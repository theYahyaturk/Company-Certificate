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
  const userName = userProfile?.name || session?.name || 'Candidate';
  const userPhone = session?.phone || '';
  const userEmail = userProfile?.email || session?.email || (userPhone ? userPhone + '@alifeo.com' : '');
  const userPhoto = userProfile?.photo_url || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Where Is My Job? by alifeo — Find. Apply. Grow.</title>
  <link rel="icon" type="image/png" href="${WHERE_IS_MY_JOB_LOGO_BASE64}">
  
  <!-- Leaflet CSS for free interactive map -->
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
  <div class="portal-wrapper">
    
    <!-- Global Modern Responsive Navigation Bar (No fake status bar!) -->
    <header class="global-header">
      <div class="portal-container header-inner">
        <div class="brand-group" onclick="switchView('candidate-home')">
          <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Alifeo" class="brand-logo-img">
          <div class="brand-title-wrap">
            <span class="brand-title">alifeo</span>
            <span class="brand-tagline">Where is My Job?</span>
          </div>
        </div>

        <nav class="desktop-nav-links">
          <span class="nav-link-btn active" id="navDesktopHome" onclick="switchView('candidate-home')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Live Map &amp; Nearby
          </span>
          <span class="nav-link-btn" id="navDesktopRemote" onclick="switchView('remote-jobs')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Remote Jobs
          </span>
          <span class="nav-link-btn" id="navDesktopAllJobs" onclick="switchView('all-jobs-list')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            All Openings
          </span>
          ${isEmployer ? `
            <span class="btn-hiring-partner-pill" onclick="switchView('employer-dashboard')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Hiring Dashboard
            </span>
          ` : `
            <span class="btn-hiring-partner-pill" onclick="handleEmployerAccessClick()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Want to Hire?
            </span>
          `}
        </nav>

        <div style="display: flex; align-items: center; gap: 12px;">
          ${session ? `
            <button class="nav-link-btn" onclick="openProfileModal()" style="padding: 6px 14px; background: #FFFFFF; border: 1.5px solid var(--border-color);">
              ${userPhoto ? `<img src="${userPhoto}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">` : `<span style="font-weight: 800; color: #006B3C;">${escapeHtml(userName.charAt(0).toUpperCase())}</span>`}
              <span>${escapeHtml(userName)}</span>
            </button>
          ` : `
            <button class="btn-lime-apply" onclick="openAuthModal('job_seeker')">
              Sign In
            </button>
          `}
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="portal-container" style="padding-top: 10px; flex: 1;">
      
      <!-- ============================================================= -->
      <!-- VIEW 1: CANDIDATE HOME (Interactive Map + Nearby Feed) -->
      <!-- ============================================================= -->
      <section class="screen-view active" id="view-candidate-home">
        <!-- Hero Header Row -->
        <div class="candidate-hero-bar">
          <div class="hero-greeting">Hyy, ${escapeHtml(userName)} 👋</div>
          <h1 class="hero-heading">Where is <span>My Job?</span></h1>
        </div>

        <!-- Candidate Discovery Banners (Nearby vs Remote - NO Employer Post Job clutter in candidate view!) -->
        <div class="candidate-discovery-grid">
          <!-- Card 1: Nearby Jobs (Lime Card) -->
          <div class="discovery-card discovery-card-nearby" onclick="scrollToMap()">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="discovery-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span style="font-size: 11px; font-weight: 800; background: #006B3C; color: #FFFFFF; padding: 3px 10px; border-radius: 100px;">GPS Live</span>
            </div>
            <div>
              <div class="discovery-title">Nearby Jobs &amp; Opportunities</div>
              <div class="discovery-sub">On-Site &amp; Hybrid openings near your current location</div>
            </div>
          </div>

          <!-- Card 2: Remote Jobs (White Card) -->
          <div class="discovery-card discovery-card-remote" onclick="switchView('remote-jobs')">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="discovery-badge-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <span style="font-size: 11px; font-weight: 800; background: #ECFDF5; color: #006B3C; padding: 3px 10px; border-radius: 100px;">Pan India</span>
            </div>
            <div>
              <div class="discovery-title">Explore Remote Jobs</div>
              <div class="discovery-sub">Work From Home careers across India</div>
            </div>
          </div>
        </div>

        <!-- Location Bar & Search Controls -->
        <div class="search-location-panel">
          <div class="loc-badge-wrap" onclick="promptCitySelection()" title="Change search city">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006B3C" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <div style="font-size: 10px; font-weight: 700; color: #78827D; text-transform: uppercase;">Location</div>
              <div style="font-size: 14px; font-weight: 800; color: #17231D; display: flex; align-items: center; gap: 4px;">
                <span id="currentLocHeader">Moradabad, India</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

          <div class="search-input-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78827D" stroke-width="2" style="margin-right: 8px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="mainSearchInput" placeholder="Search by job title, factory, shop or skill..." oninput="triggerSearch()">
          </div>

          <!-- Radius Selector -->
          <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto;">
            <button class="mini-tag-pill" onclick="changeSearchRadius(20)">20 km</button>
            <button class="mini-tag-pill mini-tag-green" id="btnRadiusDefault" onclick="changeSearchRadius(30)">30 km</button>
            <button class="mini-tag-pill" onclick="changeSearchRadius(50)">50 km</button>
            <button class="mini-tag-pill" onclick="changeSearchRadius(100)">100 km</button>
            <button class="mini-tag-pill" onclick="changeSearchRadius(1000)">Pan India</button>
          </div>
        </div>

        <!-- Map & Feed Side-by-Side Grid Layout -->
        <div class="map-feed-layout">
          <!-- Left: Real Interactive Leaflet Map -->
          <div class="map-container-box" id="mapAnchor">
            <div id="hiringMap"></div>

            <div class="map-pill-loc">
              <div class="map-pill-dot"></div>
              <span>GPS Center</span>
            </div>

            <button class="map-gps-btn" onclick="detectGPSLocation()" title="Detect My Current GPS Location">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
            </button>
          </div>

          <!-- Right: Nearby Openings List -->
          <div class="feed-panel">
            <div class="feed-header-row">
              <div class="feed-title">Nearby Openings</div>
              <span style="font-size: 13px; font-weight: 700; color: #006B3C;" id="openingsCountLabel">${jobs.length} Found</span>
            </div>

            <div id="nearbyJobsListFeed">
              ${jobs.map(j => `
                <div class="alifeo-job-card" onclick="openJobDetailModal('${j.id}')">
                  <div class="job-card-top">
                    <div class="company-avatar-box">
                      ${j.company_logo ? `<img src="${j.company_logo}" alt="${escapeHtml(j.company_name)}">` : `<div class="company-avatar-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
                    </div>
                    <div class="job-meta-col">
                      <div class="company-name-row">
                        <span>${escapeHtml(j.company_name || 'Alifeo Partner')}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div class="job-title-text">${escapeHtml(j.title)}</div>
                      <div class="job-sub-row">
                        <span>📍 <strong>${j.distance_km !== undefined ? j.distance_km + ' km' : j.city}</strong></span>
                        <span>&bull;</span>
                        <span>${escapeHtml(j.salary_display || 'Competitive')}</span>
                      </div>
                    </div>
                  </div>
                  <div class="job-card-bottom">
                    <div class="tag-pills-row">
                      <span class="mini-tag-pill mini-tag-green">${escapeHtml(j.work_mode.toUpperCase())}</span>
                      <span class="mini-tag-pill">${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
                    </div>
                    <button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailModal('${j.id}')">
                      Apply &rarr;
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- ============================================================= -->
      <!-- VIEW 2: DEDICATED REMOTE JOBS -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-remote-jobs">
        <div style="padding: 24px 0 16px 0; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 class="hero-heading" style="font-size: 26px;">Remote Jobs <span>(Work From Home)</span></h1>
            <p style="font-size: 13px; color: #78827D; margin-top: 4px;">Verified remote careers and internships across India.</p>
          </div>
          <button class="nav-link-btn" onclick="switchView('candidate-home')" style="border: 1px solid var(--border-color);">
            &larr; Back to Map
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 40px;" id="remoteJobsFeedGrid">
          ${jobs.filter(j => j.work_mode === 'remote').map(j => `
            <div class="alifeo-job-card" onclick="openJobDetailModal('${j.id}')">
              <div class="job-card-top">
                <div class="company-avatar-box">
                  ${j.company_logo ? `<img src="${j.company_logo}">` : `<div class="company-avatar-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
                </div>
                <div class="job-meta-col">
                  <div class="company-name-row">
                    <span>${escapeHtml(j.company_name || 'Alifeo')}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div class="job-title-text">${escapeHtml(j.title)}</div>
                  <div class="job-sub-row">
                    <span>🏠 <strong>Remote</strong></span>
                    <span>&bull;</span>
                    <span>${escapeHtml(j.salary_display || 'Competitive')}</span>
                  </div>
                </div>
              </div>
              <div class="job-card-bottom">
                <div class="tag-pills-row">
                  <span class="mini-tag-pill mini-tag-green">REMOTE</span>
                  <span class="mini-tag-pill">${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
                </div>
                <button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailModal('${j.id}')">
                  Apply &rarr;
                </button>
              </div>
            </div>
          `).join('') || `
            <div style="grid-column: 1 / -1; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 20px; padding: 40px; text-align: center;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#006B3C" stroke-width="2" style="margin: 0 auto 12px auto;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <h3 style="font-size: 18px; font-weight: 800; color: #17231D;">No Active Remote Jobs In Database</h3>
              <p style="font-size: 13px; color: #78827D; margin-top: 4px;">Currently all approved openings are based on-site near Moradabad &amp; NCR.</p>
              <button class="btn-lime-apply" style="margin-top: 16px;" onclick="switchView('candidate-home')">View Nearby Jobs on Map</button>
            </div>
          `}
        </div>
      </section>

      <!-- ============================================================= -->
      <!-- VIEW 3: ALL JOBS LIST -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-all-jobs-list">
        <div style="padding: 24px 0 16px 0; display: flex; align-items: center; justify-content: space-between;">
          <h1 class="hero-heading" style="font-size: 26px;">All Job Openings</h1>
          <button class="nav-link-btn" onclick="switchView('candidate-home')" style="border: 1px solid var(--border-color);">
            &larr; Back to Map
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 40px;">
          ${jobs.map(j => `
            <div class="alifeo-job-card" onclick="openJobDetailModal('${j.id}')">
              <div class="job-card-top">
                <div class="company-avatar-box">
                  ${j.company_logo ? `<img src="${j.company_logo}">` : `<div class="company-avatar-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
                </div>
                <div class="job-meta-col">
                  <div class="company-name-row">
                    <span>${escapeHtml(j.company_name || 'Alifeo')}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div class="job-title-text">${escapeHtml(j.title)}</div>
                  <div class="job-sub-row">
                    <span>📍 <strong>${escapeHtml(j.city)}</strong></span>
                    <span>&bull;</span>
                    <span>${escapeHtml(j.salary_display || 'Competitive')}</span>
                  </div>
                </div>
              </div>
              <div class="job-card-bottom">
                <div class="tag-pills-row">
                  <span class="mini-tag-pill mini-tag-green">${escapeHtml(j.work_mode.toUpperCase())}</span>
                  <span class="mini-tag-pill">${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
                </div>
                <button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailModal('${j.id}')">
                  Apply &rarr;
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ============================================================= -->
      <!-- VIEW 4: DEDICATED EMPLOYER / HIRING PARTNER DASHBOARD -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-employer-dashboard">
        <div class="employer-panel-header">
          <div>
            <div style="font-size: 12px; font-weight: 800; color: #006B3C; text-transform: uppercase; letter-spacing: 0.5px;">Hiring Partner Portal</div>
            <h1 class="hero-heading" style="font-size: 24px; margin-top: 2px;">${escapeHtml(userProfile?.company_name || 'Alifeo Partner Recruitment')}</h1>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn-lime-apply" onclick="openPostJobModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Post a New Job
            </button>
            <button class="nav-link-btn" onclick="switchView('candidate-home')" style="border: 1px solid var(--border-color);">
              View Map
            </button>
          </div>
        </div>

        <!-- Stat Counters -->
        <div class="emp-stat-grid">
          <div class="stat-card">
            <div class="stat-number">${employerJobs.filter(j => j.status === 'approved').length}</div>
            <div class="stat-label">Active Jobs on Map</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${employerApplications.length}</div>
            <div class="stat-label">Total Applicants</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${employerJobs.filter(j => j.status === 'pending').length}</div>
            <div class="stat-label">Pending Review</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${employerApplications.filter(a => a.status === 'hired').length}</div>
            <div class="stat-label">Candidates Hired</div>
          </div>
        </div>

        <!-- Employer Posted Jobs List -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 20px; padding: 24px; margin-bottom: 30px;">
          <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 16px; color: #17231D;">My Posted Jobs</h2>
          ${employerJobs.length > 0 ? employerJobs.map(j => `
            <div style="background: #F8FAF7; border: 1px solid var(--border-color); border-radius: 14px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="font-size: 16px; font-weight: 800; color: #17231D;">${escapeHtml(j.title)}</div>
                <div style="font-size: 12px; color: #78827D; margin-top: 2px;">
                  ${escapeHtml(j.city)} &bull; ${escapeHtml(j.salary_display)} &bull; 
                  <span style="font-weight: 700; color: ${j.status === 'approved' ? '#15965B' : '#E54848'}; text-transform: uppercase;">${escapeHtml(j.status)}</span>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn-lime-apply" style="padding: 6px 14px; font-size: 12px;" onclick="viewJobApplicants('${j.id}')">
                  View Applicants (${employerApplications.filter(a => a.job_id === j.id).length})
                </button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 30px; color: #78827D; font-size: 14px;">
              You have not posted any jobs yet. Click "Post a New Job" above to pin your hiring location on the live candidate map!
            </div>
          `}
        </div>

        <!-- Employer Applicants Table -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 20px; padding: 24px;">
          <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 16px; color: #17231D;">Recent Applicants</h2>
          ${employerApplications.length > 0 ? employerApplications.map(a => `
            <div style="border-bottom: 1px solid var(--border-color); padding: 12px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #17231D;">${escapeHtml(a.candidate_name || 'Candidate')} &bull; ${escapeHtml(a.candidate_phone)}</div>
                <div style="font-size: 12px; color: #78827D;">Applied for: <strong>${escapeHtml(a.job_title)}</strong> &bull; Status: <span style="font-weight: 700; color: #006B3C;">${escapeHtml(a.status.toUpperCase())}</span></div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="nav-link-btn" style="border: 1px solid var(--border-color); padding: 5px 12px;" onclick="openApplicantDetailModal('${a.id}')">Review &amp; Hire</button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 20px; color: #78827D; font-size: 13px;">No applicants received yet. Approved jobs appear live on candidate maps within 30km.</div>
          `}
        </div>
      </section>

    </main>

    <!-- Global Footer -->
    <footer class="global-footer">
      <div class="portal-container footer-inner">
        <div class="footer-brand">
          <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Alifeo" style="width: 24px; height: 24px; border-radius: 6px;">
          <span>alifeo &bull; Where is My Job?</span>
        </div>
        <div>
          <span>Official Corporate Recruitment &bull; &copy; 2026 Alifeo</span>
        </div>
      </div>
    </footer>

    <!-- Mobile Floating Navigation (Phones Only) -->
    <nav class="mobile-bottom-nav">
      <button class="mobile-tab-btn active" id="mTabMap" onclick="switchView('candidate-home')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>Map</span>
      </button>
      <button class="mobile-tab-btn" id="mTabRemote" onclick="switchView('remote-jobs')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        <span>Remote</span>
      </button>
      <button class="mobile-tab-btn" id="mTabJobs" onclick="switchView('all-jobs-list')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/></svg>
        <span>Jobs</span>
      </button>
      ${isEmployer ? `
        <button class="mobile-tab-btn" id="mTabEmp" onclick="switchView('employer-dashboard')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
          <span>Hiring</span>
        </button>
      ` : `
        <button class="mobile-tab-btn" onclick="openProfileModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Profile</span>
        </button>
      `}
    </nav>

  </div>

  <!-- ============================================================= -->
  <!-- MODALS -->
  <!-- ============================================================= -->

  <!-- 1. Real WhatsApp OTP Auth Modal -->
  <div class="modal-overlay" id="authModal">
    <div class="modal-card">
      <div class="modal-top-bar">
        <div class="modal-title-text" id="authModalTitle">Sign In with WhatsApp</div>
        <button class="modal-close-icon" onclick="closeModal('authModal')">&times;</button>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Alifeo" style="width: 54px; height: 54px; border-radius: 14px;">
        <div style="font-size: 18px; font-weight: 800; color: #006B3C; margin-top: 8px;">Where is My Job?</div>
        <div style="font-size: 12px; color: #78827D;" id="authRoleIndicatorText">Candidate Verification</div>
      </div>

      <div id="authStep1">
        <div class="form-group-ui">
          <label class="form-label-ui">WhatsApp Mobile Number</label>
          <div style="display: flex; gap: 8px;">
            <div style="padding: 12px 14px; background: #F1F5F9; border: 1.5px solid var(--border-color); border-radius: 12px; font-weight: 700;">+91</div>
            <input type="tel" id="authPhoneInput" class="form-input-ui" placeholder="10-digit mobile" maxlength="10">
          </div>
        </div>

        <div class="form-group-ui">
          <label class="form-label-ui">Your Name <span style="font-weight: 500; color: #78827D;">(Optional)</span></label>
          <input type="text" id="authNameInput" class="form-input-ui" placeholder="e.g. Mohd Yahya">
        </div>

        <button type="button" class="btn-lime-submit" onclick="submitSendAuthOtp()">Send WhatsApp OTP &rarr;</button>
      </div>

      <div id="authStep2" style="display: none;">
        <div class="form-group-ui">
          <label class="form-label-ui">Enter 6-Digit WhatsApp OTP</label>
          <input type="text" id="authOtpInput" class="form-input-ui" maxlength="6" placeholder="••••••" style="text-align: center; letter-spacing: 6px; font-size: 20px; font-weight: 800;">
          <div id="testOtpDisplayMsg" style="font-size: 12px; font-weight: 700; color: #15965B; margin-top: 8px; text-align: center;"></div>
        </div>
        <button type="button" class="btn-lime-submit" onclick="submitVerifyAuthOtp()">Verify &amp; Continue &rarr;</button>
      </div>
    </div>
  </div>

  <!-- 2. Post a New Job Modal (Employer) -->
  <div class="modal-overlay" id="postJobModal">
    <div class="modal-card">
      <div class="modal-top-bar">
        <div class="modal-title-text">Post Job &amp; Pin On Live Map</div>
        <button class="modal-close-icon" onclick="closeModal('postJobModal')">&times;</button>
      </div>

      <form id="employerPostJobForm" onsubmit="event.preventDefault(); submitPostJob();">
        <div style="background: #F8FAF7; border: 1.5px dashed #006B3C; border-radius: 16px; padding: 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
          <div onclick="document.getElementById('pjLogoFile').click()" style="width: 52px; height: 52px; border-radius: 12px; background: #CFF92D; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; flex-shrink: 0;">
            <img id="pjLogoImg" style="display: none; width: 100%; height: 100%; object-fit: cover;">
            <span id="pjLogoPlaceholder" style="font-size: 10px; font-weight: 800; color: #004D35;">+ Logo</span>
          </div>
          <input type="file" id="pjLogoFile" accept="image/*" style="display: none;" onchange="handleJobLogoUpload(event)">
          <input type="hidden" id="pjLogoBase64">
          <div style="font-size: 12px; color: #64748B;">Upload company logo to display on candidate live map pins!</div>
        </div>

        <div class="form-group-ui">
          <label class="form-label-ui">Job Title</label>
          <input type="text" id="pjTitle" class="form-input-ui" placeholder="e.g. Store Manager / Senior Developer" required>
        </div>

        <div class="form-group-ui">
          <label class="form-label-ui">Company Name</label>
          <input type="text" id="pjCompany" class="form-input-ui" value="${escapeHtml(userProfile?.company_name || 'Alifeo Partner')}" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group-ui">
            <label class="form-label-ui">Work Mode</label>
            <select id="pjWorkMode" class="form-input-ui">
              <option value="onsite">On-Site (Pins on Map)</option>
              <option value="hybrid">Hybrid (Pins on Map)</option>
              <option value="remote">Remote (Work From Home)</option>
            </select>
          </div>
          <div class="form-group-ui">
            <label class="form-label-ui">Job Type</label>
            <select id="pjJobType" class="form-input-ui">
              <option value="full_time">Full Time</option>
              <option value="internship">Internship</option>
              <option value="part_time">Part Time</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group-ui">
            <label class="form-label-ui">City / Workplace Location</label>
            <input type="text" id="pjCity" class="form-input-ui" value="Moradabad" required>
          </div>
          <div class="form-group-ui">
            <label class="form-label-ui">Salary / Pay Display</label>
            <input type="text" id="pjSalary" class="form-input-ui" placeholder="e.g. ₹25K - ₹40K / Month" required>
          </div>
        </div>

        <div class="form-group-ui">
          <label class="form-label-ui">Skills Required</label>
          <input type="text" id="pjSkills" class="form-input-ui" placeholder="e.g. Sales, React, Retail, Delivery">
        </div>

        <div class="form-group-ui">
          <label class="form-label-ui">Role Description</label>
          <textarea id="pjDesc" class="form-input-ui" rows="3" placeholder="Job responsibilities and requirements..." required></textarea>
        </div>

        <button type="submit" class="btn-lime-submit">Submit Job for Instant Live Review &rarr;</button>
      </form>
    </div>
  </div>

  <!-- 3. Job Details & 1-Click Apply Modal -->
  <div class="modal-overlay" id="jobDetailModal">
    <div class="modal-card">
      <div class="modal-top-bar">
        <div class="modal-title-text" id="jdmTitle">Job Details</div>
        <button class="modal-close-icon" onclick="closeModal('jobDetailModal')">&times;</button>
      </div>
      <div id="jdmBody"></div>
    </div>
  </div>

  <!-- 4. Profile Modal -->
  <div class="modal-overlay" id="profileModal">
    <div class="modal-card">
      <div class="modal-top-bar">
        <div class="modal-title-text">My Profile</div>
        <button class="modal-close-icon" onclick="closeModal('profileModal')">&times;</button>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: #F1F5F9; border: 3px solid #CFF92D; margin: 0 auto 8px auto; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          ${userPhoto ? `<img src="${userPhoto}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span style="font-size: 26px; font-weight: 800; color: #006B3C;">${escapeHtml(userName.charAt(0).toUpperCase())}</span>`}
        </div>
        <div style="font-size: 18px; font-weight: 800; color: #17231D;">${escapeHtml(userName)}</div>
        <div style="font-size: 12px; color: #78827D;">${escapeHtml(userEmail || userPhone)}</div>
      </div>

      <div style="margin-top: 20px;">
        <button type="button" class="btn-lime-submit" onclick="handleSwitchToEmployerNotice()" style="margin-bottom: 12px;">
          Want to Hire? Switch to Employer Partner &rarr;
        </button>
        <button type="button" style="width: 100%; padding: 12px; border-radius: 100px; background: #FEE2E2; border: none; color: #E54848; font-weight: 700; cursor: pointer;" onclick="handleLogout()">
          Sign Out of Account
        </button>
      </div>
    </div>
  </div>

  <!-- ============================================================= -->
  <!-- CLIENT RUNTIME JAVASCRIPT -->
  <!-- ============================================================= -->
  <script>
    let ACTIVE_VIEW = 'candidate-home';
    let MAP_INSTANCE = null;
    let MAP_MARKERS_LAYER = null;
    let MAP_RADIUS_CIRCLE = null;
    let USER_LOCATION_MARKER = null;
    let USER_COORDS = { lat: 28.8055, lng: 78.7651 }; // Moradabad Hub
    let CURRENT_RADIUS_KM = 30;
    // Real database jobs loaded dynamically from backend
    let ALL_JOBS = ${JSON.stringify(jobs)};
    let SELECTED_JOB = ALL_JOBS[0] || null;
    let CURRENT_AUTH_ROLE = 'job_seeker';
    const IS_LOGGED_IN = ${session ? 'true' : 'false'};
    const ACTIVE_USER_ROLE = '${session?.active_role || ''}';

    window.addEventListener('DOMContentLoaded', () => {
      if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'employer') {
        switchView('employer-dashboard');
      } else {
        switchView('candidate-home');
      }
      initHiringMap();
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    });

    function switchView(viewId) {
      document.querySelectorAll('.screen-view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById('view-' + viewId);
      if (target) {
        target.classList.add('active');
        ACTIVE_VIEW = viewId;
      }

      // Update Nav highlighting
      document.querySelectorAll('.nav-link-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.mobile-tab-btn').forEach(btn => btn.classList.remove('active'));

      if (viewId === 'candidate-home') {
        document.getElementById('navDesktopHome')?.classList.add('active');
        document.getElementById('mTabMap')?.classList.add('active');
        setTimeout(() => { if (MAP_INSTANCE) MAP_INSTANCE.invalidateSize(); }, 200);
      } else if (viewId === 'remote-jobs') {
        document.getElementById('navDesktopRemote')?.classList.add('active');
        document.getElementById('mTabRemote')?.classList.add('active');
      } else if (viewId === 'all-jobs-list') {
        document.getElementById('navDesktopAllJobs')?.classList.add('active');
        document.getElementById('mTabJobs')?.classList.add('active');
      } else if (viewId === 'employer-dashboard') {
        document.getElementById('mTabEmp')?.classList.add('active');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openModal(id) { document.getElementById(id)?.classList.add('active'); }
    function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
    function openProfileModal() { openModal('profileModal'); }
    function openPostJobModal() { openModal('postJobModal'); }

    function handleEmployerAccessClick() {
      if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'job_seeker') {
        handleSwitchToEmployerNotice();
      } else if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'employer') {
        switchView('employer-dashboard');
      } else {
        openAuthModal('employer');
      }
    }

    function handleSwitchToEmployerNotice() {
      alert('Strict Role Isolation Rule: Candidate and Employer accounts are kept separate on Alifeo. To access the Hiring Partner portal, please sign in using your Employer WhatsApp number.');
      handleLogout();
    }

    function scrollToMap() {
      document.getElementById('mapAnchor')?.scrollIntoView({ behavior: 'smooth' });
    }

    // Leaflet Free Interactive Map (Clean street-view tiles without watermarks)
    function initHiringMap() {
      const container = document.getElementById('hiringMap');
      if (!container || MAP_INSTANCE) return;

      MAP_INSTANCE = L.map('hiringMap', {
        center: [USER_COORDS.lat, USER_COORDS.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(MAP_INSTANCE);

      MAP_MARKERS_LAYER = L.layerGroup().addTo(MAP_INSTANCE);
      drawUserPin(USER_COORDS.lat, USER_COORDS.lng);
      drawCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    }

    function drawUserPin(lat, lng) {
      if (!MAP_INSTANCE) return;
      if (USER_LOCATION_MARKER) MAP_INSTANCE.removeLayer(USER_LOCATION_MARKER);
      const icon = L.divIcon({
        className: 'user-gps-container',
        html: '<div class="user-gps-marker"><div class="user-gps-pulse"></div></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      USER_LOCATION_MARKER = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(MAP_INSTANCE);
    }

    function drawCircle(lat, lng, radiusKm) {
      if (!MAP_INSTANCE) return;
      if (MAP_RADIUS_CIRCLE) MAP_INSTANCE.removeLayer(MAP_RADIUS_CIRCLE);
      MAP_RADIUS_CIRCLE = L.circle([lat, lng], {
        color: '#15965B',
        fillColor: '#CFF92D',
        fillOpacity: 0.14,
        weight: 1.5,
        dashArray: '4, 4',
        radius: radiusKm * 1000
      }).addTo(MAP_INSTANCE);
    }

    function detectGPSLocation() {
      if (!navigator.geolocation) {
        alert('Geolocation not supported by your browser.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          document.getElementById('currentLocHeader').innerText = 'Near You, India';
          if (MAP_INSTANCE) {
            MAP_INSTANCE.flyTo([USER_COORDS.lat, USER_COORDS.lng], 13);
            drawUserPin(USER_COORDS.lat, USER_COORDS.lng);
            drawCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
            loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
          }
        },
        () => { alert('GPS permission denied. Using Moradabad default.'); },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    function promptCitySelection() {
      const city = prompt('Enter Search City (e.g. Moradabad, Delhi, Noida, Bangalore):', 'Moradabad');
      if (city) {
        document.getElementById('currentLocHeader').innerText = city + ', India';
        loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM, city);
      }
    }

    function changeSearchRadius(km) {
      CURRENT_RADIUS_KM = km;
      drawCircle(USER_COORDS.lat, USER_COORDS.lng, km);
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, km);
    }

    function triggerSearch() {
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    }

    // Dynamic Map Data strictly read from Backend/Database
    async function loadMapJobs(lat, lng, radiusKm, cityQuery = '') {
      try {
        const q = document.getElementById('mainSearchInput')?.value.trim() || cityQuery || '';
        const res = await fetch('/api/jobs/map?lat=' + lat + '&lng=' + lng + '&radius=' + radiusKm + '&q=' + encodeURIComponent(q));
        const data = await res.json();
        if (data.success) {
          ALL_JOBS = data.jobs || [];
          renderRealMapPins(data.companies || []);
          renderNearbyFeedCards(ALL_JOBS);
          const badge = document.getElementById('openingsCountLabel');
          if (badge) badge.innerText = data.total_jobs + ' Found';
        }
      } catch (e) {
        console.error('Error fetching jobs:', e);
      }
    }

    // Render pins and callouts STRICTLY for real approved jobs in database
    function renderRealMapPins(companies) {
      if (!MAP_MARKERS_LAYER) return;
      MAP_MARKERS_LAYER.clearLayers();

      companies.forEach((comp, idx) => {
        if (!comp.latitude || !comp.longitude) return;
        const firstJob = comp.jobs && comp.jobs[0];
        if (!firstJob) return;

        // Teardrop marker
        const pinHtml = \`
          <div class="company-teardrop-marker" onclick="openJobDetailModal('\${firstJob.id}')">
            <div class="company-marker-inner">
              \${comp.company_logo ? \`<img src="\${comp.company_logo}">\` : '💼'}
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
        marker.on('click', () => openJobDetailModal(firstJob.id));
        MAP_MARKERS_LAYER.addLayer(marker);

        // Real Callout Badge strictly displaying the actual title and salary from database!
        const offsetLat = comp.latitude + 0.003;
        const offsetLng = comp.longitude;
        const calloutHtml = \`
          <div class="map-job-callout-badge" onclick="openJobDetailModal('\${firstJob.id}')">
            <span>\${firstJob.title}</span>
            <span class="map-callout-salary-green">\${escapeHtml(firstJob.salary_display || '')}</span>
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
        calloutMarker.on('click', () => openJobDetailModal(firstJob.id));
        MAP_MARKERS_LAYER.addLayer(calloutMarker);
      });
    }

    function renderNearbyFeedCards(jobsList) {
      const container = document.getElementById('nearbyJobsListFeed');
      if (!container) return;
      if (!jobsList || jobsList.length === 0) {
        container.innerHTML = '<div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 16px; padding: 30px; text-align: center; color: #78827D; font-size: 13px;">No active openings in this radius. Expand search distance or explore Remote Jobs.</div>';
        return;
      }
      container.innerHTML = jobsList.map(j => \`
        <div class="alifeo-job-card" onclick="openJobDetailModal('\${j.id}')">
          <div class="job-card-top">
            <div class="company-avatar-box">
              \${j.company_logo ? \`<img src="\${j.company_logo}">\` : \`<div class="company-avatar-initials">\${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>\`}
            </div>
            <div class="job-meta-col">
              <div class="company-name-row">
                <span>\${escapeHtml(j.company_name || 'Alifeo Partner')}</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="job-title-text">\${escapeHtml(j.title)}</div>
              <div class="job-sub-row">
                <span>📍 <strong>\${j.distance_km !== undefined ? j.distance_km + ' km' : j.city}</strong></span>
                <span>&bull;</span>
                <span>\${escapeHtml(j.salary_display || 'Competitive')}</span>
              </div>
            </div>
          </div>
          <div class="job-card-bottom">
            <div class="tag-pills-row">
              <span class="mini-tag-pill mini-tag-green">\${escapeHtml(j.work_mode.toUpperCase())}</span>
              <span class="mini-tag-pill">\${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
            </div>
            <button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailModal('\${j.id}')">
              Apply &rarr;
            </button>
          </div>
        </div>
      \`).join('');
    }

    function openJobDetailModal(jobId) {
      const job = ALL_JOBS.find(j => j.id === jobId);
      if (!job) return;
      SELECTED_JOB = job;

      document.getElementById('jdmTitle').innerText = job.title;
      document.getElementById('jdmBody').innerHTML = \`
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
          <div class="company-avatar-box" style="width: 56px; height: 56px;">
            \${job.company_logo ? \`<img src="\${job.company_logo}">\` : \`<div class="company-avatar-initials">\${escapeHtml((job.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>\`}
          </div>
          <div>
            <div style="font-size: 16px; font-weight: 800; color: #17231D;">\${escapeHtml(job.company_name)}</div>
            <div style="font-size: 12px; color: #78827D;">📍 \${job.distance_km !== undefined ? job.distance_km + ' km &bull; ' : ''}\${escapeHtml(job.city)} &bull; \${escapeHtml(job.work_mode.toUpperCase())}</div>
          </div>
        </div>

        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 14px; padding: 12px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; color: #004D35;">Compensation / Pay:</div>
          <div style="font-size: 18px; font-weight: 900; color: #006B3C;">\${escapeHtml(job.salary_display)}</div>
        </div>

        <div style="font-size: 13px; font-weight: 800; color: #17231D; margin-bottom: 4px;">Role Description:</div>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 16px;">\${escapeHtml(job.description || 'Join our verified company team with attractive benefits and career growth.')}</p>

        <div style="font-size: 13px; font-weight: 800; color: #17231D; margin-bottom: 4px;">Skills Required:</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px;">
          \${(job.required_skills || job.skills || 'General').split(',').filter(Boolean).map(s => \`<span class="mini-tag-pill">\${escapeHtml(s.trim())}</span>\`).join('')}
        </div>

        <button class="btn-lime-submit" onclick="submitDirectApplication('\${job.id}')">Submit 1-Click Application &rarr;</button>
      \`;

      openModal('jobDetailModal');
    }

    async function submitDirectApplication(jobId) {
      if (!IS_LOGGED_IN) {
        closeModal('jobDetailModal');
        openAuthModal('job_seeker');
        return;
      }
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: jobId })
        });
        const data = await res.json();
        if (data.success) {
          alert('Application successfully submitted! The employer will review your profile.');
          closeModal('jobDetailModal');
        } else {
          alert(data.error || 'Failed to submit application');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    // Auth OTP Handling
    function openAuthModal(role = 'job_seeker') {
      CURRENT_AUTH_ROLE = role;
      document.getElementById('authRoleIndicatorText').innerText = role === 'employer' ? 'Hiring Partner Verification' : 'Candidate Verification';
      document.getElementById('authStep1').style.display = 'block';
      document.getElementById('authStep2').style.display = 'none';
      openModal('authModal');
    }

    async function submitSendAuthOtp() {
      const phone = document.getElementById('authPhoneInput').value.trim();
      const name = document.getElementById('authNameInput').value.trim();
      if (!phone || phone.length < 10) {
        alert('Please enter a valid 10-digit mobile number');
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
            document.getElementById('testOtpDisplayMsg').innerText = 'Verification OTP: ' + data.testOtp;
          }
        } else {
          alert(data.error || 'Failed to send OTP');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function submitVerifyAuthOtp() {
      const phone = document.getElementById('authPhoneInput').value.trim();
      const otp = document.getElementById('authOtpInput').value.trim();
      const name = document.getElementById('authNameInput').value.trim();
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

    // Employer Job Post Handling
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
        document.getElementById('pjLogoBase64').value = b64;
      };
      reader.readAsDataURL(file);
    }

    async function submitPostJob() {
      const title = document.getElementById('pjTitle').value.trim();
      const company_name = document.getElementById('pjCompany').value.trim();
      const company_logo = document.getElementById('pjLogoBase64')?.value || '';
      const work_mode = document.getElementById('pjWorkMode').value;
      const job_type = document.getElementById('pjJobType').value;
      const city = document.getElementById('pjCity').value.trim();
      const salary_display = document.getElementById('pjSalary').value.trim();
      const required_skills = document.getElementById('pjSkills').value.trim();
      const description = document.getElementById('pjDesc').value.trim();

      if (!title || !company_name || !city || !salary_display) {
        alert('Please fill out required fields');
        return;
      }

      try {
        const res = await fetch('/api/employer/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title, company_name, company_logo, work_mode, job_type,
            city, salary_display, required_skills, description,
            submit_for_review: true
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

    async function handleLogout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    }

    function escapeHtml(t) {
      if (!t) return '';
      return String(t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
