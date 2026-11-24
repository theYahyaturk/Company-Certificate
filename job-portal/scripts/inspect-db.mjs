import fs from 'node:fs';
import path from 'node:path';

let envContent = fs.readFileSync(path.resolve('.env'), 'utf8');
let accountId = '';
let apiToken = '';
let d1Id = '26933800-7fa2-4e38-aab5-0021a27bfd76';

for (let line of envContent.split('\n')) {
  let [k, ...v] = line.trim().split('=');
  let val = v.join('=').replace(/^["']|["']$/g, '');
  if (k === 'CLOUDFLARE_ACCOUNT_ID') accountId = val;
  if (k === 'CLOUDFLARE_API_TOKEN') apiToken = val;
  if (k === 'D1_DATABASE_ID') d1Id = val;
}

async function queryD1(sql) {
  let res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${d1Id}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  });
  return await res.json();
}

async function run() {
  const tables = await queryD1("SELECT name FROM sqlite_master WHERE type='table';");
  console.log("Existing Tables:", tables.result[0].results.map(r => r.name));

  const apps = await queryD1("PRAGMA table_info(job_applications);");
  if (apps.result && apps.result[0]) {
    console.log("job_applications columns:", apps.result[0].results.map(r => r.name));
  }

  const profiles = await queryD1("PRAGMA table_info(job_seeker_profiles);");
  if (profiles.result && profiles.result[0]) {
    console.log("job_seeker_profiles columns:", profiles.result[0].results.map(r => r.name));
  }
}

run().catch(console.error);
