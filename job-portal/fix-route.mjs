import fs from 'node:fs';

let envPath = 'c:/Users/theya/OneDrive/Documents/Desktop/alifeo-certificate/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const [k, ...v] = line.trim().split('=');
  if (k) env[k] = v.join('=').replace(/^["']|["']$/g, '');
}

async function fix() {
  // Check DNS records for job.alifeo.com
  const dnsRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/dns_records?name=job.alifeo.com`, {
    headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}` }
  });
  const dnsData = await dnsRes.json();
  console.log('DNS records for job.alifeo.com:', JSON.stringify(dnsData.result, null, 2));

  // Add route job.alifeo.com/* if not present
  const routeRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${env.CLOUDFLARE_ZONE_ID}/workers/routes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pattern: 'job.alifeo.com/*',
      script: 'alifeo-job'
    })
  });
  const routeData = await routeRes.json();
  console.log('Add route result:', JSON.stringify(routeData, null, 2));
}

fix().catch(console.error);
