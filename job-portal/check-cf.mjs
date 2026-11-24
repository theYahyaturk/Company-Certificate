import fs from 'node:fs';
import path from 'node:path';

let envPath = 'c:/Users/theya/OneDrive/Documents/Desktop/alifeo-certificate/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.trim().split('=');
  if (k) env[k] = v.join('=').replace(/^["']|["']$/g, '');
}

async function check() {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/workers/routes`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const data = await res.json();
  console.log('Routes:', JSON.stringify(data.result, null, 2));

  const domRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/domains`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const domData = await domRes.json();
  console.log('Domains:', JSON.stringify(domData.result, null, 2));
}

check().catch(console.error);
