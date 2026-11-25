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
  let data = await res.json();
  return data.result?.[0]?.results;
}

async function run() {
  const resumes = await queryD1('SELECT id, user_phone, filename, file_size, LENGTH(file_data) as data_len, mime_type, is_current, uploaded_at FROM resumes');
  console.log('Resumes:', JSON.stringify(resumes, null, 2));

  // Also check if any resume has file_size 0 and fix it
  if (resumes && resumes.length > 0) {
    for (const r of resumes) {
      if (!r.file_size || r.file_size === 0) {
        const estBytes = Math.round((r.data_len * 3) / 4);
        console.log(`Fixing resume ${r.id} (${r.filename}): data_len=${r.data_len}, estimated=${estBytes} bytes (${Math.round(estBytes/1024)} KB)`);
        await queryD1(`UPDATE resumes SET file_size = ${estBytes} WHERE id = '${r.id}'`);
      }
    }
  }
}
run();
