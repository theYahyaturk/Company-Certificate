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
  <title>Alifeo Jobs | Live Hiring Map & Location Discovery</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  
  <!-- Leaflet CSS for free interactive map view -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <!-- Ably Real-time SDK for in-app chat -->
  <script src="https://cdn.ably.com/lib/ably.min-1.js"></script>

  <style>
    ${JOB_PORTAL_STYLES}
  </style>
</head>
<body>
  <div class="top-brand-bar"></div>

  <!-- Header Navbar (Clean Mobile-First Senior UI) -->
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo">
        <span class="nav-brand-title">Alifeo</span>
      </a>

      <!-- Location Selector Pill (Zomato-style tap to locate) -->
      <div class="header-location-pill" onclick="requestGPSLocation()" title="Detect or Change Location">
        <svg class="pin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span id="headerCityText">Moradabad Hub</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>

    <div class="nav-actions">
      ${session ? `
        <!-- Profile Greeting & Photo -->
        <div class="header-user-wrap">
          <div class="header-greeting" onclick="openProfileModal()" style="cursor: pointer;" title="Edit Profile">
            Hey, <strong>${escapeHtml((userProfile?.name || session.name || 'Candidate').split(' ')[0])}</strong>
          </div>
          <div class="header-avatar" onclick="openProfileModal()" title="Profile & Preferences">
            ${userProfile?.photo_url ? `<img src="${userProfile.photo_url}" class="header-avatar-img">` : `<div class="header-avatar-initials">${escapeHtml((userProfile?.name || session.name || 'U').charAt(0).toUpperCase())}</div>`}
          </div>
        </div>

        ${isEmployer ? `
          <button class="btn btn-sm btn-accent" onclick="openPostJobModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Post Job
          </button>
        ` : `
          <button class="btn btn-sm btn-accent" onclick="openLoginModal('employer')">
            Hire Someone
          </button>
        `}
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
      <button class="bottom-nav-item active" onclick="switchViewMode('list')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>Jobs</span>
      </button>
      <button class="bottom-nav-item" onclick="openPostJobModal()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        <span>Post</span>
      </button>
      <button class="bottom-nav-item" onclick="document.getElementById('employerApplicantsSection')?.scrollIntoView({ behavior: 'smooth' })">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Applicants</span>
      </button>
    ` : `
      <button class="bottom-nav-item ${!isEmployer ? 'active' : ''}" onclick="switchViewMode('map')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
        <span>Hiring Map</span>
      </button>
      <button class="bottom-nav-item" onclick="switchViewMode('list')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Feed</span>
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
        <div class="modal-title">My Profile & Preferences</div>
        <button class="modal-close-btn" onclick="closeModal('profileModal')">&times;</button>
      </div>
      <div class="modal-body">
        <form id="seekerProfileForm" onsubmit="handleSaveSeekerProfile(event)">
          <!-- Profile Photo Upload Circle -->
          <div class="profile-photo-container">
            <div class="profile-photo-circle" onclick="document.getElementById('spPhotoInput').click()" title="Click to change profile picture">
              <img id="spPhotoPreview" src="${escapeHtml(userProfile?.photo_url || '')}" style="${userProfile?.photo_url ? '' : 'display: none;'}" class="profile-photo-img">
              <div id="spPhotoPlaceholder" style="${userProfile?.photo_url ? 'display: none;' : ''}" class="profile-photo-placeholder">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#19563e" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <span>Upload Pic</span>
              </div>
            </div>
            <input type="file" id="spPhotoInput" accept="image/*" style="display: none;" onchange="handleProfilePhotoUpload(event)">
            <input type="hidden" id="spPhotoUrl" value="${escapeHtml(userProfile?.photo_url || '')}">
            <div style="font-size: 11px; color: #64748b; margin-top: 6px; font-weight: 600;">Tap avatar to upload your profile photo</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="spName">Full Name</label>
            <input type="text" id="spName" class="form-control" value="${escapeHtml(userProfile?.name || session?.name || '')}" placeholder="e.g. Mohd Khalid" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="spEmail">Email Address</label>
            <input type="email" id="spEmail" class="form-control" value="${escapeHtml(userProfile?.email || session?.email || '')}" placeholder="e.g. khalid@example.com">
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
                <option value="onsite" ${userProfile?.work_modes === 'onsite' ? 'selected' : ''}>On-site</option>
                <option value="hybrid" ${userProfile?.work_modes === 'hybrid' ? 'selected' : ''}>Hybrid</option>
                <option value="remote" ${userProfile?.work_modes === 'remote' ? 'selected' : ''}>Remote</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="spLocation">Current City / Location</label>
            <input type="text" id="spLocation" class="form-control" placeholder="e.g. Moradabad, Delhi, Remote" value="${escapeHtml(userProfile?.location || '')}">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">Save Profile</button>
        </form>
      </div>
    </div>
  </div>

  <!-- 6. Employer Multi-Step Job Posting Modal (With Dedicated Workplace Location) -->
  <div class="modal-overlay" id="postJobModal">
    <div class="modal-content" style="max-width: 650px;">
      <div class="modal-header">
        <div class="modal-title">Post a Job & Workplace Location</div>
        <button class="modal-close-btn" onclick="closeModal('postJobModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; color: #92400e; display: flex; align-items: center; gap: 8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div><strong>Live Map Notice:</strong> Provide accurate workplace details so local job seekers can discover your openings on the hiring map. All listings undergo mandatory admin verification before going live.</div>
        </div>

        <form id="postJobForm" onsubmit="event.preventDefault();">
          <!-- Company Logo Upload for Map Marker Pin -->
          <div class="form-group" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
            <label class="form-label" style="margin-bottom: 6px;">Company Brand Logo <span>(Appears directly on Live Hiring Map!)</span></label>
            <div style="display: flex; gap: 14px; align-items: center;">
              <div class="company-logo-preview" id="pjLogoPreviewBox" onclick="document.getElementById('pjLogoInput').click()" title="Click to upload company logo">
                <img id="pjLogoImg" style="display: none; width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                <div id="pjLogoPlaceholder" style="font-size: 11px; color: #19563e; font-weight: 800; text-align: center;">+ Logo</div>
              </div>
              <input type="file" id="pjLogoInput" accept="image/*" style="display: none;" onchange="handleJobLogoUpload(event)">
              <input type="hidden" id="pjLogoUrl" value="${escapeHtml(userProfile?.company_logo || '')}">
              <div>
                <div style="font-weight: 700; font-size: 13px; color: #19563e;">Upload Company Logo</div>
                <div style="font-size: 11px; color: #64748b;">Job seekers will see your brand pin immediately on the map</div>
              </div>
            </div>
          </div>

          <!-- Step 1: Role Overview -->
          <div class="form-group">
            <label class="form-label" for="pjTitle">Job Title</label>
            <input type="text" id="pjTitle" class="form-control" placeholder="e.g. Store Supervisor / CNC Operator / SDE" required>
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
                <option value="Manufacturing">Manufacturing & Factory</option>
                <option value="Retail">Retail & Shop</option>
                <option value="Healthcare">Healthcare & Hospital</option>
                <option value="Hospitality">Hospitality & Restaurant</option>
                <option value="Warehouse">Warehouse & Logistics</option>
                <option value="Design">UI/UX & Design</option>
                <option value="Operations">Operations & HR</option>
              </select>
            </div>
          </div>

          <!-- Step 2: Dedicated Workplace Location Step -->
          <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 13px; font-weight: 800; color: #19563e; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Workplace & Branch Location (For Live Hiring Map)
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label" for="pjWorkplaceName">Workplace / Branch Name</label>
                <input type="text" id="pjWorkplaceName" class="form-control" placeholder="e.g. Unit 2 Plant / Connaught Place Store">
              </div>
              <div class="form-group">
                <label class="form-label" for="pjWorkplaceType">Workplace Type</label>
                <select id="pjWorkplaceType" class="form-control">
                  <option value="Office">Corporate Office</option>
                  <option value="Factory">Factory / Plant</option>
                  <option value="Retail Shop">Retail Shop / Store</option>
                  <option value="Warehouse">Warehouse / Depot</option>
                  <option value="Hospital">Hospital / Clinic</option>
                  <option value="Restaurant">Restaurant / Hotel</option>
                  <option value="Site">Field / Worksite</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="pjWorkplaceAddress">Workplace Street Address</label>
              <input type="text" id="pjWorkplaceAddress" class="form-control" placeholder="e.g. Plot 14, Industrial Area, Civil Lines">
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label" for="pjCity">City</label>
                <input type="text" id="pjCity" class="form-control" value="Moradabad" required onchange="handleEmployerCityChange()">
              </div>
              <div class="form-group">
                <label class="form-label" for="pjState">State</label>
                <input type="text" id="pjState" class="form-control" placeholder="e.g. Uttar Pradesh" value="Uttar Pradesh">
              </div>
              <div class="form-group">
                <label class="form-label" for="pjPincode">Pincode</label>
                <input type="text" id="pjPincode" class="form-control" placeholder="e.g. 244001" value="244001">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; align-items: flex-end;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="pjLat">Latitude</label>
                <input type="number" step="any" id="pjLat" class="form-control" value="28.8386">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="pjLng">Longitude</label>
                <input type="number" step="any" id="pjLng" class="form-control" value="78.7733">
              </div>
              <button type="button" class="btn btn-outline" style="height: 42px;" onclick="detectEmployerPinLocation()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
                GPS Pin
              </button>
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
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="pjOpenings">Openings</label>
              <input type="number" id="pjOpenings" class="form-control" value="1" min="1">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="pjSalary">Salary / Pay Display</label>
            <input type="text" id="pjSalary" class="form-control" placeholder="e.g. ₹20,000 - ₹35,000 / month" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjSkills">Required Skills <span>(Comma-separated)</span></label>
            <input type="text" id="pjSkills" class="form-control" placeholder="e.g. Machine Operation, Quality Control" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjDesc">Role Description</label>
            <textarea id="pjDesc" class="form-control" style="min-height: 80px;" placeholder="Describe duties, shift timings, requirements..." required></textarea>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 14px;">
            <button type="button" class="btn btn-outline" style="flex: 1;" onclick="submitJobForm(false)">Save Draft</button>
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
          <label class="form-label" for="intDate">Date</label>
          <input type="date" id="intDate" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="intTime">Time</label>
          <input type="time" id="intTime" class="form-control" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="intType">Interview Type</label>
          <select id="intType" class="form-control">
            <option value="in_person">In-Person Onsite (At Workplace)</option>
            <option value="online">Online Video (Google Meet / Zoom)</option>
            <option value="phone">Phone Call</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="intLink">Meeting Link / Workplace Address</label>
          <input type="text" id="intLink" class="form-control" placeholder="https://meet.google.com/... or office address">
        </div>
        <div class="form-group">
          <label class="form-label" for="intNotes">Instructions for Candidate <span>(Optional)</span></label>
          <textarea id="intNotes" class="form-control" placeholder="Please bring your original ID and updated resume..."></textarea>
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
        <div class="modal-title">Report Issue</div>
        <button class="modal-close-btn" onclick="closeModal('reportModal')">&times;</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="reportTargetType" value="job">
        <input type="hidden" id="reportTargetId" value="">
        <div class="form-group">
          <label class="form-label" for="reportCategory">Reason Category</label>
          <select id="reportCategory" class="form-control">
            <option value="Fake Job">Fake job or fake company location</option>
            <option value="Money Demand">Asking for money / registration fee</option>
            <option value="Misleading Salary">Misleading salary / workplace address</option>
            <option value="Spam">Spam or unauthorized marketing</option>
            <option value="Harassment">Harassment or abusive behavior</option>
            <option value="Other">Other violation</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="reportDesc">Details</label>
          <textarea id="reportDesc" class="form-control" placeholder="Provide information to help investigation..."></textarea>
        </div>
        <button class="btn btn-danger" style="width: 100%; margin-top: 10px;" onclick="submitSafetyReport()">Submit Report</button>
      </div>
    </div>
  </div>

  <!-- ============================================================= -->
  <!-- CLIENT JAVASCRIPT LOGIC (LEAFLET HIRING MAP + GPS RADIUS) -->
  <!-- ============================================================= -->
  <script>
    const INITIAL_JOBS = ${JSON.stringify(jobs)};
    let ALL_JOBS = INITIAL_JOBS;
    let MAP_INSTANCE = null;
    let MAP_MARKERS_LAYER = null;
    let MAP_RADIUS_CIRCLE = null;
    let USER_COORDS = { lat: 28.8386, lng: 78.7733 }; // default Moradabad
    let CURRENT_RADIUS_KM = 30; // default 30km
    let ACTIVE_VIEW_MODE = 'map'; // 'map' or 'list'
    let CURRENT_WORK_MODE = 'all'; // 'all', 'onsite', 'remote'
    let SELECTED_CATEGORY = '';
    let ACTIVE_CHAT_APP_ID = null;
    let CURRENT_AUTH_ROLE = 'job_seeker';
    let SELECTED_JOB_FOR_APPLY = null;
    let USER_LOCATION_MARKER = null;

    window.addEventListener('DOMContentLoaded', () => {
      initHiringMap();
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
      autoDetectGPS();
      if (sessionStorage.getItem('open_profile_setup')) {
        sessionStorage.removeItem('open_profile_setup');
        setTimeout(() => openProfileModal(), 400);
      }
    });

    function openModal(id) { document.getElementById(id)?.classList.add('active'); }
    function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

    function updateLocationName(name) {
      const headerCity = document.getElementById('headerCityText');
      const bannerCity = document.getElementById('currentLocationText');
      if (headerCity) headerCity.innerText = name;
      if (bannerCity) bannerCity.innerText = name;
    }

    // Toggle Map vs List Mode with synchronized state
    function switchViewMode(mode) {
      ACTIVE_VIEW_MODE = mode;
      const mapCard = document.getElementById('mapWrapperCard');
      const listContainer = document.getElementById('jobListContainer');
      const btnOnsite = document.getElementById('btnModeOnsite');
      const btnList = document.getElementById('btnModeList');

      if (mode === 'map') {
        if (mapCard) mapCard.style.display = 'block';
        if (btnOnsite) btnOnsite.classList.add('active');
        if (btnList) btnList.classList.remove('active');
        if (MAP_INSTANCE) setTimeout(() => MAP_INSTANCE.invalidateSize(), 150);
      } else {
        if (mapCard) mapCard.style.display = 'none';
        if (btnOnsite) btnOnsite.classList.remove('active');
        if (btnList) btnList.classList.add('active');
      }
    }

    // Work Mode Filter (On-site & Nearby vs Remote Only)
    function setWorkModeFilter(mode) {
      CURRENT_WORK_MODE = mode;
      const btnOnsite = document.getElementById('btnModeOnsite');
      const btnRemote = document.getElementById('btnModeRemote');
      const btnList = document.getElementById('btnModeList');
      const mapCard = document.getElementById('mapWrapperCard');
      const radiusRow = document.getElementById('radiusSelectorRow');

      if (btnOnsite) btnOnsite.classList.toggle('active', mode === 'onsite');
      if (btnRemote) btnRemote.classList.toggle('active', mode === 'remote');
      if (btnList) btnList.classList.toggle('active', mode === 'list');

      if (mode === 'remote') {
        if (mapCard) mapCard.style.display = 'none';
        if (radiusRow) radiusRow.style.display = 'none';
      } else {
        if (mapCard) {
          mapCard.style.display = 'block';
          if (MAP_INSTANCE) setTimeout(() => MAP_INSTANCE.invalidateSize(), 150);
        }
        if (radiusRow) radiusRow.style.display = 'flex';
      }
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    }

    // Category Filter Chip Selection
    function selectCategoryChip(btn, cat) {
      SELECTED_CATEGORY = cat;
      document.querySelectorAll('.category-chip').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    }

    // Initialize Leaflet Map
    function initHiringMap() {
      const mapContainer = document.getElementById('hiringMap');
      if (!mapContainer || MAP_INSTANCE) return;

      MAP_INSTANCE = L.map('hiringMap', {
        center: [USER_COORDS.lat, USER_COORDS.lng],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // Free OpenStreetMap Standard Tiles (No API key, full street view, high detail, no watermarks)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(MAP_INSTANCE);

      MAP_MARKERS_LAYER = L.layerGroup().addTo(MAP_INSTANCE);
      drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
      drawUserLocationPin(USER_COORDS.lat, USER_COORDS.lng);
    }

    // Pulsating "You Are Here" Marker on Map
    function drawUserLocationPin(lat, lng) {
      if (!MAP_INSTANCE) return;
      if (USER_LOCATION_MARKER) MAP_INSTANCE.removeLayer(USER_LOCATION_MARKER);
      const userIcon = L.divIcon({
        className: 'user-gps-container',
        html: '<div class="user-gps-marker"><div class="user-gps-pulse"></div></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      USER_LOCATION_MARKER = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
        .bindPopup('<b style="color: #2563eb;">📍 You are here</b><br><span style="font-size: 11px;">Searching nearby verified employers</span>')
        .addTo(MAP_INSTANCE);
    }

    function drawRadiusCircle(lat, lng, radiusKm) {
      if (!MAP_INSTANCE) return;
      if (MAP_RADIUS_CIRCLE) MAP_INSTANCE.removeLayer(MAP_RADIUS_CIRCLE);

      MAP_RADIUS_CIRCLE = L.circle([lat, lng], {
        color: '#19563e',
        fillColor: '#a7f3d0',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
        radius: radiusKm * 1000
      }).addTo(MAP_INSTANCE);
    }

    // Auto-detect GPS on First View smoothly
    function autoDetectGPS() {
      if (!navigator.geolocation || sessionStorage.getItem('gps_checked')) return;
      sessionStorage.setItem('gps_checked', '1');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          updateLocationName('Near You (GPS)');
          if (MAP_INSTANCE) {
            MAP_INSTANCE.flyTo([USER_COORDS.lat, USER_COORDS.lng], 12);
            drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
            drawUserLocationPin(USER_COORDS.lat, USER_COORDS.lng);
            loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }

    // Request Device GPS Location
    function requestGPSLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please select a city manually.');
        return;
      }

      const fab = document.querySelector('.btn-gps-fab');
      if (fab) fab.style.transform = 'rotate(180deg)';

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          updateLocationName('Near You (GPS)');
          if (MAP_INSTANCE) {
            MAP_INSTANCE.flyTo([USER_COORDS.lat, USER_COORDS.lng], 12);
          }
          drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
          drawUserLocationPin(USER_COORDS.lat, USER_COORDS.lng);
          loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
        },
        (err) => {
          alert('GPS permission not granted or unavailable. You can select a city from the list below.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    // Change Radius (20km, 30km, 50km, 100km, 250km, 500km, 1000km)
    function changeRadius(radiusKm) {
      CURRENT_RADIUS_KM = radiusKm;
      document.querySelectorAll('.radius-pill').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.radius) === radiusKm);
      });
      const badge = document.getElementById('currentRadiusDisplay');
      if (badge) badge.innerText = radiusKm + ' km';
      drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, radiusKm);
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, radiusKm);
    }

    // Load Jobs within Geographic Radius from Backend API
    async function loadMapJobs(lat, lng, radiusKm) {
      try {
        const query = document.getElementById('feedSearchQuery')?.value.trim() || '';
        const mode = CURRENT_WORK_MODE || 'all';

        const res = await fetch(\`/api/jobs/map?lat=\${lat}&lng=\${lng}&radius=\${radiusKm}&mode=\${mode}&category=\${encodeURIComponent(SELECTED_CATEGORY)}&q=\${encodeURIComponent(query)}\`);
        const data = await res.json();

        if (data.success) {
          ALL_JOBS = data.jobs || [];
          renderMapMarkers(data.companies || []);
          renderFeedList(ALL_JOBS);
          const badge = document.getElementById('liveJobsCountBadge');
          if (badge) badge.innerText = \`\${data.total_jobs} Openings (\${data.companies_count} Workplaces)\`;
        }
      } catch (e) {
        console.error('Error loading map jobs:', e);
      }
    }

    // Render Company Logo Markers on Leaflet
    function renderMapMarkers(companies) {
      if (!MAP_MARKERS_LAYER) return;
      MAP_MARKERS_LAYER.clearLayers();

      companies.forEach((comp) => {
        if (!comp.latitude || !comp.longitude) return;

        // Custom HTML Marker with Company Logo & Active Opening Count Badge
        const logoHtml = comp.company_logo
          ? \`<img src="\${comp.company_logo}" class="company-marker-img">\`
          : \`<div class="company-marker-initials">\${escapeHtml(comp.company_name.substring(0, 2).toUpperCase())}</div>\`;

        const markerHtml = \`
          <div class="company-marker-pin" title="\${escapeHtml(comp.company_name)}">
            \${logoHtml}
            <span class="company-marker-badge">\${comp.openings_count}</span>
          </div>
        \`;

        const customIcon = L.divIcon({
          className: 'custom-company-pin-wrapper',
          html: markerHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const marker = L.marker([comp.latitude, comp.longitude], { icon: customIcon });

        // Tapping Marker Opens Compact Bottom Sheet (Mobile) / Side Panel (Desktop)
        marker.on('click', () => {
          showCompanySheetPreview(comp);
        });

        MAP_MARKERS_LAYER.addLayer(marker);
      });
    }

    // Show Preview Sheet when Marker is Tapped
    function showCompanySheetPreview(comp) {
      const sheet = document.getElementById('mapPreviewSheet');
      const headerTitle = document.getElementById('previewSheetTitle');
      const body = document.getElementById('previewSheetBody');

      if (!sheet || !body) return;

      headerTitle.innerText = comp.company_name;
      body.innerHTML = \`
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            \${comp.company_logo ? \`<img src="\${comp.company_logo}" style="width: 42px; height: 42px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0;">\` : \`<div style="width: 42px; height: 42px; border-radius: 8px; background: #19563e; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px;">\${escapeHtml(comp.company_name.substring(0, 2).toUpperCase())}</div>\`}
            <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a;">\${escapeHtml(comp.workplace_name)}</div>
              <div style="font-size: 11px; color: #64748b;">\${escapeHtml(comp.workplace_address)} &bull; \${escapeHtml(comp.workplace_type)}</div>
            </div>
          </div>
          <span class="distance-badge">\${comp.distance_km} km away</span>
        </div>

        <div style="font-size: 12px; font-weight: 700; color: #19563e; margin: 10px 0 6px 0;">
          \${comp.openings_count} Active Opening\${comp.openings_count > 1 ? 's' : ''}:
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          \${comp.jobs.map(j => \`
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">\${escapeHtml(j.title)}</div>
              <div style="font-size: 11px; color: #19563e; font-weight: 600; margin: 3px 0;">\${escapeHtml(j.salary_display)} &bull; \${j.work_mode.toUpperCase()}</div>
              <button class="btn btn-sm btn-primary" style="margin-top: 4px; width: 100%;" onclick="viewJobDetails('\${j.id}')">View & Apply</button>
            </div>
          \`).join('')}
        </div>
      \`;

      sheet.classList.add('active');
    }

    function closeCompanySheetPreview() {
      document.getElementById('mapPreviewSheet')?.classList.remove('active');
    }

    // Render Job Cards List with Distance Indicator
    function renderFeedList(jobList) {
      const container = document.getElementById('feedJobsContainer');
      if (!container) return;

      if (!jobList || jobList.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 40px;">No hiring locations found within this radius. Try expanding the search radius above.</div>';
        return;
      }

      container.innerHTML = jobList.map(j => \`
        <div class="job-card" id="card_\${j.id}" onclick="viewJobDetails('\${j.id}')">
          <div class="job-card-top">
            <div>
              <div class="job-card-title">\${escapeHtml(j.title)}</div>
              <div class="job-card-company">
                \${escapeHtml(j.company_name)}
                <span class="verified-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Verified
                </span>
                \${j.distance_km !== undefined ? \`<span class="distance-badge">\${j.distance_km} km away</span>\` : ''}
              </div>
            </div>
            <span class="status-pill status-approved">\${j.job_type === 'internship' ? 'Internship' : 'Job'}</span>
          </div>

          <div class="job-card-tags">
            <span class="tag tag-salary">\${escapeHtml(j.salary_display)}</span>
            <span class="tag tag-mode">\${j.work_mode.toUpperCase()}</span>
            <span class="tag">\${escapeHtml(j.city)}</span>
            <span class="tag">\${escapeHtml(j.experience_level || 'Fresher')}</span>
          </div>

          <div class="job-card-footer">
            <div>Skills: \${escapeHtml(((j.required_skills || j.skills || '').split(',').filter(Boolean).slice(0, 3).join(', ')) || 'General')}</div>
            <div style="font-weight: 700; color: #19563e;">View Details &rarr;</div>
          </div>
        </div>
      \`).join('');
    }

    // Quick City Selection
    function selectQuickCity(cityName, lat, lng) {
      USER_COORDS = { lat, lng };
      updateLocationName(cityName);
      if (MAP_INSTANCE) {
        MAP_INSTANCE.flyTo([lat, lng], 12);
        drawRadiusCircle(lat, lng, CURRENT_RADIUS_KM);
        drawUserLocationPin(lat, lng);
        loadMapJobs(lat, lng, CURRENT_RADIUS_KM);
      }
    }

    // Profile Photo Upload Handler
    function handleProfilePhotoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WebP)');
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        const b64 = e.target.result;
        const preview = document.getElementById('spPhotoPreview');
        const placeholder = document.getElementById('spPhotoPlaceholder');
        const urlInput = document.getElementById('spPhotoUrl');
        if (preview) { preview.src = b64; preview.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';
        if (urlInput) urlInput.value = b64;
      };
      reader.readAsDataURL(file);
    }

    // Company Logo Upload Handler (Map marker)
    function handleJobLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG)');
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        const b64 = e.target.result;
        const preview = document.getElementById('pjLogoImg');
        const placeholder = document.getElementById('pjLogoPlaceholder');
        const urlInput = document.getElementById('pjLogoUrl');
        if (preview) { preview.src = b64; preview.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';
        if (urlInput) urlInput.value = b64;
      };
      reader.readAsDataURL(file);
    }

    // Save Job Seeker Profile (with photo)
    async function handleSaveSeekerProfile(event) {
      event.preventDefault();
      const name = document.getElementById('spName')?.value.trim() || '';
      const email = document.getElementById('spEmail')?.value.trim() || '';
      const photo_url = document.getElementById('spPhotoUrl')?.value || '';
      const headline = document.getElementById('spHeadline')?.value.trim() || '';
      const skills = document.getElementById('spSkills')?.value.trim() || '';
      const experience_level = document.getElementById('spExpLevel')?.value || 'Fresher';
      const work_modes = document.getElementById('spWorkMode')?.value || 'remote,hybrid,onsite';
      const location = document.getElementById('spLocation')?.value.trim() || '';

      try {
        const res = await fetch('/api/profile/seeker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, email, photo_url, headline, skills,
            experience_level, work_modes, location
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Profile updated successfully!');
          closeModal('profileModal');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to save profile');
        }
      } catch (e) {
        alert('Failed to save profile');
      }
    }

    // Employer City Change
    function handleEmployerCityChange() {
      const city = document.getElementById('pjCity')?.value.toLowerCase().trim();
      const coordsMap = {
        'moradabad': [28.8386, 78.7733],
        'delhi': [28.6139, 77.2090],
        'noida': [28.5355, 77.3910],
        'gurgaon': [28.4595, 77.0266],
        'bangalore': [12.9716, 77.5946],
        'mumbai': [19.0760, 72.8777]
      };
      if (coordsMap[city]) {
        document.getElementById('pjLat').value = coordsMap[city][0];
        document.getElementById('pjLng').value = coordsMap[city][1];
      }
    }

    function detectEmployerPinLocation() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        document.getElementById('pjLat').value = pos.coords.latitude.toFixed(6);
        document.getElementById('pjLng').value = pos.coords.longitude.toFixed(6);
      });
    }

    // Auth & Role
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
          if (!name) {
            sessionStorage.setItem('open_profile_setup', '1');
          }
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

    // View Job Details
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
          <span class="tag">\${escapeHtml(job.experience_level || 'Fresher')}</span>
          \${job.distance_km !== undefined ? \`<span class="tag" style="background:#e0f2fe; color:#0369a1; font-weight:700;">\${job.distance_km} km away</span>\` : ''}
        </div>

        \${job.workplace_address ? \`
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 14px; font-size: 12px; color: #475569;">
            <strong>Workplace Location:</strong> \${escapeHtml(job.workplace_address)} &bull; \${escapeHtml(job.workplace_type || 'Office')}
          </div>
        \` : ''}

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

    // Resume Upload Handler
    function handleResumeUpload(event, autoSelect = false) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
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

    // Submit Job with Workplace Location & Company Logo
    async function submitJobForm(submitForReview) {
      const title = document.getElementById('pjTitle').value.trim();
      const company_name = document.getElementById('pjCompany').value.trim();
      const company_logo = document.getElementById('pjLogoUrl')?.value || '';
      const category = document.getElementById('pjCategory').value;
      const job_type = document.getElementById('pjType').value;
      const work_mode = document.getElementById('pjMode').value;
      const city = document.getElementById('pjCity').value.trim();
      const salary_display = document.getElementById('pjSalary').value.trim();
      const required_skills = document.getElementById('pjSkills').value.trim();
      const description = document.getElementById('pjDesc').value.trim();
      const openings = parseInt(document.getElementById('pjOpenings').value) || 1;

      // Workplace & Coordinates
      const workplace_name = document.getElementById('pjWorkplaceName')?.value.trim() || '';
      const workplace_type = document.getElementById('pjWorkplaceType')?.value || 'Office';
      const workplace_address = document.getElementById('pjWorkplaceAddress')?.value.trim() || '';
      const state = document.getElementById('pjState')?.value.trim() || '';
      const pincode = document.getElementById('pjPincode')?.value.trim() || '';
      const latitude = document.getElementById('pjLat')?.value || null;
      const longitude = document.getElementById('pjLng')?.value || null;

      if (!title || !description || !salary_display) {
        alert('Please fill out all required fields');
        return;
      }

      try {
        const res = await fetch('/api/employer/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title, company_name, company_logo, category, job_type, work_mode, city,
            salary_display, required_skills, description, openings,
            workplace_name, workplace_type, workplace_address, state, pincode,
            latitude, longitude,
            submit_for_review: submitForReview
          })
        });
        const data = await res.json();
        if (data.success) {
          alert(submitForReview ? 'Job and workplace submitted for admin verification!' : 'Job saved as draft!');
          closeModal('postJobModal');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to post job');
        }
      } catch (e) {
        alert('Submission error');
      }
    }

    // Employer Toggle Pause / Resume Hiring
    async function toggleHiringStatus(jobId) {
      try {
        const res = await fetch('/api/employer/jobs/' + jobId + '/toggle-hiring', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert(data.is_hiring_active ? 'Hiring resumed! Job is now visible on the live map.' : 'Hiring paused. Job removed from live map.');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to toggle hiring');
        }
      } catch (e) {
        alert('Network error');
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
      </div>
    </div>
  `).join('');

  return `
    <!-- Mode Switcher (On-site & Nearby vs Remote Only) -->
    <div class="view-switcher-bar">
      <div class="mode-toggle-group">
        <button id="btnModeOnsite" class="mode-toggle-btn active" onclick="setWorkModeFilter('onsite')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          On-site & Nearby Map
        </button>
        <button id="btnModeRemote" class="mode-toggle-btn" onclick="setWorkModeFilter('remote')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Remote Only
        </button>
        <button id="btnModeList" class="mode-toggle-btn" onclick="switchViewMode('list')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          List View
        </button>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="btn btn-sm btn-outline" onclick="requestGPSLocation()" title="Detect my current location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#19563e" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
          Detect GPS
        </button>
      </div>
    </div>

    <!-- Search Hero with Horizontal Category Chips -->
    <div class="search-hero-card">
      <div class="search-input-row">
        <div class="search-field">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="feedSearchQuery" placeholder="Search by job title, factory, shop, or skill..." oninput="loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM)">
        </div>
        <button class="btn btn-primary" onclick="loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM)">Find Jobs</button>
      </div>

      <!-- Horizontal Scrolling Category Chips -->
      <div class="category-scroll-bar">
        <button class="category-chip active" data-cat="" onclick="selectCategoryChip(this, '')">All Roles</button>
        <button class="category-chip" data-cat="Engineering" onclick="selectCategoryChip(this, 'Engineering')">💻 Engineering & Tech</button>
        <button class="category-chip" data-cat="Design" onclick="selectCategoryChip(this, 'Design')">🎨 Design & UI/UX</button>
        <button class="category-chip" data-cat="Marketing" onclick="selectCategoryChip(this, 'Marketing')">📈 Growth & Marketing</button>
        <button class="category-chip" data-cat="Operations" onclick="selectCategoryChip(this, 'Operations')">📦 Ops & Logistics</button>
        <button class="category-chip" data-cat="HR" onclick="selectCategoryChip(this, 'HR')">👥 HR & Recruiting</button>
        <button class="category-chip" data-cat="Retail" onclick="selectCategoryChip(this, 'Retail')">🏪 Retail & Store</button>
        <button class="category-chip" data-cat="Manufacturing" onclick="selectCategoryChip(this, 'Manufacturing')">🏭 Factory & Production</button>
      </div>

      <!-- Quick Location & Radius Selector -->
      <div class="radius-selector-bar" id="radiusSelectorRow">
        <span class="radius-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          Radius:
        </span>
        <button class="radius-pill" data-radius="20" onclick="changeRadius(20)">20 km</button>
        <button class="radius-pill active" data-radius="30" onclick="changeRadius(30)">30 km</button>
        <button class="radius-pill" data-radius="50" onclick="changeRadius(50)">50 km</button>
        <button class="radius-pill" data-radius="100" onclick="changeRadius(100)">100 km</button>
        <button class="radius-pill" data-radius="250" onclick="changeRadius(250)">250 km</button>
        <button class="radius-pill" data-radius="500" onclick="changeRadius(500)">500 km</button>
        <button class="radius-pill" data-radius="1000" onclick="changeRadius(1000)">1000 km</button>
      </div>

      <!-- Quick City Buttons -->
      <div style="display: flex; gap: 6px; overflow-x: auto; margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b; margin-right: 4px; display: flex; align-items: center;">Quick Cities:</span>
        <button class="filter-pill" onclick="selectQuickCity('Moradabad', 28.8386, 78.7733)">Moradabad</button>
        <button class="filter-pill" onclick="selectQuickCity('Delhi NCR', 28.6139, 77.2090)">Delhi NCR</button>
        <button class="filter-pill" onclick="selectQuickCity('Noida', 28.5355, 77.3910)">Noida</button>
        <button class="filter-pill" onclick="selectQuickCity('Gurugram', 28.4595, 77.0266)">Gurgaon</button>
        <button class="filter-pill" onclick="selectQuickCity('Bangalore', 12.9716, 77.5946)">Bangalore</button>
        <button class="filter-pill" onclick="selectQuickCity('Mumbai', 19.0760, 72.8777)">Mumbai</button>
      </div>
    </div>

    <!-- Live Interactive Hiring Map Container -->
    <div class="map-wrapper-card" id="mapWrapperCard">
      <div id="hiringMap"></div>
      
      <!-- GPS Trigger FAB -->
      <button class="btn-gps-fab" onclick="requestGPSLocation()" title="Locate Near Me">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
      </button>

      <!-- Location Info Banner -->
      <div class="map-location-banner">
        <div>
          <strong id="currentLocationText">Moradabad Hub</strong> &bull; Workplaces within <span id="currentRadiusDisplay">30 km</span>
        </div>
        <div style="font-size: 11px; color: #19563e; font-weight: 700;">Tap any logo pin to view openings</div>
      </div>

      <!-- Tapped Company Preview Sheet (Mobile Bottom Sheet / Desktop Side Panel) -->
      <div class="map-preview-sheet" id="mapPreviewSheet">
        <div class="map-preview-header">
          <div style="font-weight: 800; font-size: 14px;" id="previewSheetTitle">Company Details</div>
          <button style="background: none; border: none; color: #ffffff; font-size: 18px; cursor: pointer;" onclick="closeCompanySheetPreview()">&times;</button>
        </div>
        <div class="map-preview-body" id="previewSheetBody">
          <!-- Dynamically populated -->
        </div>
      </div>
    </div>

    <!-- Quick Resume Action Card -->
    <div class="quick-resume-card">
      <div class="quick-resume-info">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <div class="quick-resume-text">
          <strong>${currentResume ? 'Current Resume: ' + escapeHtml(currentResume.filename) : 'Upload Your Resume for 1-Click Apply'}</strong>
          <span>${currentResume ? 'Ready to apply directly to verified employers' : 'Upload PDF/DOC once • Instant recruiter chat & application'}</span>
        </div>
      </div>
      <button class="btn btn-sm btn-primary" onclick="openResumeModal()">
        ${currentResume ? 'Update Resume' : 'Upload Resume'}
      </button>
    </div>

    <!-- Dual Layout: Nearby Feed & Applications Tracker -->
    <div class="layout-grid" id="jobListContainer">
      <div>
        <div class="section-header-row">
          <div class="section-heading">
            Nearby Hiring Workplaces
            <span class="count-badge" id="liveJobsCountBadge">${jobs.length} Openings</span>
          </div>
        </div>
        <div id="feedJobsContainer">
          <!-- Dynamically populated with distance indicators -->
        </div>
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
            <div style="font-size: 12px; margin-top: 4px;">Click any marker on the map to view and apply.</div>
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
  const activeJobs = jobs.filter(j => j.status === 'approved' && (j.is_hiring_active === undefined || j.is_hiring_active === 1));
  const pendingJobs = jobs.filter(j => j.status === 'pending_review');

  const jobRows = jobs.map(j => `
    <div class="job-card">
      <div class="job-card-top">
        <div>
          <div class="job-card-title">${escapeHtml(j.title)}</div>
          <div class="job-card-company">
            ${escapeHtml(j.company_name)} &bull; ${escapeHtml(j.city)} &bull; ${j.work_mode.toUpperCase()}
          </div>
          ${j.workplace_address ? `
            <div style="font-size: 11px; color: #0284c7; margin-top: 3px; display: flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Workplace: ${escapeHtml(j.workplace_address)} (${escapeHtml(j.workplace_type || 'Office')})
            </div>
          ` : ''}
        </div>
        <span class="status-pill status-${j.status}">${formatJobStatus(j.status)}</span>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 12px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
        <span class="tag tag-salary">${escapeHtml(j.salary_display)}</span>
        <div style="display: flex; gap: 6px;">
          ${j.status === 'approved' ? `
            <button class="btn btn-sm ${j.is_hiring_active === 0 ? 'btn-primary' : 'btn-outline'}" onclick="toggleHiringStatus('${j.id}')">
              ${j.is_hiring_active === 0 ? 'Resume Map Hiring' : 'Pause on Map'}
            </button>
          ` : ''}
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
        <div class="metric-label">Live on Map</div>
        <div class="metric-value">${activeJobs.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Pending Verification</div>
        <div class="metric-value" style="color: ${pendingJobs.length > 0 ? '#b45309' : '#19563e'}">${pendingJobs.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Applicants</div>
        <div class="metric-value">${applications.length}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Company Status</div>
        <div style="font-size: 14px; font-weight: 700; color: #0284c7; margin-top: 8px;">
          ${profile?.verification_status ? profile.verification_status.toUpperCase() : 'VERIFIED PARTNER'}
        </div>
      </div>
    </div>

    <div class="layout-grid">
      <div>
        <div class="section-header-row">
          <div class="section-heading">
            My Job Postings & Workplaces (${jobs.length})
          </div>
          <button class="btn btn-sm btn-accent" onclick="openPostJobModal()">+ Post New Job</button>
        </div>
        ${jobRows || '<div style="text-align: center; color: #94a3b8; padding: 30px;">No jobs posted yet. Click Post New Job to start hiring.</div>'}
      </div>

      <div id="employerApplicantsSection">
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
    case 'approved': return 'Live on Map';
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
