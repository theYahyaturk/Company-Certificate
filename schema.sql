CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  domain_role TEXT NOT NULL,
  duration TEXT,
  start_date TEXT,
  end_date TEXT,
  issue_date TEXT NOT NULL,
  grade TEXT DEFAULT 'Outstanding',
  description TEXT,
  instructor_name TEXT DEFAULT 'Yahya',
  status TEXT DEFAULT 'verified',
  email_sent INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificate_id TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  verified_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cert_email ON certificates(student_email);
CREATE INDEX IF NOT EXISTS idx_cert_created ON certificates(created_at);

