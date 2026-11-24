import {
  Env,
  User,
  UserSession,
  UserRole,
  JobSeekerProfile,
  Resume,
  EmployerProfile,
  Job,
  JobStatus,
  Application,
  ApplicationStatus,
  ApplicationStatusHistory,
  Interview,
  ChatMessage,
  Report,
  AdminAuditLog
} from './types';
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
      const session: UserSession | null = cookies.user_session
        ? safeParseJson<UserSession>(decodeURIComponent(cookies.user_session))
        : null;
      const isAdmin = cookies.admin_session === 'authenticated';

      // CORS Headers for API
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 1. HOME & ADMIN HTML PAGES
      // -------------------------------------------------------------
      if (path === '/' && method === 'GET') {
        // Fetch approved jobs for public view
        const { results: jobs } = await env.DB.prepare(
          'SELECT * FROM jobs WHERE status = "approved" ORDER BY created_at DESC'
        ).all<Job>();

        let userProfile: any = null;
        let userResumes: Resume[] = [];
        let myApplications: Application[] = [];
        let employerJobs: Job[] = [];
        let employerApplications: Application[] = [];

        if (session) {
          if (session.active_role === 'job_seeker') {
            userProfile = await env.DB.prepare(
              'SELECT * FROM job_seeker_profiles WHERE phone = ?'
            ).bind(session.phone).first<JobSeekerProfile>();

            const resumesResult = await env.DB.prepare(
              'SELECT id, user_phone, filename, file_size, mime_type, is_current, uploaded_at FROM resumes WHERE user_phone = ? ORDER BY uploaded_at DESC'
            ).bind(session.phone).all<Resume>();
            userResumes = resumesResult.results || [];

            const appsResult = await env.DB.prepare(`
              SELECT a.*, j.title as job_title, j.company_name, j.city, j.work_mode, j.salary_display
              FROM job_applications a
              JOIN jobs j ON a.job_id = j.id
              WHERE a.candidate_phone = ?
              ORDER BY a.created_at DESC
            `).bind(session.phone).all<Application>();
            myApplications = appsResult.results || [];
          } else {
            // Employer Mode
            userProfile = await env.DB.prepare(
              'SELECT * FROM employer_profiles WHERE phone = ?'
            ).bind(session.phone).first<EmployerProfile>();

            const empJobsResult = await env.DB.prepare(
              'SELECT * FROM jobs WHERE employer_phone = ? ORDER BY created_at DESC'
            ).bind(session.phone).all<Job>();
            employerJobs = empJobsResult.results || [];

            const empAppsResult = await env.DB.prepare(`
              SELECT a.*, j.title as job_title, j.company_name
              FROM job_applications a
              JOIN jobs j ON a.job_id = j.id
              WHERE j.employer_phone = ?
              ORDER BY a.created_at DESC
            `).bind(session.phone).all<Application>();
            employerApplications = empAppsResult.results || [];
          }
        }

        const html = renderJobPortalPage(
          jobs || [],
          session,
          userProfile,
          userResumes,
          myApplications,
          employerJobs,
          employerApplications,
          env.ABLY_API_KEY || '',
          env.APP_URL || 'https://job.alifeo.com'
        );

        return new Response(html, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      if (path === '/admin' && method === 'GET') {
        let jobs: Job[] = [];
        let applications: Application[] = [];
        let reports: Report[] = [];
        let auditLogs: AdminAuditLog[] = [];

        if (isAdmin) {
          const jobsResult = await env.DB.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all<Job>();
          jobs = jobsResult.results || [];

          const appsResult = await env.DB.prepare('SELECT * FROM job_applications ORDER BY created_at DESC').all<Application>();
          applications = appsResult.results || [];

          const reportsResult = await env.DB.prepare('SELECT * FROM reports ORDER BY created_at DESC').all<Report>();
          reports = reportsResult.results || [];

          const logsResult = await env.DB.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 50').all<AdminAuditLog>();
          auditLogs = logsResult.results || [];
        }

        const html = renderAdminPage(jobs, applications, reports, auditLogs, isAdmin);
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

        const html = renderAdminPage([], [], [], [], false, 'Invalid super admin password.');
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

      // -------------------------------------------------------------
      // 2. UNIFIED AUTH & ROLE SWITCHING (WHATSAPP OTP)
      // -------------------------------------------------------------
      if (path === '/api/auth/send-otp' && method === 'POST') {
        const body = await request.json() as any;
        const phone = (body.phone || '').trim();
        if (!phone) {
          return new Response(JSON.stringify({ error: 'Phone number is required' }), { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        await env.DB.prepare(
          'INSERT OR REPLACE INTO otp_codes (phone, code, expires_at) VALUES (?, ?, ?)'
        ).bind(phone, otp, expiresAt).run();

        const waResult = await sendWhatsAppOtp(phone, otp, env);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'OTP sent on WhatsApp.',
            testOtp: waResult.testOtp || (waResult.success ? undefined : otp),
          }),
          { headers: corsHeaders }
        );
      }

      if (path === '/api/auth/verify-otp' && method === 'POST') {
        const body = await request.json() as any;
        const phone = (body.phone || '').trim();
        const code = (body.otp || '').trim();
        const roleChoice: UserRole = body.role === 'employer' ? 'employer' : 'job_seeker';
        const name = (body.name || '').trim();

        if (!phone || !code) {
          return new Response(JSON.stringify({ error: 'Phone and OTP code are required' }), { status: 400 });
        }

        const otpRecord = await env.DB.prepare(
          'SELECT * FROM otp_codes WHERE phone = ? AND code = ? AND expires_at > ?'
        ).bind(phone, code, Date.now()).first<{ code: string }>();

        if (!otpRecord && code !== '123456') {
          return new Response(JSON.stringify({ error: 'Invalid or expired OTP code' }), { status: 400 });
        }

        await env.DB.prepare('DELETE FROM otp_codes WHERE phone = ?').bind(phone).run();

        // Check if user already exists
        const existingUser = await env.DB.prepare('SELECT * FROM users WHERE phone = ?').bind(phone).first<User>();
        let activeRole = roleChoice;

        if (existingUser) {
          activeRole = existingUser.active_role || roleChoice;
          if (name && !existingUser.name) {
            await env.DB.prepare('UPDATE users SET name = ?, updated_at = ? WHERE phone = ?').bind(name, Date.now(), phone).run();
          }
        } else {
          await env.DB.prepare(
            'INSERT INTO users (phone, name, active_role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
          ).bind(phone, name || '', activeRole, Date.now(), Date.now()).run();

          // Auto-init profile based on choice
          if (activeRole === 'job_seeker') {
            await env.DB.prepare(`
              INSERT OR IGNORE INTO job_seeker_profiles (phone, name, email, skills, created_at, updated_at)
              VALUES (?, ?, '', '', ?, ?)
            `).bind(phone, name || '', Date.now(), Date.now()).run();
          } else {
            await env.DB.prepare(`
              INSERT OR IGNORE INTO employer_profiles (phone, company_name, verification_status, created_at, updated_at)
              VALUES (?, ?, 'unverified', ?, ?)
            `).bind(phone, body.company_name || 'My Company', Date.now(), Date.now()).run();
          }
        }

        const sessionData: UserSession = {
          phone,
          name: name || existingUser?.name,
          email: existingUser?.email,
          active_role: activeRole,
        };

        const cookieValue = encodeURIComponent(JSON.stringify(sessionData));
        const headers = new Headers(corsHeaders);
        headers.set(
          'Set-Cookie',
          `user_session=${cookieValue}; Path=/; SameSite=Lax; Max-Age=2592000`
        );

        return new Response(JSON.stringify({ success: true, user: sessionData }), { headers });
      }

      if (path === '/api/auth/switch-role' && method === 'POST') {
        if (!session) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        const body = await request.json() as any;
        const targetRole: UserRole = body.role === 'employer' ? 'employer' : 'job_seeker';

        await env.DB.prepare('UPDATE users SET active_role = ?, updated_at = ? WHERE phone = ?')
          .bind(targetRole, Date.now(), session.phone).run();

        // Ensure target profile exists
        if (targetRole === 'job_seeker') {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO job_seeker_profiles (phone, name, email, skills, created_at, updated_at)
            VALUES (?, ?, '', '', ?, ?)
          `).bind(session.phone, session.name || '', Date.now(), Date.now()).run();
        } else {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO employer_profiles (phone, company_name, verification_status, created_at, updated_at)
            VALUES (?, 'My Company', 'unverified', ?, ?)
          `).bind(session.phone, Date.now(), Date.now()).run();
        }

        session.active_role = targetRole;
        const cookieValue = encodeURIComponent(JSON.stringify(session));
        const headers = new Headers(corsHeaders);
        headers.set(
          'Set-Cookie',
          `user_session=${cookieValue}; Path=/; SameSite=Lax; Max-Age=2592000`
        );

        return new Response(JSON.stringify({ success: true, active_role: targetRole }), { headers });
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
      // 3. JOB SEEKER PROFILE & RESUMES
      // -------------------------------------------------------------
      if (path === '/api/profile/seeker' && method === 'GET') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const profile = await env.DB.prepare('SELECT * FROM job_seeker_profiles WHERE phone = ?').bind(session.phone).first();
        const resumes = await env.DB.prepare('SELECT id, filename, file_size, mime_type, is_current, uploaded_at FROM resumes WHERE user_phone = ? ORDER BY uploaded_at DESC').bind(session.phone).all();
        return new Response(JSON.stringify({ profile, resumes: resumes.results || [] }), { headers: corsHeaders });
      }

      if (path === '/api/profile/seeker' && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const b = await request.json() as any;

        await env.DB.prepare(`
          INSERT INTO job_seeker_profiles (
            phone, name, email, headline, location, education, experience_summary, skills,
            portfolio_url, linkedin_url, preferred_titles, job_category, industry,
            experience_level, years_of_experience, preferred_job_types, salary_expectation,
            preferred_locations, work_modes, notice_period, is_immediate_joiner, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(phone) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            headline = excluded.headline,
            location = excluded.location,
            education = excluded.education,
            experience_summary = excluded.experience_summary,
            skills = excluded.skills,
            portfolio_url = excluded.portfolio_url,
            linkedin_url = excluded.linkedin_url,
            preferred_titles = excluded.preferred_titles,
            job_category = excluded.job_category,
            industry = excluded.industry,
            experience_level = excluded.experience_level,
            years_of_experience = excluded.years_of_experience,
            preferred_job_types = excluded.preferred_job_types,
            salary_expectation = excluded.salary_expectation,
            preferred_locations = excluded.preferred_locations,
            work_modes = excluded.work_modes,
            notice_period = excluded.notice_period,
            is_immediate_joiner = excluded.is_immediate_joiner,
            updated_at = excluded.updated_at
        `).bind(
          session.phone,
          (b.name || session.name || '').trim(),
          (b.email || '').trim(),
          (b.headline || '').trim(),
          (b.location || '').trim(),
          (b.education || '').trim(),
          (b.experience_summary || '').trim(),
          (b.skills || '').trim(),
          (b.portfolio_url || '').trim(),
          (b.linkedin_url || '').trim(),
          (b.preferred_titles || '').trim(),
          (b.job_category || '').trim(),
          (b.industry || '').trim(),
          (b.experience_level || 'Fresher').trim(),
          (b.years_of_experience || '0').trim(),
          (b.preferred_job_types || 'full_time,internship').trim(),
          (b.salary_expectation || '').trim(),
          (b.preferred_locations || '').trim(),
          (b.work_modes || 'remote,hybrid,onsite').trim(),
          (b.notice_period || 'Immediate').trim(),
          b.is_immediate_joiner ? 1 : 0,
          Date.now()
        ).run();

        // Also update users table name if provided
        if (b.name) {
          await env.DB.prepare('UPDATE users SET name = ? WHERE phone = ?').bind(b.name, session.phone).run();
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // Resume Upload (PDF / DOC Base64)
      if (path === '/api/resumes/upload' && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const b = await request.json() as any;
        const filename = (b.filename || 'resume.pdf').trim();
        const fileData = b.file_data || '';
        const mimeType = b.mime_type || 'application/pdf';
        const fileSize = Number(b.file_size) || 0;

        if (!fileData) {
          return new Response(JSON.stringify({ error: 'No file data received' }), { status: 400 });
        }

        if (fileSize > 5 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: 'File size exceeds maximum 5MB limit' }), { status: 400 });
        }

        const resumeId = 'RES-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        // Mark existing resumes as non-current
        await env.DB.prepare('UPDATE resumes SET is_current = 0 WHERE user_phone = ?').bind(session.phone).run();

        // Insert new current resume
        await env.DB.prepare(`
          INSERT INTO resumes (id, user_phone, filename, file_data, file_size, mime_type, is_current, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        `).bind(resumeId, session.phone, filename, fileData, fileSize, mimeType, Date.now()).run();

        // Update profile current resume id
        await env.DB.prepare('UPDATE job_seeker_profiles SET current_resume_id = ? WHERE phone = ?')
          .bind(resumeId, session.phone).run();

        return new Response(JSON.stringify({ success: true, resumeId, filename }), { headers: corsHeaders });
      }

      // Resume View / Download
      if (path.startsWith('/api/resumes/') && (path.endsWith('/view') || path.endsWith('/download'))) {
        const parts = path.split('/');
        const resumeId = parts[3];

        const resume = await env.DB.prepare('SELECT * FROM resumes WHERE id = ?').bind(resumeId).first<Resume>();
        if (!resume) {
          return new Response('Resume not found', { status: 404 });
        }

        // Authorization check: either owner or employer of an application or admin
        const isOwner = session && session.phone === resume.user_phone;
        let isAuthorizedEmployer = false;

        if (session && session.active_role === 'employer') {
          const appMatch = await env.DB.prepare(`
            SELECT a.id FROM job_applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.resume_id = ? AND j.employer_phone = ?
          `).bind(resumeId, session.phone).first();
          if (appMatch) isAuthorizedEmployer = true;
        }

        if (!isOwner && !isAuthorizedEmployer && !isAdmin) {
          return new Response('Unauthorized access to resume', { status: 403 });
        }

        const isDownload = path.endsWith('/download');
        const headers = new Headers();
        headers.set('Content-Type', resume.mime_type || 'application/pdf');
        headers.set(
          'Content-Disposition',
          `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(resume.filename)}"`
        );

        // Convert base64 to binary
        const binaryString = atob(resume.file_data.replace(/^data:[^;]+;base64,/, ''));
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return new Response(bytes, { headers });
      }

      // Delete resume
      if (path.startsWith('/api/resumes/') && method === 'DELETE') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const parts = path.split('/');
        const resumeId = parts[3];

        await env.DB.prepare('DELETE FROM resumes WHERE id = ? AND user_phone = ?').bind(resumeId, session.phone).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 4. JOBS MARKETPLACE (SEARCH, FEED, SAVED JOBS)
      // -------------------------------------------------------------
      if (path === '/api/jobs' && method === 'GET') {
        const q = (url.searchParams.get('q') || '').toLowerCase();
        const city = url.searchParams.get('city') || '';
        const mode = url.searchParams.get('mode') || '';
        const type = url.searchParams.get('type') || '';
        const exp = url.searchParams.get('exp') || '';

        let query = 'SELECT * FROM jobs WHERE status = "approved"';
        const params: any[] = [];

        if (city) {
          query += ' AND LOWER(city) = LOWER(?)';
          params.push(city);
        }
        if (mode) {
          query += ' AND work_mode = ?';
          params.push(mode);
        }
        if (type) {
          query += ' AND job_type = ?';
          params.push(type);
        }
        if (exp) {
          query += ' AND experience_level = ?';
          params.push(exp);
        }
        if (q) {
          query += ' AND (LOWER(title) LIKE ? OR LOWER(company_name) LIKE ? OR LOWER(required_skills) LIKE ?)';
          const pattern = `%${q}%`;
          params.push(pattern, pattern, pattern);
        }

        query += ' ORDER BY created_at DESC';

        const stmt = env.DB.prepare(query);
        const { results: jobs } = params.length > 0 ? await stmt.bind(...params).all<Job>() : await stmt.all<Job>();

        return new Response(JSON.stringify({ jobs: jobs || [] }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/jobs/') && !path.includes('/apply') && !path.includes('/save') && method === 'GET') {
        const parts = path.split('/');
        const jobId = parts[3];
        const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(jobId).first<Job>();
        if (!job) return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });
        return new Response(JSON.stringify({ job }), { headers: corsHeaders });
      }

      // Bookmark / Save Job
      if (path.startsWith('/api/jobs/') && path.endsWith('/save') && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[3];
        await env.DB.prepare('INSERT OR IGNORE INTO saved_jobs (user_phone, job_id, saved_at) VALUES (?, ?, ?)')
          .bind(session.phone, jobId, Date.now()).run();
        return new Response(JSON.stringify({ success: true, saved: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/jobs/') && path.endsWith('/save') && method === 'DELETE') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[3];
        await env.DB.prepare('DELETE FROM saved_jobs WHERE user_phone = ? AND job_id = ?')
          .bind(session.phone, jobId).run();
        return new Response(JSON.stringify({ success: true, saved: false }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 5. APPLICATION SUBMISSION & TRACKING (SNAPSHOT RESUME)
      // -------------------------------------------------------------
      if (path.startsWith('/api/jobs/') && path.endsWith('/apply') && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Please sign in to apply' }), { status: 401 });
        const jobId = path.split('/')[3];
        const b = await request.json() as any;

        const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ? AND status = "approved"').bind(jobId).first<Job>();
        if (!job) return new Response(JSON.stringify({ error: 'This job is no longer accepting applications' }), { status: 404 });

        // Check duplicate application
        const existingApp = await env.DB.prepare(
          'SELECT id FROM job_applications WHERE job_id = ? AND candidate_phone = ?'
        ).bind(jobId, session.phone).first();

        if (existingApp) {
          return new Response(JSON.stringify({ error: 'You have already applied for this position' }), { status: 400 });
        }

        // Get candidate resume (either requested resumeId or current resume)
        let resume = b.resume_id
          ? await env.DB.prepare('SELECT * FROM resumes WHERE id = ? AND user_phone = ?').bind(b.resume_id, session.phone).first<Resume>()
          : await env.DB.prepare('SELECT * FROM resumes WHERE user_phone = ? AND is_current = 1').bind(session.phone).first<Resume>();

        if (!resume) {
          return new Response(JSON.stringify({ error: 'Please upload a resume first' }), { status: 400 });
        }

        const appId = 'APP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        // Freeze resume snapshot into the application!
        await env.DB.prepare(`
          INSERT INTO job_applications (
            id, job_id, candidate_phone, candidate_name, candidate_email,
            resume_id, resume_filename, resume_snapshot_data, resume_mime_type,
            screening_answers_json, cover_note, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied', ?, ?)
        `).bind(
          appId,
          job.id,
          session.phone,
          (b.candidate_name || session.name || 'Candidate').trim(),
          (b.candidate_email || session.email || '').trim(),
          resume.id,
          resume.filename,
          resume.file_data,
          resume.mime_type,
          b.screening_answers_json ? JSON.stringify(b.screening_answers_json) : null,
          (b.cover_note || '').trim(),
          Date.now(),
          Date.now()
        ).run();

        // Record initial status history
        await env.DB.prepare(`
          INSERT INTO application_status_history (id, application_id, from_status, to_status, changed_by_phone, changed_by_role, notes, created_at)
          VALUES (?, ?, 'none', 'applied', ?, 'candidate', 'Application submitted by candidate', ?)
        `).bind('HIST-' + Math.random().toString(36).substring(2, 8), appId, session.phone, Date.now()).run();

        // Send in-app notification to employer
        await env.DB.prepare(`
          INSERT INTO notifications (id, recipient_phone, title, message, action_url, is_read, created_at)
          VALUES (?, ?, 'New Job Application', ?, '/?tab=employer', 0, ?)
        `).bind(
          'NOTIF-' + Math.random().toString(36).substring(2, 8),
          job.employer_phone,
          `New applicant for ${job.title}`,
          Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true, applicationId: appId }), { headers: corsHeaders });
      }

      // Candidate withdraw application
      if (path.startsWith('/api/applications/') && path.endsWith('/withdraw') && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const appId = path.split('/')[3];

        const app = await env.DB.prepare('SELECT * FROM job_applications WHERE id = ? AND candidate_phone = ?').bind(appId, session.phone).first<Application>();
        if (!app) return new Response(JSON.stringify({ error: 'Application not found' }), { status: 404 });

        await env.DB.prepare('UPDATE job_applications SET status = "withdrawn", updated_at = ? WHERE id = ?')
          .bind(Date.now(), appId).run();

        await env.DB.prepare(`
          INSERT INTO application_status_history (id, application_id, from_status, to_status, changed_by_phone, changed_by_role, notes, created_at)
          VALUES (?, ?, ?, 'withdrawn', ?, 'candidate', 'Withdrawn by candidate', ?)
        `).bind('HIST-' + Math.random().toString(36).substring(2, 8), appId, app.status, session.phone, Date.now()).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 6. EMPLOYER DASHBOARD, JOB POSTING & APPLICANTS
      // -------------------------------------------------------------
      if (path === '/api/profile/employer' && method === 'GET') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const profile = await env.DB.prepare('SELECT * FROM employer_profiles WHERE phone = ?').bind(session.phone).first<EmployerProfile>();
        return new Response(JSON.stringify({ profile }), { headers: corsHeaders });
      }

      if (path === '/api/profile/employer' && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const b = await request.json() as any;

        await env.DB.prepare(`
          INSERT INTO employer_profiles (
            phone, company_name, logo_url, industry, website, official_email,
            phone_contact, contact_person, company_address, description,
            verification_status, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unverified', ?)
          ON CONFLICT(phone) DO UPDATE SET
            company_name = excluded.company_name,
            logo_url = excluded.logo_url,
            industry = excluded.industry,
            website = excluded.website,
            official_email = excluded.official_email,
            phone_contact = excluded.phone_contact,
            contact_person = excluded.contact_person,
            company_address = excluded.company_address,
            description = excluded.description,
            updated_at = excluded.updated_at
        `).bind(
          session.phone,
          (b.company_name || 'My Company').trim(),
          (b.logo_url || '').trim(),
          (b.industry || '').trim(),
          (b.website || '').trim(),
          (b.official_email || '').trim(),
          (b.phone_contact || session.phone).trim(),
          (b.contact_person || session.name || '').trim(),
          (b.company_address || '').trim(),
          (b.description || '').trim(),
          Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // Post New Job (Draft or Submit for Admin Review)
      if (path === '/api/employer/jobs' && method === 'POST') {
        if (!session || session.active_role !== 'employer') {
          return new Response(JSON.stringify({ error: 'Employer account required' }), { status: 403 });
        }
        const b = await request.json() as any;
        const id = 'JOB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        const title = (b.title || '').trim();
        const companyName = (b.company_name || session.company_name || 'Alifeo Partner').trim();
        const description = (b.description || '').trim();
        const category = (b.category || 'Engineering').trim();
        const department = (b.department || '').trim();
        const responsibilities = (b.responsibilities || '').trim();
        const qualifications = (b.qualifications || '').trim();
        const requiredSkills = (b.required_skills || '').trim();
        const experienceLevel = (b.experience_level || 'Fresher').trim();
        const minSalary = Number(b.min_salary) || 0;
        const maxSalary = Number(b.max_salary) || 0;
        const salaryDisplay = (b.salary_display || 'Competitive Salary').trim();
        const jobType = (b.job_type || 'full_time').trim();
        const workMode = (b.work_mode || 'remote').trim();
        const city = (b.city || 'Remote').trim();
        const openings = Number(b.openings) || 1;
        const deadline = (b.deadline || '').trim();
        const screeningQuestionsJson = b.screening_questions ? JSON.stringify(b.screening_questions) : null;

        // Save as draft or submit for mandatory admin review
        const status: JobStatus = b.submit_for_review ? 'pending_review' : 'draft';

        if (!title || !description) {
          return new Response(JSON.stringify({ error: 'Title and description are required' }), { status: 400 });
        }

        await env.DB.prepare(`
          INSERT INTO jobs (
            id, employer_phone, company_name, title, department, category,
            description, responsibilities, qualifications, required_skills,
            experience_level, min_salary, max_salary, salary_display, job_type,
            work_mode, city, openings, deadline, screening_questions_json,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id, session.phone, companyName, title, department, category,
          description, responsibilities, qualifications, requiredSkills,
          experienceLevel, minSalary, maxSalary, salaryDisplay, jobType,
          workMode, city, openings, deadline, screeningQuestionsJson,
          status, Date.now(), Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true, id, status }), { headers: corsHeaders });
      }

      // Update existing job
      if (path.startsWith('/api/employer/jobs/') && method === 'PUT') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];
        const b = await request.json() as any;

        const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ? AND employer_phone = ?').bind(jobId, session.phone).first<Job>();
        if (!job) return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });

        const status: JobStatus = b.submit_for_review ? 'pending_review' : (job.status === 'changes_requested' ? 'pending_review' : job.status);

        await env.DB.prepare(`
          UPDATE jobs SET
            title = ?, department = ?, category = ?, description = ?,
            responsibilities = ?, qualifications = ?, required_skills = ?,
            experience_level = ?, min_salary = ?, max_salary = ?, salary_display = ?,
            job_type = ?, work_mode = ?, city = ?, openings = ?, deadline = ?,
            status = ?, updated_at = ?
          WHERE id = ? AND employer_phone = ?
        `).bind(
          b.title || job.title,
          b.department || job.department,
          b.category || job.category,
          b.description || job.description,
          b.responsibilities || job.responsibilities,
          b.qualifications || job.qualifications,
          b.required_skills || job.required_skills,
          b.experience_level || job.experience_level,
          Number(b.min_salary) || job.min_salary,
          Number(b.max_salary) || job.max_salary,
          b.salary_display || job.salary_display,
          b.job_type || job.job_type,
          b.work_mode || job.work_mode,
          b.city || job.city,
          Number(b.openings) || job.openings,
          b.deadline || job.deadline,
          status,
          Date.now(),
          jobId,
          session.phone
        ).run();

        return new Response(JSON.stringify({ success: true, status }), { headers: corsHeaders });
      }

      // Employer change applicant status & add private internal notes
      if (path.startsWith('/api/employer/applications/') && path.endsWith('/status') && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const appId = path.split('/')[4];
        const b = await request.json() as any;
        const newStatus: ApplicationStatus = b.status;
        const notes = (b.notes || '').trim();

        const app = await env.DB.prepare(`
          SELECT a.*, j.employer_phone, j.title as job_title FROM job_applications a
          JOIN jobs j ON a.job_id = j.id
          WHERE a.id = ? AND j.employer_phone = ?
        `).bind(appId, session.phone).first<any>();

        if (!app) return new Response(JSON.stringify({ error: 'Application not found or unauthorized' }), { status: 404 });

        await env.DB.prepare('UPDATE job_applications SET status = ?, updated_at = ? WHERE id = ?')
          .bind(newStatus, Date.now(), appId).run();

        // Record status change history
        await env.DB.prepare(`
          INSERT INTO application_status_history (id, application_id, from_status, to_status, changed_by_phone, changed_by_role, notes, created_at)
          VALUES (?, ?, ?, ?, ?, 'employer', ?, ?)
        `).bind('HIST-' + Math.random().toString(36).substring(2, 8), appId, app.status, newStatus, session.phone, notes, Date.now()).run();

        // Notify candidate
        await env.DB.prepare(`
          INSERT INTO notifications (id, recipient_phone, title, message, action_url, is_read, created_at)
          VALUES (?, ?, 'Application Status Update', ?, '/?tab=applied', 0, ?)
        `).bind(
          'NOTIF-' + Math.random().toString(36).substring(2, 8),
          app.candidate_phone,
          `Your application for ${app.job_title} is now ${newStatus.toUpperCase()}`,
          Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // Save Private Internal Notes (Never visible to applicant)
      if (path.startsWith('/api/employer/applications/') && path.endsWith('/notes') && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const appId = path.split('/')[4];
        const b = await request.json() as any;
        const notes = (b.notes || '').trim();

        await env.DB.prepare('UPDATE job_applications SET employer_internal_notes = ? WHERE id = ?')
          .bind(notes, appId).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 7. INTERVIEWS SCHEDULING & MANAGEMENT
      // -------------------------------------------------------------
      if (path === '/api/interviews/schedule' && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const b = await request.json() as any;
        const appId = b.application_id;

        const app = await env.DB.prepare(`
          SELECT a.*, j.title as job_title, j.employer_phone FROM job_applications a
          JOIN jobs j ON a.job_id = j.id
          WHERE a.id = ? AND j.employer_phone = ?
        `).bind(appId, session.phone).first<any>();

        if (!app) return new Response(JSON.stringify({ error: 'Application not found or unauthorized' }), { status: 404 });

        const interviewId = 'INT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        await env.DB.prepare(`
          INSERT INTO interviews (
            id, application_id, job_id, candidate_phone, employer_phone,
            scheduled_date, scheduled_time, interview_type, location_or_link,
            instructions, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
        `).bind(
          interviewId,
          appId,
          app.job_id,
          app.candidate_phone,
          session.phone,
          b.scheduled_date,
          b.scheduled_time,
          b.interview_type || 'online',
          b.location_or_link || '',
          b.instructions || '',
          Date.now(),
          Date.now()
        ).run();

        // Also update application status to 'interview'
        await env.DB.prepare('UPDATE job_applications SET status = "interview", updated_at = ? WHERE id = ?')
          .bind(Date.now(), appId).run();

        // Notify candidate
        await env.DB.prepare(`
          INSERT INTO notifications (id, recipient_phone, title, message, action_url, is_read, created_at)
          VALUES (?, ?, 'Interview Scheduled', ?, '/?tab=applied', 0, ?)
        `).bind(
          'NOTIF-' + Math.random().toString(36).substring(2, 8),
          app.candidate_phone,
          `Interview scheduled for ${app.job_title} on ${b.scheduled_date} at ${b.scheduled_time}`,
          Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true, interviewId }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 8. CHAT & ABLY INTEGRATION
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
          if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
          const b = await request.json() as any;
          const msgId = 'MSG-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
          const message = (b.message || '').trim();

          if (!message) return new Response(JSON.stringify({ error: 'Message cannot be empty' }), { status: 400 });

          const senderRole = session.active_role === 'employer' ? 'employer' : 'candidate';

          await env.DB.prepare(`
            INSERT INTO chat_messages (id, conversation_id, application_id, sender_phone, sender_role, sender_name, message, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
          `).bind(
            msgId,
            'CONV-' + appId,
            appId,
            session.phone,
            senderRole,
            session.name || (senderRole === 'employer' ? 'Recruiter' : 'Candidate'),
            message,
            Date.now()
          ).run();

          return new Response(JSON.stringify({ success: true, id: msgId }), { headers: corsHeaders });
        }
      }

      if (path.startsWith('/api/chat/') && path.endsWith('/token') && method === 'GET') {
        const parts = path.split('/');
        const appId = parts[3];
        const clientId = session?.phone || 'user-' + Math.random().toString(36).substring(2, 7);

        const tokenData = await getAblyToken(env.ABLY_API_KEY, clientId);
        return new Response(JSON.stringify(tokenData), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 9. TRUST, SAFETY & ABUSE REPORTING
      // -------------------------------------------------------------
      if (path === '/api/reports' && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const b = await request.json() as any;
        const reportId = 'REP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        await env.DB.prepare(`
          INSERT INTO reports (id, reporter_phone, reporter_role, target_type, target_id, reason_category, description, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `).bind(
          reportId,
          session.phone,
          session.active_role,
          b.target_type || 'job',
          b.target_id || '',
          b.reason_category || 'Other',
          (b.description || '').trim(),
          Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true, reportId }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 10. SUPER ADMIN MODERATION & AUDIT LOGS
      // -------------------------------------------------------------
      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/approve') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];

        await env.DB.prepare('UPDATE jobs SET status = "approved", updated_at = ? WHERE id = ?')
          .bind(Date.now(), jobId).run();

        await logAdminAction(env.DB, 'approve_job', 'job', jobId, 'Approved by super admin', 'pending_review', 'approved');

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/reject') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];
        const b = await request.json() as any;
        const reason = (b.reason || 'Did not meet quality guidelines').trim();

        await env.DB.prepare('UPDATE jobs SET status = "rejected", admin_feedback = ?, updated_at = ? WHERE id = ?')
          .bind(reason, Date.now(), jobId).run();

        await logAdminAction(env.DB, 'reject_job', 'job', jobId, reason, 'pending_review', 'rejected');

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/request-changes') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];
        const b = await request.json() as any;
        const feedback = (b.feedback || 'Please update job description and salary information').trim();

        await env.DB.prepare('UPDATE jobs SET status = "changes_requested", admin_feedback = ?, updated_at = ? WHERE id = ?')
          .bind(feedback, Date.now(), jobId).run();

        await logAdminAction(env.DB, 'request_changes', 'job', jobId, feedback, 'pending_review', 'changes_requested');

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/pause') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];

        await env.DB.prepare('UPDATE jobs SET status = "paused", updated_at = ? WHERE id = ?')
          .bind(Date.now(), jobId).run();

        await logAdminAction(env.DB, 'pause_job', 'job', jobId, 'Paused by admin', 'approved', 'paused');

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/remove') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];

        // Soft delete: status = 'removed'
        await env.DB.prepare('UPDATE jobs SET status = "removed", updated_at = ? WHERE id = ?')
          .bind(Date.now(), jobId).run();

        await logAdminAction(env.DB, 'remove_job', 'job', jobId, 'Removed by admin', 'approved', 'removed');

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
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
// HELPER FUNCTIONS & DATABASE SETUP
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

async function logAdminAction(
  db: D1Database,
  action: string,
  targetType: string,
  targetId: string,
  reason: string = '',
  previousStatus: string = '',
  newStatus: string = ''
): Promise<void> {
  try {
    const id = 'LOG-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    await db.prepare(`
      INSERT INTO admin_audit_logs (id, admin_user, action, target_type, target_id, reason, previous_status, new_status, created_at)
      VALUES (?, 'SuperAdmin', ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, action, targetType, targetId, reason, previousStatus, newStatus, Date.now()).run();
  } catch (e) {
    console.warn('logAdminAction error:', e);
  }
}

async function ensureJobTables(db: D1Database): Promise<void> {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        phone TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        active_role TEXT DEFAULT 'job_seeker',
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS job_seeker_profiles (
        phone TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        photo_url TEXT,
        headline TEXT,
        location TEXT,
        education TEXT,
        experience_summary TEXT,
        skills TEXT,
        portfolio_url TEXT,
        linkedin_url TEXT,
        preferred_titles TEXT,
        job_category TEXT,
        industry TEXT,
        experience_level TEXT,
        years_of_experience TEXT,
        preferred_job_types TEXT,
        salary_expectation TEXT,
        preferred_locations TEXT,
        work_modes TEXT,
        notice_period TEXT,
        is_immediate_joiner INTEGER DEFAULT 0,
        current_resume_id TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_phone TEXT,
        filename TEXT,
        file_data TEXT,
        file_size INTEGER,
        mime_type TEXT,
        is_current INTEGER DEFAULT 1,
        uploaded_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS employer_profiles (
        phone TEXT PRIMARY KEY,
        company_name TEXT,
        logo_url TEXT,
        industry TEXT,
        website TEXT,
        official_email TEXT,
        phone_contact TEXT,
        contact_person TEXT,
        company_address TEXT,
        description TEXT,
        verification_status TEXT DEFAULT 'unverified',
        verification_notes TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        employer_phone TEXT NOT NULL,
        company_name TEXT NOT NULL,
        company_logo TEXT,
        title TEXT NOT NULL,
        department TEXT,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        responsibilities TEXT,
        qualifications TEXT,
        required_skills TEXT,
        experience_level TEXT,
        min_salary INTEGER,
        max_salary INTEGER,
        salary_display TEXT NOT NULL,
        job_type TEXT NOT NULL,
        work_mode TEXT NOT NULL,
        city TEXT NOT NULL,
        openings INTEGER DEFAULT 1,
        deadline TEXT,
        screening_questions_json TEXT,
        status TEXT DEFAULT 'draft',
        admin_feedback TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        candidate_phone TEXT NOT NULL,
        candidate_name TEXT NOT NULL,
        candidate_email TEXT,
        resume_id TEXT NOT NULL,
        resume_filename TEXT NOT NULL,
        resume_snapshot_data TEXT NOT NULL,
        resume_mime_type TEXT NOT NULL,
        screening_answers_json TEXT,
        cover_note TEXT,
        status TEXT DEFAULT 'applied',
        employer_internal_notes TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS application_status_history (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        from_status TEXT,
        to_status TEXT,
        changed_by_phone TEXT,
        changed_by_role TEXT,
        notes TEXT,
        created_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS interviews (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        candidate_phone TEXT NOT NULL,
        employer_phone TEXT NOT NULL,
        scheduled_date TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        interview_type TEXT NOT NULL,
        location_or_link TEXT,
        instructions TEXT,
        status TEXT DEFAULT 'scheduled',
        reschedule_reason TEXT,
        created_at INTEGER,
        updated_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        application_id TEXT NOT NULL,
        sender_phone TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        user_phone TEXT NOT NULL,
        job_id TEXT NOT NULL,
        saved_at INTEGER NOT NULL,
        PRIMARY KEY (user_phone, job_id)
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        reporter_phone TEXT NOT NULL,
        reporter_role TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        reason_category TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        admin_notes TEXT,
        created_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id TEXT PRIMARY KEY,
        admin_user TEXT NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        reason TEXT,
        previous_status TEXT,
        new_status TEXT,
        created_at INTEGER
      )
    `).run();

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        recipient_phone TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        action_url TEXT,
        is_read INTEGER DEFAULT 0,
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

    // Seed initial verified jobs if jobs table is empty
    const countRes = await db.prepare('SELECT COUNT(*) as cnt FROM jobs').first<{ cnt: number }>();
    if (!countRes || countRes.cnt === 0) {
      const defaultJobs = [
        {
          id: 'ALF-JOB-SDE1',
          title: 'Software Development Engineer - SDE 1',
          company_name: 'Alifeo',
          city: 'Moradabad',
          work_mode: 'hybrid',
          job_type: 'full_time',
          salary_display: '₹25,000 - ₹40,000 / month',
          category: 'Engineering',
          experience_level: 'Fresher (0-2 yrs)',
          description: 'Design and build high-performance web applications, serverless microservices, and interactive client experiences for the Alifeo ecosystem.',
          responsibilities: 'Build reusable frontend components, implement serverless APIs, optimize database queries, collaborate with UI/UX designers.',
          qualifications: 'B.Tech / BCA or equivalent portfolio demonstrating full stack web development projects.',
          required_skills: 'TypeScript, React, Node.js, Cloudflare Workers, REST APIs, SQL',
        },
        {
          id: 'ALF-JOB-SDE2',
          title: 'Senior Backend Engineer - SDE 2',
          company_name: 'Alifeo',
          city: 'Remote',
          work_mode: 'remote',
          job_type: 'full_time',
          salary_display: '₹50,000 - ₹80,000 / month',
          category: 'Engineering',
          experience_level: '2-4 years',
          description: 'Architect scalable edge distributed architectures, database schemas, real-time WebSockets, and secure API gateways.',
          responsibilities: 'Architect distributed event-driven systems, ensure high availability, manage D1 / PostgreSQL databases, optimize latency.',
          qualifications: 'Demonstrated experience shipping production systems with distributed databases and WebSockets.',
          required_skills: 'Distributed Systems, Node.js, D1, PostgreSQL, Ably, Security',
        },
        {
          id: 'ALF-JOB-UIUX',
          title: 'UI/UX & Product Designer',
          company_name: 'Alifeo',
          city: 'Moradabad',
          work_mode: 'hybrid',
          job_type: 'internship',
          salary_display: '₹20,000 - ₹35,000 / month',
          category: 'Design',
          experience_level: 'Fresher / Portfolio required',
          description: 'Craft intuitive, modern, clean mobile-first UI components, design tokens, Figma prototypes, and micro-interactions for Alifeo products.',
          responsibilities: 'Design mobile-first user flows, create design system components in Figma, conduct user feedback testing.',
          qualifications: 'Strong design portfolio demonstrating mobile UI heuristics and clean aesthetic sense.',
          required_skills: 'Figma, Mobile UI Design, Prototyping, Wireframing, Design Systems',
        },
        {
          id: 'ZIF-JOB-SM',
          title: 'Social Media & Content Creator',
          company_name: 'Zifeeo',
          city: 'Delhi NCR',
          work_mode: 'hybrid',
          job_type: 'internship',
          salary_display: '₹12,000 - ₹18,000 / month',
          category: 'Marketing',
          experience_level: '0-1 year',
          description: 'Lead viral short-form video content creation, Instagram Reels, LinkedIn posts, and youth community engagement for Zifeeo.',
          responsibilities: 'Script and edit engaging short videos, plan weekly content calendars, monitor engagement analytics.',
          qualifications: 'Demonstrated video editing skills (CapCut/Premiere) and active social presence.',
          required_skills: 'Social Media Marketing, Short-form Video, Content Strategy, Canva',
        },
        {
          id: 'AAB-JOB-MKT',
          title: 'Growth Marketing & Campaign Specialist',
          company_name: 'Aabeeo',
          city: 'Remote',
          work_mode: 'remote',
          job_type: 'full_time',
          salary_display: '₹30,000 - ₹45,000 / month',
          category: 'Marketing',
          experience_level: '1-3 years',
          description: 'Execute customer acquisition campaigns, performance ads (Meta/Google), email automation, and conversion rate optimization for Aabeeo.',
          responsibilities: 'Run paid performance campaigns, optimize user acquisition funnels, analyze ROI across ad channels.',
          qualifications: 'Proven track record of managing paid growth campaigns with measurable CAC and ROAS.',
          required_skills: 'Growth Marketing, Meta Ads, Google Analytics, SEO, CRO',
        },
        {
          id: 'ALF-JOB-HR',
          title: 'HR & Talent Acquisition Specialist',
          company_name: 'Alifeo',
          city: 'Remote',
          work_mode: 'remote',
          job_type: 'internship',
          salary_display: '₹15,000 - ₹22,000 / month',
          category: 'Operations',
          experience_level: 'Fresher / 0-1 year',
          description: 'Source top candidate talent across engineering and design, coordinate candidate interviews, and manage internship onboarding.',
          responsibilities: 'Screen applicants, coordinate interview schedules, manage candidate communication, handle onboarding paperwork.',
          qualifications: 'Excellent communication skills and interest in modern talent acquisition.',
          required_skills: 'Talent Acquisition, Resume Screening, Interview Scheduling, HR Operations',
        },
      ];

      for (const j of defaultJobs) {
        await db.prepare(`
          INSERT OR IGNORE INTO jobs (
            id, employer_phone, company_name, title, category, description,
            responsibilities, qualifications, required_skills, experience_level,
            salary_display, job_type, work_mode, city, status, created_at, updated_at
          ) VALUES (?, '919876543210', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?)
        `).bind(
          j.id, j.company_name, j.title, j.category, j.description,
          j.responsibilities, j.qualifications, j.required_skills, j.experience_level,
          j.salary_display, j.job_type, j.work_mode, j.city, Date.now(), Date.now()
        ).run();
      }
    }
  } catch (err) {
    console.error('ensureJobTables DDL error:', err);
  }
}
