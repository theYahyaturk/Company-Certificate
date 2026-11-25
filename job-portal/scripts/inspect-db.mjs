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
  const apps = await queryD1("PRAGMA table_info(job_applications);");
  console.log("job_applications:", apps.result[0].results.map(r => `${r.name} (${r.type}, notnull=${r.notnull})`));

  const chat = await queryD1("PRAGMA table_info(chat_messages);");
  console.log("chat_messages:", chat.result[0].results.map(r => `${r.name} (${r.type}, notnull=${r.notnull})`));

  // 1. Remove the SALES job and ok job, leaving ONLY UI/UX job approved as user requested
  console.log("\nUpdating jobs according to user instruction (only real UI/UX job active)...");
  await queryD1("UPDATE jobs SET status = 'removed', is_hiring_active = 0 WHERE title = 'SALES' OR title = 'ok' OR city = 'ok';");
  await queryD1("UPDATE jobs SET status = 'approved', is_hiring_active = 1 WHERE title = 'UI/UX' AND city = 'Moradabad';");

  // 2. Add missing columns to chat_messages
  const chatCols = [
    "ALTER TABLE chat_messages ADD COLUMN conversation_id TEXT",
    "ALTER TABLE chat_messages ADD COLUMN sender_phone TEXT",
    "ALTER TABLE chat_messages ADD COLUMN sender_role TEXT",
    "ALTER TABLE chat_messages ADD COLUMN is_read INTEGER DEFAULT 0"
  ];
  for (const c of chatCols) {
    const res = await queryD1(c);
    console.log(c, "->", res.success ? "OK" : res.errors?.[0]?.message);
  }

  // 3. Check active approved jobs in D1
  const activeJobs = await queryD1("SELECT id, title, company_name, city, status, is_hiring_active FROM jobs WHERE status = 'approved' AND is_hiring_active = 1;");
  console.log("\nCURRENT APPROVED JOBS IN D1:", JSON.stringify(activeJobs.result[0].results, null, 2));
}

run().catch(console.error);
