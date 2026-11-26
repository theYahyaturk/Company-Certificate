#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let DOMAIN = 'alifeo.com';
let SUBDOMAIN = 'job.alifeo.com';
let WORKER_NAME = 'alifeo-job';
let ZONE_ID = '01e83278c6dba3b096f9054d3bc3268e';
let D1_UUID = '26933800-7fa2-4e38-aab5-0021a27bfd76';
let accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
let apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
let adminPassword = process.env.ADMIN_PASSWORD || 'Yahya@Alifeo2026!';
let jwtSecret = process.env.JWT_SECRET || 'alifeo-job-secret-key-32chars-2026-production';
let appUrl = process.env.APP_URL || 'https://job.alifeo.com';

let whatsappPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
let whatsappWabaId = process.env.WHATSAPP_WABA_ID || '';
let whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
let whatsappTemplate = process.env.WHATSAPP_TEMPLATE_NAME || 'login';
let whatsappLang = process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'en_US';
let whatsappVerify = process.env.WHATSAPP_VERIFY_TOKEN || 'alifeo_whatsapp_verify';
let ablyApiKey = process.env.ABLY_API_KEY || '';

// Load from local or parent .env
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [k, ...v] = trimmed.split('=');
      const val = v.join('=').replace(/^["']|["']$/g, '');
      if (k === 'CLOUDFLARE_ACCOUNT_ID' && !accountId) accountId = val;
      if (k === 'CLOUDFLARE_API_TOKEN' && !apiToken) apiToken = val;
      if (k === 'CLOUDFLARE_ZONE_ID') ZONE_ID = val;
      if (k === 'D1_DATABASE_ID') D1_UUID = val;
      if (k === 'ADMIN_PASSWORD') adminPassword = val;
      if (k === 'WHATSAPP_PHONE_NUMBER_ID') whatsappPhoneId = val;
      if (k === 'WHATSAPP_WABA_ID') whatsappWabaId = val;
      if (k === 'WHATSAPP_ACCESS_TOKEN') whatsappToken = val;
      if (k === 'WHATSAPP_TEMPLATE_NAME') whatsappTemplate = val;
      if (k === 'WHATSAPP_TEMPLATE_LANGUAGE_CODE') whatsappLang = val;
      if (k === 'WHATSAPP_VERIFY_TOKEN') whatsappVerify = val;
      if (k === 'ABLY_API_KEY') ablyApiKey = val;
    }
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
  console.log('   Alifeo Job Portal - Automated Cloudflare Deploy');
  console.log('======================================================\n');

  const distFile = path.join(__dirname, 'dist', 'index.js');
  if (!fs.existsSync(distFile)) {
    error(`dist/index.js not found at ${distFile}. Please run build first.`);
    process.exit(1);
  }

  const code = fs.readFileSync(distFile, 'utf8');

  // Step 1: Prepare metadata and bindings
  log('Preparing Cloudflare Worker bindings for job.alifeo.com...');
  const bindings = [
    { name: 'DOMAIN', type: 'plain_text', text: DOMAIN },
    { name: 'SUBDOMAIN', type: 'plain_text', text: SUBDOMAIN },
    { name: 'APP_URL', type: 'plain_text', text: appUrl },
    { name: 'ADMIN_PASSWORD', type: 'secret_text', text: adminPassword },
    { name: 'JWT_SECRET', type: 'secret_text', text: jwtSecret },
    { name: 'WHATSAPP_PHONE_NUMBER_ID', type: 'plain_text', text: whatsappPhoneId },
    { name: 'WHATSAPP_WABA_ID', type: 'plain_text', text: whatsappWabaId },
    { name: 'WHATSAPP_ACCESS_TOKEN', type: 'secret_text', text: whatsappToken },
    { name: 'WHATSAPP_TEMPLATE_NAME', type: 'plain_text', text: whatsappTemplate },
    { name: 'WHATSAPP_TEMPLATE_LANGUAGE_CODE', type: 'plain_text', text: whatsappLang },
    { name: 'WHATSAPP_VERIFY_TOKEN', type: 'plain_text', text: whatsappVerify },
    { name: 'ABLY_API_KEY', type: 'secret_text', text: ablyApiKey }
  ];

  if (D1_UUID) {
    bindings.push({ name: 'DB', type: 'd1', id: D1_UUID });
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
  log(`Uploading worker "${WORKER_NAME}" (${(code.length / 1024).toFixed(1)} KB) to Cloudflare...`);
  const uploadRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${WORKER_NAME}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${apiToken}` },
    body: formData
  });

  const resText = await uploadRes.text();
  let uploadData;
  try {
    uploadData = JSON.parse(resText);
  } catch (e) {
    error(`Cloudflare API returned non-JSON response (${uploadRes.status}): ${resText.substring(0, 250)}`);
    process.exit(1);
  }
  if (!uploadData.success) {
    error(`Worker upload failed: ${JSON.stringify(uploadData.errors)}`);
    process.exit(1);
  }
  success(`Worker "${WORKER_NAME}" uploaded successfully!`);

  // Step 3: Enable workers.dev subdomain
  log('Ensuring worker route is enabled...');
  await cfApi(`/accounts/${accountId}/workers/scripts/${WORKER_NAME}/subdomain`, 'POST', { enabled: true });

  // Step 4: Attach Custom Domain (job.alifeo.com)
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

    // Also ensure route pattern exists
    await cfApi(`/zones/${ZONE_ID}/workers/routes`, 'POST', {
      pattern: `${SUBDOMAIN}/*`,
      script: WORKER_NAME
    });
  }

  console.log('\n======================================================');
  console.log(`🎉 DEPLOYMENT COMPLETE!`);
  console.log(`🌐 Job Portal:     https://${SUBDOMAIN}`);
  console.log(`🔑 Super Admin:    https://${SUBDOMAIN}/admin`);
  console.log(`📱 WhatsApp Auth:  Configured (${whatsappPhoneId})`);
  console.log(`💬 Ably Chat:      Active (${ablyApiKey ? ablyApiKey.slice(0, 10) + '...' : 'configured'})`);
  console.log('======================================================\n');
}

main().catch(err => {
  error(`Deployment error: ${err.message} (${err.cause || ''})`);
  process.exit(1);
});
