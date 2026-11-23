import { Job, Application } from '../types';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';

export function renderAdminPage(
  jobs: Job[],
  applications: Application[],
  isAuthenticated: boolean,
  errorMessage: string = ''
): string {
  if (!isAuthenticated) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Alifeo Job</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #f4f6f8; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .login-card { background: #ffffff; border-radius: 16px; width: 100%; max-width: 420px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); text-align: center; }
    .logo { height: 44px; width: 44px; border-radius: 10px; margin-bottom: 16px; }
    h2 { font-size: 24px; font-weight: 800; color: #19563E; margin-bottom: 8px; }
    p { font-size: 14px; color: #64748b; margin-bottom: 24px; }
    .input-group { margin-bottom: 20px; text-align: left; }
    label { display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px; }
    input { width: 100%; padding: 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 15px; outline: none; }
    input:focus { border-color: #19563E; box-shadow: 0 0 0 3px rgba(25, 86, 62, 0.12); }
    button { width: 100%; padding: 13px; background: #19563E; color: #ffffff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: 0.2s ease; }
    button:hover { background: #134532; }
    .error-box { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; text-align: left; }
  </style>
</head>
<body>
  <div class="login-card">
    <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="logo">
    <h2>Alifeo Job Admin</h2>
    <p>Super Admin control center to manage listings, approvals & candidates.</p>
    
    ${errorMessage ? `<div class="error-box">${errorMessage}</div>` : ''}

    <form method="POST" action="/api/admin/login">
      <div class="input-group">
        <label for="password">Super Admin Password</label>
        <input type="password" id="password" name="password" required placeholder="Enter password" autocomplete="current-password">
      </div>
      <button type="submit">Sign In to Dashboard</button>
    </form>
  </div>
</body>
</html>`;
  }

  const pendingJobs = jobs.filter(j => j.status === 'pending_review');
  const approvedJobs = jobs.filter(j => j.status === 'approved');

  const jobsListHtml = jobs.map(j => `
    <tr id="job-row-${j.id}">
      <td>
        <div style="font-weight: 700; color: #1e293b;">${escapeHtml(j.title)}</div>
        <div style="font-size: 12px; color: #64748b;">${escapeHtml(j.company)} &bull; ${escapeHtml(j.city)} &bull; ${j.work_mode.toUpperCase()}</div>
      </td>
      <td>
        <span class="badge ${j.job_type === 'internship' ? 'badge-internship' : 'badge-fulltime'}">${j.job_type === 'internship' ? 'Internship' : 'Full Time'}</span>
        <div style="font-size: 12px; color: #19563e; font-weight: 600; margin-top: 4px;">${escapeHtml(j.stipend_salary)}</div>
      </td>
      <td>
        <span class="status-pill status-${j.status}">${j.status === 'approved' ? 'Live & Verified' : 'Pending Review'}</span>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Phone: ${escapeHtml(j.employer_phone || 'Alifeo Internal')}</div>
      </td>
      <td style="text-align: right;">
        ${j.status === 'pending_review' ? `
          <button class="btn btn-sm btn-approve" onclick="approveJob('${j.id}')">Approve & Make Live</button>
        ` : ''}
        <button class="btn btn-sm btn-delete" onclick="deleteJob('${j.id}')">Delete</button>
      </td>
    </tr>
  `).join('');

  const applicationsListHtml = applications.map(a => `
    <tr>
      <td>
        <div style="font-weight: 700; color: #1e293b;">${escapeHtml(a.candidate_name)}</div>
        <div style="font-size: 12px; color: #64748b;">Phone: <strong>${escapeHtml(a.candidate_phone)}</strong></div>
        ${a.candidate_email ? `<div style="font-size: 12px; color: #64748b;">Email: ${escapeHtml(a.candidate_email)}</div>` : ''}
      </td>
      <td>
        <div style="font-weight: 600; color: #19563e;">${escapeHtml(a.job_title)}</div>
        <div style="font-size: 12px; color: #64748b;">${escapeHtml(a.company)}</div>
      </td>
      <td>
        <span class="app-status app-status-${a.status}">${formatStatus(a.status)}</span>
        ${a.assignment_submission ? `<div style="margin-top: 4px;"><a href="${escapeHtml(a.assignment_submission)}" target="_blank" style="font-size: 11px; color: #0284c7; text-decoration: underline;">View Assignment &rarr;</a></div>` : ''}
      </td>
      <td>
        <a href="${escapeHtml(a.resume_url)}" target="_blank" class="btn btn-sm btn-outline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          View Resume
        </a>
        ${a.portfolio_url ? `
          <a href="${escapeHtml(a.portfolio_url)}" target="_blank" class="btn btn-sm btn-outline" style="margin-left: 4px;">Portfolio</a>
        ` : ''}
      </td>
      <td style="font-size: 12px; color: #94a3b8;">
        ${new Date(a.created_at).toLocaleDateString()}
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Super Admin Dashboard - Alifeo Job</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #f8fafc; color: #1e293b; min-height: 100vh; }
    .navbar { background: #19563E; color: #ffffff; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .nav-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: #ffffff; }
    .nav-logo { height: 34px; width: 34px; border-radius: 8px; }
    .nav-title { font-size: 18px; font-weight: 800; }
    .nav-actions { display: flex; align-items: center; gap: 14px; }
    .btn-logout { background: rgba(255,255,255,0.15); color: #ffffff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; text-decoration: none; }
    .btn-logout:hover { background: rgba(255,255,255,0.25); }

    .container { max-width: 1200px; margin: 30px auto; padding: 0 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: #ffffff; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; }
    .stat-label { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 28px; font-weight: 800; color: #19563E; margin-top: 6px; }

    .section-card { background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 30px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .section-header { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .section-title { font-size: 18px; font-weight: 700; color: #0f172a; }

    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f8fafc; padding: 12px 20px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    tr:hover { background: #fbfcfe; }

    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .badge-internship { background: #e0f2fe; color: #0369a1; }
    .badge-fulltime { background: #dcfce7; color: #15803d; }

    .status-pill { display: inline-block; padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 700; }
    .status-approved { background: #ecfdf5; color: #059669; }
    .status-pending_review { background: #fef3c7; color: #b45309; }

    .app-status { display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .app-status-applied { background: #f1f5f9; color: #475569; }
    .app-status-under_review { background: #e0f2fe; color: #0369a1; }
    .app-status-assignment_given { background: #fef3c7; color: #b45309; }
    .app-status-shortlisted { background: #ede9fe; color: #6d28d9; }
    .app-status-interview { background: #fce7f3; color: #be185d; }
    .app-status-hired { background: #ecfdf5; color: #059669; }
    .app-status-rejected { background: #fee2e2; color: #b91c1c; }

    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; border: none; transition: 0.15s ease; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-approve { background: #19563E; color: #ffffff; }
    .btn-approve:hover { background: #134532; }
    .btn-delete { background: #fee2e2; color: #b91c1c; margin-left: 6px; }
    .btn-delete:hover { background: #fecaca; }
    .btn-outline { background: #ffffff; border: 1.5px solid #e2e8f0; color: #334155; }
    .btn-outline:hover { border-color: #cbd5e1; background: #f8fafc; }
  </style>
</head>
<body>
  <header class="navbar">
    <a href="/" class="nav-brand">
      <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo">
      <div class="nav-title">Alifeo Job &bull; Super Admin</div>
    </a>
    <div class="nav-actions">
      <a href="/" target="_blank" class="btn-logout" style="background: rgba(255,255,255,0.2);">View Live Portal &rarr;</a>
      <a href="/api/admin/logout" class="btn-logout">Sign Out</a>
    </div>
  </header>

  <div class="container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Jobs</div>
        <div class="stat-value">${jobs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Approval</div>
        <div class="stat-value" style="color: ${pendingJobs.length > 0 ? '#b45309' : '#19563E'}">${pendingJobs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Applications</div>
        <div class="stat-value">${applications.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Live Active Roles</div>
        <div class="stat-value">${approvedJobs.length}</div>
      </div>
    </div>

    <!-- Job Listings Section -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">Manage Job Listings & Company Approvals</div>
      </div>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Job / Company</th>
              <th>Type / Stipend</th>
              <th>Status</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${jobsListHtml || '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 30px;">No jobs listed yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Candidate Applications Section -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">All Candidate Applications (${applications.length})</div>
      </div>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Candidate Info</th>
              <th>Applied Role</th>
              <th>Status</th>
              <th>Resume</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${applicationsListHtml || '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 30px;">No applications submitted yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    async function approveJob(jobId) {
      if (!confirm('Approve this job listing and make it live on job.alifeo.com?')) return;
      try {
        const res = await fetch('/api/admin/jobs/' + jobId + '/approve', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert('Job approved successfully!');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to approve');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function deleteJob(jobId) {
      if (!confirm('Are you sure you want to delete this job listing?')) return;
      try {
        const res = await fetch('/api/admin/jobs/' + jobId + '/delete', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          document.getElementById('job-row-' + jobId)?.remove();
        } else {
          alert(data.error || 'Failed to delete');
        }
      } catch (e) {
        alert('Network error');
      }
    }
  </script>
</body>
</html>`;
}

function formatStatus(status: string): string {
  switch (status) {
    case 'applied': return 'Applied';
    case 'under_review': return 'Under Review';
    case 'assignment_given': return 'Assignment Given';
    case 'shortlisted': return 'Shortlisted';
    case 'interview': return 'Interview Scheduled';
    case 'hired': return 'Hired';
    case 'rejected': return 'Rejected';
    default: return status;
  }
}

function escapeHtml(text: string = ''): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
