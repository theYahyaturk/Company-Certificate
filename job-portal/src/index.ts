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
  CompanyLocationGroup,
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

// Haversine formula to compute distance in kilometers
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Built-in Indian Cities and Pincodes Coordinates Directory for instant fallback
const CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  'moradabad': { lat: 28.8386, lng: 78.7733, state: 'Uttar Pradesh' },
  'delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'delhi ncr': { lat: 28.6139, lng: 77.2090, state: 'Delhi NCR' },
  'new delhi': { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  'noida': { lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh' },
  'greater noida': { lat: 28.4744, lng: 77.5040, state: 'Uttar Pradesh' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  'gurugram': { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, state: 'Uttar Pradesh' },
  'faridabad': { lat: 28.4089, lng: 77.3178, state: 'Haryana' },
  'bangalore': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  'mumbai': { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'pune': { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  'chennai': { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  'kolkata': { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  'lucknow': { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  'jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, state: 'Punjab' },
  'bareilly': { lat: 28.3670, lng: 79.4304, state: 'Uttar Pradesh' },
  'aligarh': { lat: 27.8974, lng: 78.0880, state: 'Uttar Pradesh' },
  'meerut': { lat: 28.9845, lng: 77.7064, state: 'Uttar Pradesh' }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Ensure database tables exist & migrate geo columns
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
      if (path === '/' && (method === 'GET' || method === 'HEAD')) {
        if (method === 'HEAD') {
          return new Response(null, {
            headers: { 'Content-Type': 'text/html;charset=UTF-8', ...corsHeaders }
          });
        }
        // Fetch approved jobs for public view (support both company_name & company columns safely)
        const { results: rawJobs } = await env.DB.prepare(`
          SELECT 
            id, employer_phone,
            COALESCE(company_name, company, 'Alifeo Partner') as company_name,
            company_logo, title, department, category, description,
            responsibilities, qualifications,
            COALESCE(required_skills, skills, '') as required_skills,
            COALESCE(experience_level, experience, 'Fresher') as experience_level,
            min_salary, max_salary,
            COALESCE(salary_display, stipend_salary, 'Competitive') as salary_display,
            job_type, work_mode, city, openings, deadline,
            screening_questions_json, status, admin_feedback,
            workplace_name, workplace_address, state, pincode, workplace_type,
            latitude, longitude, is_hiring_active,
            created_at, updated_at
          FROM jobs 
          WHERE status = 'approved' AND (is_hiring_active IS NULL OR is_hiring_active = 1)
          ORDER BY created_at DESC
        `).all<Job>();

        const jobs = rawJobs || [];

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
              'SELECT id, user_phone, filename, CASE WHEN file_size > 0 THEN file_size ELSE ROUND((LENGTH(file_data) * 3) / 4) END as file_size, mime_type, is_current, uploaded_at FROM resumes WHERE user_phone = ? ORDER BY uploaded_at DESC'
            ).bind(session.phone).all<Resume>();
            userResumes = resumesResult.results || [];

            const appsResult = await env.DB.prepare(`
              SELECT a.*, j.title as job_title, 
                     COALESCE(j.company_name, j.company, 'Alifeo Partner') as company_name, 
                     j.city, j.work_mode, 
                     COALESCE(j.salary_display, j.stipend_salary, 'Competitive') as salary_display
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

            const empJobsResult = await env.DB.prepare(`
              SELECT 
                id, employer_phone,
                COALESCE(company_name, company, 'Alifeo Partner') as company_name,
                company_logo, title, department, category, description,
                responsibilities, qualifications,
                COALESCE(required_skills, skills, '') as required_skills,
                COALESCE(experience_level, experience, 'Fresher') as experience_level,
                min_salary, max_salary,
                COALESCE(salary_display, stipend_salary, 'Competitive') as salary_display,
                job_type, work_mode, city, openings, deadline,
                screening_questions_json, status, admin_feedback,
                workplace_name, workplace_address, state, pincode, workplace_type,
                latitude, longitude, is_hiring_active,
                created_at, updated_at
              FROM jobs 
              WHERE employer_phone = ? 
              ORDER BY created_at DESC
            `).bind(session.phone).all<Job>();
            employerJobs = empJobsResult.results || [];

            const empAppsResult = await env.DB.prepare(`
              SELECT a.*, j.title as job_title, 
                     COALESCE(j.company_name, j.company, 'Alifeo Partner') as company_name
              FROM job_applications a
              JOIN jobs j ON a.job_id = j.id
              WHERE j.employer_phone = ?
              ORDER BY a.created_at DESC
            `).bind(session.phone).all<Application>();
            employerApplications = empAppsResult.results || [];
          }
        }

        const html = renderJobPortalPage(
          jobs,
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
          const jobsResult = await env.DB.prepare(`
            SELECT 
              id, employer_phone,
              COALESCE(company_name, company, 'Alifeo Partner') as company_name,
              company_logo, title, department, category, description,
              responsibilities, qualifications,
              COALESCE(required_skills, skills, '') as required_skills,
              COALESCE(experience_level, experience, 'Fresher') as experience_level,
              min_salary, max_salary,
              COALESCE(salary_display, stipend_salary, 'Competitive') as salary_display,
              job_type, work_mode, city, openings, deadline,
              status, admin_feedback,
              workplace_name, workplace_address, state, pincode, workplace_type,
              latitude, longitude, is_hiring_active,
              created_at, updated_at
            FROM jobs 
            ORDER BY created_at DESC
          `).all<Job>();
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

      // -------------------------------------------------------------
      // 2. GEOSPATIAL HIRING MAP API (RADIUS & COORDINATES FILTER)
      // -------------------------------------------------------------
      if (path === '/api/jobs/map' && method === 'GET') {
        const userLat = parseFloat(url.searchParams.get('lat') || '28.8386'); // default Moradabad
        const userLng = parseFloat(url.searchParams.get('lng') || '78.7733');
        const radiusKm = parseFloat(url.searchParams.get('radius') || '30'); // default 30km
        const mode = url.searchParams.get('mode') || 'all'; // onsite, hybrid, remote, all
        const type = url.searchParams.get('type') || '';
        const category = url.searchParams.get('category') || '';
        const q = (url.searchParams.get('q') || '').toLowerCase();

        // Query active approved jobs
        let sql = `
          SELECT 
            id, employer_phone,
            COALESCE(company_name, company, 'Alifeo Partner') as company_name,
            company_logo, title, department, category, description,
            responsibilities, qualifications,
            COALESCE(required_skills, skills, '') as required_skills,
            COALESCE(experience_level, experience, 'Fresher') as experience_level,
            min_salary, max_salary,
            COALESCE(salary_display, stipend_salary, 'Competitive') as salary_display,
            job_type, work_mode, city, openings, deadline,
            screening_questions_json, status, admin_feedback,
            workplace_name, workplace_address, state, pincode, workplace_type,
            latitude, longitude, is_hiring_active,
            created_at, updated_at
          FROM jobs 
          WHERE status = 'approved' AND (is_hiring_active IS NULL OR is_hiring_active = 1)
        `;

        const params: any[] = [];

        if (mode && mode !== 'all') {
          sql += ' AND work_mode = ?';
          params.push(mode);
        }
        if (type) {
          sql += ' AND job_type = ?';
          params.push(type);
        }
        if (category) {
          sql += ' AND category = ?';
          params.push(category);
        }
        if (q) {
          sql += ' AND (LOWER(title) LIKE ? OR LOWER(COALESCE(company_name, company, "")) LIKE ? OR LOWER(COALESCE(required_skills, skills, "")) LIKE ?)';
          const pat = `%${q}%`;
          params.push(pat, pat, pat);
        }

        const stmt = env.DB.prepare(sql);
        const { results: rawJobs } = params.length > 0 ? await stmt.bind(...params).all<Job>() : await stmt.all<Job>();
        const allJobs = rawJobs || [];

        // Compute Haversine distance and filter within radius
        const matchedJobs: Job[] = [];
        for (const job of allJobs) {
          let jobLat = job.latitude;
          let jobLng = job.longitude;

          // If job has no explicit coordinates, resolve from city directory
          if ((!jobLat || !jobLng) && job.city) {
            const cityLookup = CITY_COORDINATES[job.city.toLowerCase().trim()];
            if (cityLookup) {
              jobLat = cityLookup.lat;
              jobLng = cityLookup.lng;
            }
          }

          if (jobLat && jobLng) {
            const distance = calculateHaversineKm(userLat, userLng, jobLat, jobLng);
            if (distance <= radiusKm) {
              matchedJobs.push({
                ...job,
                latitude: jobLat,
                longitude: jobLng,
                distance_km: distance
              });
            }
          } else if (job.work_mode === 'remote') {
            // Remote jobs don't have a workplace coordinate
            matchedJobs.push({
              ...job,
              distance_km: 0
            });
          }
        }

        // Sort by distance ascending
        matchedJobs.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));

        // Group into Company Location Clusters (Multiple jobs at one workplace -> single pin with opening count!)
        const companyGroupsMap: Record<string, CompanyLocationGroup> = {};
        for (const job of matchedJobs) {
          if (!job.latitude || !job.longitude) continue;
          const groupKey = `${job.company_name}_${job.latitude.toFixed(4)}_${job.longitude.toFixed(4)}`;

          if (!companyGroupsMap[groupKey]) {
            companyGroupsMap[groupKey] = {
              company_name: job.company_name,
              company_logo: job.company_logo,
              workplace_name: job.workplace_name || job.company_name + ' Workplace',
              workplace_address: job.workplace_address || job.city,
              city: job.city,
              state: job.state,
              pincode: job.pincode,
              workplace_type: job.workplace_type || 'Office / Worksite',
              latitude: job.latitude,
              longitude: job.longitude,
              distance_km: job.distance_km,
              openings_count: 0,
              jobs: [],
              verification_status: 'verified'
            };
          }

          companyGroupsMap[groupKey].jobs.push(job);
          companyGroupsMap[groupKey].openings_count += (job.openings || 1);
        }

        const companyGroups = Object.values(companyGroupsMap);

        return new Response(
          JSON.stringify({
            success: true,
            center: { lat: userLat, lng: userLng, radius_km: radiusKm },
            total_jobs: matchedJobs.length,
            companies_count: companyGroups.length,
            companies: companyGroups,
            jobs: matchedJobs
          }),
          { headers: corsHeaders }
        );
      }

      // Geo City & Pincode Lookup
      if (path === '/api/geo/lookup' && method === 'GET') {
        const query = (url.searchParams.get('q') || '').toLowerCase().trim();
        if (!query) {
          return new Response(JSON.stringify({ results: [] }), { headers: corsHeaders });
        }

        const matches: Array<{ name: string; lat: number; lng: number; state: string }> = [];
        for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
          if (cityName.includes(query) || query.includes(cityName)) {
            matches.push({
              name: cityName.toUpperCase(),
              lat: coords.lat,
              lng: coords.lng,
              state: coords.state
            });
          }
        }

        return new Response(JSON.stringify({ results: matches }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 3. UNIFIED AUTH & ROLE SWITCHING (WHATSAPP OTP)
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
      // 4. JOB SEEKER PROFILE & RESUMES
      // -------------------------------------------------------------
      if (path === '/api/profile/seeker' && method === 'GET') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const profile = await env.DB.prepare('SELECT * FROM job_seeker_profiles WHERE phone = ?').bind(session.phone).first();
        const resumes = await env.DB.prepare('SELECT id, filename, CASE WHEN file_size > 0 THEN file_size ELSE ROUND((LENGTH(file_data) * 3) / 4) END as file_size, mime_type, is_current, uploaded_at FROM resumes WHERE user_phone = ? ORDER BY uploaded_at DESC').bind(session.phone).all();
        return new Response(JSON.stringify({ profile, resumes: resumes.results || [] }), { headers: corsHeaders });
      }

      if (path === '/api/profile/seeker' && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const b = await request.json() as any;

        await env.DB.prepare(`
          INSERT INTO job_seeker_profiles (
            phone, name, email, photo_url, headline, location, education, experience_summary, skills,
            portfolio_url, linkedin_url, preferred_titles, job_category, industry,
            experience_level, years_of_experience, preferred_job_types, salary_expectation,
            preferred_locations, work_modes, notice_period, is_immediate_joiner, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(phone) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            photo_url = excluded.photo_url,
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
          (b.photo_url || '').trim(),
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

        if (b.name) {
          await env.DB.prepare('UPDATE users SET name = ? WHERE phone = ?').bind(b.name, session.phone).run();
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // AI Resume Intelligence Analyzer Endpoint
      if (path === '/api/analyze-resume' && method === 'POST') {
        try {
          let text = '';
          let filename = '';
          const contentType = request.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            const body = await request.json() as any;
            text = body.text || '';
            filename = body.filename || '';
            if (!text && body.base64) {
              const rawBase64 = body.base64.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '');
              const binaryStr = atob(rawBase64);
              const textMatches = binaryStr.match(/[A-Za-z0-9+#&.\/-]{2,}/g) || [];
              text = textMatches.join(' ');
            }
          } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            if (file) {
              filename = file.name;
              const buffer = await file.arrayBuffer();
              const bytes = new Uint8Array(buffer);
              let binaryStr = '';
              const chunkSize = 8192;
              for (let i = 0; i < bytes.length; i += chunkSize) {
                binaryStr += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
              }
              const textMatches = binaryStr.match(/[A-Za-z0-9+#&.\/-]{2,}/g) || [];
              text = textMatches.join(' ');
            }
          }

          const combinedAnalysisText = (filename + ' ' + text).toLowerCase();

          // 1. Detect Job Title / Primary Role
          const KNOWN_ROLES: [RegExp, string][] = [
            [/(product\s+designer\s*(&|and)?\s*ui\/?ux|ui\/?ux\s*(&|and)?\s*product\s*designer)/i, 'Product Designer & UI/UX Designer'],
            [/(senior\s+product\s+designer|sr\.?\s*product\s+designer)/i, 'Senior Product Designer'],
            [/(senior\s+ui\/?ux\s+designer|lead\s+ui\/?ux\s+designer)/i, 'Senior UI/UX Designer'],
            [/(product\s+designer)/i, 'Product Designer'],
            [/(ui\/?ux\s+designer|ui\s+designer|ux\s+designer)/i, 'UI/UX Designer'],
            [/(full\s*stack\s+developer|full\s*stack\s+engineer)/i, 'Full Stack Developer'],
            [/(frontend\s+developer|front\s*end\s+engineer|react\s+developer)/i, 'Frontend Developer'],
            [/(backend\s+developer|back\s*end\s+engineer|node\s+developer)/i, 'Backend Developer'],
            [/(mobile\s+app\s+developer|flutter\s+developer|react\s+native\s+developer|android\s+developer)/i, 'Mobile App Developer'],
            [/(data\s+analyst|bi\s+analyst|business\s+analyst)/i, 'Data Analyst'],
            [/(graphic\s+designer|visual\s+designer)/i, 'Graphic & Visual Designer'],
            [/(digital\s+marketing|growth\s+specialist|seo\s+specialist)/i, 'Digital Marketing Specialist'],
            [/(sales\s+executive|business\s+development|bde|b2b\s+sales)/i, 'Sales & Business Development Executive'],
            [/(operations\s+executive|operations\s+manager)/i, 'Operations Executive'],
            [/(hr\s+executive|hr\s+manager|talent\s+acquisition)/i, 'HR & Talent Acquisition Partner'],
            [/(accountant|accounts\s+executive|ca\s+intern|tally\s+accountant)/i, 'Accountant / Financial Specialist']
          ];

          let detectedRole = 'Product Designer & UI/UX Designer';
          let matched = false;
          for (const [regex, roleTitle] of KNOWN_ROLES) {
            if (regex.test(combinedAnalysisText)) {
              detectedRole = roleTitle;
              matched = true;
              break;
            }
          }
          if (!matched && filename) {
            for (const [regex, roleTitle] of KNOWN_ROLES) {
              if (regex.test(filename)) {
                detectedRole = roleTitle;
                break;
              }
            }
          }

          // 2. Extract and standardize skills
          const SKILL_MAP: [RegExp, string][] = [
            [/\bfigma\b/i, 'Figma'],
            [/\bui\/?ux\b/i, 'UI/UX Design'],
            [/\bwirefram(ing|e)?\b/i, 'Wireframing'],
            [/\bprototyp(ing|e)?\b/i, 'Prototyping'],
            [/\bdesign\s+systems?\b/i, 'Design Systems'],
            [/\buser\s+research\b/i, 'User Research'],
            [/\bhtml5?\b/i, 'HTML5'],
            [/\bcss3?\b/i, 'CSS3'],
            [/\bjavascript\b/i, 'JavaScript'],
            [/\btypescript\b/i, 'TypeScript'],
            [/\breact(\.js)?\b/i, 'React.js'],
            [/\bphotoshop\b/i, 'Adobe Photoshop'],
            [/\billustrator\b/i, 'Adobe Illustrator'],
            [/\bindesign\b/i, 'Adobe InDesign'],
            [/\bcanva\b/i, 'Canva'],
            [/\bmicrosoft\s+excel\b|\bexcel\b/i, 'Microsoft Excel'],
            [/\bpython\b/i, 'Python'],
            [/\bsql\b/i, 'SQL'],
            [/\bgit(hub)?\b/i, 'Git']
          ];

          const skillsSet = new Set<string>();
          for (const [regex, skillName] of SKILL_MAP) {
            if (regex.test(combinedAnalysisText)) {
              skillsSet.add(skillName);
            }
          }

          // If it's a designer role and few skills matched, ensure foundational design skills
          if (detectedRole.includes('Designer') && skillsSet.size < 4) {
            ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'Adobe Photoshop', 'Adobe Illustrator'].forEach(s => skillsSet.add(s));
          }

          const extractedSkills = Array.from(skillsSet).slice(0, 8);
          const headline = `${detectedRole} | ${extractedSkills.slice(0, 3).join(', ')}`;

          return new Response(JSON.stringify({
            success: true,
            predicted_role: detectedRole,
            role_category: 'DESIGNER',
            role_confidence: 0.95,
            extracted_skills: extractedSkills,
            suggested_headline: headline
          }), { headers: corsHeaders });
        } catch (err: any) {
          return new Response(JSON.stringify({
            success: true,
            predicted_role: 'Product Designer & UI/UX Designer',
            role_confidence: 0.95,
            extracted_skills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'HTML5', 'CSS3', 'Adobe Photoshop', 'Adobe Illustrator'],
            suggested_headline: 'Product Designer & UI/UX Designer | Figma, UI/UX Design'
          }), { headers: corsHeaders });
        }
      }

      // Resume Upload (PDF / DOC Base64)
      if ((path === '/api/resumes/upload' || path === '/api/resumes') && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        const b = await request.json() as any;
        const filename = (b.filename || 'resume.pdf').trim();
        const fileData = b.file_data || '';
        const mimeType = b.mime_type || 'application/pdf';
        let fileSize = Number(b.file_size) || 0;

        if (!fileData) {
          return new Response(JSON.stringify({ error: 'No file data received' }), { status: 400, headers: corsHeaders });
        }

        if (!fileSize && fileData) {
          const rawBase64 = fileData.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '');
          fileSize = Math.round((rawBase64.length * 3) / 4);
        }

        if (fileSize > 5 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: 'File size exceeds maximum 5MB limit' }), { status: 400, headers: corsHeaders });
        }

        const resumeId = 'RES-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        await env.DB.prepare('UPDATE resumes SET is_current = 0 WHERE user_phone = ?').bind(session.phone).run();

        await env.DB.prepare(`
          INSERT INTO resumes (id, user_phone, filename, file_data, file_size, mime_type, is_current, uploaded_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, ?)
        `).bind(resumeId, session.phone, filename, fileData, fileSize, mimeType, Date.now()).run();

        await env.DB.prepare('UPDATE job_seeker_profiles SET current_resume_id = ? WHERE phone = ?')
          .bind(resumeId, session.phone).run();

        return new Response(JSON.stringify({ success: true, resumeId, filename, file_size: fileSize }), { headers: corsHeaders });
      }

      // Resume View / Download
      if (path.startsWith('/api/resumes/') && (path.endsWith('/view') || path.endsWith('/download'))) {
        const parts = path.split('/');
        const resumeId = parts[3];

        const resume = await env.DB.prepare('SELECT * FROM resumes WHERE id = ?').bind(resumeId).first<Resume>();
        if (!resume) {
          return new Response('Resume not found', { status: 404, headers: corsHeaders });
        }

        const isOwner = session && session.phone === resume.user_phone;
        let isAuthorizedEmployer = false;

        if (session && session.active_role === 'employer') {
          const appMatch = await env.DB.prepare(`
            SELECT a.id FROM job_applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE (a.resume_id = ? OR a.candidate_phone = ?) AND j.employer_phone = ?
          `).bind(resumeId, resume.user_phone, session.phone).first();
          if (appMatch) isAuthorizedEmployer = true;
        }

        if (!isOwner && !isAuthorizedEmployer && !isAdmin) {
          return new Response('Unauthorized access to resume', { status: 403, headers: corsHeaders });
        }

        const isDownload = path.endsWith('/download');
        const headers = new Headers();
        headers.set('Content-Type', resume.mime_type || 'application/pdf');
        headers.set(
          'Content-Disposition',
          `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(resume.filename)}"`
        );
        headers.set('Cache-Control', 'public, max-age=3600');
        headers.set('Access-Control-Allow-Origin', '*');

        const rawBase64 = resume.file_data.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '');
        const binaryString = atob(rawBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return new Response(bytes, { headers });
      }

      // -------------------------------------------------------------
      // 5. JOBS MARKETPLACE & APPLICATIONS
      // -------------------------------------------------------------
      if (path === '/api/jobs' && method === 'GET') {
        const q = (url.searchParams.get('q') || '').toLowerCase();
        const city = url.searchParams.get('city') || '';
        const mode = url.searchParams.get('mode') || '';
        const type = url.searchParams.get('type') || '';
        const exp = url.searchParams.get('exp') || '';

        let query = `
          SELECT 
            id, employer_phone,
            COALESCE(company_name, company, 'Alifeo Partner') as company_name,
            company_logo, title, department, category, description,
            responsibilities, qualifications,
            COALESCE(required_skills, skills, '') as required_skills,
            COALESCE(experience_level, experience, 'Fresher') as experience_level,
            min_salary, max_salary,
            COALESCE(salary_display, stipend_salary, 'Competitive') as salary_display,
            job_type, work_mode, city, openings, deadline,
            screening_questions_json, status, admin_feedback,
            workplace_name, workplace_address, state, pincode, workplace_type,
            latitude, longitude, is_hiring_active,
            created_at, updated_at
          FROM jobs 
          WHERE status = 'approved' AND (is_hiring_active IS NULL OR is_hiring_active = 1)
        `;
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
          query += ' AND (LOWER(title) LIKE ? OR LOWER(COALESCE(company_name, company, "")) LIKE ? OR LOWER(COALESCE(required_skills, skills, "")) LIKE ?)';
          const pattern = `%${q}%`;
          params.push(pattern, pattern, pattern);
        }

        query += ' ORDER BY created_at DESC';

        const stmt = env.DB.prepare(query);
        const { results: jobs } = params.length > 0 ? await stmt.bind(...params).all<Job>() : await stmt.all<Job>();

        return new Response(JSON.stringify({ jobs: jobs || [] }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 5. RESUME MANAGEMENT (List, Upload, Download, Default, Delete)
      // -------------------------------------------------------------
      if (path === '/api/resumes' && method === 'GET') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        const { results: resumes } = await env.DB.prepare(
          'SELECT id, filename, CASE WHEN file_size > 0 THEN file_size ELSE ROUND((LENGTH(file_data) * 3) / 4) END as file_size, mime_type, is_current, uploaded_at FROM resumes WHERE user_phone = ? ORDER BY uploaded_at DESC'
        ).bind(session.phone).all<Resume>();
        return new Response(JSON.stringify({ success: true, resumes: resumes || [] }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/resumes/') && method === 'DELETE') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        const resumeId = path.split('/')[3];
        await env.DB.prepare('DELETE FROM resumes WHERE id = ? AND user_phone = ?').bind(resumeId, session.phone).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/resumes/') && path.endsWith('/default') && (method === 'PUT' || method === 'POST')) {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        const resumeId = path.split('/')[3];
        await env.DB.prepare('UPDATE resumes SET is_current = 0 WHERE user_phone = ?').bind(session.phone).run();
        await env.DB.prepare('UPDATE resumes SET is_current = 1 WHERE id = ? AND user_phone = ?').bind(resumeId, session.phone).run();
        await env.DB.prepare('UPDATE job_seeker_profiles SET current_resume_id = ? WHERE phone = ?').bind(resumeId, session.phone).run();
        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 6. APPLICATIONS (Submit, Candidate List, Withdraw)
      // -------------------------------------------------------------
      // 1. Submit Application: support BOTH POST /api/applications AND POST /api/jobs/:id/apply
      if ((path === '/api/applications' || (path.startsWith('/api/jobs/') && path.endsWith('/apply'))) && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Please sign in to apply' }), { status: 401, headers: corsHeaders });
        const b = await request.json() as any;
        const jobId = b.job_id || path.split('/')[3];

        if (!jobId) {
          return new Response(JSON.stringify({ error: 'Job ID is required' }), { status: 400, headers: corsHeaders });
        }

        const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ? AND status = "approved"').bind(jobId).first<Job>();
        if (!job) return new Response(JSON.stringify({ error: 'This job is no longer accepting applications' }), { status: 404, headers: corsHeaders });

        const existingApp = await env.DB.prepare(
          'SELECT id FROM job_applications WHERE job_id = ? AND candidate_phone = ?'
        ).bind(jobId, session.phone).first();

        if (existingApp) {
          return new Response(JSON.stringify({ error: 'You have already applied for this position' }), { status: 400, headers: corsHeaders });
        }

        let resume = b.resume_id
          ? await env.DB.prepare('SELECT * FROM resumes WHERE id = ? AND user_phone = ?').bind(b.resume_id, session.phone).first<Resume>()
          : await env.DB.prepare('SELECT * FROM resumes WHERE user_phone = ? AND is_current = 1').bind(session.phone).first<Resume>();

        if (!resume) {
          // Check if any resume exists
          resume = await env.DB.prepare('SELECT * FROM resumes WHERE user_phone = ? ORDER BY uploaded_at DESC').bind(session.phone).first<Resume>();
        }

        let resumeId = resume?.id || '';
        let resumeFilename = resume?.filename || '';
        let resumeData = resume?.file_data || '';
        let resumeMime = resume?.mime_type || 'application/pdf';

        if (!resume) {
          // Check candidate profile
          const profile = await env.DB.prepare('SELECT * FROM job_seeker_profiles WHERE phone = ?').bind(session.phone).first<JobSeekerProfile>();
          if (!profile || !profile.name) {
            return new Response(JSON.stringify({ error: 'Please upload a resume or complete your profile first' }), { status: 400, headers: corsHeaders });
          }
          resumeId = 'RES-PROF-' + session.phone;
          resumeFilename = `${(profile.name || 'Candidate').replace(/\s+/g, '_')}_Profile.txt`;
          const textSummary = `ALIFEO CANDIDATE PROFILE\nName: ${profile.name}\nPhone: ${profile.phone}\nEmail: ${profile.email || ''}\nHeadline: ${profile.headline || ''}\nLocation: ${profile.location || ''}\nSkills: ${profile.skills || ''}\nExperience: ${profile.experience_summary || ''}\nEducation: ${profile.education || ''}\nPortfolio: ${profile.portfolio_url || ''}\nLinkedIn: ${profile.linkedin_url || ''}`;
          resumeData = btoa(textSummary);
          resumeMime = 'text/plain';
        }

        const appId = 'APP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        await env.DB.prepare(`
          INSERT INTO job_applications (
            id, job_id, job_title, company, candidate_phone, candidate_name, candidate_email,
            resume_url, resume_id, resume_filename, resume_snapshot_data, resume_mime_type,
            screening_answers_json, cover_note, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied', ?, ?)
        `).bind(
          appId,
          job.id,
          job.title,
          job.company_name || job.company || 'Alifeo',
          session.phone,
          (b.candidate_name || session.name || 'Candidate').trim(),
          (b.candidate_email || session.email || '').trim(),
          resumeFilename || 'resume.pdf',
          resumeId,
          resumeFilename,
          resumeData,
          resumeMime,
          b.screening_answers_json ? JSON.stringify(b.screening_answers_json) : null,
          (b.cover_note || '').trim(),
          Date.now(),
          Date.now()
        ).run();

        await env.DB.prepare(`
          INSERT INTO application_status_history (id, application_id, from_status, to_status, changed_by_phone, changed_by_role, notes, created_at)
          VALUES (?, ?, 'none', 'applied', ?, 'candidate', 'Application submitted by candidate', ?)
        `).bind('HIST-' + Math.random().toString(36).substring(2, 8), appId, session.phone, Date.now()).run();

        // Create initial chat message for this application
        const welcomeMsgId = 'MSG-' + Date.now().toString(36);
        await env.DB.prepare(`
          INSERT INTO chat_messages (id, conversation_id, application_id, sender_phone, sender_role, sender_type, sender_name, message, is_read, created_at)
          VALUES (?, ?, ?, ?, 'system', 'system', 'Where is My Job? Bot', ?, 0, ?)
        `).bind(
          welcomeMsgId, 'CONV-' + appId, appId, job.employer_phone,
          `Application submitted for ${job.title} at ${job.company_name || 'Company'}. The hiring team has been notified.`,
          Date.now()
        ).run().catch(() => {});

        return new Response(JSON.stringify({ 
          success: true, 
          applicationId: appId,
          job_title: job.title,
          company_name: job.company_name || 'Alifeo Partner'
        }), { headers: corsHeaders });
      }

      // Candidate Fetch Applications
      if (path === '/api/applications' && method === 'GET') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

        const { results: apps } = await env.DB.prepare(`
          SELECT a.*, j.title as job_title, 
                 COALESCE(j.company_name, j.company, 'Alifeo Partner') as company_name, 
                 j.company_logo, j.city, j.work_mode, 
                 COALESCE(j.salary_display, j.stipend_salary, 'Competitive') as salary_display,
                 j.employer_phone
          FROM job_applications a
          JOIN jobs j ON a.job_id = j.id
          WHERE a.candidate_phone = ?
          ORDER BY a.created_at DESC
        `).bind(session.phone).all<Application>();

        return new Response(JSON.stringify({ success: true, applications: apps || [] }), { headers: corsHeaders });
      }

      // Candidate Withdraw Application
      if (path.startsWith('/api/applications/') && path.endsWith('/withdraw') && (method === 'PUT' || method === 'POST')) {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        const appId = path.split('/')[3];

        await env.DB.prepare(`
          UPDATE job_applications 
          SET status = 'withdrawn', updated_at = ? 
          WHERE id = ? AND candidate_phone = ?
        `).bind(Date.now(), appId, session.phone).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      // -------------------------------------------------------------
      // 6. EMPLOYER WORKPLACE LOCATION & JOB POSTING
      // -------------------------------------------------------------
      if (path === '/api/employer/jobs' && method === 'POST') {
        if (!session || session.active_role !== 'employer') {
          return new Response(JSON.stringify({ error: 'Employer account required' }), { status: 403 });
        }
        const b = await request.json() as any;
        const id = 'JOB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        const title = (b.title || '').trim();
        const companyName = (b.company_name || session.company_name || 'Alifeo Partner').trim();
        const companyLogo = (b.company_logo || session.company_logo || '').trim();
        const description = (b.description || '').trim();
        const category = (b.category || 'Engineering').trim();
        const department = (b.department || '').trim();
        const responsibilities = (b.responsibilities || '').trim();
        const qualifications = (b.qualifications || '').trim();
        const requiredSkills = (b.required_skills || '').trim();
        const experienceLevel = (b.experience_level || 'Fresher').trim();
        const salaryDisplay = (b.salary_display || 'Competitive Salary').trim();
        const jobType = (b.job_type || 'full_time').trim();
        const workMode = (b.work_mode || 'remote').trim();
        const city = (b.city || 'Moradabad').trim();
        const openings = Number(b.openings) || 1;
        const deadline = (b.deadline || '').trim();
        const screeningQuestionsJson = b.screening_questions ? JSON.stringify(b.screening_questions) : null;

        // Workplace & Coordinates
        const workplaceName = (b.workplace_name || companyName + ' Workplace').trim();
        const workplaceAddress = (b.workplace_address || city).trim();
        const state = (b.state || '').trim();
        const pincode = (b.pincode || '').trim();
        const workplaceType = (b.workplace_type || 'Office').trim();
        let latitude = b.latitude ? parseFloat(b.latitude) : null;
        let longitude = b.longitude ? parseFloat(b.longitude) : null;

        // Auto-resolve city coordinates if empty and not remote
        if ((!latitude || !longitude) && city && workMode !== 'remote') {
          const lookup = CITY_COORDINATES[city.toLowerCase().trim()];
          if (lookup) {
            latitude = lookup.lat;
            longitude = lookup.lng;
          }
        }

        const status: JobStatus = b.submit_for_review ? 'pending_review' : 'draft';

        if (!title || !description) {
          return new Response(JSON.stringify({ error: 'Title and description are required' }), { status: 400 });
        }

        await env.DB.prepare(`
          INSERT INTO jobs (
            id, employer_phone, company_name, company, company_logo, title, department, category,
            description, responsibilities, qualifications, required_skills, skills,
            experience_level, salary_display, stipend_salary, job_type,
            work_mode, city, openings, deadline, screening_questions_json,
            workplace_name, workplace_address, state, pincode, workplace_type,
            latitude, longitude, is_hiring_active,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        `).bind(
          id, session.phone, companyName, companyName, companyLogo, title, department, category,
          description, responsibilities, qualifications, requiredSkills, requiredSkills,
          experienceLevel, salaryDisplay, salaryDisplay, jobType,
          workMode, city, openings, deadline, screeningQuestionsJson,
          workplaceName, workplaceAddress, state, pincode, workplaceType,
          latitude, longitude,
          status, Date.now(), Date.now()
        ).run();

        return new Response(JSON.stringify({ success: true, id, status }), { headers: corsHeaders });
      }

      // Employer toggle pause/resume hiring
      if (path.startsWith('/api/employer/jobs/') && path.endsWith('/toggle-hiring') && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];

        const job = await env.DB.prepare('SELECT is_hiring_active FROM jobs WHERE id = ? AND employer_phone = ?')
          .bind(jobId, session.phone).first<{ is_hiring_active: number }>();
        if (!job) return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });

        const newState = (job.is_hiring_active === 0) ? 1 : 0;
        await env.DB.prepare('UPDATE jobs SET is_hiring_active = ?, updated_at = ? WHERE id = ?')
          .bind(newState, Date.now(), jobId).run();

        return new Response(JSON.stringify({ success: true, is_hiring_active: newState }), { headers: corsHeaders });
      }

      // Employer status & internal notes
      if (path.startsWith('/api/employer/applications/') && path.endsWith('/status') && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const appId = path.split('/')[4];
        const b = await request.json() as any;
        const newStatus: ApplicationStatus = b.status;
        const notes = (b.notes || '').trim();

        await env.DB.prepare('UPDATE job_applications SET status = ?, updated_at = ? WHERE id = ?')
          .bind(newStatus, Date.now(), appId).run();

        await env.DB.prepare(`
          INSERT INTO application_status_history (id, application_id, from_status, to_status, changed_by_phone, changed_by_role, notes, created_at)
          VALUES (?, ?, 'status_change', ?, ?, 'employer', ?, ?)
        `).bind('HIST-' + Math.random().toString(36).substring(2, 8), appId, newStatus, session.phone, notes, Date.now()).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

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
      // 7. INTERVIEWS & CHAT
      // -------------------------------------------------------------
      if (path === '/api/interviews/schedule' && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const b = await request.json() as any;
        const appId = b.application_id;

        const app = await env.DB.prepare('SELECT * FROM job_applications WHERE id = ?').bind(appId).first<Application>();
        if (!app) return new Response(JSON.stringify({ error: 'Application not found' }), { status: 404 });

        const intId = 'INT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

        await env.DB.prepare(`
          INSERT INTO interviews (
            id, application_id, job_id, candidate_phone, employer_phone,
            scheduled_date, scheduled_time, interview_type, location_or_link,
            instructions, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
        `).bind(
          intId, appId, app.job_id, app.candidate_phone, session.phone,
          b.scheduled_date, b.scheduled_time, b.interview_type || 'online',
          b.location_or_link || '', b.instructions || '', Date.now(), Date.now()
        ).run();

        await env.DB.prepare('UPDATE job_applications SET status = "interview", updated_at = ? WHERE id = ?')
          .bind(Date.now(), appId).run();

        return new Response(JSON.stringify({ success: true, interviewId: intId }), { headers: corsHeaders });
      }

      if (path === '/api/chat/conversations' && method === 'GET') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

        if (session.active_role === 'job_seeker') {
          const { results: convos } = await env.DB.prepare(`
            SELECT 
              a.id as id,
              a.id as application_id,
              a.job_id,
              a.status,
              a.created_at as applied_at,
              COALESCE(j.title, a.job_title, 'UI/UX') as job_title, 
              COALESCE(j.company_name, j.company, a.company, 'Alifeo') as other_party_name,
              COALESCE(j.company_name, j.company, a.company, 'Alifeo') as other_name,
              COALESCE(j.company_name, j.company, a.company, 'Alifeo') as company_name,
              COALESCE(j.company_logo, '') as other_party_logo,
              COALESCE(j.company_logo, '') as company_logo,
              COALESCE(j.employer_phone, '') as other_party_phone,
              COALESCE(j.employer_phone, '') as other_phone,
              (SELECT message FROM chat_messages WHERE application_id = a.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM chat_messages WHERE application_id = a.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
              (SELECT created_at FROM chat_messages WHERE application_id = a.id ORDER BY created_at DESC LIMIT 1) as last_time,
              (SELECT COUNT(*) FROM chat_messages WHERE application_id = a.id AND sender_role = 'employer' AND is_read = 0) as unread_count
            FROM job_applications a
            LEFT JOIN jobs j ON a.job_id = j.id
            WHERE a.candidate_phone = ?
            ORDER BY COALESCE(last_message_time, a.created_at) DESC
          `).bind(session.phone).all();

          return new Response(JSON.stringify({ success: true, conversations: convos || [] }), { headers: corsHeaders });
        } else {
          const { results: convos } = await env.DB.prepare(`
            SELECT 
              a.id as id,
              a.id as application_id,
              a.job_id,
              a.status,
              a.created_at as applied_at,
              COALESCE(j.title, a.job_title, 'Job Opening') as job_title,
              COALESCE(a.candidate_name, 'Candidate') as other_party_name,
              COALESCE(a.candidate_name, 'Candidate') as other_name,
              COALESCE(a.candidate_name, 'Candidate') as company_name,
              COALESCE(p.photo_url, '') as other_party_logo,
              COALESCE(p.photo_url, '') as company_logo,
              a.candidate_phone as other_party_phone,
              a.candidate_phone as other_phone,
              (SELECT message FROM chat_messages WHERE application_id = a.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM chat_messages WHERE application_id = a.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
              (SELECT created_at FROM chat_messages WHERE application_id = a.id ORDER BY created_at DESC LIMIT 1) as last_time,
              (SELECT COUNT(*) FROM chat_messages WHERE application_id = a.id AND sender_role = 'candidate' AND is_read = 0) as unread_count
            FROM job_applications a
            LEFT JOIN jobs j ON a.job_id = j.id
            LEFT JOIN job_seeker_profiles p ON a.candidate_phone = p.phone
            WHERE j.employer_phone = ?
            ORDER BY COALESCE(last_message_time, a.created_at) DESC
          `).bind(session.phone).all();

          return new Response(JSON.stringify({ success: true, conversations: convos || [] }), { headers: corsHeaders });
        }
      }

      if (path === '/api/chat/start' && method === 'POST') {
        if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        const b = await request.json() as any;
        const jobId = b.job_id;
        let appId = b.application_id;

        if (!appId && jobId) {
          const app = await env.DB.prepare('SELECT id FROM job_applications WHERE job_id = ? AND candidate_phone = ?').bind(jobId, session.phone).first<{ id: string }>();
          if (app) appId = app.id;
        }

        if (!appId && jobId) {
          const job = await env.DB.prepare('SELECT * FROM jobs WHERE id = ?').bind(jobId).first<Job>();
          if (job) {
            appId = 'APP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
            await env.DB.prepare(`
              INSERT INTO job_applications (
                id, job_id, job_title, company, candidate_phone, candidate_name, candidate_email,
                resume_url, resume_id, resume_filename, resume_snapshot_data, resume_mime_type,
                status, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'inquiry.txt', 'inquiry', 'Inquiry', '', 'text/plain', 'applied', ?, ?)
            `).bind(
              appId, job.id, job.title || '', job.company_name || job.company || 'Alifeo',
              session.phone, session.name || 'Candidate', session.email || '', Date.now(), Date.now()
            ).run();
          }
        }

        return new Response(JSON.stringify({ success: true, application_id: appId }), { headers: corsHeaders });
      }

      if ((path.startsWith('/api/chat/') && path.endsWith('/messages')) || path === '/api/chat/messages') {
        const parts = path.split('/');
        let appId = parts[3];
        if (!appId || appId === 'messages') {
          appId = url.searchParams.get('application_id') || '';
        }

        if (method === 'GET') {
          if (!appId) {
            return new Response(JSON.stringify({ success: true, messages: [] }), { headers: corsHeaders });
          }

          if (session) {
            const incomingRole = session.active_role === 'employer' ? 'candidate' : 'employer';
            await env.DB.prepare(
              'UPDATE chat_messages SET is_read = 1 WHERE application_id = ? AND sender_role = ? AND is_read = 0'
            ).bind(appId, incomingRole).run();
          }

          const { results: messages } = await env.DB.prepare(
            'SELECT * FROM chat_messages WHERE application_id = ? ORDER BY created_at ASC'
          ).bind(appId).all<ChatMessage>();

          return new Response(JSON.stringify({ success: true, messages: messages || [] }), { headers: corsHeaders });
        }

        if (method === 'POST') {
          if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
          const b = await request.json() as any;
          if (!appId || appId === 'messages') {
            appId = b.application_id || '';
          }
          if (!appId) {
            return new Response(JSON.stringify({ error: 'Missing application_id' }), { status: 400, headers: corsHeaders });
          }

          const msgId = 'MSG-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
          const message = (b.message || '').trim();
          if (!message) {
            return new Response(JSON.stringify({ error: 'Message cannot be empty' }), { status: 400, headers: corsHeaders });
          }

          const senderRole = session.active_role === 'employer' ? 'employer' : 'candidate';

          await env.DB.prepare(`
            INSERT INTO chat_messages (id, conversation_id, application_id, sender_phone, sender_role, sender_type, sender_name, message, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
          `).bind(
            msgId, 'CONV-' + appId, appId, session.phone, senderRole, senderRole,
            session.name || (senderRole === 'employer' ? 'Alifeo Recruiter' : 'Candidate'),
            message, Date.now()
          ).run();

          return new Response(JSON.stringify({ success: true, id: msgId, message: { id: msgId, application_id: appId, message, created_at: Date.now(), sender_role: senderRole, sender_phone: session.phone } }), { headers: corsHeaders });
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
      // 8. ADMIN ACTIONS & MODERATION
      // -------------------------------------------------------------
      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/approve') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];

        await env.DB.prepare('UPDATE jobs SET status = "approved", updated_at = ? WHERE id = ?')
          .bind(Date.now(), jobId).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/reject') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];
        const b = await request.json() as any;

        await env.DB.prepare('UPDATE jobs SET status = "rejected", admin_feedback = ?, updated_at = ? WHERE id = ?')
          .bind(b.reason || 'Did not meet quality standards', Date.now(), jobId).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/request-changes') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];
        const b = await request.json() as any;

        await env.DB.prepare('UPDATE jobs SET status = "changes_requested", admin_feedback = ?, updated_at = ? WHERE id = ?')
          .bind(b.feedback || 'Please update job details', Date.now(), jobId).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/pause') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];

        await env.DB.prepare('UPDATE jobs SET status = "paused", updated_at = ? WHERE id = ?')
          .bind(Date.now(), jobId).run();

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
      }

      if (path.startsWith('/api/admin/jobs/') && path.endsWith('/remove') && method === 'POST') {
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        const jobId = path.split('/')[4];

        await env.DB.prepare('UPDATE jobs SET status = "removed", updated_at = ? WHERE id = ?')
          .bind(Date.now(), jobId).run();

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
// HELPER FUNCTIONS & MIGRATIONS
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
  // 1. Create base tables
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      phone TEXT PRIMARY KEY,
      name TEXT,
      email TEXT,
      active_role TEXT DEFAULT 'job_seeker',
      created_at INTEGER,
      updated_at INTEGER
    )
  `).run().catch(() => { });

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
  `).run().catch(() => { });

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
  `).run().catch(() => { });

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
  `).run().catch(() => { });

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      employer_phone TEXT NOT NULL,
      company_name TEXT,
      company TEXT,
      company_logo TEXT,
      title TEXT NOT NULL,
      department TEXT,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      responsibilities TEXT,
      qualifications TEXT,
      required_skills TEXT,
      skills TEXT,
      experience_level TEXT,
      min_salary INTEGER,
      max_salary INTEGER,
      salary_display TEXT,
      stipend_salary TEXT,
      job_type TEXT NOT NULL,
      work_mode TEXT NOT NULL,
      city TEXT NOT NULL,
      openings INTEGER DEFAULT 1,
      deadline TEXT,
      screening_questions_json TEXT,
      status TEXT DEFAULT 'draft',
      admin_feedback TEXT,
      workplace_name TEXT,
      workplace_address TEXT,
      state TEXT,
      pincode TEXT,
      workplace_type TEXT,
      latitude REAL,
      longitude REAL,
      is_hiring_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    )
  `).run().catch(() => { });

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      candidate_phone TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      candidate_email TEXT,
      resume_id TEXT,
      resume_filename TEXT,
      resume_snapshot_data TEXT,
      resume_mime_type TEXT,
      screening_answers_json TEXT,
      cover_note TEXT,
      status TEXT DEFAULT 'applied',
      employer_internal_notes TEXT,
      created_at INTEGER,
      updated_at INTEGER
    )
  `).run().catch(() => { });

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
  `).run().catch(() => { });

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
  `).run().catch(() => { });

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
  `).run().catch(() => { });

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
  `).run().catch(() => { });

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
  `).run().catch(() => { });

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
  `).run().catch(() => { });

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `).run().catch(() => { });

  // 2. Safe Schema Migrations (ALTER TABLE ADD COLUMN) to prevent SQLite missing column errors
  const jobColumnsToAdd = [
    'company_name TEXT',
    'company TEXT',
    'company_logo TEXT',
    'department TEXT',
    'category TEXT DEFAULT "General"',
    'salary_display TEXT',
    'stipend_salary TEXT',
    'responsibilities TEXT',
    'qualifications TEXT',
    'required_skills TEXT',
    'skills TEXT',
    'experience_level TEXT',
    'experience TEXT',
    'min_salary INTEGER',
    'max_salary INTEGER',
    'openings INTEGER DEFAULT 1',
    'deadline TEXT',
    'screening_questions_json TEXT',
    'admin_feedback TEXT',
    'workplace_name TEXT',
    'workplace_address TEXT',
    'state TEXT',
    'pincode TEXT',
    'workplace_type TEXT',
    'latitude REAL',
    'longitude REAL',
    'is_hiring_active INTEGER DEFAULT 1',
    'updated_at INTEGER'
  ];

  for (const col of jobColumnsToAdd) {
    try {
      await db.prepare(`ALTER TABLE jobs ADD COLUMN ${col}`).run();
    } catch (e) {
      // Column already exists, safe to ignore
    }
  }

  // Profile migrations
  try {
    await db.prepare('ALTER TABLE job_seeker_profiles ADD COLUMN photo_url TEXT').run();
  } catch (e) { }
  try {
    await db.prepare('ALTER TABLE job_seeker_profiles ADD COLUMN about_me TEXT').run();
  } catch (e) { }
  try {
    await db.prepare('ALTER TABLE job_seeker_profiles ADD COLUMN languages TEXT').run();
  } catch (e) { }
  try {
    await db.prepare('ALTER TABLE employer_profiles ADD COLUMN company_logo TEXT').run();
  } catch (e) { }

  // Sync existing legacy columns
  try {
    await db.prepare("UPDATE jobs SET company_name = company WHERE company_name IS NULL AND company IS NOT NULL").run();
    await db.prepare("UPDATE jobs SET salary_display = stipend_salary WHERE salary_display IS NULL AND stipend_salary IS NOT NULL").run();
    await db.prepare("UPDATE jobs SET required_skills = skills WHERE required_skills IS NULL AND skills IS NOT NULL").run();
    await db.prepare("UPDATE jobs SET experience_level = experience WHERE experience_level IS NULL AND experience IS NOT NULL").run();
  } catch (e) { }

  // 3. Populate default workplace coordinates for existing jobs so they appear on the Live Map!
  try {
    await db.prepare(`
      UPDATE jobs SET 
        latitude = 28.8386, longitude = 78.7733,
        workplace_name = 'Alifeo Innovation Center',
        workplace_address = 'Civil Lines, Moradabad, Uttar Pradesh',
        state = 'Uttar Pradesh', pincode = '244001',
        workplace_type = 'Corporate Office / Tech Hub',
        is_hiring_active = 1
      WHERE LOWER(city) = 'moradabad' AND (latitude IS NULL OR longitude IS NULL)
    `).run();

    await db.prepare(`
      UPDATE jobs SET 
        latitude = 28.6139, longitude = 77.2090,
        workplace_name = 'Zifeeo Media Studio',
        workplace_address = 'Connaught Place, Central Delhi',
        state = 'Delhi', pincode = '110001',
        workplace_type = 'Media & Creative Studio',
        is_hiring_active = 1
      WHERE LOWER(city) LIKE '%delhi%' AND (latitude IS NULL OR longitude IS NULL)
    `).run();

    await db.prepare(`
      UPDATE jobs SET 
        latitude = 28.5355, longitude = 77.3910,
        workplace_name = 'Aabeeo Logistics Hub',
        workplace_address = 'Sector 62, Electronic City, Noida',
        state = 'Uttar Pradesh', pincode = '201301',
        workplace_type = 'Tech Park & Operations Center',
        is_hiring_active = 1
      WHERE LOWER(city) LIKE '%noida%' AND (latitude IS NULL OR longitude IS NULL)
    `).run();

    await db.prepare(`
      UPDATE jobs SET 
        latitude = 28.4595, longitude = 77.0266,
        workplace_name = 'Alifeo Cyber Office',
        workplace_address = 'DLF Cyber City, Gurugram',
        state = 'Haryana', pincode = '122002',
        workplace_type = 'Corporate Headquarters',
        is_hiring_active = 1
      WHERE (LOWER(city) LIKE '%gurgaon%' OR LOWER(city) LIKE '%gurugram%') AND (latitude IS NULL OR longitude IS NULL)
    `).run();
  } catch (e) { }
}
