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
  const userName = userProfile?.name || session?.name || 'Candidate';
  const userPhone = session?.phone || '';
  const userEmail = userProfile?.email || session?.email || (userPhone ? userPhone + '@alifeo.com' : '');
  const userPhoto = userProfile?.photo_url || '';
  const isProfileComplete = Boolean(userProfile?.name && userProfile.name.trim().length > 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
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
  <!-- Global In-App Toast Notification (Replaces all JS alerts!) -->
  <div class="inapp-toast-container" id="inAppToast">
    <div class="inapp-toast-icon" id="inAppToastIcon">✓</div>
    <div id="inAppToastMsg">Action completed successfully</div>
  </div>

  <!-- Global In-App Notice Dialog Modal (Replaces browser alert for role switch / notices) -->
  <div class="modal-overlay" id="inAppNoticeModal">
    <div class="modal-card" style="max-width: 400px; text-align: center;">
      <div style="width: 52px; height: 52px; border-radius: 50%; background: #FEF3C7; color: #D97706; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 12px auto;">⚠️</div>
      <div class="modal-title-text" id="noticeTitle" style="font-size: 18px; margin-bottom: 6px;">Notice</div>
      <p id="noticeDesc" style="font-size: 13px; color: #64748B; line-height: 1.5; margin-bottom: 20px;"></p>
      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn-lime-submit" id="noticeConfirmBtn" style="flex: 1;">Continue</button>
        <button type="button" class="nav-link-btn" style="border: 1px solid var(--border-color); justify-content: center; padding: 10px 16px;" onclick="closeModal('inAppNoticeModal')">Dismiss</button>
      </div>
    </div>
  </div>

  ${!session ? `
  <!-- ============================================================= -->
  <!-- PRE-LOGIN ONBOARDING GATE (Splash -> Choose Option -> WhatsApp Login -> Profile Setup -> Enable GPS) -->
  <!-- ============================================================= -->
  <div class="onboarding-screen-wrapper" id="onboardingFlowContainer">
    
    <!-- STEP 1: SPLASH SCREEN (Auto-progresses after 1.2s or tap) -->
    <div class="splash-container" id="stepSplash" onclick="goToOnboardingStep('stepChooseRole')">
      <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Where is My Job?" class="splash-logo-img">
      <div class="splash-heading-small">where is</div>
      <div class="splash-heading-main">My Job?</div>
      <div class="splash-powered">
        <span>powered by</span>
        <span class="brand-alifeo-italic" style="font-size: 16px;">alifeo</span>
      </div>
      <div class="splash-loader-bar">
        <div class="splash-loader-progress"></div>
      </div>
    </div>

    <!-- STEP 2: CHOOSE OPTION (Want to Hire? vs Get a Job?) -->
    <div class="choose-option-wrapper" id="stepChooseRole" style="display: none;">
      <div class="choose-option-brand">
        <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Where is My Job?" style="width: 54px; height: 54px; border-radius: 14px; margin-bottom: 8px;">
        <div style="font-size: 12px; font-weight: 700; color: #78827D; text-transform: uppercase; letter-spacing: 0.5px;">where is</div>
        <div class="title">My Job?</div>
        <div class="sub">by alifeo</div>
      </div>

      <!-- Card 1: Want to Hire? (Lime Card) -->
      <div class="choose-card choose-card-hire" onclick="startWhatsAppLogin('employer')">
        <div>
          <div style="font-size: 26px; margin-bottom: 4px;">💼</div>
          <div class="choose-card-title">Want to Hire?</div>
          <div class="choose-card-sub">Post a Job &amp; Find Talent</div>
        </div>
        <div class="choose-circle-btn">&rarr;</div>
      </div>

      <!-- Card 2: Get a Job? (White Card) -->
      <div class="choose-card choose-card-job" onclick="startWhatsAppLogin('job_seeker')">
        <div>
          <div style="font-size: 26px; margin-bottom: 4px;">🔍</div>
          <div class="choose-card-title">Get a Job?</div>
          <div class="choose-card-sub">Explore Nearby &amp; Remote Opportunities</div>
        </div>
        <div class="choose-circle-btn">&rarr;</div>
      </div>

      <div style="margin-top: 24px; font-size: 11px; font-weight: 700; color: #78827D; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>Powered by</span>
        <span class="brand-alifeo-italic" style="font-size: 13px;">alifeo</span>
      </div>
    </div>

    <!-- STEP 3: LOGIN WITH WHATSAPP (NO name field here!) -->
    <div class="profile-setup-card" id="stepWhatsAppAuth" style="display: none;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 52px; height: 52px; border-radius: 16px; background: #ECFDF5; border: 1.5px solid #A7F3D0; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto; color: #15965B;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </div>
        <div style="font-size: 20px; font-weight: 900; color: #17231D;">Login with WhatsApp</div>
        <div style="font-size: 12px; color: #78827D; margin-top: 2px;">Get started in seconds to explore jobs</div>
        <div id="authModeBadge" style="display: inline-block; margin-top: 8px; font-size: 11px; font-weight: 800; background: #CFF92D; color: #004D35; padding: 3px 12px; border-radius: 100px;">Candidate Mode</div>
      </div>

      <div id="authPhoneSubstep">
        <div class="form-group-ui">
          <label class="form-label-ui">Enter WhatsApp Mobile Number</label>
          <div style="display: flex; gap: 8px;">
            <div style="padding: 11px 14px; background: #F1F5F9; border: 1.5px solid var(--border-color); border-radius: 12px; font-weight: 700;">+91</div>
            <input type="tel" id="onboardPhoneInput" class="form-input-ui" placeholder="10-digit mobile" maxlength="10">
          </div>
        </div>

        <button type="button" class="btn-lime-submit" onclick="submitOnboardingPhone()">Continue with WhatsApp &rarr;</button>
        <button type="button" style="background: none; border: none; font-size: 12px; color: #78827D; width: 100%; margin-top: 14px; cursor: pointer;" onclick="goToOnboardingStep('stepChooseRole')">&larr; Back to Role Selection</button>
      </div>

      <div id="authOtpSubstep" style="display: none;">
        <div class="form-group-ui">
          <label class="form-label-ui">Enter 6-Digit WhatsApp OTP</label>
          <input type="text" id="onboardOtpInput" class="form-input-ui" maxlength="6" placeholder="••••••" style="text-align: center; letter-spacing: 6px; font-size: 20px; font-weight: 800;">
          <div id="onboardTestOtpMsg" style="font-size: 12px; font-weight: 700; color: #15965B; margin-top: 8px; text-align: center;"></div>
        </div>

        <button type="button" class="btn-lime-submit" onclick="submitOnboardingOtp()">Verify &amp; Continue &rarr;</button>
        <button type="button" style="background: none; border: none; font-size: 12px; color: #78827D; width: 100%; margin-top: 14px; cursor: pointer;" onclick="document.getElementById('authOtpSubstep').style.display='none'; document.getElementById('authPhoneSubstep').style.display='block';">&larr; Change Mobile Number</button>
      </div>
    </div>

    <!-- STEP 4: COMPLETE YOUR PROFILE (Name, Resume, Skills - after login) -->
    <div class="profile-setup-card" id="stepCompleteProfile" style="display: none;">
      <div style="text-align: center; margin-bottom: 16px;">
        <div class="profile-avatar-uploader" onclick="document.getElementById('profilePhotoInput').click()">
          <img id="avatarPreviewImg" style="display: none; width: 100%; height: 100%; object-fit: cover;">
          <div id="avatarPlaceholderIcon" style="font-size: 24px; color: #006B3C;">📷</div>
        </div>
        <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;" onchange="handleAvatarFile(event)">
        <input type="hidden" id="profilePhotoBase64">
        <div style="font-size: 18px; font-weight: 900; color: #17231D;">Complete Your Profile</div>
        <div style="font-size: 12px; color: #78827D;">Help us personalize your job recommendations</div>
      </div>

      <div class="form-group-ui">
        <label class="form-label-ui">Full Name</label>
        <input type="text" id="profileFullName" class="form-input-ui" placeholder="e.g. Aabeeo Kumar" required>
      </div>

      <div class="form-group-ui">
        <label class="form-label-ui">Upload Resume <span style="font-weight: 500; color: #78827D;">(PDF, DOCX max 5MB)</span></label>
        <div onclick="document.getElementById('resumeFileInput').click()" style="background: #F8FAF7; border: 1.5px dashed var(--border-color); border-radius: 12px; padding: 12px; text-align: center; cursor: pointer;">
          <div style="font-size: 12px; font-weight: 700; color: #006B3C;" id="resumeFileLabel">📎 Choose Resume File</div>
        </div>
        <input type="file" id="resumeFileInput" accept=".pdf,.doc,.docx" style="display: none;" onchange="handleResumeFile(event)">
        <input type="hidden" id="resumeBase64">
        <input type="hidden" id="resumeFilename">
      </div>

      <div class="form-group-ui">
        <label class="form-label-ui">Select Skills</label>
        <div class="skills-chip-selector" id="skillsChipBox">
          <span class="skill-selectable-chip selected" onclick="toggleSkillChip(this, 'UI/UX')">UI/UX</span>
          <span class="skill-selectable-chip selected" onclick="toggleSkillChip(this, 'Design')">Design</span>
          <span class="skill-selectable-chip" onclick="toggleSkillChip(this, 'React')">React</span>
          <span class="skill-selectable-chip" onclick="toggleSkillChip(this, 'Sales')">Sales</span>
          <span class="skill-selectable-chip" onclick="toggleSkillChip(this, 'Marketing')">Marketing</span>
          <span class="skill-selectable-chip" onclick="toggleSkillChip(this, 'Operations')">Operations</span>
        </div>
      </div>

      <div class="form-group-ui">
        <label class="form-label-ui">Current City / Location</label>
        <input type="text" id="profileLocation" class="form-input-ui" value="Moradabad" placeholder="e.g. Moradabad, Delhi, Noida">
      </div>

      <button type="button" class="btn-lime-submit" onclick="submitCompleteProfile()">Continue &rarr;</button>
    </div>

    <!-- STEP 5: ENABLE LOCATION -->
    <div class="enable-loc-card" id="stepEnableLocation" style="display: none;">
      <div class="loc-illustration-circle">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style="font-size: 22px; font-weight: 900; color: #17231D;">Enable Location</div>
      <p style="font-size: 13px; color: #78827D; line-height: 1.5; margin: 8px 0 24px 0;">Find nearby jobs &amp; opportunities matching your exact workplace proximity.</p>
      
      <button type="button" class="btn-lime-submit" onclick="enableGPSAndEnterApp()" style="margin-bottom: 12px;">Enable Location &rarr;</button>
      <button type="button" style="background: none; border: none; font-size: 12px; font-weight: 700; color: #78827D; cursor: pointer;" onclick="skipGPSAndEnterApp()">Not Now / Use Default</button>
    </div>

  </div>
  ` : ''}

  <!-- ============================================================= -->
  <!-- MAIN APPLICATION INTERFACE -->
  <!-- ============================================================= -->
  <div class="portal-wrapper" id="mainAppWrapper" style="${!session ? 'display: none;' : ''}">
    
    <!-- Global Header -->
    <header class="global-header">
      <div class="portal-container header-inner">
        <div class="brand-group" onclick="switchView('candidate-home')">
          <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Where is My Job?" class="brand-logo-img">
          <div class="brand-title-wrap">
            <div class="brand-title">Where is <span style="color: #006B3C;">My Job?</span></div>
            <div class="brand-tagline">by alifeo</div>
          </div>
        </div>

        <nav class="desktop-nav-links">
          <span class="nav-link-btn active" id="navDesktopHome" onclick="switchView('candidate-home')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Live Map &amp; Nearby
          </span>
          <span class="nav-link-btn" id="navDesktopRemote" onclick="switchView('remote-jobs')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            Remote Jobs
          </span>
          <span class="nav-link-btn" id="navDesktopAllJobs" onclick="switchView('all-jobs-list')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/></svg>
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
            <button class="btn-lime-apply" onclick="goToOnboardingStep('stepChooseRole')">
              Sign In
            </button>
          `}
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="portal-container" style="padding-top: 8px; flex: 1;">
      
      <!-- ============================================================= -->
      <!-- VIEW 1: CANDIDATE HOME (Interactive Zomato-Type Map FIRST + Discovery Cards + Feed) -->
      <!-- ============================================================= -->
      <section class="screen-view active" id="view-candidate-home">
        
        <!-- 1. Candidate Hero Bar -->
        <div class="candidate-hero-bar">
          <div class="hero-greeting">Hyy, ${escapeHtml(userName)} 👋</div>
          <h1 class="hero-heading">Where is <span>My Job?</span></h1>
        </div>

        <!-- 2. Location & Search Bar (Clicking Location opens In-App City Modal, NO alert/prompt!) -->
        <div class="search-location-panel">
          <div class="loc-badge-wrap" onclick="openCityPickerModal()" title="Change Search City">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006B3C" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <div style="font-size: 9px; font-weight: 700; color: #78827D; text-transform: uppercase;">Location</div>
              <div style="font-size: 13px; font-weight: 800; color: #17231D; display: flex; align-items: center; gap: 4px;">
                <span id="currentLocHeader">Moradabad, India</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

          <div class="search-input-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78827D" stroke-width="2" style="margin-right: 6px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="mainSearchInput" placeholder="Search by job title, factory, shop or skill..." oninput="triggerSearch()">
          </div>

          <!-- Radius Selector -->
          <div class="radius-selector-row">
            <button class="mini-tag-pill" id="rad20" onclick="changeSearchRadius(20)">20 km</button>
            <button class="mini-tag-pill mini-tag-green" id="rad30" onclick="changeSearchRadius(30)">30 km</button>
            <button class="mini-tag-pill" id="rad50" onclick="changeSearchRadius(50)">50 km</button>
            <button class="mini-tag-pill" id="rad100" onclick="changeSearchRadius(100)">100 km</button>
            <button class="mini-tag-pill" id="rad1000" onclick="changeSearchRadius(1000)">Pan India</button>
          </div>
        </div>

        <!-- 3. LIVE MAP VIEW FIRST (Zomato-type Map first!) -->
        <div class="map-container-box" id="mapAnchor">
          <div id="hiringMap"></div>

          <!-- Street vs Satellite Layer Switcher -->
          <div class="map-layer-switcher">
            <button class="map-layer-btn active" id="btnLayerStreet" onclick="setMapLayer('street')">🗺️ Streets</button>
            <button class="map-layer-btn" id="btnLayerSat" onclick="setMapLayer('satellite')">🛰️ Satellite</button>
          </div>

          <!-- GPS Recenter Button -->
          <button class="map-gps-btn" onclick="detectGPSLocation()" title="Detect My Current GPS Location">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
          </button>
        </div>

        <!-- 4. Candidate Discovery Banners (Nearby vs Remote) -->
        <div class="candidate-discovery-grid">
          <!-- Card 1: Nearby Jobs (Lime Card) -->
          <div class="discovery-card discovery-card-nearby" onclick="scrollToMap()">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div class="discovery-badge-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span style="font-size: 10px; font-weight: 800; background: #006B3C; color: #FFFFFF; padding: 2px 8px; border-radius: 100px;">GPS Live</span>
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <span style="font-size: 10px; font-weight: 800; background: #ECFDF5; color: #006B3C; padding: 2px 8px; border-radius: 100px;">Pan India</span>
            </div>
            <div>
              <div class="discovery-title">Explore Remote Jobs</div>
              <div class="discovery-sub">Work From Home careers across India</div>
            </div>
          </div>
        </div>

        <!-- 5. Nearby Openings List -->
        <div class="feed-panel">
          <div class="feed-header-row">
            <div class="feed-title">Nearby Openings</div>
            <span style="font-size: 12px; font-weight: 700; color: #006B3C;" id="openingsCountLabel">${jobs.length} Found</span>
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
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
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
      </section>

      <!-- ============================================================= -->
      <!-- VIEW 2: DEDICATED REMOTE JOBS -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-remote-jobs">
        <div style="padding: 16px 0 12px 0; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 class="hero-heading" style="font-size: 22px;">Remote Jobs <span>(Work From Home)</span></h1>
            <p style="font-size: 12px; color: #78827D; margin-top: 2px;">Verified remote careers and internships across India.</p>
          </div>
          <button class="nav-link-btn" onclick="switchView('candidate-home')" style="border: 1px solid var(--border-color);">
            &larr; Back to Map
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; margin-bottom: 40px;" id="remoteJobsFeedGrid">
          ${jobs.filter(j => j.work_mode === 'remote').map(j => `
            <div class="alifeo-job-card" onclick="openJobDetailModal('${j.id}')">
              <div class="job-card-top">
                <div class="company-avatar-box">
                  ${j.company_logo ? `<img src="${j.company_logo}">` : `<div class="company-avatar-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
                </div>
                <div class="job-meta-col">
                  <div class="company-name-row">
                    <span>${escapeHtml(j.company_name || 'Alifeo')}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
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
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#006B3C" stroke-width="2" style="margin: 0 auto 10px auto;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <h3 style="font-size: 16px; font-weight: 800; color: #17231D;">No Active Remote Jobs In Database</h3>
              <p style="font-size: 12px; color: #78827D; margin-top: 4px;">Currently all approved openings are based on-site near Moradabad &amp; NCR.</p>
              <button class="btn-lime-apply" style="margin-top: 14px;" onclick="switchView('candidate-home')">View Nearby Jobs on Map</button>
            </div>
          `}
        </div>
      </section>

      <!-- ============================================================= -->
      <!-- VIEW 3: ALL JOBS LIST -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-all-jobs-list">
        <div style="padding: 16px 0 12px 0; display: flex; align-items: center; justify-content: space-between;">
          <h1 class="hero-heading" style="font-size: 22px;">All Job Openings</h1>
          <button class="nav-link-btn" onclick="switchView('candidate-home')" style="border: 1px solid var(--border-color);">
            &larr; Back to Map
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; margin-bottom: 40px;">
          ${jobs.map(j => `
            <div class="alifeo-job-card" onclick="openJobDetailModal('${j.id}')">
              <div class="job-card-top">
                <div class="company-avatar-box">
                  ${j.company_logo ? `<img src="${j.company_logo}">` : `<div class="company-avatar-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
                </div>
                <div class="job-meta-col">
                  <div class="company-name-row">
                    <span>${escapeHtml(j.company_name || 'Alifeo')}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
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
      <!-- VIEW 4: DEDICATED EMPLOYER DASHBOARD -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-employer-dashboard">
        <div class="employer-panel-header" style="padding: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 11px; font-weight: 800; color: #006B3C; text-transform: uppercase;">Hiring Partner Portal</div>
            <h1 class="hero-heading" style="font-size: 20px; margin-top: 2px;">${escapeHtml(userProfile?.company_name || 'Alifeo Partner Recruitment')}</h1>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn-lime-apply" onclick="openPostJobModal()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 18px; padding: 18px; margin-bottom: 20px;">
          <h2 style="font-size: 16px; font-weight: 800; margin-bottom: 14px; color: #17231D;">My Posted Jobs</h2>
          ${employerJobs.length > 0 ? employerJobs.map(j => `
            <div style="background: #F8FAF7; border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #17231D;">${escapeHtml(j.title)}</div>
                <div style="font-size: 11px; color: #78827D; margin-top: 2px;">
                  ${escapeHtml(j.city)} &bull; ${escapeHtml(j.salary_display)} &bull; 
                  <span style="font-weight: 700; color: ${j.status === 'approved' ? '#15965B' : '#E54848'}; text-transform: uppercase;">${escapeHtml(j.status)}</span>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn-lime-apply" style="padding: 5px 12px; font-size: 11px;" onclick="viewJobApplicants('${j.id}')">
                  View Applicants (${employerApplications.filter(a => a.job_id === j.id).length})
                </button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 24px; color: #78827D; font-size: 13px;">
              You have not posted any jobs yet. Click "Post a New Job" above to pin your hiring location on the live candidate map!
            </div>
          `}
        </div>

        <!-- Employer Applicants Table -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 18px; padding: 18px;">
          <h2 style="font-size: 16px; font-weight: 800; margin-bottom: 14px; color: #17231D;">Recent Applicants</h2>
          ${employerApplications.length > 0 ? employerApplications.map(a => `
            <div style="border-bottom: 1px solid var(--border-color); padding: 10px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #17231D;">${escapeHtml(a.candidate_name || 'Candidate')} &bull; ${escapeHtml(a.candidate_phone)}</div>
                <div style="font-size: 11px; color: #78827D;">Applied for: <strong>${escapeHtml(a.job_title)}</strong> &bull; Status: <span style="font-weight: 700; color: #006B3C;">${escapeHtml(a.status.toUpperCase())}</span></div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="nav-link-btn" style="border: 1px solid var(--border-color); padding: 5px 12px;" onclick="openInAppChat('${a.id}', '${escapeHtml(a.candidate_name || 'Candidate')}', '${a.candidate_phone}')">💬 In-App Chat</button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 18px; color: #78827D; font-size: 12px;">No applicants received yet. Approved jobs appear live on candidate maps within 30km.</div>
          `}
        </div>
      </section>

    </main>

    <!-- Global Footer -->
    <footer class="global-footer">
      <div class="portal-container footer-inner">
        <div class="footer-brand">
          <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Where is My Job?" style="width: 24px; height: 24px; border-radius: 6px;">
          <span>Where is My Job? &bull; by alifeo</span>
        </div>
        <div>
          <span>Official Corporate Recruitment &bull; &copy; 2026 Alifeo</span>
        </div>
      </div>
    </footer>

    <!-- Mobile Floating Bottom Navigation -->
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

  <!-- 1. City & Location Selection Modal (Replaces browser prompt completely!) -->
  <div class="modal-overlay" id="cityPickerModal">
    <div class="modal-card">
      <div class="modal-top-bar">
        <div class="modal-title-text">Select Search Location</div>
        <button class="modal-close-icon" onclick="closeModal('cityPickerModal')">&times;</button>
      </div>

      <div class="form-group-ui">
        <label class="form-label-ui">Search City or Pincode</label>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="citySearchInputModal" class="form-input-ui" placeholder="e.g. Moradabad, Delhi, Noida, Bangalore" onkeypress="if(event.key === 'Enter') applyCustomCitySelection()">
          <button class="btn-lime-apply" onclick="applyCustomCitySelection()" style="padding: 0 16px;">Set</button>
        </div>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: #78827D; margin-top: 12px; text-transform: uppercase;">Quick Cities</div>
      <div class="city-chips-grid">
        <button class="city-chip-btn" onclick="selectPresetCity('Moradabad', 28.8055, 78.7651)">📍 Moradabad</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Delhi NCR', 28.6139, 77.2090)">📍 Delhi NCR</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Noida', 28.5355, 77.3910)">📍 Noida</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Gurgaon', 28.4595, 77.0266)">📍 Gurgaon</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Bareilly', 28.3670, 79.4304)">📍 Bareilly</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Lucknow', 26.8467, 80.9462)">📍 Lucknow</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Bangalore', 12.9716, 77.5946)">📍 Bangalore</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Mumbai', 19.0760, 72.8777)">📍 Mumbai</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Pune', 18.5204, 73.8567)">📍 Pune</button>
      </div>

      <button type="button" class="btn-lime-submit" onclick="detectGPSLocation(); closeModal('cityPickerModal');" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
        Detect My Current GPS Location
      </button>
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
        <div style="background: #F8FAF7; border: 1.5px dashed #006B3C; border-radius: 16px; padding: 12px; margin-bottom: 14px; display: flex; align-items: center; gap: 12px;">
          <div onclick="document.getElementById('pjLogoFile').click()" style="width: 48px; height: 48px; border-radius: 12px; background: #CFF92D; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; flex-shrink: 0;">
            <img id="pjLogoImg" style="display: none; width: 100%; height: 100%; object-fit: cover;">
            <span id="pjLogoPlaceholder" style="font-size: 10px; font-weight: 800; color: #004D35;">+ Logo</span>
          </div>
          <input type="file" id="pjLogoFile" accept="image/*" style="display: none;" onchange="handleJobLogoUpload(event)">
          <input type="hidden" id="pjLogoBase64">
          <div style="font-size: 11px; color: #64748B;">Upload company logo to display on candidate live map pins!</div>
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

  <!-- 4. In-App Real-Time Chat Modal -->
  <div class="modal-overlay" id="inAppChatModal">
    <div class="modal-card chat-modal-card">
      <div class="chat-header">
        <div class="chat-header-user">
          <button class="modal-close-icon" style="width: 30px; height: 30px;" onclick="closeModal('inAppChatModal')">&larr;</button>
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #17231D;" id="chatRecipientName">Hiring Team</div>
            <div style="font-size: 11px; font-weight: 700; color: #15965B; display: flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #15965B;"></span> Online
            </div>
          </div>
        </div>
        <div style="font-size: 11px; font-weight: 700; color: #78827D; background: #F1F5F9; padding: 4px 10px; border-radius: 100px;">Direct Hiring</div>
      </div>

      <div class="chat-messages-body" id="chatMessagesList">
        <div class="chat-bubble chat-bubble-in">
          <div>Hello! Thanks for applying. Please review our assessment requirement.</div>
          <div style="font-size: 10px; color: #94A3B8; margin-top: 4px; text-align: right;">10:00 AM</div>
        </div>

        <div class="chat-assignment-box">
          <div>
            <div style="font-size: 13px; font-weight: 800; color: #17231D;">📋 Role Assessment Task</div>
            <div style="font-size: 11px; color: #78827D;">UI_Design_Assignment.pdf &bull; 245 KB</div>
          </div>
          <button class="btn-lime-apply" style="padding: 5px 12px; font-size: 11px;" onclick="showInAppToast('Assignment submitted successfully!', 'success')">Submit</button>
        </div>

        <div class="chat-bubble chat-bubble-out">
          <div>Sure, reviewing and sharing details now.</div>
          <div style="font-size: 10px; color: #D1FAE5; margin-top: 4px; text-align: right;">10:05 AM</div>
        </div>
      </div>

      <div class="chat-input-bar">
        <input type="text" id="chatMessageInput" class="chat-input-field" placeholder="Type a message..." onkeypress="if(event.key === 'Enter') sendChatMessage()">
        <button class="chat-send-btn" onclick="sendChatMessage()">&rarr;</button>
      </div>
    </div>
  </div>

  <!-- 5. Profile Modal -->
  <div class="modal-overlay" id="profileModal">
    <div class="modal-card">
      <div class="modal-top-bar">
        <div class="modal-title-text">My Profile</div>
        <button class="modal-close-icon" onclick="closeModal('profileModal')">&times;</button>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 68px; height: 68px; border-radius: 50%; background: #F1F5F9; border: 3px solid #CFF92D; margin: 0 auto 8px auto; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          ${userPhoto ? `<img src="${userPhoto}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span style="font-size: 24px; font-weight: 800; color: #006B3C;">${escapeHtml(userName.charAt(0).toUpperCase())}</span>`}
        </div>
        <div style="font-size: 17px; font-weight: 800; color: #17231D;">${escapeHtml(userName)}</div>
        <div style="font-size: 12px; color: #78827D;">${escapeHtml(userEmail || userPhone)}</div>
      </div>

      <div style="margin-top: 20px;">
        <button type="button" class="btn-lime-submit" onclick="handleSwitchToEmployerNotice()" style="margin-bottom: 10px;">
          Want to Hire? Switch to Employer Partner &rarr;
        </button>
        <button type="button" style="width: 100%; padding: 11px; border-radius: 100px; background: #FEE2E2; border: none; color: #E54848; font-weight: 700; cursor: pointer;" onclick="handleLogout()">
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
    let STREET_LAYER = null;
    let SATELLITE_LAYER = null;
    let CURRENT_LAYER_TYPE = 'street';

    let USER_COORDS = { lat: 28.8055, lng: 78.7651 }; // Default: Moradabad Hub
    let CURRENT_RADIUS_KM = 30;
    let ALL_JOBS = ${JSON.stringify(jobs)};
    let SELECTED_JOB = ALL_JOBS[0] || null;
    let CURRENT_AUTH_ROLE = 'job_seeker';
    const IS_LOGGED_IN = ${session ? 'true' : 'false'};
    const ACTIVE_USER_ROLE = '${session?.active_role || ''}';
    const ABLY_KEY = '${ablyKey}';
    let CURRENT_CHAT_APP_ID = null;
    let ONBOARDING_PHONE = '';
    let SELECTED_SKILLS = ['UI/UX', 'Design'];

    // In-App Toast Engine (100% replaces alert())
    let toastTimeout = null;
    function showInAppToast(msg, type = 'info') {
      const toast = document.getElementById('inAppToast');
      const icon = document.getElementById('inAppToastIcon');
      const text = document.getElementById('inAppToastMsg');
      if (!toast) return;

      toast.className = 'inapp-toast-container inapp-toast-' + type;
      if (type === 'success') icon.innerText = '✓';
      else if (type === 'error') icon.innerText = '✕';
      else icon.innerText = 'ℹ';

      text.innerText = msg;
      toast.classList.add('show');

      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3200);
    }

    // In-App Notice Modal (100% replaces alert() dialogs)
    function showInAppNotice(title, desc, confirmText, onConfirm) {
      document.getElementById('noticeTitle').innerText = title;
      document.getElementById('noticeDesc').innerText = desc;
      const btn = document.getElementById('noticeConfirmBtn');
      btn.innerText = confirmText || 'Continue';
      btn.onclick = () => {
        closeModal('inAppNoticeModal');
        if (onConfirm) onConfirm();
      };
      openModal('inAppNoticeModal');
    }

    window.addEventListener('DOMContentLoaded', () => {
      if (!IS_LOGGED_IN) {
        // Auto splash timer: after 1.2s proceed to Choose Option Screen
        setTimeout(() => {
          goToOnboardingStep('stepChooseRole');
        }, 1200);
      } else {
        if (ACTIVE_USER_ROLE === 'employer') {
          switchView('employer-dashboard');
        } else {
          switchView('candidate-home');
        }
        initHiringMap();
        loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
      }
    });

    // Onboarding Gate Navigation
    function goToOnboardingStep(stepId) {
      const steps = ['stepSplash', 'stepChooseRole', 'stepWhatsAppAuth', 'stepCompleteProfile', 'stepEnableLocation'];
      steps.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = (s === stepId ? (s === 'stepSplash' ? 'flex' : 'block') : 'none');
      });
    }

    function startWhatsAppLogin(role) {
      CURRENT_AUTH_ROLE = role;
      document.getElementById('authModeBadge').innerText = role === 'employer' ? 'Employer / Hiring Mode' : 'Candidate Mode';
      document.getElementById('authPhoneSubstep').style.display = 'block';
      document.getElementById('authOtpSubstep').style.display = 'none';
      goToOnboardingStep('stepWhatsAppAuth');
    }

    async function submitOnboardingPhone() {
      const phoneInput = document.getElementById('onboardPhoneInput');
      const phone = phoneInput.value.trim().replace(/\D/g, '');
      if (!phone || phone.length < 10) {
        showInAppToast('Please enter a valid 10-digit mobile number', 'error');
        return;
      }
      ONBOARDING_PHONE = phone;

      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, role: CURRENT_AUTH_ROLE })
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('authPhoneSubstep').style.display = 'none';
          document.getElementById('authOtpSubstep').style.display = 'block';
          if (data.testOtp) {
            document.getElementById('onboardTestOtpMsg').innerText = 'Verification OTP: ' + data.testOtp;
          }
          showInAppToast('OTP sent to WhatsApp +91 ' + phone, 'success');
        } else {
          showInAppToast(data.error || 'Failed to send OTP', 'error');
        }
      } catch (e) {
        showInAppToast('Network error while sending OTP', 'error');
      }
    }

    async function submitOnboardingOtp() {
      const otp = document.getElementById('onboardOtpInput').value.trim();
      if (!otp || otp.length < 4) {
        showInAppToast('Please enter the OTP received on WhatsApp', 'error');
        return;
      }

      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: ONBOARDING_PHONE, otp, role: CURRENT_AUTH_ROLE })
        });
        const data = await res.json();
        if (data.success) {
          if (CURRENT_AUTH_ROLE === 'employer') {
            window.location.reload();
          } else {
            // Candidate: proceed to Complete Profile
            goToOnboardingStep('stepCompleteProfile');
          }
        } else {
          showInAppToast(data.error || 'Invalid OTP code entered', 'error');
        }
      } catch (e) {
        showInAppToast('Verification error', 'error');
      }
    }

    function handleAvatarFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const b64 = e.target.result;
        const img = document.getElementById('avatarPreviewImg');
        const icon = document.getElementById('avatarPlaceholderIcon');
        if (img) { img.src = b64; img.style.display = 'block'; }
        if (icon) icon.style.display = 'none';
        document.getElementById('profilePhotoBase64').value = b64;
      };
      reader.readAsDataURL(file);
    }

    function handleResumeFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      document.getElementById('resumeFileLabel').innerText = '✓ ' + file.name;
      document.getElementById('resumeFilename').value = file.name;

      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('resumeBase64').value = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function toggleSkillChip(el, skill) {
      if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        SELECTED_SKILLS = SELECTED_SKILLS.filter(s => s !== skill);
      } else {
        el.classList.add('selected');
        if (!SELECTED_SKILLS.includes(skill)) SELECTED_SKILLS.push(skill);
      }
    }

    async function submitCompleteProfile() {
      const name = document.getElementById('profileFullName').value.trim();
      const photo_url = document.getElementById('profilePhotoBase64').value;
      const location = document.getElementById('profileLocation').value.trim() || 'Moradabad';
      const resumeB64 = document.getElementById('resumeBase64').value;
      const resumeFilename = document.getElementById('resumeFilename').value;

      if (!name) {
        showInAppToast('Please enter your full name', 'error');
        return;
      }

      try {
        // Save seeker profile
        await fetch('/api/profile/seeker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            photo_url,
            location,
            skills: SELECTED_SKILLS.join(', ')
          })
        });

        // Upload resume if selected
        if (resumeB64) {
          await fetch('/api/resumes/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: resumeFilename,
              file_data: resumeB64
            })
          });
        }

        goToOnboardingStep('stepEnableLocation');
      } catch (e) {
        goToOnboardingStep('stepEnableLocation');
      }
    }

    function enableGPSAndEnterApp() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            window.location.reload();
          },
          () => {
            window.location.reload();
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        window.location.reload();
      }
    }

    function skipGPSAndEnterApp() {
      window.location.reload();
    }

    function switchView(viewId) {
      document.querySelectorAll('.screen-view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById('view-' + viewId);
      if (target) {
        target.classList.add('active');
        ACTIVE_VIEW = viewId;
      }

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
    function openCityPickerModal() { openModal('cityPickerModal'); }

    function handleEmployerAccessClick() {
      if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'job_seeker') {
        handleSwitchToEmployerNotice();
      } else if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'employer') {
        switchView('employer-dashboard');
      } else {
        startWhatsAppLogin('employer');
      }
    }

    function handleSwitchToEmployerNotice() {
      showInAppNotice(
        'Strict Role Isolation',
        'Candidate and Employer accounts are kept separate on Where is My Job? by alifeo. To access the Hiring Partner portal, please sign in with your Employer WhatsApp number.',
        'Sign In as Employer →',
        () => {
          handleLogout();
        }
      );
    }

    function scrollToMap() {
      document.getElementById('mapAnchor')?.scrollIntoView({ behavior: 'smooth' });
    }

    // Leaflet Free Interactive Map with Street + Satellite Toggle
    function initHiringMap() {
      const container = document.getElementById('hiringMap');
      if (!container || MAP_INSTANCE) return;

      MAP_INSTANCE = L.map('hiringMap', {
        center: [USER_COORDS.lat, USER_COORDS.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      STREET_LAYER = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      });

      SATELLITE_LAYER = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      });

      STREET_LAYER.addTo(MAP_INSTANCE);

      MAP_MARKERS_LAYER = L.layerGroup().addTo(MAP_INSTANCE);
      drawUserPin(USER_COORDS.lat, USER_COORDS.lng);
      drawCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    }

    function setMapLayer(type) {
      if (!MAP_INSTANCE) return;
      if (type === 'satellite') {
        if (MAP_INSTANCE.hasLayer(STREET_LAYER)) MAP_INSTANCE.removeLayer(STREET_LAYER);
        SATELLITE_LAYER.addTo(MAP_INSTANCE);
        document.getElementById('btnLayerSat')?.classList.add('active');
        document.getElementById('btnLayerStreet')?.classList.remove('active');
        CURRENT_LAYER_TYPE = 'satellite';
      } else {
        if (MAP_INSTANCE.hasLayer(SATELLITE_LAYER)) MAP_INSTANCE.removeLayer(SATELLITE_LAYER);
        STREET_LAYER.addTo(MAP_INSTANCE);
        document.getElementById('btnLayerStreet')?.classList.add('active');
        document.getElementById('btnLayerSat')?.classList.remove('active');
        CURRENT_LAYER_TYPE = 'street';
      }
    }

    function drawUserPin(lat, lng) {
      if (!MAP_INSTANCE) return;
      if (USER_LOCATION_MARKER) MAP_INSTANCE.removeLayer(USER_LOCATION_MARKER);
      const icon = L.divIcon({
        className: 'user-gps-container',
        html: '<div class="user-gps-marker"><div class="user-gps-pulse"></div><div class="user-gps-label">You</div></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });
      USER_LOCATION_MARKER = L.marker([lat, lng], { icon, zIndexOffset: 2000 }).addTo(MAP_INSTANCE);
    }

    function drawCircle(lat, lng, radiusKm) {
      if (!MAP_INSTANCE) return;
      if (MAP_RADIUS_CIRCLE) MAP_INSTANCE.removeLayer(MAP_RADIUS_CIRCLE);
      MAP_RADIUS_CIRCLE = L.circle([lat, lng], {
        color: '#15965B',
        fillColor: '#CFF92D',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4',
        radius: radiusKm * 1000
      }).addTo(MAP_INSTANCE);
    }

    function detectGPSLocation() {
      if (!navigator.geolocation) {
        showInAppToast('Geolocation not supported by your browser', 'error');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          document.getElementById('currentLocHeader').innerText = 'Near You, India';
          showInAppToast('GPS Location Updated', 'success');
          if (MAP_INSTANCE) {
            MAP_INSTANCE.flyTo([USER_COORDS.lat, USER_COORDS.lng], 13);
            drawUserPin(USER_COORDS.lat, USER_COORDS.lng);
            drawCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
            loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
          }
        },
        () => {
          showInAppToast('GPS permission denied. Using selected city.', 'info');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    function selectPresetCity(cityName, lat, lng) {
      USER_COORDS = { lat, lng };
      document.getElementById('currentLocHeader').innerText = cityName + ', India';
      closeModal('cityPickerModal');
      showInAppToast('Location set to ' + cityName, 'success');
      if (MAP_INSTANCE) {
        MAP_INSTANCE.flyTo([lat, lng], 13);
        drawUserPin(lat, lng);
        drawCircle(lat, lng, CURRENT_RADIUS_KM);
      }
      loadMapJobs(lat, lng, CURRENT_RADIUS_KM, cityName);
    }

    function applyCustomCitySelection() {
      const city = document.getElementById('citySearchInputModal').value.trim();
      if (!city) return;
      document.getElementById('currentLocHeader').innerText = city + ', India';
      closeModal('cityPickerModal');
      showInAppToast('Searching ' + city, 'info');
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM, city);
    }

    function changeSearchRadius(km) {
      CURRENT_RADIUS_KM = km;
      ['rad20', 'rad30', 'rad50', 'rad100', 'rad1000'].forEach(id => {
        document.getElementById(id)?.classList.remove('mini-tag-green');
      });
      document.getElementById('rad' + km)?.classList.add('mini-tag-green');
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

    // Render Clean Map Pins with Tooltips Anchored Cleanly Above Pin Tip
    function renderRealMapPins(companies) {
      if (!MAP_MARKERS_LAYER) return;
      MAP_MARKERS_LAYER.clearLayers();

      companies.forEach((comp) => {
        if (!comp.latitude || !comp.longitude) return;
        const firstJob = comp.jobs && comp.jobs[0];
        if (!firstJob) return;

        const pinHtml = \`
          <div class="company-teardrop-marker">
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
        
        const salaryBadge = firstJob.salary_display ? \`<span class="tooltip-salary">\${escapeHtml(firstJob.salary_display)}</span>\` : '';
        const tooltipContent = \`\${escapeHtml(firstJob.title)} &bull; \${salaryBadge} &rsaquo;\`;
        
        marker.bindTooltip(tooltipContent, {
          permanent: true,
          direction: 'top',
          offset: [0, -36],
          className: 'clean-job-tooltip'
        });

        marker.on('click', () => openJobDetailModal(firstJob.id));
        MAP_MARKERS_LAYER.addLayer(marker);
      });
    }

    function renderNearbyFeedCards(jobsList) {
      const container = document.getElementById('nearbyJobsListFeed');
      if (!container) return;
      if (!jobsList || jobsList.length === 0) {
        container.innerHTML = '<div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; text-align: center; color: #78827D; font-size: 12px;">No active openings in this radius. Expand search distance or explore Remote Jobs.</div>';
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
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
        <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">
          <div class="company-avatar-box" style="width: 50px; height: 50px;">
            \${job.company_logo ? \`<img src="\${job.company_logo}">\` : \`<div class="company-avatar-initials">\${escapeHtml((job.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>\`}
          </div>
          <div>
            <div style="font-size: 15px; font-weight: 800; color: #17231D;">\${escapeHtml(job.company_name)}</div>
            <div style="font-size: 11px; color: #78827D;">📍 \${job.distance_km !== undefined ? job.distance_km + ' km &bull; ' : ''}\${escapeHtml(job.city)} &bull; \${escapeHtml(job.work_mode.toUpperCase())}</div>
          </div>
        </div>

        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 10px; margin-bottom: 14px;">
          <div style="font-size: 10px; font-weight: 700; color: #004D35;">Compensation / Pay:</div>
          <div style="font-size: 16px; font-weight: 900; color: #006B3C;">\${escapeHtml(job.salary_display)}</div>
        </div>

        <div style="font-size: 12px; font-weight: 800; color: #17231D; margin-bottom: 3px;">Role Description:</div>
        <p style="font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 14px;">\${escapeHtml(job.description || 'Join our verified company team with attractive benefits and career growth.')}</p>

        <div style="font-size: 12px; font-weight: 800; color: #17231D; margin-bottom: 3px;">Skills Required:</div>
        <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 20px;">
          \${(job.required_skills || job.skills || 'General').split(',').filter(Boolean).map(s => \`<span class="mini-tag-pill">\${escapeHtml(s.trim())}</span>\`).join('')}
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn-lime-submit" style="flex: 2;" onclick="submitDirectApplication('\${job.id}')">Submit 1-Click Application &rarr;</button>
          <button class="nav-link-btn" style="flex: 1; border: 1px solid var(--border-color); justify-content: center;" onclick="closeModal('jobDetailModal'); openInAppChat('general', '\${escapeHtml(job.company_name)}', '')">💬 Chat</button>
        </div>
      \`;

      openModal('jobDetailModal');
    }

    async function submitDirectApplication(jobId) {
      if (!IS_LOGGED_IN) {
        closeModal('jobDetailModal');
        goToOnboardingStep('stepChooseRole');
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
          showInAppToast('Application submitted! Employer will review your profile.', 'success');
          closeModal('jobDetailModal');
        } else {
          showInAppToast(data.error || 'Failed to submit application', 'error');
        }
      } catch (e) {
        showInAppToast('Network error submitting application', 'error');
      }
    }

    // In-App Chat Functions
    function openInAppChat(appId, name, phone) {
      CURRENT_CHAT_APP_ID = appId;
      document.getElementById('chatRecipientName').innerText = name || 'Hiring Team';
      openModal('inAppChatModal');
    }

    function sendChatMessage() {
      const input = document.getElementById('chatMessageInput');
      const text = input.value.trim();
      if (!text) return;

      const container = document.getElementById('chatMessagesList');
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble chat-bubble-out';
      bubble.innerHTML = '<div>' + escapeHtml(text) + '</div><div style="font-size: 10px; color: #D1FAE5; margin-top: 4px; text-align: right;">Just now</div>';
      container.appendChild(bubble);
      input.value = '';
      container.scrollTop = container.scrollHeight;
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
        showInAppToast('Please fill out required fields', 'error');
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
          showInAppToast('Job posted! Live on candidate maps after instant admin check.', 'success');
          closeModal('postJobModal');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showInAppToast(data.error || 'Failed to post job', 'error');
        }
      } catch (e) {
        showInAppToast('Network error while posting job', 'error');
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
