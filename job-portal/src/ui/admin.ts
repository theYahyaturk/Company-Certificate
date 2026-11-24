import { Job, Application, Report, AdminAuditLog } from '../types';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';

export function renderAdminPage(
  jobs: Job[],
  applications: Application[],
  reports: Report[],
  auditLogs: AdminAuditLog[],
  isAuthenticated: boolean,
  errorMessage: string = ''
): string {
  if (!isAuthenticated) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Alifeo Jobs Moderation</title>
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
    <h2>Alifeo Jobs Moderation</h2>
    <p>Super Admin control center to approve jobs, review safety reports & manage audit logs.</p>
    
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
        <div style="font-size: 12px; color: #64748b;">${escapeHtml(j.company_name)} &bull; ${escapeHtml(j.city)} &bull; ${j.work_mode.toUpperCase()}</div>
      </td>
      <td>
        <span class="badge ${j.job_type === 'internship' ? 'badge-internship' : 'badge-fulltime'}">${j.job_type === 'internship' ? 'Internship' : 'Job'}</span>
        <div style="font-size: 12px; color: #19563e; font-weight: 600; margin-top: 4px;">${escapeHtml(j.salary_display)}</div>
      </td>
      <td>
        <span class="status-pill status-${j.status}">${formatJobStatus(j.status)}</span>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Poster: ${escapeHtml(j.employer_phone || 'Alifeo')}</div>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        ${j.status === 'pending_review' ? `
          <button class="btn btn-sm btn-approve" onclick="approveJob('${j.id}')">Approve Live</button>
          <button class="btn btn-sm btn-outline" onclick="requestChanges('${j.id}')">Request Changes</button>
          <button class="btn btn-sm btn-delete" onclick="rejectJob('${j.id}')">Reject</button>
        ` : j.status === 'approved' ? `
          <button class="btn btn-sm btn-outline" onclick="pauseJob('${j.id}')">Pause</button>
          <button class="btn btn-sm btn-delete" onclick="removeJob('${j.id}')">Remove</button>
        ` : `
          <button class="btn btn-sm btn-approve" onclick="approveJob('${j.id}')">Re-Approve</button>
        `}
      </td>
    </tr>
  `).join('');

  const applicationsListHtml = applications.map(a => `
    <tr>
      <td>
        <div style="font-weight: 700; color: #1e293b;">${escapeHtml(a.candidate_name)}</div>
        <div style="font-size: 12px; color: #64748b;">Phone: <strong>${escapeHtml(a.candidate_phone)}</strong></div>
      </td>
      <td>
        <div style="font-weight: 600; color: #19563e;">${escapeHtml(a.job_id)}</div>
      </td>
      <td>
        <span class="app-status app-status-${a.status}">${formatStatus(a.status)}</span>
      </td>
      <td>
        <a href="/api/resumes/${a.resume_id}/view" target="_blank" class="btn btn-sm btn-outline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Snapshot
        </a>
      </td>
      <td style="font-size: 12px; color: #94a3b8;">
        ${new Date(a.created_at).toLocaleDateString()}
      </td>
    </tr>
  `).join('');

  const reportsListHtml = reports.map(r => `
    <tr>
      <td>
        <span class="status-pill status-${r.status}">${r.status.toUpperCase()}</span>
      </td>
      <td>
        <div style="font-weight: 700; color: #b91c1c;">${escapeHtml(r.reason_category)}</div>
        <div style="font-size: 12px; color: #64748b;">Target: ${escapeHtml(r.target_type)} (${escapeHtml(r.target_id)})</div>
      </td>
      <td style="font-size: 13px; color: #334155;">
        ${escapeHtml(r.description || 'No description provided')}
      </td>
      <td style="font-size: 12px; color: #94a3b8;">
        ${escapeHtml(r.reporter_phone)}
      </td>
    </tr>
  `).join('');

  const auditLogsHtml = auditLogs.map(l => `
    <tr>
      <td style="font-size: 12px; color: #64748b;">${new Date(l.created_at).toLocaleString()}</td>
      <td style="font-weight: 700; color: #19563e;">${escapeHtml(l.action)}</td>
      <td style="font-size: 13px;">${escapeHtml(l.target_type)}: <strong>${escapeHtml(l.target_id)}</strong></td>
      <td style="font-size: 12px; color: #475569;">${escapeHtml(l.reason || '-')}</td>
      <td style="font-size: 12px;">${l.previous_status || '-'} &rarr; <strong>${l.new_status || '-'}</strong></td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Super Admin Moderation - Alifeo Jobs</title>
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
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .stat-card { background: #ffffff; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; }
    .stat-label { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 28px; font-weight: 800; color: #19563E; margin-top: 6px; }

    .section-card { background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 30px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .section-header { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .section-title { font-size: 17px; font-weight: 800; color: #0f172a; }

    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f8fafc; padding: 12px 20px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    tr:hover { background: #fbfcfe; }

    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .badge-internship { background: #e0f2fe; color: #0369a1; }
    .badge-fulltime { background: #dcfce7; color: #15803d; }

    .status-pill { display: inline-block; padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 700; }
    .status-approved { background: #ecfdf5; color: #059669; }
    .status-pending_review { background: #fef3c7; color: #b45309; }
    .status-changes_requested { background: #ffedd5; color: #c2410c; }
    .status-rejected { background: #fee2e2; color: #b91c1c; }
    .status-paused { background: #f1f5f9; color: #475569; }

    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; border: none; transition: 0.15s ease; }
    .btn-approve { background: #19563E; color: #ffffff; }
    .btn-approve:hover { background: #134532; }
    .btn-delete { background: #fee2e2; color: #b91c1c; margin-left: 4px; }
    .btn-delete:hover { background: #fecaca; }
    .btn-outline { background: #ffffff; border: 1px solid #cbd5e1; color: #334155; margin-left: 4px; }
  </style>
</head>
<body>
  <header class="navbar">
    <a href="/" class="nav-brand">
      <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo">
      <div class="nav-title">Alifeo Jobs &bull; Moderation Console</div>
    </a>
    <div class="nav-actions">
      <a href="/" target="_blank" class="btn-logout" style="background: rgba(255,255,255,0.2);">Live Portal &rarr;</a>
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
        <div class="stat-label">Pending Review</div>
        <div class="stat-value" style="color: ${pendingJobs.length > 0 ? '#b45309' : '#19563E'}">${pendingJobs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Live Active Jobs</div>
        <div class="stat-value">${approvedJobs.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Trust & Safety Reports</div>
        <div class="stat-value" style="color: ${reports.length > 0 ? '#dc2626' : '#19563E'}">${reports.length}</div>
      </div>
    </div>

    <!-- Job Moderation Queue -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">Job Postings Moderation & Mandatory Review Queue</div>
      </div>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Job / Company</th>
              <th>Type / Pay</th>
              <th>Status</th>
              <th style="text-align: right;">Moderation Action</th>
            </tr>
          </thead>
          <tbody>
            ${jobsListHtml || '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 30px;">No jobs listed.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Trust & Safety Reports -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">Trust & Safety Reports (${reports.length})</div>
      </div>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Reason Category</th>
              <th>Description</th>
              <th>Reporter</th>
            </tr>
          </thead>
          <tbody>
            ${reportsListHtml || '<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 24px;">No safety abuse reports. Clean platform!</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Candidate Applications Snapshot -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">All Candidate Applications (${applications.length})</div>
      </div>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Candidate Info</th>
              <th>Job ID</th>
              <th>Status</th>
              <th>Snapshot Resume</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${applicationsListHtml || '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">No applications submitted yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Audit Logs -->
    <div class="section-card">
      <div class="section-header">
        <div class="section-title">Admin Moderation Audit Logs</div>
      </div>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Target</th>
              <th>Reason</th>
              <th>Status Transition</th>
            </tr>
          </thead>
          <tbody>
            ${auditLogsHtml || '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">No audit logs yet.</td></tr>'}
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
          window.location.reload();
        } else {
          alert(data.error || 'Failed to approve');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function rejectJob(jobId) {
      const reason = prompt('Enter rejection reason:');
      if (!reason) return;
      try {
        const res = await fetch('/api/admin/jobs/' + jobId + '/reject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || 'Failed to reject');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function requestChanges(jobId) {
      const feedback = prompt('Enter changes feedback for employer:');
      if (!feedback) return;
      try {
        const res = await fetch('/api/admin/jobs/' + jobId + '/request-changes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || 'Failed to request changes');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function pauseJob(jobId) {
      if (!confirm('Pause this live job?')) return;
      try {
        const res = await fetch('/api/admin/jobs/' + jobId + '/pause', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || 'Failed to pause');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function removeJob(jobId) {
      if (!confirm('Remove this job from the platform?')) return;
      try {
        const res = await fetch('/api/admin/jobs/' + jobId + '/remove', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || 'Failed to remove');
        }
      } catch (e) {
        alert('Network error');
      }
    }
  </script>
</body>
</html>`;
}

function formatJobStatus(status: string): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'pending_review': return 'Pending Review';
    case 'changes_requested': return 'Changes Requested';
    case 'approved': return 'Live';
    case 'paused': return 'Paused';
    case 'removed': return 'Removed';
    default: return status;
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case 'applied': return 'Applied';
    case 'under_review': return 'Under Review';
    case 'shortlisted': return 'Shortlisted';
    case 'interview': return 'Interview';
    case 'selected': return 'Selected';
    case 'rejected': return 'Rejected';
    case 'withdrawn': return 'Withdrawn';
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
