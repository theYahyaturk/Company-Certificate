import { Job, UserSession, Resume, Application, EmployerProfile } from '../types';
import { JOB_PORTAL_STYLES } from './styles';
import { WHERE_IS_MY_JOB_LOGO_BASE64 } from '../logo-where-is-my-job-base64';

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
  const userName = userProfile?.name || session?.name || 'Aabeeo';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Where is my job - Alifeo Job FINDER</title>
  <link rel="icon" type="image/png" href="${WHERE_IS_MY_JOB_LOGO_BASE64}">
  
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
  <div class="app-canvas">
    
    <!-- Native Mobile Status Bar (9:41, Cellular, Wifi, Battery) -->
    <div class="status-bar">
      <span>9:41</span>
      <div class="status-bar-icons">
        <svg width="15" height="11" viewBox="0 0 17 11" fill="none"><rect width="3" height="4" rx="0.5" fill="#0f172a"/><rect x="4.5" y="2" width="3" height="6" rx="0.5" fill="#0f172a"/><rect x="9" y="4" width="3" height="7" rx="0.5" fill="#0f172a"/><rect x="13.5" y="6" width="3" height="9" rx="0.5" fill="#0f172a"/></svg>
        <svg width="15" height="11" viewBox="0 0 16 12" fill="none"><path d="M8 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="#0f172a"/><path d="M4.5 7a5 5 0 017 0" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round"/><path d="M1.5 4a9 9 0 0113 0" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round"/></svg>
        <svg width="22" height="11" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#0f172a"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="#0f172a"/><path d="M23 4v4" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- App Header Bar -->
    <header class="app-header">
      <div class="app-brand-left">
        <div class="app-logo-badge">
          <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Where is My Job">
        </div>
        <div class="app-brand-text">alifeo</div>
      </div>
      
      <div style="display: flex; align-items: center; gap: 8px;">
        <button class="btn-icon-round" onclick="openNotifications()" title="Notifications">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <div class="unread-dot"></div>
        </button>

        ${session ? `
          <button class="btn-icon-round" onclick="openProfileModal()" title="My Profile" style="overflow: hidden; padding: 0;">
            ${userProfile?.photo_url ? `<img src="${userProfile.photo_url}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span style="font-weight: 800; font-size: 14px; color: #064e3b;">${escapeHtml(userName.charAt(0).toUpperCase())}</span>`}
          </button>
        ` : `
          <button class="btn-apply-lime" style="padding: 6px 14px; font-size: 12px;" onclick="openLoginModal('job_seeker')">Sign In</button>
        `}
      </div>
    </header>

    <!-- Greeting & Title -->
    <div class="hero-greeting-section">
      <div class="greeting-sub">Hyy, ${escapeHtml(userName)} 👋</div>
      <h1 class="greeting-title">Where is <span>My Job?</span></h1>
    </div>

    <!-- Location Selector -->
    <div class="app-location-row" onclick="requestGPSLocation()" title="Tap to detect GPS or switch city">
      <svg class="loc-icon-pin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <div class="loc-details-wrap">
        <span class="loc-label">Your Location</span>
        <div class="loc-name">
          <span id="currentLocHeader">Moradabad</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
    </div>

    <!-- Dual Action Hero Banners (Side-by-Side as in mockup) -->
    <div class="dual-banners-row">
      <!-- 1. Want to Hire? (Lime Card) -->
      <div class="banner-card banner-hire" onclick="${session ? 'openPostJobModal()' : "openLoginModal('employer')"}">
        <div class="banner-top-visual">
          <span class="banner-icon-badge">🪑</span>
        </div>
        <div>
          <div class="banner-title">Want to<br>Hire?</div>
          <div class="banner-sub">Post a job &amp; find talent</div>
        </div>
        <div class="banner-arrow-circle">&rarr;</div>
      </div>

      <!-- 2. Get a Job? (Pastel Card) -->
      <div class="banner-card banner-job" onclick="openResumeModal()">
        <div class="banner-top-visual">
          <span class="banner-icon-badge">💼</span>
        </div>
        <div>
          <div class="banner-title">Get a<br>Job?</div>
          <div class="banner-sub">Explore nearby opportunities</div>
        </div>
        <div class="banner-arrow-circle">&rarr;</div>
      </div>
    </div>

    <!-- Floating Search & Filter Pill Bar -->
    <div class="search-floating-wrap">
      <div class="search-pill-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" style="margin-right: 8px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="feedSearchQuery" class="search-pill-input" placeholder="Search jobs, companies..." oninput="loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM)">
        <button class="search-filter-btn" onclick="toggleRadiusOptions()" title="Filter Distance">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
        </button>
      </div>

      <!-- Expandable Radius Selector Bar -->
      <div id="radiusOptionsBar" style="display: none; gap: 6px; overflow-x: auto; padding: 10px 0 2px 0;">
        <button class="category-chip" data-radius="20" onclick="changeRadius(20)">20 km</button>
        <button class="category-chip active" data-radius="30" onclick="changeRadius(30)">30 km</button>
        <button class="category-chip" data-radius="50" onclick="changeRadius(50)">50 km</button>
        <button class="category-chip" data-radius="100" onclick="changeRadius(100)">100 km</button>
        <button class="category-chip" data-radius="250" onclick="changeRadius(250)">250 km</button>
        <button class="category-chip" data-radius="1000" onclick="changeRadius(1000)">Pan India</button>
      </div>
    </div>

    <!-- Live Interactive Map View (Alifeo FBS Mobile Look) -->
    <div class="map-section-wrap" id="mapSection">
      <div id="hiringMap"></div>
      
      <!-- Top-Left Floating Location Pill -->
      <div class="map-pill-location">
        <div class="map-pill-dot"></div>
        <span>Your Location</span>
      </div>

      <!-- Top-Right Floating GPS Re-center FAB -->
      <button class="map-gps-circle-btn" onclick="requestGPSLocation()" title="Center GPS Location">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
      </button>
    </div>

    <!-- Nearby Jobs Bottom Drawer / Feed -->
    <div class="nearby-drawer">
      <div class="drawer-handle-bar"></div>
      
      <div class="drawer-header-row">
        <div class="drawer-title">
          <span>💼</span>
          Nearby Jobs
          <span style="font-size: 12px; font-weight: 700; color: #059669;" id="jobCountLabel">${jobs.length} Openings</span>
        </div>
        <div class="drawer-see-all" onclick="document.getElementById('nearbyJobsFeedList').scrollIntoView({ behavior: 'smooth' })">See All &rarr;</div>
      </div>

      <!-- Job List Cards Container -->
      <div id="nearbyJobsFeedList">
        ${jobs.slice(0, 8).map(j => `
          <div class="app-job-card" onclick="viewJobDetails('${j.id}')">
            <div class="app-card-top">
              <div class="app-company-thumbnail">
                ${j.company_logo ? `<img src="${j.company_logo}" alt="${escapeHtml(j.company_name)}">` : `<div class="app-company-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
              </div>
              <div class="app-card-meta">
                <div class="app-company-name-row">
                  <span>${escapeHtml(j.company_name || 'Alifeo Partner')}</span>
                  <span class="verified-badge-green" title="Verified Employer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                </div>
                <div class="app-job-title">${escapeHtml(j.title)}</div>
                <div class="app-loc-distance-row">
                  <span>📍 <strong>${j.distance_km !== undefined ? j.distance_km + ' km' : 'Nearby'}</strong></span>
                  <span>&bull;</span>
                  <span>${escapeHtml(j.city)}</span>
                  <span>&bull;</span>
                  <span>${escapeHtml(j.salary_display || 'Competitive')}</span>
                </div>
              </div>
            </div>

            <div class="app-card-bottom">
              <div class="app-tag-pills">
                <span class="app-tag app-tag-mode">${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
                <span class="app-tag">${escapeHtml(j.work_mode.toUpperCase())}</span>
                <span class="app-tag">${escapeHtml((j.required_skills || j.skills || 'General').split(',')[0] || 'Direct')}</span>
              </div>
              <button class="btn-apply-lime" onclick="event.stopPropagation(); viewJobDetails('${j.id}')">
                Apply &rarr;
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Floating Mobile Bottom Navigation Bar (iOS style) -->
    <nav class="floating-bottom-nav">
      <button class="nav-tab-item active" onclick="switchTab('home')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span>Home</span>
      </button>

      <button class="nav-tab-item" onclick="switchTab('jobs')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>My Jobs</span>
      </button>

      <!-- Center Elevated Lime Map FAB -->
      <div class="nav-center-map-fab" onclick="focusHiringMap()" title="Live Hiring Map">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>

      <button class="nav-tab-item" onclick="openNotifications()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span>Alerts</span>
      </button>

      <button class="nav-tab-item" onclick="openProfileModal()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </button>
    </nav>

  </div>

  <!-- ============================================================= -->
  <!-- MODALS & BOTTOM SHEETS -->
  <!-- ============================================================= -->

  <!-- 1. WhatsApp OTP Auth Modal -->
  <div class="modal-overlay" id="authModal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">Sign In with WhatsApp</div>
        <button class="modal-close-btn" onclick="closeModal('authModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Alifeo" style="height: 60px; width: 60px; border-radius: 16px;">
          <h3 style="font-size: 19px; font-weight: 800; color: #064E3B; margin-top: 10px;">Where is My Job?</h3>
          <p style="font-size: 13px; color: #64748b; margin-top: 4px;">Instant passwordless verification via WhatsApp</p>
        </div>

        <div id="authStep1">
          <div class="form-group">
            <label class="form-label">What are you here for?</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button type="button" id="roleChoiceSeeker" class="btn-apply-lime" style="width: 100%;" onclick="selectAuthRole('job_seeker')">Find a Job</button>
              <button type="button" id="roleChoiceEmployer" class="btn-primary-app" style="width: 100%; background: #F1F5F9; color: #0F172A;" onclick="selectAuthRole('employer')">Hire Someone</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="authPhone">WhatsApp Phone Number</label>
            <input type="tel" id="authPhone" class="form-control" placeholder="10-digit mobile (e.g. 9876543210)">
          </div>

          <div class="form-group">
            <label class="form-label" for="authName">Your Name <span>(Optional)</span></label>
            <input type="text" id="authName" class="form-control" placeholder="e.g. Aabeeo">
          </div>

          <button type="button" class="btn-primary-app" onclick="sendAuthOtp()">Send WhatsApp OTP &rarr;</button>
        </div>

        <div id="authStep2" style="display: none;">
          <div class="form-group">
            <label class="form-label" for="authOtp">Enter 6-Digit OTP</label>
            <input type="text" id="authOtp" class="form-control" maxlength="6" placeholder="123456" style="text-align: center; letter-spacing: 4px; font-size: 18px; font-weight: 800;">
            <div id="testOtpDisplay" style="color: #059669; font-size: 12px; font-weight: 700; margin-top: 6px;"></div>
          </div>
          <button type="button" class="btn-apply-lime" style="width: 100%;" onclick="verifyAuthOtp()">Verify &amp; Enter &rarr;</button>
          <div style="text-align: center; margin-top: 10px;">
            <button type="button" style="background: none; border: none; color: #64748b; font-size: 12px; cursor: pointer;" onclick="resetAuthStep()">&larr; Back to phone number</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 2. Profile Setup Modal with Photo Upload -->
  <div class="modal-overlay" id="profileModal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">My Profile &amp; Preferences</div>
        <button class="modal-close-btn" onclick="closeModal('profileModal')">&times;</button>
      </div>
      <div class="modal-body">
        <form id="seekerProfileForm" onsubmit="handleSaveSeekerProfile(event)">
          <div class="profile-photo-container" style="text-align: center; margin-bottom: 16px;">
            <div class="profile-photo-circle" onclick="document.getElementById('spPhotoInput').click()" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #CFF92D; background: #F1F5F9; overflow: hidden; margin: 0 auto; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              <img id="spPhotoPreview" src="${escapeHtml(userProfile?.photo_url || '')}" style="${userProfile?.photo_url ? '' : 'display: none;'} width: 100%; height: 100%; object-fit: cover;">
              <div id="spPhotoPlaceholder" style="${userProfile?.photo_url ? 'display: none;' : ''} font-size: 11px; font-weight: 700; color: #064e3b;">+ Upload Pic</div>
            </div>
            <input type="file" id="spPhotoInput" accept="image/*" style="display: none;" onchange="handleProfilePhotoUpload(event)">
            <input type="hidden" id="spPhotoUrl" value="${escapeHtml(userProfile?.photo_url || '')}">
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Tap avatar to update picture</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="spName">Full Name</label>
            <input type="text" id="spName" class="form-control" value="${escapeHtml(userProfile?.name || session?.name || '')}" placeholder="e.g. Aabeeo" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="spEmail">Email Address</label>
            <input type="email" id="spEmail" class="form-control" value="${escapeHtml(userProfile?.email || session?.email || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="spSkills">Key Skills <span>(Comma-separated)</span></label>
            <input type="text" id="spSkills" class="form-control" placeholder="React, Figma, Sales, Delivery" value="${escapeHtml(userProfile?.skills || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="spLocation">Current City</label>
            <input type="text" id="spLocation" class="form-control" value="${escapeHtml(userProfile?.location || 'Moradabad')}">
          </div>
          <button type="submit" class="btn-apply-lime" style="width: 100%; margin-top: 10px;">Save Profile &rarr;</button>
        </form>

        ${session ? `
          <div style="margin-top: 16px; text-align: center;">
            <button type="button" style="background: none; border: none; color: #ef4444; font-size: 13px; font-weight: 700; cursor: pointer;" onclick="handleLogout()">Sign Out of Account</button>
          </div>
        ` : ''}
      </div>
    </div>
  </div>

  <!-- 3. Resume Upload Modal -->
  <div class="modal-overlay" id="resumeModal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">My Resume</div>
        <button class="modal-close-btn" onclick="closeModal('resumeModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="border: 2px dashed #059669; border-radius: 16px; padding: 24px; text-align: center; cursor: pointer; background: #F0FDF4;" onclick="document.getElementById('modalResumeFileInput').click()">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" style="margin: 0 auto 8px auto; display: block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style="font-weight: 800; font-size: 15px; color: #064E3B;">Upload New Resume (PDF / DOC)</div>
          <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Max file size 5MB • Validated format</div>
          <input type="file" id="modalResumeFileInput" style="display: none;" accept=".pdf,.doc,.docx" onchange="handleResumeUpload(event)">
        </div>

        <div style="margin-top: 18px;">
          <div style="font-size: 13px; font-weight: 800; color: #334155; margin-bottom: 8px;">Active Resumes</div>
          ${userResumes.length > 0 ? userResumes.map(r => `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div>
                <div style="font-weight: 700; font-size: 13px; color: #0F172A;">${escapeHtml(r.filename)}</div>
                <div style="font-size: 11px; color: #64748B;">${formatBytes(r.file_size)} • ${r.is_current ? 'Default Resume' : 'Previous'}</div>
              </div>
              <div style="display: flex; gap: 6px;">
                <a href="/api/resumes/${r.id}/view" target="_blank" class="btn-apply-lime" style="padding: 4px 10px; font-size: 11px;">View</a>
                <button class="btn-icon-round" style="width: 30px; height: 30px; color: #ef4444;" onclick="deleteResume('${r.id}')">&times;</button>
              </div>
            </div>
          `).join('') : '<div style="color: #94A3B8; font-size: 13px; text-align: center; padding: 16px;">No resume uploaded yet. Upload one for 1-click apply.</div>'}
        </div>
      </div>
    </div>
  </div>

  <!-- 4. Post Job Free Modal (Employer) -->
  <div class="modal-overlay" id="postJobModal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title">Post Job &amp; Pin On Map</div>
        <button class="modal-close-btn" onclick="closeModal('postJobModal')">&times;</button>
      </div>
      <div class="modal-body">
        <form id="postJobForm" onsubmit="event.preventDefault();">
          <!-- Logo upload for live map pin -->
          <div class="form-group" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 12px;">
            <label class="form-label">Company Brand Logo <span>(Pins directly on Map)</span></label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <div onclick="document.getElementById('pjLogoInput').click()" style="width: 50px; height: 50px; border-radius: 12px; border: 2px dashed #064E3B; background: #CFF92D; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden;">
                <img id="pjLogoImg" style="display: none; width: 100%; height: 100%; object-fit: cover;">
                <div id="pjLogoPlaceholder" style="font-size: 10px; font-weight: 800; color: #064E3B;">+ Logo</div>
              </div>
              <input type="file" id="pjLogoInput" accept="image/*" style="display: none;" onchange="handleJobLogoUpload(event)">
              <input type="hidden" id="pjLogoUrl">
              <div style="font-size: 12px; color: #64748B;">Upload your logo to appear as an interactive pin on candidate maps!</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="pjTitle">Job Title</label>
            <input type="text" id="pjTitle" class="form-control" placeholder="e.g. Senior Product Designer / Store Manager" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjCompany">Hiring Company</label>
            <input type="text" id="pjCompany" class="form-control" value="${escapeHtml(userProfile?.company_name || 'Alifeo Partner')}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjCategory">Job Category</label>
            <select id="pjCategory" class="form-control">
              <option value="Design">UI/UX &amp; Product Design</option>
              <option value="Engineering">Software &amp; IT</option>
              <option value="Marketing">Growth &amp; Marketing</option>
              <option value="Operations">Operations &amp; Delivery</option>
              <option value="Retail">Retail &amp; Store</option>
              <option value="Manufacturing">Manufacturing &amp; Factory</option>
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group">
              <label class="form-label" for="pjCity">City / Location</label>
              <input type="text" id="pjCity" class="form-control" value="Moradabad" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="pjSalary">Salary / Pay</label>
              <input type="text" id="pjSalary" class="form-control" placeholder="e.g. ₹25,000 - ₹40,000/m" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjSkills">Skills Required</label>
            <input type="text" id="pjSkills" class="form-control" placeholder="e.g. Figma, React, Prototyping" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="pjDesc">Role Description</label>
            <textarea id="pjDesc" class="form-control" rows="3" placeholder="Describe requirements and responsibilities..." required></textarea>
          </div>
          <button type="button" class="btn-apply-lime" style="width: 100%; padding: 12px; font-size: 14px;" onclick="submitJobForm(true)">Submit Job For Review &rarr;</button>
        </form>
      </div>
    </div>
  </div>

  <!-- 5. Job Details & 1-Click Apply Modal -->
  <div class="modal-overlay" id="jobDetailModal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-title" id="jdTitle">Job Details</div>
        <button class="modal-close-btn" onclick="closeModal('jobDetailModal')">&times;</button>
      </div>
      <div class="modal-body" id="jdBody">
        <!-- Dynamically rendered -->
      </div>
    </div>
  </div>

  <!-- 6. Real-time In-App Chat Modal -->
  <div class="modal-overlay" id="chatModal">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <div class="modal-title" id="chatTitle">Job Conversation</div>
          <div style="font-size: 11px; color: #64748B;">Direct in-app messaging</div>
        </div>
        <button class="modal-close-btn" onclick="closeModal('chatModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="height: 300px; overflow-y: auto; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px; margin-bottom: 12px;" id="chatMessages">
          <div style="text-align: center; color: #94A3B8; font-size: 12px; margin-top: 30px;">Loading chat...</div>
        </div>
        <form style="display: flex; gap: 8px;" onsubmit="handleSendChatMessage(event)">
          <input type="text" id="chatInputText" class="form-control" placeholder="Type a message..." autocomplete="off">
          <button type="submit" class="btn-apply-lime" style="padding: 0 18px;">Send</button>
        </form>
      </div>
    </div>
  </div>

  <!-- ============================================================= -->
  <!-- CLIENT JAVASCRIPT -->
  <!-- ============================================================= -->
  <script>
    let MAP_INSTANCE = null;
    let MAP_MARKERS_LAYER = null;
    let MAP_RADIUS_CIRCLE = null;
    let USER_LOCATION_MARKER = null;
    let USER_COORDS = { lat: 28.8386, lng: 78.7733 }; // Moradabad Hub
    let CURRENT_RADIUS_KM = 30;
    let ALL_JOBS = ${JSON.stringify(jobs)};
    let ACTIVE_CHAT_APP_ID = null;
    let CURRENT_AUTH_ROLE = 'job_seeker';
    let SELECTED_JOB_FOR_APPLY = null;

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
      const el = document.getElementById('currentLocHeader');
      if (el) el.innerText = name;
    }

    function toggleRadiusOptions() {
      const bar = document.getElementById('radiusOptionsBar');
      if (bar) bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
    }

    function switchTab(tab) {
      document.querySelectorAll('.nav-tab-item').forEach(el => el.classList.remove('active'));
      if (tab === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (tab === 'jobs') {
        openResumeModal();
      }
    }

    function focusHiringMap() {
      document.getElementById('mapSection')?.scrollIntoView({ behavior: 'smooth' });
      if (MAP_INSTANCE) setTimeout(() => MAP_INSTANCE.invalidateSize(), 200);
    }

    function openNotifications() {
      alert('You have 2 new job alerts near your location!');
    }

    // Initialize Leaflet Map (Alifeo FBS Mobile View)
    function initHiringMap() {
      const container = document.getElementById('hiringMap');
      if (!container || MAP_INSTANCE) return;

      MAP_INSTANCE = L.map('hiringMap', {
        center: [USER_COORDS.lat, USER_COORDS.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Free OpenStreetMap Tiles (Clean, street-level view, no watermark, no API key)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(MAP_INSTANCE);

      MAP_MARKERS_LAYER = L.layerGroup().addTo(MAP_INSTANCE);
      drawUserLocationPin(USER_COORDS.lat, USER_COORDS.lng);
      drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    }

    // Pulsating GPS User Location Marker
    function drawUserLocationPin(lat, lng) {
      if (!MAP_INSTANCE) return;
      if (USER_LOCATION_MARKER) MAP_INSTANCE.removeLayer(USER_LOCATION_MARKER);
      
      const userIcon = L.divIcon({
        className: 'user-gps-container',
        html: '<div class="user-gps-marker"><div class="user-gps-pulse"></div></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      USER_LOCATION_MARKER = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(MAP_INSTANCE);
    }

    function drawRadiusCircle(lat, lng, radiusKm) {
      if (!MAP_INSTANCE) return;
      if (MAP_RADIUS_CIRCLE) MAP_INSTANCE.removeLayer(MAP_RADIUS_CIRCLE);

      MAP_RADIUS_CIRCLE = L.circle([lat, lng], {
        color: '#10B981',
        fillColor: '#CFF92D',
        fillOpacity: 0.14,
        weight: 1.5,
        dashArray: '4, 4',
        radius: radiusKm * 1000
      }).addTo(MAP_INSTANCE);
    }

    // Auto-detect GPS
    function autoDetectGPS() {
      if (!navigator.geolocation || sessionStorage.getItem('gps_checked')) return;
      sessionStorage.setItem('gps_checked', '1');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          updateLocationName('Near You');
          if (MAP_INSTANCE) {
            MAP_INSTANCE.flyTo([USER_COORDS.lat, USER_COORDS.lng], 13);
            drawUserLocationPin(USER_COORDS.lat, USER_COORDS.lng);
            drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
            loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }

    function requestGPSLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation not supported by your browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          updateLocationName('Near You');
          if (MAP_INSTANCE) {
            MAP_INSTANCE.flyTo([USER_COORDS.lat, USER_COORDS.lng], 13);
            drawUserLocationPin(USER_COORDS.lat, USER_COORDS.lng);
            drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
            loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
          }
        },
        () => { alert('GPS access was denied. Showing Moradabad default.'); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    function changeRadius(radiusKm) {
      CURRENT_RADIUS_KM = radiusKm;
      drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, radiusKm);
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, radiusKm);
      toggleRadiusOptions();
    }

    // Load Jobs & Render Custom Teardrop Map Markers + Floating Callout Badges
    async function loadMapJobs(lat, lng, radiusKm) {
      try {
        const query = document.getElementById('feedSearchQuery')?.value.trim() || '';
        const res = await fetch('/api/jobs/map?lat=' + lat + '&lng=' + lng + '&radius=' + radiusKm + '&q=' + encodeURIComponent(query));
        const data = await res.json();

        if (data.success) {
          ALL_JOBS = data.jobs || [];
          renderMapMarkers(data.companies || []);
          renderFeedCards(ALL_JOBS);
          const lbl = document.getElementById('jobCountLabel');
          if (lbl) lbl.innerText = data.total_jobs + ' Openings';
        }
      } catch (e) {
        console.error('Error loading jobs:', e);
      }
    }

    function renderMapMarkers(companies) {
      if (!MAP_MARKERS_LAYER) return;
      MAP_MARKERS_LAYER.clearLayers();

      companies.forEach((comp, idx) => {
        if (!comp.latitude || !comp.longitude) return;

        // Teardrop pin icon
        const pinHtml = \`
          <div class="company-teardrop-pin" onclick="viewJobDetails('\${comp.jobs[0]?.id}')">
            <div class="company-teardrop-inner">
              \${comp.company_logo ? \`<img src="\${comp.company_logo}" class="company-teardrop-logo">\` : '💼'}
            </div>
          </div>
        \`;

        const pinIcon = L.divIcon({
          className: 'custom-company-pin-wrapper',
          html: pinHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        const marker = L.marker([comp.latitude, comp.longitude], { icon: pinIcon });
        marker.on('click', () => {
          if (comp.jobs[0]) viewJobDetails(comp.jobs[0].id);
        });
        MAP_MARKERS_LAYER.addLayer(marker);

        // Floating Callout Badge above first few jobs (matching screenshot!)
        if (comp.jobs && comp.jobs[0] && idx < 3) {
          const firstJob = comp.jobs[0];
          const offsetLat = comp.latitude + (idx === 0 ? 0.0035 : idx === 1 ? -0.003 : 0.002);
          const offsetLng = comp.longitude + (idx === 0 ? 0.004 : idx === 1 ? -0.004 : -0.004);

          const calloutHtml = \`
            <div class="map-callout-badge" onclick="viewJobDetails('\${firstJob.id}')">
              <span>\${firstJob.title.length > 18 ? firstJob.title.substring(0, 16) + '...' : firstJob.title}</span>
              <span class="map-callout-salary">\${escapeHtml(firstJob.salary_display || '')}</span>
              <span>&rsaquo;</span>
            </div>
          \`;

          const calloutIcon = L.divIcon({
            className: 'custom-company-pin-wrapper',
            html: calloutHtml,
            iconSize: [160, 32],
            iconAnchor: [80, 16]
          });

          const calloutMarker = L.marker([offsetLat, offsetLng], { icon: calloutIcon });
          calloutMarker.on('click', () => viewJobDetails(firstJob.id));
          MAP_MARKERS_LAYER.addLayer(calloutMarker);
        }
      });
    }

    function renderFeedCards(jobList) {
      const feed = document.getElementById('nearbyJobsFeedList');
      if (!feed) return;
      if (!jobList || jobList.length === 0) {
        feed.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 30px; font-size: 13px;">No openings found matching this location. Expand radius above.</div>';
        return;
      }
      feed.innerHTML = jobList.map(j => \`
        <div class="app-job-card" onclick="viewJobDetails('\${j.id}')">
          <div class="app-card-top">
            <div class="app-company-thumbnail">
              \${j.company_logo ? \`<img src="\${j.company_logo}" alt="\${escapeHtml(j.company_name)}">\` : \`<div class="app-company-initials">\${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>\`}
            </div>
            <div class="app-card-meta">
              <div class="app-company-name-row">
                <span>\${escapeHtml(j.company_name || 'Alifeo Partner')}</span>
                <span class="verified-badge-green" title="Verified Employer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
              </div>
              <div class="app-job-title">\${escapeHtml(j.title)}</div>
              <div class="app-loc-distance-row">
                <span>📍 <strong>\${j.distance_km !== undefined ? j.distance_km + ' km' : 'Nearby'}</strong></span>
                <span>&bull;</span>
                <span>\${escapeHtml(j.city)}</span>
                <span>&bull;</span>
                <span>\${escapeHtml(j.salary_display || 'Competitive')}</span>
              </div>
            </div>
          </div>

          <div class="app-card-bottom">
            <div class="app-tag-pills">
              <span class="app-tag app-tag-mode">\${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
              <span class="app-tag">\${escapeHtml(j.work_mode.toUpperCase())}</span>
              <span class="app-tag">\${escapeHtml((j.required_skills || j.skills || 'Direct').split(',')[0] || 'Direct')}</span>
            </div>
            <button class="btn-apply-lime" onclick="event.stopPropagation(); viewJobDetails('\${j.id}')">
              Apply &rarr;
            </button>
          </div>
        </div>
      \`).join('');
    }

    function viewJobDetails(jobId) {
      const job = ALL_JOBS.find(j => j.id === jobId);
      if (!job) return;
      SELECTED_JOB_FOR_APPLY = job;

      const titleEl = document.getElementById('jdTitle');
      const bodyEl = document.getElementById('jdBody');
      if (titleEl) titleEl.innerText = job.title;

      if (bodyEl) {
        bodyEl.innerHTML = \`
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
            <div class="app-company-thumbnail" style="width: 50px; height: 50px;">
              \${job.company_logo ? \`<img src="\${job.company_logo}">\` : \`<div class="app-company-initials">\${escapeHtml(job.company_name.substring(0, 2).toUpperCase())}</div>\`}
            </div>
            <div>
              <div style="font-weight: 800; font-size: 15px; color: #0f172a;">\${escapeHtml(job.company_name)}</div>
              <div style="font-size: 12px; color: #64748b;">\${escapeHtml(job.city)} &bull; \${job.distance_km !== undefined ? job.distance_km + ' km away' : 'Nearby'}</div>
            </div>
          </div>

          <div style="background: #ECFDF5; border: 1px solid #D1FAE5; border-radius: 12px; padding: 12px; margin-bottom: 14px;">
            <div style="font-size: 12px; color: #065F46; font-weight: 700;">Pay / Compensation:</div>
            <div style="font-size: 16px; font-weight: 800; color: #064E3B;">\${escapeHtml(job.salary_display)}</div>
          </div>

          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Description:</div>
          <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-bottom: 14px;">\${escapeHtml(job.description)}</p>

          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 6px;">Skills:</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 18px;">
            \${(job.required_skills || job.skills || '').split(',').filter(Boolean).map(s => \`<span class="app-tag">\${escapeHtml(s.trim())}</span>\`).join('')}
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="btn-apply-lime" style="flex: 1; padding: 12px;" onclick="applyForJobQuick('\${job.id}')">Submit 1-Click Application &rarr;</button>
          </div>
        \`;
      }
      openModal('jobDetailModal');
    }

    async function applyForJobQuick(jobId) {
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: jobId })
        });
        const data = await res.json();
        if (data.success) {
          alert('Application successfully submitted to ' + SELECTED_JOB_FOR_APPLY.company_name + '!');
          closeModal('jobDetailModal');
          window.location.reload();
        } else {
          if (data.error && data.error.includes('Unauthorized')) {
            openLoginModal('job_seeker');
          } else {
            alert(data.error || 'Failed to submit application');
          }
        }
      } catch (e) {
        openLoginModal('job_seeker');
      }
    }

    // Photo & Logo Upload Handlers
    function handleProfilePhotoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const b64 = e.target.result;
        const img = document.getElementById('spPhotoPreview');
        const ph = document.getElementById('spPhotoPlaceholder');
        if (img) { img.src = b64; img.style.display = 'block'; }
        if (ph) ph.style.display = 'none';
        document.getElementById('spPhotoUrl').value = b64;
      };
      reader.readAsDataURL(file);
    }

    function handleJobLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const b64 = e.target.result;
        const img = document.getElementById('pjLogoImg');
        const ph = document.getElementById('pjLogoPlaceholder');
        if (img) { img.src = b64; img.style.display = 'block'; }
        if (ph) ph.style.display = 'none';
        document.getElementById('pjLogoUrl').value = b64;
      };
      reader.readAsDataURL(file);
    }

    async function handleSaveSeekerProfile(event) {
      event.preventDefault();
      const name = document.getElementById('spName')?.value.trim() || '';
      const email = document.getElementById('spEmail')?.value.trim() || '';
      const photo_url = document.getElementById('spPhotoUrl')?.value || '';
      const skills = document.getElementById('spSkills')?.value.trim() || '';
      const location = document.getElementById('spLocation')?.value.trim() || '';

      try {
        const res = await fetch('/api/profile/seeker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, photo_url, skills, location })
        });
        const data = await res.json();
        if (data.success) {
          alert('Profile updated!');
          closeModal('profileModal');
          window.location.reload();
        } else {
          alert(data.error || 'Failed');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function submitJobForm(submitForReview) {
      const title = document.getElementById('pjTitle').value.trim();
      const company_name = document.getElementById('pjCompany').value.trim();
      const company_logo = document.getElementById('pjLogoUrl')?.value || '';
      const category = document.getElementById('pjCategory').value;
      const city = document.getElementById('pjCity').value.trim();
      const salary_display = document.getElementById('pjSalary').value.trim();
      const required_skills = document.getElementById('pjSkills').value.trim();
      const description = document.getElementById('pjDesc').value.trim();

      if (!title || !description || !salary_display) {
        alert('Please fill out required fields');
        return;
      }

      try {
        const res = await fetch('/api/employer/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title, company_name, company_logo, category, city,
            salary_display, required_skills, description,
            work_mode: 'onsite', job_type: 'full_time',
            submit_for_review: submitForReview
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Job posted! Live on candidate maps after instant admin check.');
          closeModal('postJobModal');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to post job');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    // Auth OTP Handling
    function openLoginModal(role = 'job_seeker') {
      CURRENT_AUTH_ROLE = role;
      openModal('authModal');
    }

    function selectAuthRole(role) {
      CURRENT_AUTH_ROLE = role;
      const bSeeker = document.getElementById('roleChoiceSeeker');
      const bEmp = document.getElementById('roleChoiceEmployer');
      if (role === 'employer') {
        bEmp.style.background = '#CFF92D';
        bEmp.style.color = '#0B3B24';
        bSeeker.style.background = '#F1F5F9';
        bSeeker.style.color = '#0F172A';
      } else {
        bSeeker.style.background = '#CFF92D';
        bSeeker.style.color = '#0B3B24';
        bEmp.style.background = '#F1F5F9';
        bEmp.style.color = '#0F172A';
      }
    }

    async function sendAuthOtp() {
      const phone = document.getElementById('authPhone').value.trim();
      const name = document.getElementById('authName').value.trim();
      if (!phone || phone.length < 10) {
        alert('Please enter a valid 10-digit WhatsApp phone number');
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
        alert('Network error');
      }
    }

    async function verifyAuthOtp() {
      const phone = document.getElementById('authPhone').value.trim();
      const otp = document.getElementById('authOtp').value.trim();
      const name = document.getElementById('authName').value.trim();
      if (!otp) {
        alert('Please enter the 6-digit OTP');
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

    async function handleLogout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    }

    function handleResumeUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const res = await fetch('/api/resumes/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              file_data: reader.result,
              file_size: file.size,
              mime_type: file.type || 'application/pdf'
            })
          });
          const data = await res.json();
          if (data.success) {
            alert('Resume uploaded successfully!');
            window.location.reload();
          } else {
            alert(data.error || 'Upload failed');
          }
        } catch (e) {
          alert('Upload failed');
        }
      };
      reader.readAsDataURL(file);
    }

    async function deleteResume(id) {
      if (!confirm('Delete this resume?')) return;
      await fetch('/api/resumes/' + id, { method: 'DELETE' });
      window.location.reload();
    }

    function openPostJobModal() { openModal('postJobModal'); }
    function openResumeModal() { openModal('resumeModal'); }
    function openProfileModal() { openModal('profileModal'); }

    function escapeHtml(t) {
      if (!t) return '';
      return String(t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string = ''): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
