import { Job, UserSession } from '../types';
import { JOB_PORTAL_STYLES } from './styles';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';

export function renderJobPortalPage(
  jobs: Job[],
  session: UserSession | null,
  ablyKey: string,
  appUrl: string
): string {
  const jobsJson = JSON.stringify(jobs);
  const sessionJson = JSON.stringify(session);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Alifeo Job | Free Job & Internship Platform</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  
  <!-- Leaflet CSS for free interactive map view -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <!-- Ably Real-time SDK for in-app chat -->
  <script src="https://cdn.ably.com/lib/ably.min-1.js"></script>
  <!-- Leaflet JS -->
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

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
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
        <span class="nav-brand-title">Alifeo Job</span>
      </a>
      <span class="nav-brand-badge">Free Portal</span>
    </div>

    <div class="nav-actions">
      <button class="btn-nav-primary" onclick="handlePostJobClick()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>Post Job Free</span>
      </button>

      ${session ? `
        <button class="btn-nav-outline" onclick="openDashboardModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>${session.role === 'employer' ? 'Company Dashboard' : 'My Applications'}</span>
        </button>
        <button class="btn-nav-outline" onclick="handleLogout()" style="padding: 6px 10px;" title="Logout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      ` : `
        <button class="btn-nav-outline" onclick="openIntentModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Login / Join</span>
        </button>
      `}
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    
    <!-- Hero Search -->
    <div class="job-hero">
      <h1 class="job-hero-title">Find Jobs & Internships</h1>
      <p class="job-hero-sub">Direct hiring from Alifeo, Zifeeo, Aabeeo & verified employers with 100% free posting.</p>

      <!-- Search & City Filter Bar -->
      <div class="search-filter-box">
        <div class="search-input-group">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #94a3b8;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="keywordInput" class="search-input-field" placeholder="Role, skill, or company (e.g. SDE 1, Designer, React)" oninput="filterJobs()" />
        </div>

        <select id="cityFilter" class="filter-select" onchange="filterJobs()">
          <option value="all">📍 All Cities</option>
          <option value="Moradabad">Moradabad</option>
          <option value="Delhi NCR">Delhi NCR / Noida / Gurugram</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Remote">Remote (Anywhere)</option>
        </select>

        <select id="typeFilter" class="filter-select" onchange="filterJobs()">
          <option value="all">💼 All Types</option>
          <option value="internship">Internships</option>
          <option value="full_time">Full-Time Jobs</option>
          <option value="part_time">Part-Time</option>
        </select>

        <button class="btn-search-main" onclick="filterJobs()">
          <span>Search</span>
        </button>
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="category-tabs" id="catTabs">
      <button class="cat-pill active" onclick="setCategoryFilter('all', this)">🔥 All Roles</button>
      <button class="cat-pill" onclick="setCategoryFilter('internship', this)">🎓 Internships</button>
      <button class="cat-pill" onclick="setCategoryFilter('full_time', this)">💼 Full-Time Jobs</button>
      <button class="cat-pill" onclick="setCategoryFilter('remote', this)">🌐 Remote Work</button>
      <button class="cat-pill" onclick="setCategoryFilter('engineering', this)">💻 Software & Tech</button>
      <button class="cat-pill" onclick="setCategoryFilter('design', this)">🎨 UI/UX & Design</button>
      <button class="cat-pill" onclick="setCategoryFilter('marketing', this)">📈 Marketing & Growth</button>
      <button class="cat-pill" onclick="setCategoryFilter('alifeo', this)">🏢 Alifeo Ventures</button>
    </div>

    <!-- View Switcher (List vs Map) -->
    <div class="view-switcher-bar">
      <div class="job-count-text" id="jobCountText">Showing ${jobs.length} Opportunities</div>
      
      <div class="view-toggle-btns">
        <button class="view-toggle-btn active" id="btnListView" onclick="setViewMode('list')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          List View
        </button>
        <button class="view-toggle-btn" id="btnMapView" onclick="setViewMode('map')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          City Map View
        </button>
      </div>
    </div>

    <!-- Free OpenStreetMap Leaflet Container -->
    <div id="mapViewContainer"></div>

    <!-- Jobs Grid -->
    <div class="jobs-grid" id="jobsGrid">
      <!-- Rendered dynamically via JS for fast filtering -->
    </div>

  </main>

  <!-- ==============================================
       MODAL 1: PRE-LOGIN INTENT (Are you applying or hiring?)
       ============================================== -->
  <div class="modal-backdrop" id="intentModal">
    <div class="modal-card">
      <button class="close-modal-btn" onclick="closeModal('intentModal')">✕</button>

      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="font-size: 22px; font-weight: 800; color: var(--alifeo-dark); margin-bottom: 6px;">
          Welcome to Alifeo Job
        </h2>
        <p style="font-size: 13.5px; color: var(--text-muted);">Please select how you want to proceed:</p>
      </div>

      <!-- Option A: Candidate -->
      <div class="intent-card-choice" onclick="selectIntentRole('candidate')">
        <div style="font-size: 32px;">🎓</div>
        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--alifeo-dark);">I am looking for a Job / Internship</h3>
          <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">Apply with 1-click, track application status, submit assignments, and chat with employers.</p>
        </div>
      </div>

      <!-- Option B: Employer -->
      <div class="intent-card-choice" onclick="selectIntentRole('employer')">
        <div style="font-size: 32px;">🏢</div>
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <h3 style="font-size: 16px; font-weight: 800; color: var(--alifeo-dark);">I want to Hire Talent</h3>
            <span style="font-size: 10px; background: #ecfdf5; color: #059669; font-weight: 800; padding: 2px 6px; border-radius: 4px;">100% FREE</span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">Post unlimited free jobs & internships, review unlimited resumes, send assignments, and chat directly.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ==============================================
       MODAL 2: WHATSAPP OTP LOGIN
       ============================================== -->
  <div class="modal-backdrop" id="whatsappAuthModal">
    <div class="modal-card">
      <button class="close-modal-btn" onclick="closeModal('whatsappAuthModal')">✕</button>

      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 48px; height: 48px; background: #ecfdf5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: #25D366;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </div>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--alifeo-dark);">WhatsApp Passwordless Login</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;" id="authSubtitle">
          We will send a 6-digit verification code to your WhatsApp.
        </p>
      </div>

      <!-- Step 1: Mobile Input -->
      <div id="authStepPhone">
        <div class="form-group">
          <label class="form-label">WhatsApp Number *</label>
          <input type="tel" id="inputAuthPhone" class="form-input" placeholder="e.g. 9876543210 (10-digit)" autofocus />
        </div>
        <button type="button" class="btn-submit" id="btnSendOtp" onclick="handleSendOtp()">
          Send Verification Code via WhatsApp
        </button>
      </div>

      <!-- Step 2: OTP Input -->
      <div id="authStepOtp" style="display: none;">
        <div class="form-group">
          <label class="form-label">Enter 6-Digit OTP *</label>
          <input type="text" id="inputAuthOtp" class="form-input" placeholder="••••••" maxlength="6" style="letter-spacing: 6px; font-size: 20px; text-align: center;" />
        </div>
        <div id="otpTestHint" style="display: none; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 12px; text-align: center;"></div>
        <button type="button" class="btn-submit" id="btnVerifyOtp" onclick="handleVerifyOtp()">
          Verify & Sign In
        </button>
      </div>
    </div>
  </div>

  <!-- ==============================================
       MODAL 3: APPLY FOR JOB
       ============================================== -->
  <div class="modal-backdrop" id="applyModal">
    <div class="modal-card">
      <button class="close-modal-btn" onclick="closeModal('applyModal')">✕</button>

      <div style="margin-bottom: 16px;">
        <span class="job-pill-tag pill-type-internship" id="applyJobType">Internship</span>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--alifeo-dark); margin-top: 6px;" id="applyJobTitle">Apply for Job</h2>
        <p style="font-size: 13px; color: var(--text-muted);" id="applyJobCompany">Company</p>
      </div>

      <form id="applyJobForm" onsubmit="submitJobApplication(event)">
        <input type="hidden" id="applyTargetJobId" />

        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" id="applyName" class="form-input" placeholder="e.g. Priya Sharma" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">WhatsApp Number *</label>
            <input type="tel" id="applyPhone" class="form-input" placeholder="9876543210" required />
          </div>
          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" id="applyEmail" class="form-input" placeholder="priya@example.com" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Resume / CV Link (Google Drive / GitHub / LinkedIn) *</label>
          <input type="url" id="applyResumeUrl" class="form-input" placeholder="https://drive.google.com/..." required />
        </div>

        <div class="form-group">
          <label class="form-label">Portfolio / Projects Link (Optional)</label>
          <input type="url" id="applyPortfolioUrl" class="form-input" placeholder="https://github.com/... or Behance / Website" />
        </div>

        <div class="form-group">
          <label class="form-label">Brief Pitch / Cover Note (Optional)</label>
          <textarea id="applyCoverNote" class="form-textarea" rows="2" placeholder="Why you are a strong fit for this opportunity..."></textarea>
        </div>

        <button type="submit" class="btn-submit" id="btnSubmitJobApp">
          Submit Application
        </button>
      </form>
    </div>
  </div>

  <!-- ==============================================
       MODAL 4: POST JOB FREE (For Employers)
       ============================================== -->
  <div class="modal-backdrop" id="postJobModal">
    <div class="modal-card" style="max-width: 580px;">
      <button class="close-modal-btn" onclick="closeModal('postJobModal')">✕</button>

      <div style="margin-bottom: 16px;">
        <span style="font-size: 11px; background: #ecfdf5; color: #059669; font-weight: 800; padding: 3px 8px; border-radius: 4px;">100% FREE POSTING</span>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--alifeo-dark); margin-top: 4px;">Post a Job or Internship</h2>
        <p style="font-size: 13px; color: var(--text-muted);">Unlimited resume views, candidate task assignments & in-app chat.</p>
      </div>

      <form id="postJobForm" onsubmit="submitNewJob(event)">
        <div class="form-group">
          <label class="form-label">Job / Internship Title *</label>
          <input type="text" id="postTitle" class="form-input" placeholder="e.g. SDE 1 (React / Node.js) or UI/UX Intern" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Hiring Company *</label>
            <input type="text" id="postCompany" class="form-input" placeholder="e.g. Zifeeo / Alifeo / Your Brand" required />
          </div>
          <div class="form-group">
            <label class="form-label">Opportunity Type *</label>
            <select id="postType" class="form-select">
              <option value="internship">Internship (Stipend / Non-Stipend)</option>
              <option value="full_time">Full-Time Job</option>
              <option value="part_time">Part-Time</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Work Mode *</label>
            <select id="postWorkMode" class="form-select">
              <option value="remote">Remote (Work from Anywhere)</option>
              <option value="onsite">Onsite (In-Office)</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">City Location *</label>
            <input type="text" id="postCity" class="form-input" placeholder="e.g. Moradabad, Delhi, Bangalore" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Stipend / Salary Range *</label>
          <input type="text" id="postSalary" class="form-input" placeholder="e.g. ₹15,000 - ₹25,000 / month or ₹6 - ₹10 LPA" required />
        </div>

        <div class="form-group">
          <label class="form-label">Key Required Skills (comma separated) *</label>
          <input type="text" id="postSkills" class="form-input" placeholder="e.g. React, TypeScript, Figma, Tailwind" required />
        </div>

        <div class="form-group">
          <label class="form-label">Description & Roles *</label>
          <textarea id="postDesc" class="form-textarea" rows="3" placeholder="Explain the key responsibilities, deliverables, and team context..." required></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Candidate Assignment / Assessment Task (Optional - like Internshala)</label>
          <textarea id="postAssignment" class="form-textarea" rows="2" placeholder="e.g. Design a mobile authentication screen or build a mini-API. Candidate must submit this before interview."></textarea>
        </div>

        <button type="submit" class="btn-submit" id="btnSubmitNewJob">
          Publish Job for Free
        </button>
      </form>
    </div>
  </div>

  <!-- ==============================================
       MODAL 5: DASHBOARD (Candidate Applications or Employer Applicants)
       ============================================== -->
  <div class="modal-backdrop" id="dashboardModal">
    <div class="modal-card" style="max-width: 740px;">
      <button class="close-modal-btn" onclick="closeModal('dashboardModal')">✕</button>

      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 800; color: var(--alifeo-dark);" id="dashTitle">My Dashboard</h2>
        <p style="font-size: 13px; color: var(--text-muted);" id="dashSub">Manage your applications and communication.</p>
      </div>

      <div id="dashContentArea" style="max-height: 480px; overflow-y: auto;">
        <!-- Filled dynamically -->
      </div>
    </div>
  </div>

  <!-- ==============================================
       MODAL 6: IN-APP CHAT (Powered by Ably)
       ============================================== -->
  <div class="modal-backdrop" id="chatModal">
    <div class="modal-card" style="max-width: 540px; padding: 18px;">
      <button class="close-modal-btn" onclick="closeModal('chatModal')">✕</button>

      <div style="margin-bottom: 12px;">
        <div style="font-size: 11px; color: #059669; font-weight: 800;" id="chatRoleBadge">In-App Chat</div>
        <h3 style="font-size: 16px; font-weight: 800; color: var(--alifeo-dark);" id="chatRecipientName">Chat</h3>
      </div>

      <div class="chat-box-container">
        <div class="chat-messages-area" id="chatMessagesArea">
          <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
            Connecting real-time chat via Ably...
          </div>
        </div>

        <form class="chat-input-bar" onsubmit="sendChatMessage(event)">
          <input type="text" id="chatInputMessage" class="search-input-field" placeholder="Type a message..." required autocomplete="off" />
          <button type="submit" class="btn-search-main" style="padding: 8px 16px;">
            Send
          </button>
        </form>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <p>© 2026 Alifeo Job. All rights reserved. • Built on Alifeo Product & WhatsApp Verification Network</p>
  </footer>

  <!-- CLIENT-SIDE SCRIPT -->
  <script>
    const ALL_JOBS = ${jobsJson};
    let currentUser = ${sessionJson};
    const ABLY_KEY = "${ablyKey}";

    let currentCategory = 'all';
    let currentView = 'list';
    let mapInstance = null;
    let markersLayer = null;

    // Active Chat context
    let activeChatAppId = null;
    let ablyRealtime = null;
    let ablyChannel = null;

    // Pre-login intent
    let selectedRoleIntent = 'candidate';

    function initPage() {
      renderJobsList(ALL_JOBS);
    }

    // View Switcher
    function setViewMode(mode) {
      currentView = mode;
      document.getElementById('btnListView').classList.toggle('active', mode === 'list');
      document.getElementById('btnMapView').classList.toggle('active', mode === 'map');
      
      const mapBox = document.getElementById('mapViewContainer');
      const gridBox = document.getElementById('jobsGrid');

      if (mode === 'map') {
        mapBox.style.display = 'block';
        gridBox.style.display = 'none';
        initMap();
      } else {
        mapBox.style.display = 'none';
        gridBox.style.display = 'grid';
      }
    }

    // Leaflet OpenStreetMap Initialization (100% Free, No Credit Card)
    function initMap() {
      if (!mapInstance) {
        // Centered around India
        mapInstance = L.map('mapViewContainer').setView([24.0, 78.5], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);
      }

      // City Coordinates Mapping
      const cityCoords = {
        'moradabad': [28.8386, 78.7733],
        'delhi ncr': [28.6139, 77.2090],
        'delhi': [28.6139, 77.2090],
        'noida': [28.5355, 77.3910],
        'gurugram': [28.4595, 77.0266],
        'bangalore': [12.9716, 77.5946],
        'mumbai': [19.0760, 72.8777],
        'remote': [23.2599, 77.4126]
      };

      if (markersLayer) {
        mapInstance.removeLayer(markersLayer);
      }
      markersLayer = L.layerGroup().addTo(mapInstance);

      // Group jobs by city
      const cityCounts = {};
      ALL_JOBS.forEach(j => {
        const c = (j.city || 'remote').toLowerCase();
        cityCounts[c] = (cityCounts[c] || 0) + 1;
      });

      Object.keys(cityCounts).forEach(c => {
        const coords = cityCoords[c] || [28.6139 + (Math.random()-0.5)*2, 77.2090 + (Math.random()-0.5)*2];
        const marker = L.marker(coords).addTo(markersLayer);
        marker.bindPopup('<b>' + c.toUpperCase() + '</b><br>' + cityCounts[c] + ' Active Openings<br><button onclick="filterByCity(\\'' + c + '\\')" style="margin-top:5px; padding:3px 8px; background:#19563e; color:#fff; border:none; border-radius:4px; cursor:pointer;">View Jobs</button>');
      });

      setTimeout(() => { mapInstance.invalidateSize(); }, 200);
    }

    function filterByCity(cityName) {
      document.getElementById('cityFilter').value = cityName;
      setViewMode('list');
      filterJobs();
    }

    // Category Tabs
    function setCategoryFilter(cat, btn) {
      currentCategory = cat;
      const pills = document.querySelectorAll('.cat-pill');
      pills.forEach(p => p.classList.remove('active'));
      if (btn) btn.classList.add('active');
      filterJobs();
    }

    // Search and Filtering Logic
    function filterJobs() {
      const keyword = document.getElementById('keywordInput').value.toLowerCase().trim();
      const city = document.getElementById('cityFilter').value.toLowerCase();
      const type = document.getElementById('typeFilter').value;

      const filtered = ALL_JOBS.filter(job => {
        // Keyword match
        const matchesKeyword = !keyword || 
          job.title.toLowerCase().includes(keyword) || 
          job.company.toLowerCase().includes(keyword) || 
          job.skills.toLowerCase().includes(keyword) || 
          (job.description && job.description.toLowerCase().includes(keyword));

        // City match
        const matchesCity = city === 'all' || 
          (job.city && job.city.toLowerCase().includes(city)) || 
          (city === 'remote' && job.work_mode === 'remote');

        // Type match
        const matchesType = type === 'all' || job.job_type === type;

        // Category tab match
        let matchesCat = true;
        if (currentCategory === 'internship') matchesCat = job.job_type === 'internship';
        else if (currentCategory === 'full_time') matchesCat = job.job_type === 'full_time';
        else if (currentCategory === 'remote') matchesCat = job.work_mode === 'remote';
        else if (currentCategory === 'engineering') matchesCat = job.title.toLowerCase().includes('sde') || job.skills.toLowerCase().includes('react') || job.skills.toLowerCase().includes('node');
        else if (currentCategory === 'design') matchesCat = job.title.toLowerCase().includes('design') || job.skills.toLowerCase().includes('figma');
        else if (currentCategory === 'marketing') matchesCat = job.title.toLowerCase().includes('marketing') || job.title.toLowerCase().includes('social');
        else if (currentCategory === 'alifeo') matchesCat = ['alifeo', 'zifeeo', 'aabeeo'].some(v => job.company.toLowerCase().includes(v));

        return matchesKeyword && matchesCity && matchesType && matchesCat;
      });

      renderJobsList(filtered);
    }

    function renderJobsList(jobs) {
      const grid = document.getElementById('jobsGrid');
      const countEl = document.getElementById('jobCountText');
      if (countEl) countEl.textContent = 'Showing ' + jobs.length + ' Opportunities';

      if (!jobs || jobs.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; background: #fff; border-radius: 16px; border: 1px solid var(--border-color);"><div style="font-size: 36px; margin-bottom: 8px;">🔍</div><h3 style="font-size: 18px; font-weight: 800; color: var(--alifeo-dark);">No matching opportunities found</h3><p style="color: var(--text-muted); font-size: 13.5px; margin-top: 4px;">Try searching with different keywords or cities.</p></div>';
        return;
      }

      grid.innerHTML = jobs.map(j => {
        const skillsArr = j.skills ? j.skills.split(',').map(s => s.trim()) : [];
        const initial = j.company ? j.company.charAt(0).toUpperCase() : 'A';

        return \`
          <div class="job-card">
            <div>
              <div class="job-card-header">
                <div>
                  <h3 class="job-title">\${j.title}</h3>
                  <div class="job-company">\${j.company}</div>
                </div>
                <div class="job-company-avatar">\${initial}</div>
              </div>

              <div class="job-meta-row">
                <span class="job-pill-tag \${j.job_type === 'internship' ? 'pill-type-internship' : 'pill-type-job'}">
                  \${j.job_type === 'internship' ? '🎓 Internship' : '💼 Full-Time'}
                </span>
                <span class="job-pill-tag pill-mode">
                  \${j.work_mode === 'remote' ? '🌐 Remote' : '🏢 ' + (j.work_mode || 'Onsite')}
                </span>
                <span class="job-pill-tag pill-city">📍 \${j.city || 'Remote'}</span>
              </div>

              <div class="job-stipend-val">
                <span>💰 \${j.stipend_salary || 'Competitive / Post-Interview'}</span>
              </div>

              <p class="job-desc-snippet">\${j.description ? j.description.slice(0, 140) + '...' : ''}</p>

              <div class="job-skills-wrap">
                \${skillsArr.slice(0, 4).map(s => \`<span class="job-skill-chip">\${s}</span>\`).join('')}
              </div>
            </div>

            <div class="job-card-actions">
              <button class="btn-apply-job" onclick="openApplyModal('\${j.id}')">
                Apply Now ↗
              </button>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Modal helpers
    function openModal(id) {
      document.getElementById(id).style.display = 'flex';
    }

    function closeModal(id) {
      document.getElementById(id).style.display = 'none';
    }

    // Intent Modal
    function openIntentModal() {
      openModal('intentModal');
    }

    function selectIntentRole(role) {
      selectedRoleIntent = role;
      closeModal('intentModal');
      
      const sub = document.getElementById('authSubtitle');
      if (sub) {
        sub.textContent = role === 'employer' 
          ? 'Enter your WhatsApp number to post free jobs & hire talent.' 
          : 'Enter your WhatsApp number to apply & track jobs.';
      }

      openModal('whatsappAuthModal');
      document.getElementById('authStepPhone').style.display = 'block';
      document.getElementById('authStepOtp').style.display = 'none';
    }

    function handlePostJobClick() {
      if (!currentUser) {
        selectIntentRole('employer');
      } else {
        openModal('postJobModal');
      }
    }

    // WhatsApp Auth Functions
    let currentAuthPhone = '';

    async function handleSendOtp() {
      const phoneInput = document.getElementById('inputAuthPhone');
      const phone = phoneInput.value.trim();
      const btn = document.getElementById('btnSendOtp');

      if (!phone || phone.length < 10) {
        alert('Please enter a valid 10-digit WhatsApp number');
        return;
      }

      currentAuthPhone = phone;
      btn.disabled = true;
      btn.textContent = 'Sending WhatsApp OTP...';

      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, role: selectedRoleIntent })
        });
        const data = await res.json();
        
        if (data.success) {
          document.getElementById('authStepPhone').style.display = 'none';
          document.getElementById('authStepOtp').style.display = 'block';
          
          if (data.testOtp) {
            const hint = document.getElementById('otpTestHint');
            hint.style.display = 'block';
            hint.textContent = 'OTP sent to WhatsApp: ' + data.testOtp;
          }
        } else {
          alert('Error sending OTP: ' + (data.error || 'Failed'));
        }
      } catch (err) {
        alert('Request failed: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Verification Code via WhatsApp';
      }
    }

    async function handleVerifyOtp() {
      const otpInput = document.getElementById('inputAuthOtp');
      const otp = otpInput.value.trim();
      const btn = document.getElementById('btnVerifyOtp');

      if (!otp || otp.length < 4) {
        alert('Please enter the verification code');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Verifying...';

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: currentAuthPhone, otp, role: selectedRoleIntent })
        });
        const data = await res.json();

        if (data.success) {
          currentUser = data.user;
          closeModal('whatsappAuthModal');
          location.reload();
        } else {
          alert('Invalid code: ' + (data.error || 'Please try again.'));
        }
      } catch (err) {
        alert('Verification error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Verify & Sign In';
      }
    }

    async function handleLogout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      location.reload();
    }

    // Apply for Job
    function openApplyModal(jobId) {
      const job = ALL_JOBS.find(j => j.id === jobId);
      if (!job) return;

      document.getElementById('applyTargetJobId').value = jobId;
      document.getElementById('applyJobTitle').textContent = job.title;
      document.getElementById('applyJobCompany').textContent = job.company + ' • ' + (job.city || 'Remote');
      document.getElementById('applyJobType').textContent = job.job_type === 'internship' ? 'Internship' : 'Full-Time';

      if (currentUser && currentUser.phone) {
        document.getElementById('applyPhone').value = currentUser.phone;
      }

      openModal('applyModal');
    }

    async function submitJobApplication(e) {
      e.preventDefault();
      const jobId = document.getElementById('applyTargetJobId').value;
      const btn = document.getElementById('btnSubmitJobApp');

      const payload = {
        candidate_name: document.getElementById('applyName').value.trim(),
        candidate_phone: document.getElementById('applyPhone').value.trim(),
        candidate_email: document.getElementById('applyEmail').value.trim(),
        resume_url: document.getElementById('applyResumeUrl').value.trim(),
        portfolio_url: document.getElementById('applyPortfolioUrl').value.trim(),
        cover_note: document.getElementById('applyCoverNote').value.trim()
      };

      btn.disabled = true;
      btn.textContent = 'Submitting Application...';

      try {
        const res = await fetch('/api/jobs/' + encodeURIComponent(jobId) + '/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert('🎉 Application submitted successfully! You can track your status in My Applications.');
          closeModal('applyModal');
        } else {
          alert('Error: ' + (data.error || 'Could not submit application'));
        }
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Application';
      }
    }

    // Post Free Job
    async function submitNewJob(e) {
      e.preventDefault();
      const btn = document.getElementById('btnSubmitNewJob');

      const payload = {
        title: document.getElementById('postTitle').value.trim(),
        company: document.getElementById('postCompany').value.trim(),
        job_type: document.getElementById('postType').value,
        work_mode: document.getElementById('postWorkMode').value,
        city: document.getElementById('postCity').value.trim(),
        stipend_salary: document.getElementById('postSalary').value.trim(),
        skills: document.getElementById('postSkills').value.trim(),
        description: document.getElementById('postDesc').value.trim(),
        assignment_text: document.getElementById('postAssignment').value.trim()
      };

      btn.disabled = true;
      btn.textContent = 'Publishing...';

      try {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
          alert('🎉 Your job has been published for free! Candidates can now apply.');
          closeModal('postJobModal');
          location.reload();
        } else {
          alert('Error publishing job: ' + (data.error || 'Failed'));
        }
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Publish Job for Free';
      }
    }

    // Dashboard Modal (Candidate or Employer)
    async function openDashboardModal() {
      if (!currentUser) return;
      const isEmployer = currentUser.role === 'employer';
      document.getElementById('dashTitle').textContent = isEmployer ? 'Company Hiring Dashboard' : 'My Applications Tracker';
      document.getElementById('dashSub').textContent = isEmployer 
        ? 'View applicants, unlimited resumes, send assignments, and chat.' 
        : 'Track your application status, view assignments, and chat with employers.';

      const content = document.getElementById('dashContentArea');
      content.innerHTML = '<div style="text-align: center; padding: 30px; color: #94a3b8;">Loading records...</div>';
      openModal('dashboardModal');

      try {
        const endpoint = isEmployer ? '/api/employer/applications' : '/api/my-applications';
        const res = await fetch(endpoint);
        const data = await res.json();
        const apps = data.applications || [];

        if (apps.length === 0) {
          content.innerHTML = '<div style="text-align: center; padding: 40px; color: #94a3b8;"><div style="font-size: 32px; margin-bottom: 8px;">📋</div><p>No applications found.</p></div>';
          return;
        }

        content.innerHTML = apps.map(a => {
          let statusColor = '#d97706';
          let statusLabel = 'Applied';
          if (a.status === 'assignment_given') { statusColor = '#7c3aed'; statusLabel = 'Assignment Given'; }
          if (a.status === 'shortlisted') { statusColor = '#2563eb'; statusLabel = 'Shortlisted'; }
          if (a.status === 'interview') { statusColor = '#059669'; statusLabel = 'Interview Scheduled'; }
          if (a.status === 'hired') { statusColor = '#059669'; statusLabel = 'Hired ✔'; }
          if (a.status === 'rejected') { statusColor = '#dc2626'; statusLabel = 'Rejected'; }

          return \`
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                <div>
                  <h4 style="font-size: 15.5px; font-weight: 800; color: var(--alifeo-dark);">\${a.job_title}</h4>
                  <div style="font-size: 12.5px; color: #64748b;">\${a.company} • Candidate: <strong>\${a.candidate_name}</strong></div>
                </div>
                <span style="font-size: 11px; font-weight: 800; color: \${statusColor}; background: \${statusColor}15; padding: 3px 8px; border-radius: 6px;">
                  \${statusLabel}
                </span>
              </div>

              <!-- Candidate Info / Unlimited Resume Link -->
              <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; margin-bottom: 12px;">
                \${a.resume_url ? \`<a href="\${a.resume_url}" target="_blank" style="color: #2563eb; font-weight: 700; text-decoration: underline;">📄 View Unlimited Resume ↗</a>\` : ''}
                \${a.portfolio_url ? \`<a href="\${a.portfolio_url}" target="_blank" style="color: #059669; font-weight: 700; text-decoration: underline;">🌐 Portfolio ↗</a>\` : ''}
                <span style="color: #64748b;">📱 \${a.candidate_phone}</span>
                <span style="color: #64748b;">✉️ \${a.candidate_email}</span>
              </div>

              <!-- Assignment View -->
              \${a.assignment_text ? \`
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 12px; margin-bottom: 10px;">
                  <strong style="color: #7c3aed;">📝 Assessment Task:</strong> \${a.assignment_text}
                </div>
              \` : ''}

              <!-- Actions (Chat, Update Status) -->
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button onclick="openChatModal('\${a.id}', '\${isEmployer ? a.candidate_name : a.company}')" style="background: #19563e; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
                  💬 Open Live Chat
                </button>

                \${isEmployer ? \`
                  <select onchange="updateApplicantStatus('\${a.id}', this.value)" style="font-size: 12px; padding: 5px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">
                    <option value="applied" \${a.status === 'applied' ? 'selected' : ''}>Applied</option>
                    <option value="under_review" \${a.status === 'under_review' ? 'selected' : ''}>Under Review</option>
                    <option value="assignment_given" \${a.status === 'assignment_given' ? 'selected' : ''}>Assignment Sent</option>
                    <option value="shortlisted" \${a.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                    <option value="interview" \${a.status === 'interview' ? 'selected' : ''}>Interview</option>
                    <option value="hired" \${a.status === 'hired' ? 'selected' : ''}>Hired</option>
                    <option value="rejected" \${a.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                  </select>
                \` : ''}
              </div>
            </div>
          \`;
        }).join('');

      } catch (err) {
        content.innerHTML = '<div style="color: red; padding: 20px;">Failed to load records: ' + err.message + '</div>';
      }
    }

    async function updateApplicantStatus(appId, status) {
      await fetch('/api/applications/' + encodeURIComponent(appId) + '/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      openDashboardModal();
    }

    // In-App Chat powered by Ably
    async function openChatModal(appId, partnerName) {
      activeChatAppId = appId;
      document.getElementById('chatRecipientName').textContent = partnerName || 'Live Chat';
      openModal('chatModal');

      const messagesArea = document.getElementById('chatMessagesArea');
      messagesArea.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">Loading conversation...</div>';

      // 1. Fetch previous message history
      try {
        const res = await fetch('/api/chat/' + encodeURIComponent(appId) + '/messages');
        const data = await res.json();
        renderChatMessages(data.messages || []);
      } catch (e) {
        console.warn(e);
      }

      // 2. Connect to Ably WebSocket for real-time messages
      try {
        if (!ablyRealtime && window.Ably) {
          ablyRealtime = new Ably.Realtime({ key: ABLY_KEY, clientId: currentUser ? currentUser.phone : 'guest' });
        }
        if (ablyRealtime) {
          const channelName = 'job-chat-' + appId;
          ablyChannel = ablyRealtime.channels.get(channelName);
          ablyChannel.subscribe('new-message', (msg) => {
            appendSingleChatMessage(msg.data);
          });
        }
      } catch (err) {
        console.error('Ably connection error:', err);
      }
    }

    function renderChatMessages(messages) {
      const area = document.getElementById('chatMessagesArea');
      if (!messages || messages.length === 0) {
        area.innerHTML = '<div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px;">No messages yet. Say hello! 👋</div>';
        return;
      }
      area.innerHTML = messages.map(m => {
        const isMe = currentUser && (
          (currentUser.role === 'candidate' && m.sender_type === 'candidate') ||
          (currentUser.role === 'employer' && m.sender_type === 'employer')
        );
        return \`
          <div class="chat-bubble \${isMe ? 'chat-bubble-me' : 'chat-bubble-them'}">
            <div style="font-size: 10.5px; opacity: 0.8; margin-bottom: 2px;">\${m.sender_name}</div>
            <div>\${m.message}</div>
          </div>
        \`;
      }).join('');
      area.scrollTop = area.scrollHeight;
    }

    function appendSingleChatMessage(m) {
      const area = document.getElementById('chatMessagesArea');
      const isMe = currentUser && (
        (currentUser.role === 'candidate' && m.sender_type === 'candidate') ||
        (currentUser.role === 'employer' && m.sender_type === 'employer')
      );
      const div = document.createElement('div');
      div.className = 'chat-bubble ' + (isMe ? 'chat-bubble-me' : 'chat-bubble-them');
      div.innerHTML = \`<div style="font-size: 10.5px; opacity: 0.8; margin-bottom: 2px;">\${m.sender_name}</div><div>\${m.message}</div>\`;
      area.appendChild(div);
      area.scrollTop = area.scrollHeight;
    }

    async function sendChatMessage(e) {
      e.preventDefault();
      const input = document.getElementById('chatInputMessage');
      const text = input.value.trim();
      if (!text || !activeChatAppId) return;

      input.value = '';
      const senderName = currentUser ? (currentUser.name || currentUser.company_name || currentUser.phone) : 'User';
      const senderType = currentUser ? currentUser.role : 'candidate';

      const payload = {
        message: text,
        sender_name: senderName,
        sender_type: senderType
      };

      try {
        // Publish to backend (which saves to DB and broadcasts to Ably)
        await fetch('/api/chat/' + encodeURIComponent(activeChatAppId) + '/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Also publish directly to Ably channel for instant UI feedback
        if (ablyChannel) {
          ablyChannel.publish('new-message', payload);
        }
      } catch (err) {
        console.error('Send message error:', err);
      }
    }

    // Run on load
    document.addEventListener('DOMContentLoaded', initPage);
  </script>
</body>
</html>`;
}
