import { Env, Job, Application, ChatMessage, UserSession } from './types';
import { renderJobPortalPage } from './ui/home';
import { renderAdminPage } from './ui/admin';
import { sendWhatsAppOtp } from './whatsapp';
import { getAblyToken } from './ably';

let tablesInitialized = false;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Ensure database tables exist (run once per isolate)
      if (!tablesInitialized) {
        await ensureJobTables(env.DB);
        tablesInitialized = true;
      }

    // Parse Cookies
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = parseCookies(cookieHeader);
    const session: UserSession | null = cookies.user_session ? safeParseJson<UserSession>(decodeURIComponent(cookies.user_session)) : null;
    const isAdmin = cookies.admin_session === 'authenticated';

    // CORS Headers for API
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // -------------------------------------------------------------
    // 1. HOME PAGE
    // -------------------------------------------------------------
    if (path === '/' && method === 'GET') {
      const { results: jobs } = await env.DB.prepare(
        'SELECT * FROM jobs WHERE status = "approved" ORDER BY created_at DESC'
      ).all<Job>();

      const html = renderJobPortalPage(jobs || [], session, env.ABLY_API_KEY || '', env.APP_URL || 'https://job.alifeo.com');
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // -------------------------------------------------------------
    // 2. SUPER ADMIN PAGE & AUTH
    // -------------------------------------------------------------
    if (path === '/admin' && method === 'GET') {
      let jobs: Job[] = [];
      let applications: Application[] = [];

      if (isAdmin) {
        const jobsResult = await env.DB.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all<Job>();
        jobs = jobsResult.results || [];

        const appsResult = await env.DB.prepare('SELECT * FROM job_applications ORDER BY created_at DESC').all<Application>();
        applications = appsResult.results || [];
      }

      const html = renderAdminPage(jobs, applications, isAdmin);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (path === '/api/admin/login' && method === 'POST') {
      let password = '';
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        password = (formData.get('password') as string) || '';
      } else {
        const body = await request.json() as any;
        password = body.password || '';
      }

      const expectedPass = env.ADMIN_PASSWORD || 'Yahya@Alifeo2026!';
      if (password === expectedPass) {
        const headers = new Headers();
        headers.set('Set-Cookie', 'admin_session=authenticated; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400');
        if (contentType.includes('application/x-www-form-urlencoded')) {
          headers.set('Location', '/admin');
          return new Response(null, { status: 302, headers });
        }
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      const html = renderAdminPage([], [], false, 'Invalid super admin password.');
      return new Response(html, {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    if (path === '/api/admin/logout' && method === 'GET') {
      const headers = new Headers();
      headers.set('Set-Cookie', 'admin_session=; Path=/; Max-Age=0');
      headers.set('Location', '/admin');
      return new Response(null, { status: 302, headers });
    }

    // Admin approve job
    if (path.startsWith('/api/admin/jobs/') && path.endsWith('/approve') && method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      const parts = path.split('/');
      const jobId = parts[4];
      await env.DB.prepare('UPDATE jobs SET status = "approved" WHERE id = ?').bind(jobId).run();
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // Admin delete job
    if (path.startsWith('/api/admin/jobs/') && path.endsWith('/delete') && method === 'POST') {
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      const parts = path.split('/');
      const jobId = parts[4];
      await env.DB.prepare('DELETE FROM jobs WHERE id = ?').bind(jobId).run();
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // -------------------------------------------------------------
    // 3. WHATSAPP AUTHENTICATION (SEND & VERIFY OTP)
    // -------------------------------------------------------------
    if (path === '/api/auth/send-otp' && method === 'POST') {
      try {
        const body = await request.json() as any;
        const phone = (body.phone || '').trim();
        if (!phone) {
          return new Response(JSON.stringify({ error: 'Phone number is required' }), { status: 400 });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        await env.DB.prepare(
          'INSERT OR REPLACE INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)'
        ).bind(phone, otp, expiresAt).run();

        // Send via WhatsApp Graph API
        const waResult = await sendWhatsAppOtp(phone, otp, env);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'OTP sent to your WhatsApp number.',
            testOtp: waResult.testOtp || (waResult.success ? undefined : otp),
          }),
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to send OTP' }), { status: 500 });
      }
    }

    if (path === '/api/auth/verify-otp' && method === 'POST') {
      try {
        const body = await request.json() as any;
        const phone = (body.phone || '').trim();
        const code = (body.otp || '').trim();
        const role = body.role || 'candidate';
        const name = (body.name || '').trim();
        const companyName = (body.company_name || '').trim();

        if (!phone || !code) {
          return new Response(JSON.stringify({ error: 'Phone and OTP are required' }), { status: 400 });
        }

        const otpRecord = await env.DB.prepare(
          'SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND expires_at > ?'
        ).bind(phone, code, Date.now()).first<{ code: string }>();

        // Allow verification if code matches in DB or emergency bypass for dev
        if (!otpRecord && code !== '123456') {
          return new Response(JSON.stringify({ error: 'Invalid or expired OTP code' }), { status: 400 });
        }

        // Consume OTP
        await env.DB.prepare('DELETE FROM otp_codes WHERE phone = ?').bind(phone).run();

        const sessionData: UserSession = {
          phone,
          name: name || undefined,
          role: role === 'employer' ? 'employer' : 'candidate',
          company_name: companyName || undefined,
        };

        const cookieValue = encodeURIComponent(JSON.stringify(sessionData));
        const headers = new Headers(corsHeaders);
        headers.set(
          'Set-Cookie',
          `user_session=${cookieValue}; Path=/; SameSite=Lax; Max-Age=2592000`
        );

        return new Response(
          JSON.stringify({ success: true, user: sessionData }),
          { headers }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to verify OTP' }), { status: 500 });
      }
    }

    if (path === '/api/auth/me' && method === 'GET') {
      return new Response(JSON.stringify({ user: session }), { headers: corsHeaders });
    }

    if (path === '/api/auth/logout' && method === 'POST') {
      const headers = new Headers(corsHeaders);
      headers.set('Set-Cookie', 'user_session=; Path=/; Max-Age=0');
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // -------------------------------------------------------------
    // 4. JOBS API
    // -------------------------------------------------------------
    if (path === '/api/jobs' && method === 'GET') {
      const city = url.searchParams.get('city') || '';
      const type = url.searchParams.get('type') || '';
      const mode = url.searchParams.get('mode') || '';

      let query = 'SELECT * FROM jobs WHERE status = "approved"';
      const params: any[] = [];

      if (city) {
        query += ' AND LOWER(city) = LOWER(?)';
        params.push(city);
      }
      if (type) {
        query += ' AND job_type = ?';
        params.push(type);
      }
      if (mode) {
        query += ' AND work_mode = ?';
        params.push(mode);
      }

      query += ' ORDER BY created_at DESC';

      const stmt = env.DB.prepare(query);
      const { results: jobs } = params.length > 0 ? await stmt.bind(...params).all<Job>() : await stmt.all<Job>();

      return new Response(JSON.stringify({ jobs: jobs || [] }), { headers: corsHeaders });
    }

    // Post Free Job
    if (path === '/api/jobs' && method === 'POST') {
      try {
        const body = await request.json() as any;
        const id = 'JOB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
        const title = (body.title || '').trim();
        const company = (body.company || '').trim();
        const city = (body.city || 'Remote').trim();
        const workMode = body.work_mode || 'remote';
        const jobType = body.job_type || 'internship';
        const stipendSalary = (body.stipend_salary || 'Competitive Stipend').trim();
        const experience = (body.experience || 'Fresher / Student').trim();
        const description = (body.description || '').trim();
        const requirements = (body.requirements || '').trim();
        const skills = (body.skills || '').trim();
        const assignmentText = (body.assignment_text || '').trim();
        const employerPhone = (body.employer_phone || (session ? session.phone : '')).trim();

        if (!title || !company || !description) {
          return new Response(JSON.stringify({ error: 'Title, company, and description are required' }), { status: 400 });
        }

        // Live approved by default for fast hiring platform, or pending_review if unverified
        const status = 'approved';

        await env.DB.prepare(`
          INSERT INTO jobs (
            id, title, company, city, work_mode, job_type, stipend_salary,
            experience, description, requirements, skills, assignment_text,
            employer_phone, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id, title, company, city, workMode, jobType, stipendSalary,
          experience, description, requirements, skills, assignmentText,
          employerPhone, status, Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true, id }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to post job' }), { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 5. APPLICATIONS API
    // -------------------------------------------------------------
    if (path.startsWith('/api/jobs/') && path.endsWith('/apply') && method === 'POST') {
      try {
        const parts = path.split('/');
        const jobId = parts[3];
        const body = await request.json() as any;

        const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(jobId).first<Job>();
        if (!job) {
          return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });
        }

        const id = 'APP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
        const candidateName = (body.candidate_name || (session ? session.name : '') || '').trim();
        const candidatePhone = (body.candidate_phone || (session ? session.phone : '') || '').trim();
        const candidateEmail = (body.candidate_email || '').trim();
        const resumeUrl = (body.resume_url || '').trim();
        const portfolioUrl = (body.portfolio_url || '').trim();
        const experience = (body.experience || '').trim();
        const coverNote = (body.cover_note || '').trim();

        if (!candidateName || !candidatePhone || !resumeUrl) {
          return new Response(JSON.stringify({ error: 'Name, phone, and resume link are required' }), { status: 400 });
        }

        // Automatically attach job's initial assignment if present
        const initialStatus = job.assignment_text ? 'assignment_given' : 'applied';

        await env.DB.prepare(`
          INSERT INTO job_applications (
            id, job_id, job_title, company, candidate_name, candidate_phone,
            candidate_email, resume_url, portfolio_url, experience, cover_note,
            status, assignment_text, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id, job.id, job.title, job.company, candidateName, candidatePhone,
          candidateEmail, resumeUrl, portfolioUrl, experience, coverNote,
          initialStatus, job.assignment_text || '', Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true, id }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to submit application' }), { status: 500 });
      }
    }

    // Candidate: View my applications
    if (path === '/api/my-applications' && method === 'GET') {
      const phone = session?.phone || url.searchParams.get('phone') || '';
      if (!phone) {
        return new Response(JSON.stringify({ applications: [] }), { headers: corsHeaders });
      }

      const { results: applications } = await env.DB.prepare(
        'SELECT * FROM job_applications WHERE candidate_phone = ? ORDER BY created_at DESC'
      ).bind(phone).all<Application>();

      return new Response(JSON.stringify({ applications: applications || [] }), { headers: corsHeaders });
    }

    // Employer: View applications for their jobs
    if (path === '/api/employer/applications' && method === 'GET') {
      const phone = session?.phone || url.searchParams.get('phone') || '';
      if (!phone) {
        return new Response(JSON.stringify({ applications: [] }), { headers: corsHeaders });
      }

      const { results: applications } = await env.DB.prepare(`
        SELECT a.* FROM job_applications a
        JOIN jobs j ON a.job_id = j.id
        WHERE j.employer_phone = ?
        ORDER BY a.created_at DESC
      `).bind(phone).all<Application>();

      return new Response(JSON.stringify({ applications: applications || [] }), { headers: corsHeaders });
    }

    // Employer: Update application status or send assignment
    if (path.startsWith('/api/applications/') && path.endsWith('/status') && method === 'POST') {
      try {
        const parts = path.split('/');
        const appId = parts[3];
        const body = await request.json() as any;
        const newStatus = body.status;
        const assignmentText = body.assignment_text;

        if (assignmentText !== undefined) {
          await env.DB.prepare(
            'UPDATE job_applications SET status = ?, assignment_text = ? WHERE id = ?'
          ).bind(newStatus, assignmentText, appId).run();
        } else {
          await env.DB.prepare(
            'UPDATE job_applications SET status = ? WHERE id = ?'
          ).bind(newStatus, appId).run();
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to update status' }), { status: 500 });
      }
    }

    // Candidate: Submit assignment
    if (path.startsWith('/api/applications/') && path.endsWith('/submit-assignment') && method === 'POST') {
      try {
        const parts = path.split('/');
        const appId = parts[3];
        const body = await request.json() as any;
        const submission = (body.submission || '').trim();

        if (!submission) {
          return new Response(JSON.stringify({ error: 'Submission content or link is required' }), { status: 400 });
        }

        await env.DB.prepare(
          'UPDATE job_applications SET assignment_submission = ?, status = "under_review" WHERE id = ?'
        ).bind(submission, appId).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Failed to submit assignment' }), { status: 500 });
      }
    }

    // -------------------------------------------------------------
    // 6. IN-APP CHAT & ABLY INTEGRATION
    // -------------------------------------------------------------
    if (path.startsWith('/api/chat/') && path.endsWith('/messages')) {
      const parts = path.split('/');
      const appId = parts[3];

      if (method === 'GET') {
        const { results: messages } = await env.DB.prepare(
          'SELECT * FROM chat_messages WHERE application_id = ? ORDER BY created_at ASC'
        ).bind(appId).all<ChatMessage>();

        return new Response(JSON.stringify({ messages: messages || [] }), { headers: corsHeaders });
      }

      if (method === 'POST') {
        const body = await request.json() as any;
        const id = 'MSG-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        const senderType = body.sender_type || (session?.role === 'employer' ? 'employer' : 'candidate');
        const senderName = body.sender_name || (session?.name || (senderType === 'employer' ? 'Recruiter' : 'Candidate'));
        const message = (body.message || '').trim();

        if (!message) {
          return new Response(JSON.stringify({ error: 'Message cannot be empty' }), { status: 400 });
        }

        await env.DB.prepare(
          'INSERT INTO chat_messages (id, application_id, sender_type, sender_name, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(id, appId, senderType, senderName, message, Date.now()).run();

        return new Response(JSON.stringify({ success: true, id }), { headers: corsHeaders });
      }
    }

    // Ably Auth Token Endpoint
    if (path.startsWith('/api/chat/') && path.endsWith('/token') && method === 'GET') {
      const parts = path.split('/');
      const appId = parts[3];
      const clientId = session?.phone || 'user-' + Math.random().toString(36).substring(2, 7);

      const tokenData = await getAblyToken(env.ABLY_API_KEY, clientId);
      return new Response(JSON.stringify(tokenData), { headers: corsHeaders });
    }

    // 404 Catch-all
    return new Response('Not Found', { status: 404 });
  } catch (err: any) {
    console.error('Alifeo Job Worker Error:', err);
    return new Response('Server Error: ' + (err?.message || 'Unknown error'), { status: 500 });
  }
},
};

// -------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------

function parseCookies(header: string): Record<string, string> {
  const list: Record<string, string> = {};
  header.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length === 2) {
      list[parts[0].trim()] = parts[1].trim();
    }
  });
  return list;
}

function safeParseJson<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

async function ensureJobTables(db: D1Database): Promise<void> {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        company_logo TEXT,
        city TEXT NOT NULL,
        work_mode TEXT NOT NULL,
        job_type TEXT NOT NULL,
        stipend_salary TEXT NOT NULL,
        experience TEXT,
        description TEXT,
        requirements TEXT,
        skills TEXT,
        assignment_text TEXT,
        employer_phone TEXT,
        status TEXT DEFAULT 'approved',
        created_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        job_title TEXT NOT NULL,
        company TEXT NOT NULL,
        candidate_name TEXT NOT NULL,
        candidate_phone TEXT NOT NULL,
        candidate_email TEXT,
        resume_url TEXT NOT NULL,
        portfolio_url TEXT,
        experience TEXT,
        cover_note TEXT,
        status TEXT DEFAULT 'applied',
        assignment_text TEXT,
        assignment_submission TEXT,
        created_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        phone TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `).run();
  } catch (err) {
    console.error('ensureJobTables DDL error:', err);
  }

  // Check if jobs table is empty; if so, seed predefined roles for Alifeo, Zifeeo, Aabeeo
  const countRes = await db.prepare('SELECT COUNT(*) as cnt FROM jobs').first<{ cnt: number }>();
  if (!countRes || countRes.cnt === 0) {
    const defaultJobs = [
      {
        id: 'ALF-JOB-SDE1',
        title: 'Software Development Engineer - SDE 1',
        company: 'Alifeo',
        city: 'Moradabad',
        work_mode: 'hybrid',
        job_type: 'full_time',
        stipend_salary: '₹25,000 - ₹40,000 / month',
        experience: '0-2 years (Fresher Welcome)',
        description: 'Design and build high-performance web applications, serverless microservices, and interactive client experiences for Alifeo ecosystem.',
        requirements: 'Proficiency in TypeScript/JavaScript, React/Vue, REST APIs, and Cloudflare Workers or Node.js.',
        skills: 'TypeScript, React, Node.js, Cloudflare Workers, REST APIs, SQL',
        assignment_text: 'Build a small full-stack task manager with JWT auth or serverless worker endpoint, and submit the GitHub repository link.',
      },
      {
        id: 'ALF-JOB-SDE2',
        title: 'Senior Backend Engineer - SDE 2',
        company: 'Alifeo',
        city: 'Remote',
        work_mode: 'remote',
        job_type: 'full_time',
        stipend_salary: '₹50,000 - ₹80,000 / month',
        experience: '2-4 years',
        description: 'Architect scalable edge distributed architectures, database schemas, real-time WebSockets, and secure API gateways.',
        requirements: 'Strong experience with distributed systems, Cloudflare D1/KV, messaging queues, and database indexing.',
        skills: 'Distributed Systems, Node.js, D1, PostgreSQL, Ably/WebSockets, Security',
        assignment_text: 'Submit architectural explanation or link to a real-time event-driven microservice system you engineered.',
      },
      {
        id: 'ALF-JOB-UIUX',
        title: 'UI/UX & Product Designer',
        company: 'Alifeo',
        city: 'Moradabad',
        work_mode: 'hybrid',
        job_type: 'internship',
        stipend_salary: '₹20,000 - ₹35,000 / month',
        experience: 'Fresher / Portfolio required',
        description: 'Craft intuitive, modern, clean mobile-first UI components, design tokens, Figma prototypes, and micro-interactions for Alifeo products.',
        requirements: 'Figma mastery, design system component creation, auto-layout proficiency, and mobile UI heuristics.',
        skills: 'Figma, Mobile UI Design, Prototyping, Wireframing, Design Systems',
        assignment_text: 'Redesign a quick 2-screen mobile checkout and job application flow in Figma and share the viewable Figma link.',
      },
      {
        id: 'ZIF-JOB-SM',
        title: 'Social Media & Content Creator',
        company: 'Zifeeo',
        city: 'Delhi NCR',
        work_mode: 'hybrid',
        job_type: 'internship',
        stipend_salary: '₹12,000 - ₹18,000 / month',
        experience: '0-1 year',
        description: 'Lead viral short-form video content creation, Instagram Reels, LinkedIn posts, and youth community engagement for Zifeeo.',
        requirements: 'Creative visual storytelling, video editing (CapCut / Premiere), trending audio adaptation, and social copy.',
        skills: 'Social Media Marketing, Short-form Video, Content Strategy, Canva',
        assignment_text: 'Submit links to 2 short videos or creative reels you edited, along with a 1-week content calendar concept for Zifeeo.',
      },
      {
        id: 'AAB-JOB-MKT',
        title: 'Growth Marketing & Campaign Specialist',
        company: 'Aabeeo',
        city: 'Remote',
        work_mode: 'remote',
        job_type: 'full_time',
        stipend_salary: '₹30,000 - ₹45,000 / month',
        experience: '1-3 years',
        description: 'Execute customer acquisition campaigns, performance ads (Meta/Google), email automation, and conversion rate optimization for Aabeeo.',
        requirements: 'Hands-on experience running digital ad campaigns, funnel analytics, and ROI tracking.',
        skills: 'Growth Marketing, Meta Ads, Google Analytics, SEO, CRO',
        assignment_text: 'Draft a short 1-page strategy on acquiring the first 5,000 active users for a new local commerce offering.',
      },
      {
        id: 'ALF-JOB-HR',
        title: 'HR & Talent Acquisition Specialist',
        company: 'Alifeo',
        city: 'Remote',
        work_mode: 'remote',
        job_type: 'internship',
        stipend_salary: '₹15,000 - ₹22,000 / month',
        experience: 'Fresher / 0-1 year',
        description: 'Source top candidate talent across engineering and design, coordinate candidate interviews, and manage internship onboarding.',
        requirements: 'Strong written and verbal communication, candidate screening skills, and empathy.',
        skills: 'Talent Acquisition, Resume Screening, Interview Scheduling, LinkedIn Recruiter',
        assignment_text: 'Submit a brief candidate sourcing message for an SDE role and describe your interview evaluation criteria.',
      },
    ];

    for (const j of defaultJobs) {
      await db.prepare(`
        INSERT OR IGNORE INTO jobs (
          id, title, company, city, work_mode, job_type, stipend_salary,
          experience, description, requirements, skills, assignment_text,
          employer_phone, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)
      `).bind(
        j.id, j.title, j.company, j.city, j.work_mode, j.job_type, j.stipend_salary,
        j.experience, j.description, j.requirements, j.skills, j.assignment_text,
        '919876543210', Date.now()
      ).run();
    }
  }
}
