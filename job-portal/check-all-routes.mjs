import fs from 'node:fs';

let envPath = 'c:/Users/theya/OneDrive/Documents/Desktop/alifeo-certificate/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.trim().split('=');
  if (k) env[k] = v.join('=').replace(/^["']|["']$/g, '');
}

async function checkAll() {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/workers/routes`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const data = await res.json();
  console.log('All zone routes:', JSON.stringify(data.result, null, 2));

  const scriptsRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const scriptsData = await scriptsRes.json();
  console.log('All worker scripts:', scriptsData.result?.map(s => s.id));
}

checkAll().catch(console.error);
