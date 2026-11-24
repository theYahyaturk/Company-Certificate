import fs from 'node:fs';

let envPath = 'c:/Users/theya/OneDrive/Documents/Desktop/alifeo-certificate/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.trim().split('=');
  if (k) env[k] = v.join('=').replace(/^["']|["']$/g, '');
}

async function debugRoutes() {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/workers/routes`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const data = await res.json();
  console.log('Routes in zone:', JSON.stringify(data.result, null, 2));

  // Also check DNS records for *.alifeo.com or job.alifeo.com
  const dnsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const dnsData = await dnsRes.json();
  console.log('All DNS records:', dnsData.result.map(d => ({ name: d.name, type: d.type, content: d.content, meta: d.meta })));
}

debugRoutes().catch(console.error);
