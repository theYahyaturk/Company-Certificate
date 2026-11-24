import { Job, UserSession, Resume, Application, EmployerProfile } from '../types';
import { JOB_PORTAL_STYLES } from './styles';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';

export function renderJobPortalPage(
  jobs: Job[],
  session: UserSession | null,
  userProfile: any,
  userResumes: Resume[],
  myApplications: Application[],
  employerJobs: Job[],
  employerApplications: Application[],
  ablyKey: string,
  appUrl: string
): string {
  const isEmployer = session?.active_role === 'employer';
  const currentResume = userResumes.find(r => r.is_current) || userResumes[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Alifeo Jobs | Two-Sided Career & Hiring Platform</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  
  <!-- Ably Real-time SDK for in-app chat -->
  <script src="https://cdn.ably.com/lib/ably.min-1.js"></script>

  <style>
    ${JOB_PORTAL_STYLES}
  </style>
</head>
<body>
  <div class="top-brand-bar"></div>

  <!-- Header Navbar -->
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo">
        <span class="nav-brand-title">Alifeo Jobs</span>
      </a>
      <span class="nav-tagline">${isEmployer ? 'Recruiter Mode' : 'Candidate Mode'}</span>
    </div>

    <div class="nav-actions">
      ${session ? `
        <!-- Role Switcher Pill -->
        <div class="role-toggle-pill">
          <button class="role-btn ${!isEmployer ? 'active' : ''}" onclick="switchRole('job_seeker')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Job Seeker
          </button>
          <button class="role-btn ${isEmployer ? 'active' : ''}" onclick="switchRole('employer')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Employer
          </button>
        </div>

        ${isEmployer ? `
          <button class="btn btn-sm btn-accent" onclick="openPostJobModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Post Job
          </button>
        ` : `
          <button class="btn btn-sm btn-outline-white" onclick="openResumeModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${currentResume ? 'My Resume' : 'Upload Resume'}
          </button>
        `}

        <button class="btn btn-sm btn-outline-white" onclick="handleLogout()" title="Sign Out">
          Sign Out
        </button>
      ` : `
        <button class="btn btn-sm btn-outline-white" onclick="openLoginModal('job_seeker')">Sign In</button>
        <button class="btn btn-sm btn-accent" onclick="openLoginModal('employer')">Hire Someone</button>
      `}
    </div>
  </header>

  <!-- Main Platform Content -->
  <main class="main-container">
    ${isEmployer ? renderEmployerSection(employerJobs, employerApplications, userProfile) : renderSeekerSection(jobs, myApplications, userProfile, currentResume)}
  </main>

  <!-- Mobile Bottom Navigation -->
  <nav class="bottom-nav">
    ${isEmployer ? `
      <button class="bottom-nav-item active" onclick="showEmployerTab('jobs')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>Jobs</span>
      </button>
      <button class="bottom-nav-item" onclick="openPostJobModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span>Post</span>
      </button>
      <button class="bottom-nav-item" onclick="showEmployerTab('applicants')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Applicants</span>
      </button>
      <button class="bottom-nav-item" onclick="openEmployerProfileModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Company</span>
      </button>
    ` : `
      <button class="bottom-nav-item active" onclick="showSeekerTab('feed')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Find Jobs</span>
      </button>
      <button class="bottom-nav-item" onclick="showSeekerTab('applications')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>Applied</span>
      </button>
      <button class="bottom-nav-item" onclick="openResumeModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>Resume</span>
      </button>
      <button class="bottom-nav-item" onclick="openProfileModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </button>
    `}
  </nav>

  <!-- ============================================================= -->
  <!-- MODALS -->
  <!-- ============================================================= -->

  <!-- 1. WhatsApp OTP Auth Modal -->
  <div class="modal-overlay" id="authModal">
    <div class="modal-content" style="max-width: 420px;">
      <div class="modal-header">
        <div class="modal-title">Sign In with WhatsApp</div>
        <button class="modal-close-btn" onclick="closeModal('authModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" style="height: 48px; width: 48px; border-radius: 10px;">
          <h3 style="font-size: 18px; font-weight: 800; color: #19563E; margin-top: 8px;">Welcome to Alifeo Jobs</h3>
          <p style="font-size: 13px; color: #64748b; margin-top: 4px;">Direct passwordless verification on WhatsApp</p>
        </div>

        <div id="authStep1">
          <div class="form-group">
            <label class="form-label">What are you here for?</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button type="button" id="roleChoiceSeeker" class="btn btn-outline" style="border-color: #19563e; background: #ecfdf5; color: #19563e;" onclick="selectAuthRole('job_seeker')">
                Find a Job
              </button>
              <button type="button" id="roleChoiceEmployer" class="btn btn-outline" onclick="selectAuthRole('employer')">
                Hire Someone
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="authPhone">WhatsApp Phone Number</label>
            <input type="tel" id="authPhone" class="form-control" placeholder="10-digit mobile number (e.g. 9876543210)">
          </div>

          <div class="form-group">
            <label class="form-label" for="authName">Full Name <span>(Optional)</span></label>
            <input type="text" id="authName" class="form-control" placeholder="Your name">
          </div>

          <button class="btn btn-primary" style="width: 100%; padding: 12px;" onclick="sendAuthOtp()">
            Send WhatsApp OTP &rarr;
          </button>
        </div>

        <div id="authStep2" style="display: none;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 13px; color: #065f46;">
            OTP sent to your WhatsApp number. Check your chat.
            <div id="testOtpDisplay" style="margin-top: 4px; font-weight: 700; color: #19563e;"></div>
          </div>

          <div class="form-group">
            <label class="form-label" for="authOtp">Enter 6-Digit OTP</label>
            <input type="text" id="authOtp" class="form-control" placeholder="6-digit code" maxlength="6" style="letter-spacing: 6px; font-size: 18px; text-align: center; font-weight: 700;">
          </div>

          <button class="btn btn-primary" style="width: 100%; padding: 12px;" onclick="verifyAuthOtp()">
            Verify & Continue
          </button>
          <button class="btn btn-outline" style="width: 100%; margin-top: 8px;" onclick="resetAuthStep()">
            Change Number
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. Job Detail & Apply Modal -->
  <div class="modal-overlay" id="jobDetailModal">
    <div class="modal-content" style="max-width: 650px;">
      <div class="modal-header">
        <div class="modal-title" id="jdTitle">Job Details</div>
        <button class="modal-close-btn" onclick="closeModal('jobDetailModal')">&times;</button>
      </div>
      <div class="modal-body" id="jdBody">
        <!-- Injected via JavaScript -->
      </div>
      <div class="modal-footer" id="jdFooter">
        <button class="btn btn-outline" onclick="openReportModal('job')">Report</button>
        <button class="btn btn-primary" id="jdApplyBtn" onclick="initiateJobApply()">Apply for Job</button>
      </div>
    </div>
  </div>

  <!-- 3. Candidate Application Submission Modal -->
  <div class="modal-overlay" id="applyModal">
    <div class="modal-content" style="max-width: 520px;">
      <div class="modal-header">
        <div class="modal-title">Submit Application</div>
        <button class="modal-close-btn" onclick="closeModal('applyModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div id="applyJobHeader" style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9;">
          <div style="font-weight: 800; font-size: 16px; color: #19563e;" id="applyJobTitle">Role</div>
          <div style="font-size: 13px; color: #64748b;" id="applyCompany">Company</div>
        </div>

        <div class="form-group">
          <label class="form-label">Resume to Submit</label>
          ${currentResume ? `
            <div class="resume-card" style="margin-top: 0;">
              <div class="resume-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#065f46" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <div>
                  <div class="resume-name">${escapeHtml(currentResume.filename)}</div>
                  <div class="resume-size">${formatBytes(currentResume.file_size)} &bull; Current Snapshot</div>
                </div>
              </div>
              <a href="/api/resumes/${currentResume.id}/view" target="_blank" class="btn btn-sm btn-outline">Preview</a>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
              A snapshot of this resume will be attached to your application.
            </div>
          ` : `
            <div class="resume-dropzone" onclick="document.getElementById('applyResumeFileInput').click()">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#19563e" stroke-width="2" style="margin: 0 auto 6px auto; display: block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style="font-weight: 700; font-size: 13px; color: #19563e;">Upload Resume (PDF / DOC)</div>
              <div style="font-size: 11px; color: #64748b;">Max 5MB file size</div>
              <input type="file" id="applyResumeFileInput" style="display: none;" accept=".pdf,.doc,.docx" onchange="handleResumeUpload(event, true)">
            </div>
          `}
        </div>

        <div id="screeningQuestionsContainer"></div>

        <div class="form-group">
          <label class="form-label" for="applyCoverNote">Cover Note / Why you are a good fit <span>(Optional)</span></label>
          <textarea id="applyCoverNote" class="form-control" placeholder="Briefly describe your relevant experience..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('applyModal')">Cancel</button>
        <button class="btn btn-primary" onclick="submitApplicationFinal()">Submit Application</button>
      </div>
    </div>
  </div>

  <!-- 4. Resume Management Modal -->
  <div class="modal-overlay" id="resumeModal">
    <div class="modal-content" style="max-width: 500px;">
      <div class="modal-header">
        <div class="modal-title">Manage Your Resume</div>
        <button class="modal-close-btn" onclick="closeModal('resumeModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="resume-dropzone" onclick="document.getElementById('modalResumeFileInput').click()">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#19563e" stroke-width="2" style="margin: 0 auto 8px auto; display: block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style="font-weight: 700; font-size: 14px; color: #19563e;">Upload New Resume (PDF / DOC)</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Max file size 5MB &bull; Validated format</div>
          <input type="file" id="modalResumeFileInput" style="display: none;" accept=".pdf,.doc,.docx" onchange="handleResumeUpload(event)">
        </div>

        <div style="margin-top: 20px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">Uploaded Resumes</div>
          ${userResumes.length > 0 ? userResumes.map(r => `
            <div class="resume-card">
              <div class="resume-info">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#065f46" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <div>
                  <div class="resume-name">${escapeHtml(r.filename)}</div>
                  <div class="resume-size">${formatBytes(r.file_size)} &bull; ${r.is_current ? 'Default Resume' : 'Previous Version'}</div>
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <a href="/api/resumes/${r.id}/view" target="_blank" class="btn btn-sm btn-outline">View</a>
                <a href="/api/resumes/${r.id}/download" class="btn btn-sm btn-outline">Download</a>
                <button class="btn btn-sm btn-danger" onclick="deleteResume('${r.id}')">Delete</button>
              </div>
            </div>
          `).join('') : '<div style="color: #94a3b8; font-size: 13px; text-align: center; padding: 16px;">No resume uploaded yet. Upload one to apply to jobs with 1-click.</div>'}
        </div>
      </div>
    </div>
  </div>

  <!-- 5. Job Seeker Profile & Preferences Modal -->
  <div class="modal-overlay" id="profileModal">
    <div class="modal-content" style="max-width: 580px;">
      <div class="modal-header">
        <div class="modal-title">Career Preferences & Profile</div>
        <button class="modal-close-btn" onclick="closeModal('profileModal')">&times;</button>
      </div>
      <div class="modal-body">
        <form id="seekerProfileForm" onsubmit="handleSaveSeekerProfile(event)">
          <div class="form-group">
            <label class="form-label" for="spName">Full Name</label>
            <input type="text" id="spName" class="form-control" value="${escapeHtml(userProfile?.name || session?.name || '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="spEmail">Email Address</label>
            <input type="email" id="spEmail" class="form-control" value="${escapeHtml(userProfile?.email || session?.email || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="spHeadline">Professional Headline</label>
            <input type="text" id="spHeadline" class="form-control" placeholder="e.g. Frontend Engineer | React & TypeScript" value="${escapeHtml(userProfile?.headline || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="spSkills">Key Skills <span>(Comma-separated)</span></label>
            <input type="text" id="spSkills" class="form-control" placeholder="React, Node.js, TypeScript, SQL" value="${escapeHtml(userProfile?.skills || '')}">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" for="spExpLevel">Experience Level</label>
              <select id="spExpLevel" class="form-control">
                <option value="Fresher" ${userProfile?.experience_level === 'Fresher' ? 'selected' : ''}>Fresher</option>
                <option value="1-2 years" ${userProfile?.experience_level === '1-2 years' ? 'selected' : ''}>1-2 years</option>
                <option value="2-4 years" ${userProfile?.experience_level === '2-4 years' ? 'selected' : ''}>2-4 years</option>
                <option value="5+ years" ${userProfile?.experience_level === '5+ years' ? 'selected' : ''}>5+ years</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="spWorkMode">Preferred Work Mode</label>
              <select id="spWorkMode" class="form-control">
                <option value="remote,hybrid,onsite">Any Mode</option>
                <option value="remote" ${userProfile?.work_modes === 'remote' ? 'selected' : ''}>Remote</option>
                <option value="hybrid" ${userProfile?.work_modes === 'hybrid' ? 'selected' : ''}>Hybrid</option>
                <option value="onsite" ${userProfile?.work_modes === 'onsite' ? 'selected' : ''}>On-site</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="spLocation">Current City / Location</label>
            <input type="text" id="spLocation" class="form-control" placeholder="e.g. Moradabad, Delhi, Remote" value="${escapeHtml(userProfile?.location || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="spEducation">Education</label>
            <input type="text" id="spEducation" class="form-control" placeholder="e.g. B.Tech Computer Science" value="${escapeHtml(userProfile?.education || '')}">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Save Profile</button>
        </form>
      </div>
    </div>
  </div>

  <!-- 6. Employer Multi-Step Job Posting Modal -->
  <div class="modal-overlay" id="postJobModal">
    <div class="modal-content" style="max-width: 620px;">
      <div class="modal-header">
        <div class="modal-title">Post a Job or Internship</div>
        <button class="modal-close-btn" onclick="closeModal('postJobModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: #92400e; display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div><strong>Mandatory Admin Review:</strong> All job postings are verified by the Alifeo team before going live to ensure job seeker trust & safety.</div>
        </div>

        <form id="postJobForm" onsubmit="handlePostJobSubmit(event)">
          <div class="form-group">
            <label class="form-label" for="pjTitle">Job Title</label>
            <input type="text" id="pjTitle" class="form-control" placeholder="e.g. Full Stack Developer (React / Node)" required>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" for="pjCompany">Hiring Company</label>
              <input type="text" id="pjCompany" class="form-control" value="${escapeHtml(userProfile?.company_name || 'My Company')}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="pjCategory">Category</label>
              <select id="pjCategory" class="form-control">
                <option value="Engineering">Engineering & Tech</option>
                <option value="Design">UI/UX & Design</option>
                <option value="Product">Product Management</option>
                <option value="Marketing">Marketing & Growth</option>
                <option value="Operations">Operations & HR</option>
                <option value="Sales">Sales & BD</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label" for="pjType">Job Type</label>
              <select id="pjType" class="form-control">
                <option value="full_time">Full Time</option>
                <option value="internship">Internship</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="pjMode">Work Mode</label>
              <select id="pjMode" class="form-control">
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="pjCity">Location / City</label>
              <input type="text" id="pjCity" class="form-control" placeholder="e.g. Moradabad" value="Moradabad">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjSalary">Salary / Stipend Display</label>
            <input type="text" id="pjSalary" class="form-control" placeholder="e.g. ₹25,000 - ₹40,000 / month" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjSkills">Required Skills <span>(Comma-separated)</span></label>
            <input type="text" id="pjSkills" class="form-control" placeholder="e.g. React, Node.js, SQL" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjDesc">Job Description</label>
            <textarea id="pjDesc" class="form-control" style="min-height: 90px;" placeholder="Describe the role and key goals..." required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjResp">Key Responsibilities <span>(Optional)</span></label>
            <textarea id="pjResp" class="form-control" placeholder="Outline day-to-day duties..."></textarea>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px;">
            <button type="button" class="btn btn-outline" style="flex: 1;" onclick="submitJobForm(false)">Save as Draft</button>
            <button type="button" class="btn btn-primary" style="flex: 1;" onclick="submitJobForm(true)">Submit for Review</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- 7. Schedule Interview Modal -->
  <div class="modal-overlay" id="interviewModal">
    <div class="modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <div class="modal-title">Schedule Interview</div>
        <button class="modal-close-btn" onclick="closeModal('interviewModal')">&times;</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="intAppId">
        <div class="form-group">
          <label class="form-label" for="intDate">Interview Date</label>
          <input type="date" id="intDate" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="intTime">Time</label>
          <input type="time" id="intTime" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="intType">Type</label>
          <select id="intType" class="form-control">
            <option value="online">Online Video (Google Meet / Zoom)</option>
            <option value="in_person">In-Person Onsite</option>
            <option value="phone">Phone Call</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="intLink">Meeting Link / Office Address</label>
          <input type="text" id="intLink" class="form-control" placeholder="https://meet.google.com/... or office address">
        </div>
        <div class="form-group">
          <label class="form-label" for="intNotes">Instructions for Candidate <span>(Optional)</span></label>
          <textarea id="intNotes" class="form-control" placeholder="e.g. Please bring your laptop and be ready with your project demo..."></textarea>
        </div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="submitInterviewSchedule()">Confirm & Notify Candidate</button>
      </div>
    </div>
  </div>

  <!-- 8. Real-time In-App Chat Modal -->
  <div class="modal-overlay" id="chatModal">
    <div class="modal-content" style="max-width: 520px;">
      <div class="modal-header">
        <div>
          <div class="modal-title" id="chatTitle">Job Conversation</div>
          <div style="font-size: 11px; color: #64748b;" id="chatSubtitle">Direct Candidate & Recruiter Chat</div>
        </div>
        <button class="modal-close-btn" onclick="closeModal('chatModal')">&times;</button>
      </div>
      <div class="modal-body" style="padding: 12px;">
        <div class="chat-box">
          <div class="chat-messages" id="chatMessages">
            <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">Loading conversation...</div>
          </div>
          <form class="chat-input-row" onsubmit="handleSendChatMessage(event)">
            <input type="text" id="chatInputText" placeholder="Type a message..." autocomplete="off">
            <button type="submit" class="btn btn-primary btn-sm">Send</button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- 9. Trust & Safety Reporting Modal -->
  <div class="modal-overlay" id="reportModal">
    <div class="modal-content" style="max-width: 440px;">
      <div class="modal-header">
        <div class="modal-title">Report & Safety Issue</div>
        <button class="modal-close-btn" onclick="closeModal('reportModal')">&times;</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="reportTargetType" value="job">
        <input type="hidden" id="reportTargetId" value="">
        <div class="form-group">
          <label class="form-label" for="reportCategory">Reason Category</label>
          <select id="reportCategory" class="form-control">
            <option value="Fake Job">Fake job or company</option>
            <option value="Money Demand">Asking for money / application fee</option>
            <option value="Misleading Salary">Misleading salary / description</option>
            <option value="Spam">Spam or promotional message</option>
            <option value="Discrimination">Discrimination or inappropriate questions</option>
            <option value="Harassment">Harassment or abusive behavior</option>
            <option value="Other">Other policy violation</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="reportDesc">Description of Violation</label>
          <textarea id="reportDesc" class="form-control" placeholder="Provide details to help admin investigation..."></textarea>
        </div>
        <button class="btn btn-danger" style="width: 100%; margin-top: 10px;" onclick="submitSafetyReport()">Submit Report to Moderation</button>
      </div>
    </div>
  </div>

  <!-- ============================================================= -->
  <!-- CLIENT JAVASCRIPT LOGIC -->
  <!-- ============================================================= -->
  <script>
    const ALL_JOBS = ${JSON.stringify(jobs)};
    let ACTIVE_CHAT_APP_ID = null;
    let ACTIVE_CHAT_JOB_ID = null;
    let ABLY_CLIENT = null;
    let CURRENT_AUTH_ROLE = 'job_seeker';
    let SELECTED_JOB_FOR_APPLY = null;

    function openModal(id) {
      document.getElementById(id)?.classList.add('active');
    }
    function closeModal(id) {
      document.getElementById(id)?.classList.remove('active');
    }

    function selectAuthRole(role) {
      CURRENT_AUTH_ROLE = role;
      const bSeeker = document.getElementById('roleChoiceSeeker');
      const bEmp = document.getElementById('roleChoiceEmployer');
      if (role === 'employer') {
        bEmp.style.borderColor = '#19563e';
        bEmp.style.background = '#ecfdf5';
        bEmp.style.color = '#19563e';
        bSeeker.style.borderColor = '#e2e8f0';
        bSeeker.style.background = '#ffffff';
        bSeeker.style.color = '#334155';
      } else {
        bSeeker.style.borderColor = '#19563e';
        bSeeker.style.background = '#ecfdf5';
        bSeeker.style.color = '#19563e';
        bEmp.style.borderColor = '#e2e8f0';
        bEmp.style.background = '#ffffff';
        bEmp.style.color = '#334155';
      }
    }

    function openLoginModal(role = 'job_seeker') {
      selectAuthRole(role);
      document.getElementById('authStep1').style.display = 'block';
      document.getElementById('authStep2').style.display = 'none';
      openModal('authModal');
    }

    async function sendAuthOtp() {
      const phone = document.getElementById('authPhone').value.trim();
      const name = document.getElementById('authName').value.trim();
      if (!phone) {
        alert('Please enter your WhatsApp mobile number');
        return;
      }
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, name, role: CURRENT_AUTH_ROLE })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('authStep1').style.display = 'none';
          document.getElementById('authStep2').style.display = 'block';
          if (data.testOtp) {
            document.getElementById('testOtpDisplay').innerText = 'Verification OTP: ' + data.testOtp;
          }
        } else {
          alert(data.error || 'Failed to send OTP');
        }
      } catch (e) {
        alert('Network connection error');
      }
    }

    async function verifyAuthOtp() {
      const phone = document.getElementById('authPhone').value.trim();
      const otp = document.getElementById('authOtp').value.trim();
      const name = document.getElementById('authName').value.trim();
      if (!otp) {
        alert('Please enter the 6-digit OTP code');
        return;
      }
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, otp, role: CURRENT_AUTH_ROLE, name })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || 'Invalid OTP code');
        }
      } catch (e) {
        alert('Verification error');
      }
    }

    function resetAuthStep() {
      document.getElementById('authStep1').style.display = 'block';
      document.getElementById('authStep2').style.display = 'none';
    }

    async function switchRole(targetRole) {
      try {
        const res = await fetch('/api/auth/switch-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: targetRole })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || 'Failed to switch role');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function handleLogout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    }

    // Job View & Apply
    function viewJobDetails(jobId) {
      const job = ALL_JOBS.find(j => j.id === jobId);
      if (!job) return;
      SELECTED_JOB_FOR_APPLY = job;
      document.getElementById('jdTitle').innerText = job.title;
      document.getElementById('jdBody').innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #0f172a;">\${escapeHtml(job.title)}</div>
            <div style="font-size: 14px; font-weight: 600; color: #19563e; margin-top: 4px;">\${escapeHtml(job.company_name)} &bull; \${escapeHtml(job.city)}</div>
          </div>
          <span class="status-pill status-approved">Verified Company</span>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          <span class="tag tag-salary">\${escapeHtml(job.salary_display)}</span>
          <span class="tag tag-type">\${escapeHtml(job.job_type.toUpperCase())}</span>
          <span class="tag tag-mode">\${escapeHtml(job.work_mode.toUpperCase())}</span>
          <span class="tag">\${escapeHtml(job.experience_level)}</span>
        </div>

        <div style="margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">About the Role</div>
          <p style="font-size: 14px; color: #475569; line-height: 1.5; white-space: pre-line;">\${escapeHtml(job.description)}</p>
        </div>

        \${job.responsibilities ? \`
          <div style="margin-bottom: 16px;">
            <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Key Responsibilities</div>
            <p style="font-size: 14px; color: #475569; line-height: 1.5; white-space: pre-line;">\${escapeHtml(job.responsibilities)}</p>
          </div>
        \` : ''}

          <div style="margin-bottom: 16px;">
            <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 4px;">Required Skills</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              \${(job.required_skills || job.skills || '').split(',').filter(Boolean).map(s => \`<span class="tag">\${escapeHtml(s.trim())}</span>\`).join('')}
            </div>
          </div>
      \`;
      document.getElementById('reportTargetId').value = job.id;
      openModal('jobDetailModal');
    }

    function initiateJobApply() {
      closeModal('jobDetailModal');
      if (!SELECTED_JOB_FOR_APPLY) return;
      document.getElementById('applyJobTitle').innerText = SELECTED_JOB_FOR_APPLY.title;
      document.getElementById('applyCompany').innerText = SELECTED_JOB_FOR_APPLY.company_name;
      openModal('applyModal');
    }

    async function submitApplicationFinal() {
      if (!SELECTED_JOB_FOR_APPLY) return;
      const coverNote = document.getElementById('applyCoverNote')?.value.trim() || '';

      try {
        const res = await fetch('/api/jobs/' + SELECTED_JOB_FOR_APPLY.id + '/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cover_note: coverNote })
        });
        const data = await res.json();
        if (data.success) {
          alert('Application submitted successfully!');
          closeModal('applyModal');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to submit application');
        }
      } catch (e) {
        alert('Network error while applying');
      }
    }

    // Resume Upload Handler (Base64 file reading)
    function handleResumeUpload(event, autoSelect = false) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async function() {
        const base64Data = reader.result;
        try {
          const res = await fetch('/api/resumes/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              file_data: base64Data,
              file_size: file.size,
              mime_type: file.type || 'application/pdf'
            })
          });
          const data = await res.json();
          if (data.success) {
            alert('Resume uploaded and set as default!');
            window.location.reload();
          } else {
            alert(data.error || 'Failed to upload resume');
          }
        } catch (e) {
          alert('Upload failed');
        }
      };
      reader.readAsDataURL(file);
    }

    async function deleteResume(id) {
      if (!confirm('Are you sure you want to delete this resume?')) return;
      try {
        const res = await fetch('/api/resumes/' + id, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || 'Delete failed');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    // Post Job Form Submit
    async function submitJobForm(submitForReview) {
      const title = document.getElementById('pjTitle').value.trim();
      const company_name = document.getElementById('pjCompany').value.trim();
      const category = document.getElementById('pjCategory').value;
      const job_type = document.getElementById('pjType').value;
      const work_mode = document.getElementById('pjMode').value;
      const city = document.getElementById('pjCity').value.trim();
      const salary_display = document.getElementById('pjSalary').value.trim();
      const required_skills = document.getElementById('pjSkills').value.trim();
      const description = document.getElementById('pjDesc').value.trim();
      const responsibilities = document.getElementById('pjResp').value.trim();

      if (!title || !description || !salary_display) {
        alert('Please fill out all required fields');
        return;
      }

      try {
        const res = await fetch('/api/employer/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title, company_name, category, job_type, work_mode, city,
            salary_display, required_skills, description, responsibilities,
            submit_for_review: submitForReview
          })
        });
        const data = await res.json();
        if (data.success) {
          alert(submitForReview ? 'Job submitted for admin review!' : 'Job saved as draft!');
          closeModal('postJobModal');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to post job');
        }
      } catch (e) {
        alert('Submission error');
      }
    }

    // Employer Status & Internal Notes
    async function updateCandidateStatus(appId, newStatus) {
      const notes = prompt('Add optional note for status change:');
      try {
        const res = await fetch('/api/employer/applications/' + appId + '/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, notes })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.error || 'Failed to update status');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function saveInternalNotes(appId) {
      const notes = document.getElementById('internalNotes_' + appId)?.value.trim() || '';
      try {
        const res = await fetch('/api/employer/applications/' + appId + '/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes })
        });
        const data = await res.json();
        if (data.success) {
          alert('Internal private note saved!');
        } else {
          alert(data.error || 'Failed to save note');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    // Interview Modal
    function openInterviewScheduleModal(appId) {
      document.getElementById('intAppId').value = appId;
      openModal('interviewModal');
    }

    async function submitInterviewSchedule() {
      const appId = document.getElementById('intAppId').value;
      const scheduled_date = document.getElementById('intDate').value;
      const scheduled_time = document.getElementById('intTime').value;
      const interview_type = document.getElementById('intType').value;
      const location_or_link = document.getElementById('intLink').value.trim();
      const instructions = document.getElementById('intNotes').value.trim();

      if (!scheduled_date || !scheduled_time) {
        alert('Please select date and time');
        return;
      }

      try {
        const res = await fetch('/api/interviews/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            application_id: appId,
            scheduled_date,
            scheduled_time,
            interview_type,
            location_or_link,
            instructions
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Interview scheduled and candidate notified!');
          closeModal('interviewModal');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to schedule');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    // Realtime In-App Chat
    async function openChatModal(appId, title) {
      ACTIVE_CHAT_APP_ID = appId;
      document.getElementById('chatTitle').innerText = title || 'Job Conversation';
      openModal('chatModal');
      await loadChatMessages(appId);
    }

    async function loadChatMessages(appId) {
      try {
        const res = await fetch('/api/chat/' + appId + '/messages');
        const data = await res.json();
        const container = document.getElementById('chatMessages');
        if (data.messages && data.messages.length > 0) {
          container.innerHTML = data.messages.map(m => \`
            <div class="chat-bubble \${m.sender_role === '${session?.active_role === 'employer' ? 'employer' : 'candidate'}' ? 'mine' : 'theirs'}">
              <div style="font-size: 11px; font-weight: 700; opacity: 0.8; margin-bottom: 2px;">\${escapeHtml(m.sender_name)}</div>
              <div>\${escapeHtml(m.message)}</div>
              <div class="chat-time">\${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          \`).join('');
          container.scrollTop = container.scrollHeight;
        } else {
          container.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px;">No messages yet. Start the conversation!</div>';
        }
      } catch (e) {
        console.error('Chat load error:', e);
      }
    }

    async function handleSendChatMessage(event) {
      event.preventDefault();
      const input = document.getElementById('chatInputText');
      const text = input.value.trim();
      if (!text || !ACTIVE_CHAT_APP_ID) return;

      input.value = '';
      try {
        const res = await fetch('/api/chat/' + ACTIVE_CHAT_APP_ID + '/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        if (data.success) {
          await loadChatMessages(ACTIVE_CHAT_APP_ID);
        }
      } catch (e) {
        alert('Failed to send message');
      }
    }

    // Safety Report
    function openReportModal(targetType, targetId) {
      document.getElementById('reportTargetType').value = targetType || 'job';
      document.getElementById('reportTargetId').value = targetId || '';
      openModal('reportModal');
    }

    async function submitSafetyReport() {
      const target_type = document.getElementById('reportTargetType').value;
      const target_id = document.getElementById('reportTargetId').value;
      const reason_category = document.getElementById('reportCategory').value;
      const description = document.getElementById('reportDesc').value.trim();

      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_type, target_id, reason_category, description })
        });
        const data = await res.json();
        if (data.success) {
          alert('Report submitted. Admin moderation will investigate.');
          closeModal('reportModal');
        } else {
          alert(data.error || 'Failed to submit report');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    function openPostJobModal() { openModal('postJobModal'); }
    function openResumeModal() { openModal('resumeModal'); }
    function openProfileModal() { openModal('profileModal'); }
    function openEmployerProfileModal() { alert('Employer company settings updated from job post.'); }

    function showSeekerTab(tab) {
      // Toggle client-side view tab
    }
    function showEmployerTab(tab) {
      // Toggle employer client view tab
    }

    function escapeHtml(t) {
      if (!t) return '';
      return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  </script>
</body>
</html>`;
}

function renderSeekerSection(
  jobs: Job[],
  applications: Application[],
  profile: any,
  currentResume?: Resume
): string {
  const jobCards = jobs.map(j => `
    <div class="job-card" onclick="viewJobDetails('${j.id}')">
      <div class="job-card-top">
        <div>
          <div class="job-card-title">${escapeHtml(j.title)}</div>
          <div class="job-card-company">
            ${escapeHtml(j.company_name)}
            <span class="verified-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Verified
            </span>
          </div>
        </div>
        <span class="status-pill status-approved">${j.job_type === 'internship' ? 'Internship' : 'Job'}</span>
      </div>

      <div class="job-card-tags">
        <span class="tag tag-salary">${escapeHtml(j.salary_display)}</span>
        <span class="tag tag-mode">${j.work_mode.toUpperCase()}</span>
        <span class="tag">${escapeHtml(j.city)}</span>
        <span class="tag">${escapeHtml(j.experience_level)}</span>
      </div>

      <div class="job-card-footer">
        <div>Skills: ${escapeHtml(((j.required_skills || (j as any).skills || '').split(',').filter(Boolean).slice(0, 3).join(', ')) || 'General')}</div>
        <div style="font-weight: 700; color: #19563e;">View Details &rarr;</div>
      </div>
    </div>
  `).join('');

  const appCards = applications.map(a => `
    <div class="job-card" style="cursor: default;">
      <div class="job-card-top">
        <div>
          <div class="job-card-title">${escapeHtml(a.job_title || 'Position')}</div>
          <div class="job-card-company">${escapeHtml(a.company_name || 'Alifeo Partner')}</div>
        </div>
        <span class="status-pill status-${a.status}">${formatStatus(a.status)}</span>
      </div>

      <div style="font-size: 12px; color: #64748b; margin: 10px 0;">
        Applied on ${new Date(a.created_at).toLocaleDateString()} &bull; Snapshot: <strong>${escapeHtml(a.resume_filename)}</strong>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button class="btn btn-sm btn-primary" onclick="openChatModal('${a.id}', '${escapeHtml(a.job_title)}')">In-App Chat</button>
        ${a.status !== 'withdrawn' ? `<button class="btn btn-sm btn-outline" onclick="withdrawApp('${a.id}')">Withdraw</button>` : ''}
      </div>
    </div>
  `).join('');

  return `
    <div class="search-hero-card">
      <div class="search-input-row">
        <div class="search-field">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="feedSearchQuery" placeholder="Search by job title, skill, or company...">
        </div>
        <div class="search-field" style="max-width: 200px;">
          <select id="feedFilterCity">
            <option value="">All Locations</option>
            <option value="Moradabad">Moradabad</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="alert('Filtering jobs feed...')">Search</button>
      </div>
      <div class="filter-pills-row">
        <button class="filter-pill active">All Roles</button>
        <button class="filter-pill">Remote Only</button>
        <button class="filter-pill">Internships</button>
        <button class="filter-pill">Full Time</button>
        <button class="filter-pill">Engineering</button>
        <button class="filter-pill">Design</button>
      </div>
    </div>

    <div class="layout-grid">
      <div>
        <div class="section-header-row">
          <div class="section-heading">
            Live Verified Openings
            <span class="count-badge">${jobs.length} Available</span>
          </div>
        </div>
        ${jobCards || '<div style="text-align: center; color: #94a3b8; padding: 40px;">No approved jobs found matching filters.</div>'}
      </div>

      <div>
        <div class="section-header-row">
          <div class="section-heading">
            My Applications
            <span class="count-badge">${applications.length}</span>
          </div>
        </div>
        ${appCards || `
          <div class="job-card" style="text-align: center; padding: 30px; color: #64748b;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin: 0 auto 8px auto; display: block;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div style="font-weight: 700; font-size: 14px; color: #334155;">No applications submitted yet</div>
            <div style="font-size: 12px; margin-top: 4px;">Explore openings and apply with 1-click.</div>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderEmployerSection(
  jobs: Job[],
  applications: Application[],
  profile: EmployerProfile
): string {
  const activeJobs = jobs.filter(j => j.status === 'approved');
  const pendingJobs = jobs.filter(j => j.status === 'pending_review');

  const jobRows = jobs.map(j => `
    <div class="job-card">
      <div class="job-card-top">
        <div>
          <div class="job-card-title">${escapeHtml(j.title)}</div>
          <div class="job-card-company">${escapeHtml(j.company_name)} &bull; ${escapeHtml(j.city)} &bull; ${j.work_mode.toUpperCase()}</div>
        </div>
        <span class="status-pill status-${j.status}">${formatJobStatus(j.status)}</span>
      </div>

      ${j.status === 'changes_requested' && j.admin_feedback ? `
        <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #c2410c; margin: 10px 0;">
          <strong>Admin Feedback:</strong> ${escapeHtml(j.admin_feedback)}
        </div>
      ` : ''}

      <div style="display: flex; gap: 8px; margin-top: 12px; align-items: center; justify-content: space-between;">
        <span class="tag tag-salary">${escapeHtml(j.salary_display)}</span>
        <div>
          ${j.status === 'draft' ? `<button class="btn btn-sm btn-primary" onclick="alert('Submit draft via edit')">Submit for Review</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  const applicantRows = applications.map(a => `
    <div class="job-card">
      <div class="job-card-top">
        <div>
          <div class="job-card-title">${escapeHtml(a.candidate_name)}</div>
          <div style="font-size: 13px; color: #19563e; font-weight: 600;">Applied for: ${escapeHtml(a.job_title || 'Position')}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Phone: <strong>${escapeHtml(a.candidate_phone)}</strong></div>
        </div>
        <span class="status-pill status-${a.status}">${formatStatus(a.status)}</span>
      </div>

      <div style="display: flex; gap: 8px; margin: 12px 0;">
        <a href="/api/resumes/${a.resume_id}/view" target="_blank" class="btn btn-sm btn-outline">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          View Resume
        </a>
        <button class="btn btn-sm btn-primary" onclick="openChatModal('${a.id}', '${escapeHtml(a.candidate_name)}')">Message</button>
        <button class="btn btn-sm btn-accent" onclick="openInterviewScheduleModal('${a.id}')">Schedule Interview</button>
      </div>

      <div class="form-group" style="margin-top: 10px;">
        <label class="form-label" style="font-size: 11px;">Pipeline Stage Action</label>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="btn btn-sm btn-outline" onclick="updateCandidateStatus('${a.id}', 'under_review')">Under Review</button>
          <button class="btn btn-sm btn-outline" onclick="updateCandidateStatus('${a.id}', 'shortlisted')">Shortlist</button>
          <button class="btn btn-sm btn-outline" style="color: #15803d; border-color: #a7f3d0;" onclick="updateCandidateStatus('${a.id}', 'selected')">Select</button>
          <button class="btn btn-sm btn-danger" onclick="updateCandidateStatus('${a.id}', 'rejected')">Reject</button>
        </div>
      </div>

      <!-- Private Internal Notes -->
      <div style="margin-top: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 4px;">Recruiter Private Internal Notes (Hidden from candidate)</div>
        <textarea id="internalNotes_${a.id}" class="form-control" style="font-size: 12px; min-height: 50px;" placeholder="Add private evaluation notes...">${escapeHtml(a.employer_internal_notes || '')}</textarea>
        <button class="btn btn-sm btn-outline" style="margin-top: 6px;" onclick="saveInternalNotes('${a.id}')">Save Private Note</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Active Jobs</div>
        <div class="metric-value">${activeJobs.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Under Review</div>
        <div class="metric-value" style="color: ${pendingJobs.length > 0 ? '#b45309' : '#19563e'}">${pendingJobs.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Applicants</div>
        <div class="metric-value">${applications.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Verification</div>
        <div style="font-size: 14px; font-weight: 700; color: #0284c7; margin-top: 8px;">
          ${profile?.verification_status ? profile.verification_status.toUpperCase() : 'UNVERIFIED'}
        </div>
      </div>
    </div>

    <div class="layout-grid">
      <div>
        <div class="section-header-row">
          <div class="section-heading">
            My Job Postings (${jobs.length})
          </div>
          <button class="btn btn-sm btn-accent" onclick="openPostJobModal()">+ Post New Job</button>
        </div>
        ${jobRows || '<div style="text-align: center; color: #94a3b8; padding: 30px;">No jobs posted yet. Click Post New Job to start hiring.</div>'}
      </div>

      <div>
        <div class="section-header-row">
          <div class="section-heading">
            Candidate Pipeline (${applications.length})
          </div>
        </div>
        ${applicantRows || '<div style="text-align: center; color: #94a3b8; padding: 30px;">No candidates have applied yet.</div>'}
      </div>
    </div>
  `;
}

function formatStatus(status: string): string {
  switch (status) {
    case 'applied': return 'Applied';
    case 'under_review': return 'Under Review';
    case 'shortlisted': return 'Shortlisted';
    case 'interview': return 'Interview Scheduled';
    case 'selected': return 'Selected';
    case 'rejected': return 'Rejected';
    case 'withdrawn': return 'Withdrawn';
    default: return status;
  }
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

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(text: string = ''): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
