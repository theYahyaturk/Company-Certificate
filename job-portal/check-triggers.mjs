import fs from 'node:fs';

let envPath = 'c:/Users/theya/OneDrive/Documents/Desktop/alifeo-certificate/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.trim().split('=');
  if (k) env[k] = v.join('=').replace(/^["']|["']$/g, '');
}

async function checkDomains() {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/domains`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const data = await res.json();
  console.log('Workers domains:', JSON.stringify(data.result, null, 2));

  // Check script triggers for alifeo-job
  const jobTriggers = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/alifeo-job/routes`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const jtData = await jobTriggers.json();
  console.log('alifeo-job routes:', JSON.stringify(jtData, null, 2));

  // Check script triggers for alifeo-certificate
  const certTriggers = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/alifeo-certificate/routes`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const ctData = await certTriggers.json();
  console.log('alifeo-certificate routes:', JSON.stringify(ctData, null, 2));
}

checkDomains().catch(console.error);
