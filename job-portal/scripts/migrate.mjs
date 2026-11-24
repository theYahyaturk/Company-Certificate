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

const alters = [
  // jobs table
  "ALTER TABLE jobs ADD COLUMN company_name TEXT",
  "ALTER TABLE jobs ADD COLUMN salary_display TEXT",
  "ALTER TABLE jobs ADD COLUMN required_skills TEXT",
  "ALTER TABLE jobs ADD COLUMN experience_level TEXT",
  "ALTER TABLE jobs ADD COLUMN workplace_name TEXT",
  "ALTER TABLE jobs ADD COLUMN workplace_address TEXT",
  "ALTER TABLE jobs ADD COLUMN state TEXT",
  "ALTER TABLE jobs ADD COLUMN pincode TEXT",
  "ALTER TABLE jobs ADD COLUMN workplace_type TEXT",
  "ALTER TABLE jobs ADD COLUMN latitude REAL",
  "ALTER TABLE jobs ADD COLUMN longitude REAL",
  "ALTER TABLE jobs ADD COLUMN is_hiring_active INTEGER DEFAULT 1",
  "ALTER TABLE jobs ADD COLUMN updated_at INTEGER",

  // job_applications table
  "ALTER TABLE job_applications ADD COLUMN resume_id TEXT",
  "ALTER TABLE job_applications ADD COLUMN resume_filename TEXT",
  "ALTER TABLE job_applications ADD COLUMN resume_snapshot_data TEXT",
  "ALTER TABLE job_applications ADD COLUMN resume_mime_type TEXT",
  "ALTER TABLE job_applications ADD COLUMN screening_answers_json TEXT",
  "ALTER TABLE job_applications ADD COLUMN employer_internal_notes TEXT",
  "ALTER TABLE job_applications ADD COLUMN updated_at INTEGER",

  // job_seeker_profiles table
  "ALTER TABLE job_seeker_profiles ADD COLUMN photo_url TEXT",
  "ALTER TABLE job_seeker_profiles ADD COLUMN about_me TEXT",
  "ALTER TABLE job_seeker_profiles ADD COLUMN languages TEXT",

  // employer_profiles table
  "ALTER TABLE employer_profiles ADD COLUMN company_logo TEXT",

  // Sync columns
  "UPDATE jobs SET company_name = company WHERE company_name IS NULL AND company IS NOT NULL",
  "UPDATE jobs SET salary_display = stipend_salary WHERE salary_display IS NULL AND stipend_salary IS NOT NULL",
  "UPDATE jobs SET required_skills = skills WHERE required_skills IS NULL AND skills IS NOT NULL",
  "UPDATE jobs SET experience_level = experience WHERE experience_level IS NULL AND experience IS NOT NULL"
];

async function run() {
  for (const sql of alters) {
    try {
      const res = await queryD1(sql);
      console.log(sql.substring(0, 50), "->", res.success ? "OK" : res.errors?.[0]?.message);
    } catch (e) {
      console.log(sql.substring(0, 50), "-> ERR:", e.message);
    }
  }
}

run().catch(console.error);
