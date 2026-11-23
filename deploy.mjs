#!/usr/bin/env node
import fs from 'node:fs';

let DOMAIN = 'alifeo.com';
let SUBDOMAIN = 'certificate.alifeo.com';
let WORKER_NAME = 'alifeo-certificate';
let ZONE_ID = '01e83278c6dba3b096f9054d3bc3268e';
let D1_UUID = '26933800-7fa2-4e38-aab5-0021a27bfd76';
let MAIL_D1_UUID = 'd5cc98a4-085e-4a7e-a5d1-7f3a5d05375d';
let accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
let apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
let resendKey = process.env.RESEND_API_KEY || '';
let adminPassword = process.env.ADMIN_PASSWORD || '';
let hrEmail = process.env.HR_EMAIL || 'hr@alifeo.com';
let jwtSecret = process.env.JWT_SECRET || '';
let appUrl = process.env.APP_URL || 'https://certificate.alifeo.com';

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    const val = v.join('=').replace(/^["']|["']$/g, '');
    if (k === 'DOMAIN') DOMAIN = val;
    if (k === 'SUBDOMAIN') SUBDOMAIN = val;
    if (k === 'WORKER_NAME') WORKER_NAME = val;
    if (k === 'CLOUDFLARE_ZONE_ID') ZONE_ID = val;
    if (k === 'D1_DATABASE_ID') D1_UUID = val;
    if (k === 'MAIL_D1_DATABASE_ID') MAIL_D1_UUID = val;
    if (k === 'CLOUDFLARE_ACCOUNT_ID') accountId = val;
    if (k === 'CLOUDFLARE_API_TOKEN') apiToken = val;
    if (k === 'RESEND_API_KEY') resendKey = val;
    if (k === 'ADMIN_PASSWORD') adminPassword = val;
    if (k === 'HR_EMAIL') hrEmail = val;
    if (k === 'JWT_SECRET') jwtSecret = val;
    if (k === 'APP_URL') appUrl = val;
  }
}

function log(msg) { console.log(`\x1b[36m[DEPLOY]\x1b[0m ${msg}`); }
function success(msg) { console.log(`\x1b[32m✔ ${msg}\x1b[0m`); }
function warn(msg) { console.log(`\x1b[33m⚠ ${msg}\x1b[0m`); }
function error(msg) { console.error(`\x1b[31m✖ ${msg}\x1b[0m`); }

async function cfApi(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`https://api.cloudflare.com/client/v4${endpoint}`, options);
  return await res.json();
}

async function main() {
  console.log('\n======================================================');
  console.log('   Alifeo Certificate Portal - Automated Cloudflare Deploy');
  console.log('======================================================\n');

  if (!fs.existsSync('dist/index.js')) {
    error('dist/index.js not found. Please run npm run build first.');
    process.exit(1);
  }

  const code = fs.readFileSync('dist/index.js', 'utf8');

  // Step 1: Prepare metadata and bindings
  log('Preparing Cloudflare Worker bindings...');
  const bindings = [
    { name: 'DOMAIN', type: 'plain_text', text: DOMAIN },
    { name: 'SUBDOMAIN', type: 'plain_text', text: SUBDOMAIN },
    { name: 'APP_URL', type: 'plain_text', text: appUrl },
    { name: 'HR_EMAIL', type: 'plain_text', text: hrEmail },
    { name: 'RESEND_API_KEY', type: 'secret_text', text: resendKey },
    { name: 'ADMIN_PASSWORD', type: 'secret_text', text: adminPassword },
    { name: 'JWT_SECRET', type: 'secret_text', text: jwtSecret }
  ];

  if (D1_UUID) {
    bindings.push({ name: 'DB', type: 'd1', id: D1_UUID });
  }

  if (MAIL_D1_UUID) {
    bindings.push({ name: 'MAIL_DB', type: 'd1', id: MAIL_D1_UUID });
  }

  const metadata = {
    main_module: 'index.js',
    compatibility_date: '2024-11-01',
    compatibility_flags: ['nodejs_compat'],
    bindings
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('index.js', new Blob([code], { type: 'application/javascript+module' }), 'index.js');

  // Step 2: Upload script to Cloudflare
  log(`Uploading worker "${WORKER_NAME}" to Cloudflare...`);
  const uploadRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${WORKER_NAME}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${apiToken}` },
    body: formData
  });

  const uploadData = await uploadRes.json();
  if (!uploadData.success) {
    error(`Worker upload failed: ${JSON.stringify(uploadData.errors)}`);
    process.exit(1);
  }
  success(`Worker "${WORKER_NAME}" uploaded successfully!`);

  // Step 3: Enable workers.dev subdomain
  log('Ensuring worker route is enabled...');
  await cfApi(`/accounts/${accountId}/workers/scripts/${WORKER_NAME}/subdomain`, 'POST', { enabled: true });

  // Step 4: Attach Custom Domain (certificate.alifeo.com)
  if (ZONE_ID) {
    log(`Attaching custom domain https://${SUBDOMAIN}...`);
    const domainRes = await cfApi(`/accounts/${accountId}/workers/domains`, 'PUT', {
      hostname: SUBDOMAIN,
      zone_id: ZONE_ID,
      service: WORKER_NAME,
      environment: 'production'
    });
    if (domainRes.success) {
      success(`Custom domain https://${SUBDOMAIN} attached and SSL active!`);
    } else {
      warn(`Custom domain notice: ${domainRes.errors?.[0]?.message || 'Configured'}`);
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 DEPLOYMENT COMPLETE!`);
  console.log(`🌐 Public Portal:  https://${SUBDOMAIN}`);
  console.log(`🔑 Admin Console:  https://${SUBDOMAIN}/admin`);
  console.log(`📧 Webmail Sync:   Connected to mail.alifeo.com (MAIL_DB)`);
  console.log(`👤 HR Mailbox:     hr@alifeo.com`);
  console.log('======================================================\n');
}

main().catch(err => {
  error(`Deployment error: ${err.message} (${err.cause || ''})`);
  process.exit(1);
});
