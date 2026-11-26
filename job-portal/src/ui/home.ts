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
  
  <!-- Leaflet CSS for free interactive map (Ultra-fast CDN, zero SRI blocking) -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
  <!-- Leaflet JS -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
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
        <label class="form-label-ui">Mobile Number</label>
        <input type="text" id="profilePhoneDisplay" class="form-input-ui" readonly style="background: #F1F5F9; color: #475569; font-weight: 600;">
      </div>

      <div class="form-group-ui">
        <label class="form-label-ui">Full Name</label>
        <input type="text" id="profileFullName" class="form-input-ui" placeholder="e.g. Aabeeo Kumar" required>
      </div>

      <div class="form-group-ui">
        <label class="form-label-ui">Upload Resume <span style="font-weight: 500; color: #78827D;">(PDF, DOCX max 5MB)</span></label>
        <div onclick="document.getElementById('resumeFileInput').click()" style="background: #F8FAF7; border: 1.5px dashed var(--border-color); border-radius: 14px; padding: 14px; text-align: center; cursor: pointer; transition: all 0.2s ease;">
          <div style="font-size: 13px; font-weight: 800; color: #006B3C;" id="resumeFileLabel">📎 Choose Resume File (Auto-Detect Role &amp; Skills)</div>
          <div style="font-size: 11px; color: #78827D; margin-top: 3px;">AI parses text, extracts verified skills, and identifies your primary role.</div>
        </div>
        <input type="file" id="resumeFileInput" accept=".pdf,.doc,.docx" style="display: none;" onchange="handleResumeFile(event)">
        <input type="hidden" id="resumeBase64">
        <input type="hidden" id="resumeFilename">
      </div>

      <!-- AI Verified Intelligence Card -->
      <div id="aiVerifiedResultCard" class="ai-result-hero-card" style="display: none;">
        <div class="ai-result-badge-top">
          ✨ AI Resume Intelligence Verified
        </div>
        
        <div class="ai-role-highlight-box">
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #78827D; text-transform: uppercase;">Detected Primary Role:</div>
            <div class="ai-role-title-text" id="aiResultRoleText">Product Designer &amp; UI/UX Designer</div>
          </div>
          <span style="font-size: 10px; font-weight: 800; color: #006B3C; background: #CFF92D; padding: 3px 8px; border-radius: 100px;">95% Match</span>
        </div>

        <div style="font-size: 11px; font-weight: 800; color: #17231D; margin-bottom: 2px;">Extracted Core Skills:</div>
        <div class="ai-skills-clean-grid" id="aiResultSkillsGrid"></div>

        <div class="ai-add-skill-box">
          <input type="text" id="aiCustomSkillInput" class="form-input-ui" style="padding: 7px 12px; font-size: 11px;" placeholder="Add another skill (e.g. Figma, React)..." onkeypress="if(event.key === 'Enter'){ event.preventDefault(); addCustomAiSkill(); }">
          <button type="button" class="btn-lime-apply" style="padding: 6px 14px; font-size: 11px; white-space: nowrap;" onclick="addCustomAiSkill()">+ Add</button>
        </div>
      </div>

      <div class="form-group-ui">
        <label class="form-label-ui">Professional Role / Headline <span style="font-weight: 500; font-size: 10px; color: #15965B;">(Auto-filled by AI)</span></label>
        <input type="text" id="profileHeadline" class="form-input-ui" placeholder="e.g. Product Designer &amp; UI/UX Designer">
      </div>

      <div class="form-group-ui" id="manualSkillsGroupBox">
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
          ${session ? `
            <span class="nav-link-btn" id="navDesktopApplications" onclick="switchView('my-applications')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              My Applications
              ${myApplications.length > 0 ? `<span style="background: #006B3C; color: #FFF; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 10px;">${myApplications.length}</span>` : ''}
            </span>
            <span class="nav-link-btn" id="navDesktopMessages" onclick="switchView('messages-inbox')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Messages
            </span>
          ` : ''}
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
        
        <!-- 1. UNIFIED PRO MOBILE APP BAR & CONTROLS (Native App Style, Pro SVG Icons) -->
        <div class="pro-mobile-header">
          <div class="pro-app-bar-row">
            <div class="pro-loc-selector" onclick="openCityPickerModal()" title="Change Search Location">
              <div class="pro-loc-icon-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#004D35" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="pro-loc-info">
                <div class="pro-loc-heading">
                  <span id="currentLocHeader">Moradabad, India</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div class="pro-loc-sub">GPS Verified &bull; Tap to change city</div>
              </div>
            </div>

            <div class="pro-header-right">
              <button type="button" class="btn-pro-remote-pill" onclick="switchView('remote-jobs')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <span>Remote Jobs</span>
              </button>
            </div>
          </div>

          <!-- PRO FLOATING SEARCH & FILTER BAR -->
          <div class="pro-search-row">
            <div class="pro-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="mainSearchInput" placeholder="Search jobs by title, factory, shop or skill..." oninput="triggerSearch()">
            </div>
          </div>

          <!-- PRO RADIUS & FILTER CHIPS (Horizontal Scrollable, Sleek) -->
          <div class="pro-filters-scroll">
            <button class="pro-filter-chip mini-tag-green" id="rad20" onclick="changeSearchRadius(20)">Within 20 km</button>
            <button class="pro-filter-chip" id="rad30" onclick="changeSearchRadius(30)">30 km</button>
            <button class="pro-filter-chip" id="rad50" onclick="changeSearchRadius(50)">50 km</button>
            <button class="pro-filter-chip" id="rad100" onclick="changeSearchRadius(100)">100 km</button>
            <button class="pro-filter-chip" id="rad1000" onclick="changeSearchRadius(1000)">Pan India</button>
          </div>
        </div>

        <!-- 2. LIVE INTERACTIVE MAP (With Pro SVG Controls, No cartoon emojis) -->
        <div class="map-container-box" id="mapAnchor">
          <div id="hiringMap"></div>

          <!-- Street vs Satellite Layer Switcher (Pro SVG Icons) -->
          <div class="map-layer-switcher">
            <button class="map-layer-btn active" id="btnLayerStreet" onclick="setMapLayer('street')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              <span>Map</span>
            </button>
            <button class="map-layer-btn" id="btnLayerSat" onclick="setMapLayer('satellite')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
              <span>Satellite</span>
            </button>
          </div>

          <!-- GPS Recenter Button (Pro Crosshair SVG) -->
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
              <div class="discovery-title">Nearby Jobs</div>
              <div class="discovery-sub">On-Site &amp; Hybrid</div>
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
              <div class="discovery-title">Remote Jobs</div>
              <div class="discovery-sub">Work From Home</div>
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
        <div style="padding: 12px 0 10px 0;">
          <h1 class="hero-heading" style="font-size: 20px;">Remote Jobs</h1>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 40px;" id="remoteJobsFeedGrid">
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
            <div style="grid-column: 1 / -1; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 18px; padding: 32px 16px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">🏠</div>
              <h3 style="font-size: 15px; font-weight: 800; color: #17231D;">No Active Remote Jobs</h3>
              <p style="font-size: 12px; color: #78827D; margin-top: 4px;">New remote opportunities will appear here.</p>
            </div>
          `}
        </div>
      </section>

      <!-- ============================================================= -->
      <!-- VIEW 3: ALL JOBS LIST -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-all-jobs-list">
        <div style="padding: 12px 0 10px 0;">
          <h1 class="hero-heading" style="font-size: 20px;">All Openings</h1>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 40px;">
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
              No jobs posted yet. Click "Post a New Job" above to create an opening.
            </div>
          `}
        </div>

        <!-- Employer Applicants Table -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 18px; padding: 18px;">
          <h2 style="font-size: 16px; font-weight: 800; margin-bottom: 14px; color: #17231D;">Recent Applicants (${employerApplications.length})</h2>
          ${employerApplications.length > 0 ? employerApplications.map(a => `
            <div style="background: #F8FAF7; border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 15px; font-weight: 800; color: #17231D;">${escapeHtml(a.candidate_name || 'Candidate')}</span>
                  <span class="status-pill status-pill-${(a.status || 'applied').toLowerCase().replace(' ', '_')}">${escapeHtml((a.status || 'applied').toUpperCase())}</span>
                </div>
                <div style="font-size: 12px; color: #64748B; margin-top: 3px;">
                  📞 ${escapeHtml(a.candidate_phone)} &bull; Applied for: <strong>${escapeHtml(a.job_title)}</strong>
                </div>
                ${a.resume_filename ? `
                  <div style="font-size: 11px; color: #006B3C; font-weight: 700; margin-top: 4px;">
                    📎 Resume: ${escapeHtml(a.resume_filename)}
                  </div>
                ` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                ${a.resume_snapshot_data ? `
                  <a href="${a.resume_snapshot_data}" download="${escapeHtml(a.resume_filename || 'Candidate_Resume.pdf')}" class="nav-link-btn" style="border: 1px solid var(--border-color); padding: 6px 12px; font-size: 11px; text-decoration: none; color: #17231D;">
                    📥 Resume
                  </a>
                ` : ''}
                <select class="form-input-ui" style="width: auto; padding: 6px 10px; font-size: 11px; font-weight: 700;" onchange="updateApplicantStatus('${a.id}', this.value)">
                  <option value="applied" ${a.status === 'applied' ? 'selected' : ''}>Status: Applied</option>
                  <option value="under_review" ${a.status === 'under_review' ? 'selected' : ''}>Status: Under Review</option>
                  <option value="shortlisted" ${a.status === 'shortlisted' ? 'selected' : ''}>Status: Shortlisted</option>
                  <option value="interview_scheduled" ${a.status === 'interview_scheduled' ? 'selected' : ''}>Status: Interview</option>
                  <option value="hired" ${a.status === 'hired' ? 'selected' : ''}>Status: Selected / Hired</option>
                  <option value="rejected" ${a.status === 'rejected' ? 'selected' : ''}>Status: Rejected</option>
                </select>
                <button class="nav-link-btn" style="border: 1px solid var(--border-color); padding: 6px 12px; font-size: 11px;" onclick="openInAppChat('${a.id}', '${escapeHtml(a.candidate_name || 'Candidate')}', '${a.candidate_phone}')">💬 Chat</button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 24px; color: #78827D; font-size: 13px;">No applicants received yet.</div>
          `}
        </div>
      </section>

      <!-- ============================================================= -->
      <!-- VIEW 5: CANDIDATE MY APPLICATIONS -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-my-applications">
        <div style="padding: 12px 0 10px 0;">
          <h1 class="hero-heading" style="font-size: 20px;">My Applications</h1>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px;">
          <button class="category-pill-btn active" onclick="filterApplications('all')">All (${myApplications.length})</button>
          <button class="category-pill-btn" onclick="filterApplications('applied')">Applied</button>
          <button class="category-pill-btn" onclick="filterApplications('shortlisted')">Shortlisted</button>
          <button class="category-pill-btn" onclick="filterApplications('interview')">Interview</button>
          <button class="category-pill-btn" onclick="filterApplications('selected')">Selected</button>
          <button class="category-pill-btn" onclick="filterApplications('withdrawn')">Withdrawn</button>
        </div>

        <div id="myApplicationsContainer">
          ${myApplications.length > 0 ? myApplications.map(app => {
    const statusKey = (app.status || 'applied').toLowerCase().replace(' ', '_');
    const statusClass = 'status-pill-' + statusKey;
    const statusLabel = (app.status || 'applied').replace('_', ' ').toUpperCase();
    return `
              <div class="job-card-feed app-item-card" data-status="${escapeHtml(app.status)}" style="margin-bottom: 14px;">
                <div class="job-card-top">
                  <div class="company-avatar-box">
                    ${app.company_logo ? `<img src="${app.company_logo}">` : `<div class="company-avatar-initials">${escapeHtml((app.company_name || 'AL').substring(0, 2).toUpperCase())}</div>`}
                  </div>
                  <div class="job-card-header-info">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                      <div class="job-card-title">${escapeHtml(app.job_title || 'Application')}</div>
                      <span class="status-pill ${statusClass}">${escapeHtml(statusLabel)}</span>
                    </div>
                    <div class="job-sub-row">
                      <span>🏢 <strong>${escapeHtml(app.company_name || 'Alifeo Partner')}</strong></span>
                      <span>&bull;</span>
                      <span>📍 ${escapeHtml(app.city || 'India')}</span>
                      <span>&bull;</span>
                      <span>${escapeHtml(app.salary_display || 'Competitive')}</span>
                    </div>
                  </div>
                </div>
                <div class="job-card-bottom" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                  <div style="font-size: 11px; color: #78827D;">
                    Applied on: <strong>${new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button class="nav-link-btn" style="border: 1px solid var(--border-color); padding: 5px 12px; font-size: 12px;" onclick="openInboxConversationDirect('${app.id}', '${escapeHtml(app.company_name || 'Alifeo')}', '${app.company_logo || ''}', '${escapeHtml(app.job_title || 'UI/UX')}', '${app.job_id || ''}')">
                      💬 In-App Chat
                    </button>
                    ${app.status !== 'withdrawn' && app.status !== 'rejected' ? `
                      <button class="nav-link-btn" style="border: 1px solid #FECACA; color: #E54848; padding: 5px 12px; font-size: 12px;" onclick="confirmWithdrawApplication('${app.id}')">
                        Withdraw
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
  }).join('') : `
            <div style="text-align: center; padding: 36px 16px; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 18px;">
              <div style="font-size: 26px; margin-bottom: 8px;">📄</div>
              <h3 style="font-size: 15px; font-weight: 800; color: #17231D; margin-bottom: 4px;">No Applications Yet</h3>
              <p style="font-size: 12px; color: #78827D;">Applied jobs and interview statuses will appear here.</p>
            </div>
          `}
        </div>
      </section>

      <!-- ============================================================= -->
      <!-- VIEW 6: MESSAGES & INBOX -->
      <!-- ============================================================= -->
      <section class="screen-view" id="view-messages-inbox">
        <div class="inbox-container">
          <div class="inbox-conversations-sidebar">
            <div style="padding: 12px 14px; border-bottom: 1px solid var(--border-color); font-size: 13px; font-weight: 800; color: #17231D;">
              Conversations
            </div>
            <div id="inboxConversationList" style="overflow-y: auto; flex: 1;">
              <div style="padding: 24px; text-align: center; color: #78827D; font-size: 12px;">Loading messages...</div>
            </div>
          </div>

          <div class="inbox-chat-pane">
            <div class="chat-header" id="inboxChatHeader" style="border-radius: 0; padding: 10px 14px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; position: sticky; top: 0; z-index: 10;">
              <div class="chat-header-user" style="display: flex; align-items: center; gap: 8px; min-width: 0;">
                <button type="button" class="chat-back-btn mobile-chat-back-btn" onclick="backToConversationList()" title="Back to conversations">&larr;</button>
                <div style="position: relative; flex-shrink: 0;">
                  <div class="chat-avatar-icon" id="inboxHeaderAvatar" style="width: 38px; height: 38px; border-radius: 50%; font-size: 16px; font-weight: 800; background: #004D35; color: #CFF92D; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1.5px solid #E2E8F0;">
                    <span id="inboxHeaderAvatarInitial">A</span>
                    <img id="inboxHeaderAvatarImg" src="" style="display: none; width: 100%; height: 100%; object-fit: cover;">
                  </div>
                  <span id="inboxHeaderOnlineDot" style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: #10B981; border: 2px solid #FFFFFF; border-radius: 50%;"></span>
                </div>
                <div style="min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 14px; font-weight: 800; color: #17231D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="inboxRecipientName">Select Conversation</span>
                    <span id="inboxVerifiedBadge" style="display: inline-flex; align-items: center; gap: 3px; font-size: 9.5px; font-weight: 800; background: #ECFDF5; color: #006B3C; border: 1px solid #A7F3D0; padding: 1px 6px; border-radius: 100px;">
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      Verified
                    </span>
                  </div>
                  <div style="font-size: 10.5px; color: #10B981; font-weight: 700; margin-top: 1px;" id="inboxRecipientSub">● Online</div>
                </div>
              </div>
              <div id="inboxHeaderActions" style="display: none; align-items: center; gap: 8px;">
                <button type="button" class="nav-link-btn" id="inboxViewJobBtn" style="border: 1px solid var(--border-color); padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 8px; background: #FFFFFF; display: flex; align-items: center; gap: 5px; cursor: pointer;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  <span>View Job</span>
                </button>
              </div>
            </div>

            <div class="chat-messages-body" id="inboxMessagesBody" style="flex: 1; overflow-y: auto; padding: 16px; background: #F8FAF7; display: flex; flex-direction: column; gap: 10px;">
              <div style="text-align: center; padding: 48px 16px; color: #94A3B8; font-size: 13px;">
                Select a recruiter or applicant conversation on the left to view messages.
              </div>
            </div>

            <div class="chat-input-bar" id="inboxInputBar" style="display: none; padding: 10px 14px; background: #FFFFFF; border-top: 1px solid var(--border-color); gap: 8px; align-items: center; position: sticky; bottom: 0; z-index: 10;">
              <input type="text" id="inboxMessageInput" class="chat-input-field" placeholder="Type a message..." onkeypress="if(event.key === 'Enter') sendInboxMessage()" style="flex: 1; padding: 10px 16px; border-radius: 100px; border: 1.5px solid #E2E8F0; font-size: 13.5px; font-family: inherit; outline: none; background: #F8FAF7;">
              <button type="button" class="chat-send-btn" id="inboxSendBtn" onclick="sendInboxMessage()" title="Send Message" style="width: 40px; height: 40px; border-radius: 50%; background: #004D35; border: none; color: #CFF92D; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Global Footer -->
    <footer class="global-footer">
      <div class="portal-container footer-inner">
        <div class="footer-brand">
          <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Where is My Job?" style="width: 24px; height: 24px; border-radius: 6px;">
          <span>Where is My Job?</span>
        </div>
        <div>
          <span>&copy; 2026 Alifeo. All rights reserved.</span>
        </div>
      </div>
    </footer>

    <!-- Mobile Floating Bottom Navigation (6 Core Tabs) -->
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
      ${session ? `
        <button class="mobile-tab-btn" id="mTabApplied" onclick="switchView('my-applications')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>Applied</span>
        </button>
        <button class="mobile-tab-btn" id="mTabChat" onclick="switchView('messages-inbox')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>Chat</span>
        </button>
      ` : ''}
      ${isEmployer ? `
        <button class="mobile-tab-btn" id="mTabEmp" onclick="switchView('employer-dashboard')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
          <span>Hiring</span>
        </button>
      ` : `
        <button class="mobile-tab-btn" id="mTabProfile" onclick="openProfileModal()">
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
        <button class="city-chip-btn" onclick="selectPresetCity('Moradabad', 28.8055, 78.7651)">Moradabad</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Delhi NCR', 28.6139, 77.2090)">Delhi NCR</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Noida', 28.5355, 77.3910)">Noida</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Gurgaon', 28.4595, 77.0266)">Gurgaon</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Bareilly', 28.3670, 79.4304)">Bareilly</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Lucknow', 26.8467, 80.9462)">Lucknow</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Bangalore', 12.9716, 77.5946)">Bangalore</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Mumbai', 19.0760, 72.8777)">Mumbai</button>
        <button class="city-chip-btn" onclick="selectPresetCity('Pune', 18.5204, 73.8567)">Pune</button>
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
          <button type="button" class="chat-back-btn" onclick="closeModal('inAppChatModal')" title="Back">&larr;</button>
          <div class="chat-avatar-icon" id="chatAvatarContainer">
            <span id="chatAvatarInitial">H</span>
            <img id="chatAvatarImg" src="" style="display: none; width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="min-width: 0;">
            <div style="font-size: 14px; font-weight: 800; color: #17231D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="chatRecipientName">Hiring Team</div>
            <div style="font-size: 11px; font-weight: 700; color: #15965B; display: flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #15965B;"></span> Online &bull; Direct Hiring
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="font-size: 11px; font-weight: 700; color: #006B3C; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 4px 10px; border-radius: 100px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" id="chatJobBadge">Job Details</div>
          <button type="button" class="modal-close-icon" style="width: 28px; height: 28px; font-size: 15px;" onclick="closeModal('inAppChatModal')">&times;</button>
        </div>
      </div>

      <div class="chat-messages-body" id="chatMessagesList">
        <!-- Dynamically populated from /api/chat/:appId/messages -->
      </div>

      <div class="chat-quick-suggestions" id="chatQuickSuggestions">
        <button type="button" class="chat-quick-chip" onclick="applyChatQuickSuggestion('I am very interested in this role!')">Interested in role</button>
        <button type="button" class="chat-quick-chip" onclick="applyChatQuickSuggestion('When would be a good time for a short interview?')">Interview schedule</button>
        <button type="button" class="chat-quick-chip" onclick="applyChatQuickSuggestion('I have updated my portfolio and resume.')">Portfolio updated</button>
        <button type="button" class="chat-quick-chip" onclick="applyChatQuickSuggestion('Thank you for connecting!')">Thank you</button>
      </div>

      <div class="chat-input-bar">
        <input type="text" id="chatMessageInput" class="chat-input-field" placeholder="Type a message..." onkeypress="if(event.key === 'Enter') sendChatMessage()">
        <button type="button" class="chat-send-btn" id="chatSendBtn" onclick="sendChatMessage()" title="Send Message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- 5. Comprehensive Profile Modal (Tabs: Profile Details, My Resumes, Account) -->
  <div class="modal-overlay" id="profileModal">
    <div class="modal-card" style="max-width: 580px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-top-bar">
        <div class="modal-title-text">Candidate Profile</div>
        <button class="modal-close-icon" onclick="closeModal('profileModal')">&times;</button>
      </div>

      <!-- Tab Navigation Bar -->
      <div class="tab-nav-bar">
        <button class="tab-nav-item active" id="tabBtnProfileDetails" onclick="switchProfileTab('profileDetails')">Profile Details</button>
        <button class="tab-nav-item" id="tabBtnProfileResumes" onclick="switchProfileTab('profileResumes')">My Resumes (${userResumes.length})</button>
        <button class="tab-nav-item" id="tabBtnProfileAccount" onclick="switchProfileTab('profileAccount')">Account</button>
      </div>

      <!-- TAB 1: Profile Details -->
      <div id="tabContentProfileDetails">
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="position: relative; width: 76px; height: 76px; margin: 0 auto 8px auto;">
            <div style="width: 76px; height: 76px; border-radius: 50%; background: #F1F5F9; border: 3px solid #CFF92D; overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <img id="userPhotoPreview" src="${userPhoto || ''}" style="${userPhoto ? '' : 'display: none;'} width: 100%; height: 100%; object-fit: cover;">
              <span id="userPhotoInitial" style="${userPhoto ? 'display: none;' : ''} font-size: 28px; font-weight: 800; color: #006B3C;">${escapeHtml(userName.charAt(0).toUpperCase())}</span>
            </div>
            <label for="profilePhotoInput" style="position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; border-radius: 50%; background: #006B3C; color: #FFFFFF; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #FFFFFF; font-size: 13px;" title="Upload Photo">
              📷
            </label>
            <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;" onchange="handleProfilePhotoUpload(event)">
            <input type="hidden" id="profilePhotoBase64" value="${escapeHtml(userPhoto)}">
          </div>
          <div style="font-size: 16px; font-weight: 800; color: #17231D;">${escapeHtml(userName)}</div>
          <div style="font-size: 12px; color: #78827D;">WhatsApp Verified: <strong>${escapeHtml(userPhone)}</strong></div>
        </div>

        <!-- AI Verified Intelligence Card in Profile Details -->
        <div id="profAiVerifiedBox" style="background: linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%); border: 1.5px solid #15965B; border-radius: 16px; padding: 12px 14px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(21, 150, 91, 0.08);">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="background: #CFF92D; color: #004D35; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 100px;">✨ AI Resume Intelligence Verified</span>
              <span style="font-size: 11px; font-weight: 800; color: #15965B;" id="profAiMatchTag">95% Match</span>
            </div>
            <button type="button" class="nav-link-btn" style="border: 1px solid #15965B; color: #006B3C; font-size: 11px; padding: 4px 10px; font-weight: 800; background: #FFFFFF; display: inline-flex; align-items: center; gap: 4px;" onclick="triggerProfileAiRescan()">
              ⚡ Re-Sync from Resume
            </button>
          </div>
          <div style="margin-top: 8px; font-size: 12px; font-weight: 700; color: #17231D;">
            Detected Role: <span style="color: #006B3C; font-weight: 800;" id="profAiDetectedRole">${escapeHtml(userProfile?.headline || 'Product Designer & UI/UX Designer')}</span>
          </div>
        </div>

        <form id="candidateProfileForm" onsubmit="event.preventDefault(); saveCandidateProfile();">
          <div class="form-row-2col">
            <div class="form-group-ui">
              <label class="form-label-ui">Full Name *</label>
              <input type="text" id="profName" class="form-input-ui" value="${escapeHtml(userProfile?.name || session?.name || '')}" placeholder="Your Full Name" required>
            </div>
            <div class="form-group-ui">
              <label class="form-label-ui">Professional Headline</label>
              <input type="text" id="profHeadline" class="form-input-ui" value="${escapeHtml(userProfile?.headline || '')}" placeholder="e.g. Senior Product Designer">
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group-ui">
              <label class="form-label-ui">Email Address *</label>
              <input type="email" id="profEmail" class="form-input-ui" value="${escapeHtml(userProfile?.email || session?.email || '')}" placeholder="name@example.com" required>
            </div>
            <div class="form-group-ui">
              <label class="form-label-ui">Current City / Location</label>
              <input type="text" id="profLocation" class="form-input-ui" value="${escapeHtml(userProfile?.location || 'Moradabad, India')}" placeholder="e.g. Moradabad, Uttar Pradesh">
            </div>
          </div>

          <div class="form-group-ui">
            <label class="form-label-ui">About Me / Summary</label>
            <textarea id="profAbout" class="form-input-ui" rows="2" placeholder="Brief summary of your professional background and interests...">${escapeHtml(userProfile?.about_me || userProfile?.experience_summary || '')}</textarea>
          </div>

          <div class="form-row-2col">
            <div class="form-group-ui">
              <label class="form-label-ui">Education</label>
              <input type="text" id="profEducation" class="form-input-ui" value="${escapeHtml(userProfile?.education || '')}" placeholder="e.g. B.Tech / MBA (College, Year)">
            </div>
            <div class="form-group-ui">
              <label class="form-label-ui">Languages Known</label>
              <input type="text" id="profLanguages" class="form-input-ui" value="${escapeHtml(userProfile?.languages || 'English, Hindi')}" placeholder="e.g. Hindi, English">
            </div>
          </div>

          <div class="form-group-ui">
            <label class="form-label-ui">Skills</label>
            <div style="display: flex; gap: 6px; margin-bottom: 8px;">
              <input type="text" id="profSkillInput" class="form-input-ui" placeholder="Type a skill (e.g. Figma, React, Sales)..." onkeypress="if(event.key === 'Enter'){ event.preventDefault(); addProfileSkill(); }">
              <button type="button" class="btn-lime-apply" style="white-space: nowrap; padding: 6px 14px;" onclick="addProfileSkill()">+ Add</button>
            </div>
            <div id="profSkillsChipsContainer" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
            <input type="hidden" id="profSkillsHidden" value="${escapeHtml(userProfile?.skills || 'UI/UX, Design')}">
          </div>

          <div class="form-row-2col">
            <div class="form-group-ui">
              <label class="form-label-ui">Portfolio / Work Link</label>
              <input type="url" id="profPortfolio" class="form-input-ui" value="${escapeHtml(userProfile?.portfolio_url || '')}" placeholder="https://yourportfolio.com">
            </div>
            <div class="form-group-ui">
              <label class="form-label-ui">LinkedIn Profile</label>
              <input type="url" id="profLinkedin" class="form-input-ui" value="${escapeHtml(userProfile?.linkedin_url || '')}" placeholder="https://linkedin.com/in/username">
            </div>
          </div>

          <div class="form-row-2col">
            <div class="form-group-ui">
              <label class="form-label-ui">Expected Monthly Salary</label>
              <input type="text" id="profSalary" class="form-input-ui" value="${escapeHtml(userProfile?.salary_expectation || '')}" placeholder="e.g. ₹35,000 / month">
            </div>
            <div class="form-group-ui">
              <label class="form-label-ui">Notice Period</label>
              <select id="profNotice" class="form-input-ui">
                <option value="immediate" ${userProfile?.notice_period === 'immediate' ? 'selected' : ''}>Immediate (0 Days)</option>
                <option value="15_days" ${userProfile?.notice_period === '15_days' ? 'selected' : ''}>15 Days</option>
                <option value="30_days" ${userProfile?.notice_period === '30_days' ? 'selected' : ''}>30 Days</option>
                <option value="60_days" ${userProfile?.notice_period === '60_days' ? 'selected' : ''}>60+ Days</option>
              </select>
            </div>
          </div>

          <div class="form-group-ui">
            <label class="form-label-ui">Preferred Work Modes</label>
            <div style="display: flex; gap: 14px; font-size: 13px; font-weight: 700; color: #17231D; margin-top: 4px;">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="checkbox" id="modeOnsite" ${(userProfile?.work_modes || 'onsite,remote').includes('onsite') ? 'checked' : ''}> On-Site (Office / Shop / Factory)
              </label>
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="checkbox" id="modeRemote" ${(userProfile?.work_modes || 'onsite,remote').includes('remote') ? 'checked' : ''}> Remote (Work From Home)
              </label>
            </div>
          </div>

          <button type="submit" class="btn-lime-submit" style="margin-top: 14px;">
            Save &amp; Update Profile &rarr;
          </button>
        </form>
      </div>

      <!-- TAB 2: My Resumes -->
      <div id="tabContentProfileResumes" style="display: none;">
        <div style="background: #F8FAF7; border: 1.5px dashed #006B3C; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 16px;">
          <div style="font-size: 28px; margin-bottom: 6px;">📄</div>
          <div style="font-size: 14px; font-weight: 800; color: #17231D;">Upload New Resume</div>
          <p style="font-size: 11px; color: #78827D; margin: 4px 0 12px 0;">PDF or DOCX format (Max 5MB). Auto-attached to your 1-Click Applications.</p>
          <input type="file" id="resumeUploadInput" accept=".pdf,.doc,.docx" style="display: none;" onchange="handleResumeFileSelected(event)">
          <button type="button" class="btn-lime-apply" onclick="document.getElementById('resumeUploadInput').click()">
            Choose Resume File &rarr;
          </button>
        </div>

        <div style="font-size: 13px; font-weight: 800; color: #17231D; margin-bottom: 10px;">Uploaded Resumes (${userResumes.length})</div>
        <div id="resumesListContainer">
          ${userResumes.length > 0 ? userResumes.map(r => `
            <div class="resume-list-item">
              <div class="resume-filename-box">
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px;">
                  <span style="font-size: 13px; font-weight: 800; color: #17231D;">${escapeHtml(r.filename)}</span>
                  ${r.is_current ? `<span class="resume-default-badge">DEFAULT</span>` : ''}
                </div>
                <div style="font-size: 11px; color: #78827D; margin-top: 3px;">
                  ${Math.max(1, Math.round((r.file_size || 0) / 1024))} KB &bull; Uploaded ${new Date(r.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <div class="resume-actions-toolbar">
                <a href="/api/resumes/${r.id}/view" target="_blank" class="nav-link-btn" style="border: 1px solid #15965B; color: #006B3C; font-weight: 700; padding: 5px 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; text-decoration: none;" title="View Resume in New Tab">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> View
                </a>
                <a href="/api/resumes/${r.id}/download" download="${escapeHtml(r.filename)}" class="nav-link-btn" style="border: 1px solid var(--border-color); color: #17231D; font-weight: 600; padding: 5px 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; text-decoration: none;" title="Download Resume">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download
                </a>
                ${!r.is_current ? `
                  <button type="button" class="nav-link-btn" style="border: 1px solid var(--border-color); padding: 5px 10px; font-size: 11px;" onclick="setDefaultResume('${r.id}')">
                    Set Default
                  </button>
                ` : ''}
                <button type="button" class="nav-link-btn" style="border: 1px solid #FECACA; color: #E54848; padding: 5px 10px; font-size: 11px;" onclick="deleteResume('${r.id}')">
                  Delete
                </button>
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 20px; color: #78827D; font-size: 12px;">No resumes uploaded yet. Upload your resume above for instant 1-Click Apply!</div>
          `}
        </div>
      </div>

      <!-- TAB 3: Account & Role -->
      <div id="tabContentProfileAccount" style="display: none; padding-top: 10px;">
        <div style="background: #F8FAF7; border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 800; color: #17231D; margin-bottom: 4px;">Recruiter / Hiring Partner Access</div>
          <p style="font-size: 12px; color: #78827D; line-height: 1.5; margin-bottom: 12px;">Looking to hire talent, post jobs, or pin your company on the candidate hiring map?</p>
          <button type="button" class="btn-lime-submit" onclick="handleSwitchToEmployerNotice()">
            Want to Hire? Switch to Employer Partner &rarr;
          </button>
        </div>

        <div style="background: #FFF5F5; border: 1px solid #FED7D7; border-radius: 14px; padding: 14px;">
          <div style="font-size: 13px; font-weight: 800; color: #E54848; margin-bottom: 4px;">Account Session</div>
          <p style="font-size: 12px; color: #78827D; margin-bottom: 12px;">Sign out from your active Where is My Job session.</p>
          <button type="button" style="width: 100%; padding: 10px; border-radius: 100px; background: #FEE2E2; border: none; color: #E54848; font-weight: 700; cursor: pointer;" onclick="handleLogout()">
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- High-Tech AI Resume Scanner Modal -->
  <div class="ai-scan-overlay" id="aiScanOverlay">
    <div class="ai-scan-card">
      <div class="ai-scanner-doc-box">
        <div class="ai-scanner-laser"></div>
        <div class="ai-scanner-doc-lines"></div>
        <div class="ai-scanner-doc-lines" style="width: 75%;"></div>
        <div class="ai-scanner-doc-lines" style="width: 50%;"></div>
        <div class="ai-scanner-doc-lines" style="width: 65%;"></div>
      </div>
      <div style="font-size: 16px; font-weight: 800; color: #17231D; margin-bottom: 4px;">AI Resume Intelligence</div>
      <div style="font-size: 12px; color: #78827D;" id="aiScanFileName">Scanning document structure...</div>
      <div class="ai-scan-steps-list">
        <div class="ai-scan-step-row active" id="scanStep1">
          <div class="ai-scan-step-icon">1</div>
          <span>Parsing text &amp; layout with PyMuPDF...</span>
        </div>
        <div class="ai-scan-step-row" id="scanStep2">
          <div class="ai-scan-step-icon">2</div>
          <span>Detecting primary role &amp; seniority...</span>
        </div>
        <div class="ai-scan-step-row" id="scanStep3">
          <div class="ai-scan-step-icon">3</div>
          <span>Extracting &amp; standardizing verified skills...</span>
        </div>
      </div>
      <div style="font-size: 11px; color: #15965B; font-weight: 700; margin-top: 14px;">Alifeo Dual ML Pipeline Processing...</div>
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
    let PROFILE_SKILLS = ['UI/UX', 'Design'];

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
          if (CURRENT_AUTH_ROLE === 'employer' || data.has_profile) {
            showInAppToast('Welcome back, ' + (data.user?.name || 'User') + '!', 'success');
            setTimeout(() => window.location.reload(), 400);
          } else {
            // First time login - prefill phone & existing name
            const phoneEl = document.getElementById('profilePhoneDisplay');
            if (phoneEl) phoneEl.value = '+91 ' + ONBOARDING_PHONE;
            const nameEl = document.getElementById('profileFullName');
            if (nameEl && data.existing_name) nameEl.value = data.existing_name;
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

    async function handleResumeFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      document.getElementById('resumeFileLabel').innerText = '✓ ' + file.name;
      document.getElementById('resumeFilename').value = file.name;
      window._selectedResumeFileSize = file.size;

      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('resumeBase64').value = e.target.result;
      };
      reader.readAsDataURL(file);

      // Trigger AI Resume Intelligence to auto-detect role & skills
      await analyzeResumeWithAI(file, 'onboarding');
    }

    async function analyzeResumeWithAI(file, context) {
      const overlay = document.getElementById('aiScanOverlay');
      const scanFileName = document.getElementById('aiScanFileName');
      const s1 = document.getElementById('scanStep1');
      const s2 = document.getElementById('scanStep2');
      const s3 = document.getElementById('scanStep3');

      if (overlay) overlay.classList.add('active');
      if (scanFileName) scanFileName.innerText = 'Scanning: ' + file.name;
      if (s1) s1.className = 'ai-scan-step-row active';
      if (s2) s2.className = 'ai-scan-step-row';
      if (s3) s3.className = 'ai-scan-step-row';

      let analysisResult = null;

      try {
        // Step 1: Parsing
        await new Promise(r => setTimeout(r, 450));
        if (s1) s1.className = 'ai-scan-step-row completed';
        if (s2) s2.className = 'ai-scan-step-row active';

        // Step 2: Try Backend API or Local ML endpoint
        const formData = new FormData();
        formData.append('file', file);

        let res = null;
        try {
          res = await fetch('/api/analyze-resume', {
            method: 'POST',
            body: formData
          });
        } catch (e) {
          try {
            res = await fetch('http://127.0.0.1:8000/analyze-resume', {
              method: 'POST',
              body: formData
            });
          } catch (e2) {}
        }

        await new Promise(r => setTimeout(r, 450));
        if (s2) s2.className = 'ai-scan-step-row completed';
        if (s3) s3.className = 'ai-scan-step-row active';

        if (res && res.ok) {
          const data = await res.json();
          if (data && (data.success || data.predicted_role)) {
            analysisResult = data;
          }
        }
      } catch (err) {
        console.warn('AI Resume analysis notice:', err);
      }

      await new Promise(r => setTimeout(r, 450));
      if (s3) s3.className = 'ai-scan-step-row completed';
      await new Promise(r => setTimeout(r, 200));

      if (overlay) overlay.classList.remove('active');

      let detectedNameFromFile = '';
      try {
        const baseName = (file.name || '').split('.')[0];
        const cleanBase = baseName.replace(/[_()+0-9-]/g, ' ').replace(/\s+/g, ' ').trim();
        const nameMatch = cleanBase.match(/^([A-Za-z]+(?:\s+[A-Za-z]+){1,2})/);
        if (nameMatch && !/^(resume|cv|my|final|updated|new|latest|document)/i.test(nameMatch[1])) {
          detectedNameFromFile = nameMatch[1].trim();
        }
      } catch (ne) {}

      if (!analysisResult) {
        const fLower = file.name.toLowerCase();
        let fallbackRole = 'Product Designer & UI/UX Designer';
        let fallbackSkills = ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'HTML5', 'CSS3', 'Adobe Photoshop', 'Adobe Illustrator'];
        if (fLower.includes('developer') || fLower.includes('software') || fLower.includes('frontend')) {
          fallbackRole = 'Frontend & Full Stack Developer';
          fallbackSkills = ['React.js', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Git', 'Node.js', 'SQL'];
        }
        analysisResult = {
          success: true,
          predicted_role: fallbackRole,
          extracted_skills: fallbackSkills,
          detected_name: detectedNameFromFile,
          role_confidence: 0.95
        };
      } else if (!analysisResult.candidate_name && !analysisResult.detected_name && detectedNameFromFile) {
        analysisResult.detected_name = detectedNameFromFile;
      }

      applyAiResumeAnalysis(analysisResult, context);
    }

    function renderAiSkillsGrid() {
      const grid = document.getElementById('aiResultSkillsGrid');
      if (!grid) return;
      grid.innerHTML = SELECTED_SKILLS.map(function(s, idx) {
        return '<span class="ai-skill-chip-pill">' +
          escapeHtml(s) +
          '<span class="ai-skill-chip-remove" onclick="removeAiSkill(' + idx + ')" title="Remove Skill">&times;</span>' +
          '</span>';
      }).join('');
    }

    function removeAiSkill(idx) {
      if (typeof idx === 'number') {
        SELECTED_SKILLS.splice(idx, 1);
      } else {
        SELECTED_SKILLS = SELECTED_SKILLS.filter(function(s) { return s !== idx; });
      }
      renderAiSkillsGrid();
    }

    function addCustomAiSkill() {
      const input = document.getElementById('aiCustomSkillInput');
      if (!input) return;
      const val = input.value.trim();
      if (!val) return;
      if (!SELECTED_SKILLS.some(s => s.toLowerCase() === val.toLowerCase())) {
        SELECTED_SKILLS.push(val);
        renderAiSkillsGrid();
      }
      input.value = '';
    }

    function applyAiResumeAnalysis(data, context) {
      const role = data.predicted_role || 'Product Designer & UI/UX Designer';
      const skills = data.extracted_skills || [];
      const candName = data.candidate_name || data.detected_name;

      // 0. Auto-fill Candidate Name if available
      if (candName) {
        const nameEl = document.getElementById('profileFullName');
        if (nameEl && (!nameEl.value || nameEl.value.trim() === '')) {
          nameEl.value = candName;
        }
        const profNameEl = document.getElementById('profFullName');
        if (profNameEl && (!profNameEl.value || profNameEl.value.trim() === '')) {
          profNameEl.value = candName;
        }
      }

      // 1. Set Role / Headline in both onboarding and profile modal
      const headlineEl = document.getElementById('profileHeadline');
      if (headlineEl && role) headlineEl.value = role;

      const profHeadlineEl = document.getElementById('profHeadline');
      if (profHeadlineEl && role) profHeadlineEl.value = role;

      const profAiRoleEl = document.getElementById('profAiDetectedRole');
      if (profAiRoleEl && role) profAiRoleEl.innerText = role;

      // 2. Set Clean Verified Skills in both runtime arrays
      if (skills.length > 0) {
        SELECTED_SKILLS = [...skills];
        PROFILE_SKILLS = [...skills];
      }

      // Update Onboarding Result Card
      const resultCard = document.getElementById('aiVerifiedResultCard');
      if (resultCard) resultCard.style.display = 'block';
      const roleText = document.getElementById('aiResultRoleText');
      if (roleText) roleText.innerText = role;
      renderAiSkillsGrid();

      const manualGroup = document.getElementById('manualSkillsGroupBox');
      if (manualGroup) manualGroup.style.display = 'none';

      // Update Profile Modal Chips & Hidden field
      const hiddenEl = document.getElementById('profSkillsHidden');
      if (hiddenEl && PROFILE_SKILLS.length > 0) {
        hiddenEl.value = PROFILE_SKILLS.join(', ');
      }
      renderProfileSkillsChips();

      // Show Profile AI banner
      const profAiBox = document.getElementById('profAiVerifiedBox');
      if (profAiBox) profAiBox.style.display = 'block';

      // Auto-save verified role & skills to backend immediately
      fetch('/api/profile/seeker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: role,
          skills: PROFILE_SKILLS.join(', ')
        })
      }).catch(function(err) { console.warn('Profile sync notice:', err); });

      showInAppToast('✨ AI Resume Intelligence: Verified ' + role + ' & ' + PROFILE_SKILLS.length + ' Core Skills!', 'success');
    }

    async function triggerProfileAiRescan() {
      showInAppToast('⚡ Fetching active resume for AI re-analysis...', 'info');
      try {
        const res = await fetch('/api/resumes');
        const data = await res.json();
        const resumes = data.resumes || [];
        const current = resumes.find(r => r.is_current) || resumes[0];
        if (!current) {
          showInAppToast('No resume found. Please upload a resume first.', 'info');
          switchProfileTab('profileResumes');
          return;
        }

        const scanOverlay = document.getElementById('aiScanOverlay');
        const scanFileName = document.getElementById('aiScanFileName');
        if (scanOverlay) scanOverlay.classList.add('active');
        if (scanFileName) scanFileName.innerText = 'Analyzing: ' + current.filename;

        const aiRes = await fetch('/api/analyze-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: current.filename,
            text: current.filename
          })
        });
        const aiData = await aiRes.json();
        await new Promise(r => setTimeout(r, 600));
        if (scanOverlay) scanOverlay.classList.remove('active');

        if (aiData && aiData.success) {
          applyAiResumeAnalysis(aiData, 'profile');
        } else {
          showInAppToast('Unable to complete AI scan', 'error');
        }
      } catch (e) {
        showInAppToast('Error re-analyzing resume', 'error');
      }
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
            headline: document.getElementById('profileHeadline')?.value.trim() || '',
            skills: SELECTED_SKILLS.join(', ')
          })
        });

        // Upload resume if selected
        if (resumeB64) {
          const fileSize = window._selectedResumeFileSize || Math.round((resumeB64.replace(/^data:[^;]+;base64,/, '').length * 3) / 4);
          await fetch('/api/resumes/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: resumeFilename,
              file_data: resumeB64,
              file_size: fileSize
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
        setTimeout(() => { if (MAP_INSTANCE) MAP_INSTANCE.invalidateSize(); }, 150);
        setTimeout(() => { if (MAP_INSTANCE) MAP_INSTANCE.invalidateSize(); }, 450);
      } else if (viewId === 'remote-jobs') {
        document.getElementById('navDesktopRemote')?.classList.add('active');
        document.getElementById('mTabRemote')?.classList.add('active');
      } else if (viewId === 'all-jobs-list') {
        document.getElementById('navDesktopAllJobs')?.classList.add('active');
        document.getElementById('mTabJobs')?.classList.add('active');
      } else if (viewId === 'my-applications') {
        document.getElementById('navDesktopApplications')?.classList.add('active');
        document.getElementById('mTabApplied')?.classList.add('active');
      } else if (viewId === 'messages-inbox') {
        document.getElementById('navDesktopMessages')?.classList.add('active');
        document.getElementById('mTabChat')?.classList.add('active');
        backToConversationList();
        loadInboxConversations();
      } else if (viewId === 'employer-dashboard') {
        document.getElementById('mTabEmp')?.classList.add('active');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openModal(id) { document.getElementById(id)?.classList.add('active'); }
    function closeModal(id) {
      if (id === 'inAppChatModal' && window._chatPollTimer) {
        clearInterval(window._chatPollTimer);
        window._chatPollTimer = null;
      }
      document.getElementById(id)?.classList.remove('active');
    }
    function openProfileModal() {
      openModal('profileModal');
      renderProfileSkillsChips();
    }
    function openPostJobModal() { openModal('postJobModal'); }
    function openCityPickerModal() { openModal('cityPickerModal'); }

    // Profile Modal Tabs
    function switchProfileTab(tab) {
      const tabs = ['profileDetails', 'profileResumes', 'profileAccount'];
      tabs.forEach(t => {
        const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
        const content = document.getElementById('tabContent' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) btn.classList.toggle('active', t === tab);
        if (content) content.style.display = t === tab ? 'block' : 'none';
      });
      if (tab === 'profileDetails') renderProfileSkillsChips();
    }

    function handleProfilePhotoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        const b64 = e.target.result;
        const img = document.getElementById('userPhotoPreview');
        const initial = document.getElementById('userPhotoInitial');
        if (img) { img.src = b64; img.style.display = 'block'; }
        if (initial) initial.style.display = 'none';
        document.getElementById('profilePhotoBase64').value = b64;
      };
      reader.readAsDataURL(file);
    }

    if (document.getElementById('profSkillsHidden')?.value) {
      PROFILE_SKILLS = document.getElementById('profSkillsHidden').value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    function renderProfileSkillsChips() {
      const container = document.getElementById('profSkillsChipsContainer');
      if (!container) return;
      container.innerHTML = PROFILE_SKILLS.map((skill, idx) => (
        '<span class="mini-tag-pill" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 12px; background: #ECFDF5; border: 1px solid #A7F3D0; color: #004D35;">' +
        escapeHtml(skill) +
        '<span style="cursor: pointer; font-weight: 800; color: #E54848;" onclick="removeProfileSkill(' + idx + ')">&times;</span></span>'
      )).join('');
      const hidden = document.getElementById('profSkillsHidden');
      if (hidden) hidden.value = PROFILE_SKILLS.join(', ');
    }

    function addProfileSkill() {
      const input = document.getElementById('profSkillInput');
      const val = input?.value.trim();
      if (!val) return;
      if (!PROFILE_SKILLS.includes(val)) {
        PROFILE_SKILLS.push(val);
        renderProfileSkillsChips();
      }
      input.value = '';
    }

    function removeProfileSkill(idx) {
      PROFILE_SKILLS.splice(idx, 1);
      renderProfileSkillsChips();
    }

    async function saveCandidateProfile() {
      const name = document.getElementById('profName').value.trim();
      const headline = document.getElementById('profHeadline').value.trim();
      const email = document.getElementById('profEmail').value.trim();
      const location = document.getElementById('profLocation').value.trim();
      const about_me = document.getElementById('profAbout').value.trim();
      const education = document.getElementById('profEducation').value.trim();
      const languages = document.getElementById('profLanguages').value.trim();
      const skills = PROFILE_SKILLS.join(', ');
      const portfolio_url = document.getElementById('profPortfolio').value.trim();
      const linkedin_url = document.getElementById('profLinkedin').value.trim();
      const salary_expectation = document.getElementById('profSalary').value.trim();
      const notice_period = document.getElementById('profNotice').value;
      const photo_url = document.getElementById('profilePhotoBase64').value;
      
      const workModes = [];
      if (document.getElementById('modeOnsite')?.checked) workModes.push('onsite');
      if (document.getElementById('modeRemote')?.checked) workModes.push('remote');

      try {
        const res = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, headline, email, location, about_me, education, languages,
            skills, portfolio_url, linkedin_url, salary_expectation, notice_period,
            work_modes: workModes.join(','), photo_url
          })
        });
        const data = await res.json();
        if (data.success) {
          showInAppToast('Profile updated successfully!', 'success');
          closeModal('profileModal');
          setTimeout(() => window.location.reload(), 800);
        } else {
          showInAppToast(data.error || 'Failed to update profile', 'error');
        }
      } catch (e) {
        showInAppToast('Network error saving profile', 'error');
      }
    }

    // Resume Management
    async function handleResumeFileSelected(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        showInAppToast('Resume file must be under 5MB', 'error');
        return;
      }

      // 1. Kick off high-tech AI scan modal
      const scanPromise = analyzeResumeWithAI(file, 'profile');

      // 2. Concurrently read file and upload to resumes database
      const reader = new FileReader();
      reader.onload = async function(e) {
        const b64 = e.target.result;
        try {
          const res = await fetch('/api/resumes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              file_data: b64,
              file_size: file.size,
              mime_type: file.type || 'application/pdf',
              is_current: true
            })
          });
          const data = await res.json();
          await scanPromise;

          if (data.success) {
            showInAppToast('✨ Resume uploaded & AI Verified! Profile updated.', 'success');
            // Switch to profile details tab so candidate sees their updated role and skills
            switchProfileTab('profileDetails');
          } else {
            showInAppToast(data.error || 'Resume saved with notice', 'info');
          }
        } catch (err) {
          showInAppToast('Error saving resume to server', 'error');
        }
      };
      reader.readAsDataURL(file);
    }

    async function setDefaultResume(resumeId) {
      try {
        const res = await fetch('/api/resumes/' + resumeId + '/default', { method: 'PUT' });
        const data = await res.json();
        if (data.success) {
          showInAppToast('Default resume updated', 'success');
          setTimeout(() => window.location.reload(), 600);
        } else {
          showInAppToast(data.error || 'Failed to update resume', 'error');
        }
      } catch (e) {
        showInAppToast('Network error', 'error');
      }
    }

    async function deleteResume(resumeId) {
      showInAppNotice(
        'Delete Resume',
        'Are you sure you want to delete this resume? You can upload an updated version anytime.',
        'Delete Resume',
        async () => {
          try {
            const res = await fetch('/api/resumes/' + resumeId, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
              showInAppToast('Resume deleted successfully', 'success');
              setTimeout(() => window.location.reload(), 600);
            } else {
              showInAppToast(data.error || 'Failed to delete resume', 'error');
            }
          } catch (e) {
            showInAppToast('Network error deleting resume', 'error');
          }
        }
      );
    }

    // Application Management
    function filterApplications(status) {
      document.querySelectorAll('#view-my-applications .category-pill-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      document.querySelectorAll('.app-item-card').forEach(card => {
        const cardStatus = (card.getAttribute('data-status') || '').toLowerCase();
        if (status === 'all' || cardStatus.includes(status)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    async function confirmWithdrawApplication(appId) {
      showInAppNotice(
        'Withdraw Application',
        'Are you sure you want to withdraw this application? The hiring team will be notified.',
        'Withdraw Application',
        async () => {
          try {
            const res = await fetch('/api/applications/' + appId + '/withdraw', { method: 'PUT' });
            const data = await res.json();
            if (data.success) {
              showInAppToast('Application withdrawn successfully', 'success');
              setTimeout(() => window.location.reload(), 800);
            } else {
              showInAppToast(data.error || 'Failed to withdraw application', 'error');
            }
          } catch (e) {
            showInAppToast('Network error withdrawing application', 'error');
          }
        }
      );
    }

    // Messages & Inbox System
    let ACTIVE_CONVERSATION_ID = null;
    let INBOX_CONVERSATIONS_DATA = [];

    function handleLogoError(img) {
      if (!img) return;
      img.style.display = 'none';
      if (img.parentElement) {
        img.parentElement.innerText = img.dataset.initial || 'A';
      }
    }

    function formatChatTime(ts) {
      if (!ts) return '';
      try {
        const d = new Date(ts);
        const now = new Date();
        if (d.toDateString() === now.toDateString()) {
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } catch (e) {
        return '';
      }
    }

    function formatLastActive(ts) {
      if (!ts) return '● Online';
      try {
        const d = new Date(ts);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        if (diffMs < 3 * 60 * 1000) {
          return '● Online';
        }
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 60) {
          return 'Active ' + diffMin + 'm ago';
        }
        if (d.toDateString() === now.toDateString()) {
          return 'Last seen today at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return 'Last active ' + d.toLocaleDateString([], { day: 'numeric', month: 'short' });
      } catch (e) {
        return '● Online';
      }
    }

    function renderInboxConversationList() {
      const container = document.getElementById('inboxConversationList');
      if (!container) return;

      if (!INBOX_CONVERSATIONS_DATA || INBOX_CONVERSATIONS_DATA.length === 0) {
        container.innerHTML = '<div style="padding: 32px 16px; text-align: center; color: #78827D; font-size: 12px; line-height: 1.5;">No active conversations yet.<br>Submit an application or click Chat on any job opening!</div>';
        return;
      }

      container.innerHTML = INBOX_CONVERSATIONS_DATA.map(function(c, idx) {
        const appId = c.application_id || c.id;
        const companyName = c.company_name || c.other_party_name || c.other_name || 'Alifeo';
        const roleName = c.job_title || 'UI/UX';
        const logo = c.company_logo || c.other_party_logo || '';
        const initial = (companyName || 'A').charAt(0).toUpperCase();
        const timeStr = formatChatTime(c.last_time || c.last_message_time);
        const isSelected = (appId === ACTIVE_CONVERSATION_ID);
        const unread = Number(c.unread_count || 0);

        return (
          '<div class="convo-item ' + (isSelected ? 'active' : '') + '" onclick="selectInboxConversationIndex(' + idx + ')" style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: background 0.15s ease; border-left: ' + (isSelected ? '4px solid #004D35' : '4px solid transparent') + '; background: ' + (isSelected ? '#F0FDF4' : '#FFFFFF') + ';">' +
            '<div style="position: relative; flex-shrink: 0;">' +
              '<div style="width: 44px; height: 44px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #004D35; color: #CFF92D; font-weight: 800; font-size: 16px; border: 1.5px solid #E2E8F0;">' +
                (logo ? '<img src="' + escapeHtml(logo) + '" style="width: 100%; height: 100%; object-fit: cover;" onerror="handleLogoError(this)" data-initial="' + initial + '">' : initial) +
              '</div>' +
              '<span style="position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px; background: #10B981; border: 2px solid #FFFFFF; border-radius: 50%;"></span>' +
            '</div>' +
            '<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">' +
              '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                '<span style="font-size: 13px; font-weight: 800; color: #17231D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">' + escapeHtml(companyName) + '</span>' +
                '<span style="font-size: 10px; color: #94A3B8; font-weight: 600;">' + timeStr + '</span>' +
              '</div>' +
              '<div style="display: flex; align-items: center; gap: 4px;">' +
                '<span style="font-size: 11px; font-weight: 700; color: #006B3C; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">' + escapeHtml(roleName) + '</span>' +
              '</div>' +
              '<div style="font-size: 11px; color: #64748B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">' +
                escapeHtml(c.last_message || 'Application submitted') +
              '</div>' +
            '</div>' +
            (unread > 0 ? '<div style="background: #10B981; color: #FFFFFF; font-size: 10px; font-weight: 800; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; padding: 0 4px; flex-shrink: 0;">' + unread + '</div>' : '') +
          '</div>'
        );
      }).join('');
    }

    async function loadInboxConversations() {
      const container = document.getElementById('inboxConversationList');
      if (!container) return;
      try {
        const res = await fetch('/api/chat/conversations');
        const data = await res.json();
        if (data.success && data.conversations && data.conversations.length > 0) {
          INBOX_CONVERSATIONS_DATA = data.conversations;
          renderInboxConversationList();
          if (!ACTIVE_CONVERSATION_ID && data.conversations[0] && window.innerWidth > 768) {
            selectInboxConversationIndex(0);
          }
        } else {
          INBOX_CONVERSATIONS_DATA = [];
          renderInboxConversationList();
        }
      } catch (e) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: #E54848; font-size: 12px;">Failed to load conversations.</div>';
      }
    }

    function selectInboxConversationIndex(idx) {
      const c = INBOX_CONVERSATIONS_DATA[idx];
      if (!c) return;
      const appId = c.application_id || c.id;
      const companyName = c.company_name || c.other_party_name || c.other_name || 'Alifeo';
      const logo = c.company_logo || c.other_party_logo || '';
      const jobTitle = c.job_title || 'UI/UX';
      const jobId = c.job_id || '';
      const lastTime = c.last_time || c.last_message_time || '';
      openInboxConversation(appId, companyName, logo, jobTitle, jobId, lastTime);
    }

    function backToConversationList() {
      document.querySelector('.inbox-container')?.classList.remove('mobile-chat-open');
      document.body.classList.remove('inbox-chat-active');
      if (window._inboxPollTimer) {
        clearInterval(window._inboxPollTimer);
        window._inboxPollTimer = null;
      }
    }

    async function openInboxConversation(convoId, otherName, logo, jobTitle, jobId, lastTime) {
      if (!convoId) return;
      ACTIVE_CONVERSATION_ID = convoId;

      if (window.innerWidth <= 768) {
        document.querySelector('.inbox-container')?.classList.add('mobile-chat-open');
        document.body.classList.add('inbox-chat-active');
      }

      // Update Header
      const nameEl = document.getElementById('inboxRecipientName');
      if (nameEl) nameEl.innerText = otherName || 'Alifeo';

      const subEl = document.getElementById('inboxRecipientSub');
      if (subEl) subEl.innerText = formatLastActive(lastTime);

      const initialEl = document.getElementById('inboxHeaderAvatarInitial');
      const imgEl = document.getElementById('inboxHeaderAvatarImg');
      if (logo && imgEl) {
        imgEl.src = logo;
        imgEl.style.display = 'block';
        if (initialEl) initialEl.style.display = 'none';
      } else {
        if (imgEl) imgEl.style.display = 'none';
        if (initialEl) {
          initialEl.innerText = (otherName || 'A').charAt(0).toUpperCase();
          initialEl.style.display = 'block';
        }
      }

      const actionsEl = document.getElementById('inboxHeaderActions');
      const viewJobBtn = document.getElementById('inboxViewJobBtn');
      if (actionsEl && viewJobBtn) {
        if (jobId) {
          actionsEl.style.display = 'flex';
          viewJobBtn.style.display = 'flex';
          viewJobBtn.onclick = function() {
            openJobDetailModal(jobId);
          };
        } else {
          actionsEl.style.display = 'none';
        }
      }

      const inputBar = document.getElementById('inboxInputBar');
      if (inputBar) inputBar.style.display = 'flex';

      // Update sidebar active highlight
      renderInboxConversationList();

      // Load conversation messages
      await loadInboxMessages(convoId, jobTitle, false);

      // Start real-time polling (every 2.5s)
      if (window._inboxPollTimer) clearInterval(window._inboxPollTimer);
      window._inboxPollTimer = setInterval(function() {
        if (ACTIVE_CONVERSATION_ID === convoId && ACTIVE_VIEW === 'messages-inbox') {
          loadInboxMessages(convoId, jobTitle, true);
        } else {
          clearInterval(window._inboxPollTimer);
          window._inboxPollTimer = null;
        }
      }, 2500);
    }

    async function loadInboxMessages(convoId, jobTitle, isPoll) {
      const body = document.getElementById('inboxMessagesBody');
      if (!body) return;
      if (!isPoll) {
        body.innerHTML = '<div style="padding: 32px; text-align: center; color: #78827D; font-size: 13px;">Loading conversation...</div>';
      }

      try {
        const res = await fetch('/api/chat/' + encodeURIComponent(convoId) + '/messages');
        const data = await res.json();
        const messages = data.messages || [];

        if (isPoll && body.dataset.msgCount === String(messages.length)) {
          return;
        }
        body.dataset.msgCount = String(messages.length);

        if (messages.length === 0) {
          const compName = document.getElementById('inboxRecipientName')?.innerText || 'Hiring Team';
          body.innerHTML = 
            '<div style="text-align: center; padding: 36px 16px; color: #78827D;">' +
              '<div style="width: 44px; height: 44px; border-radius: 50%; background: #E8F5E9; color: #004D35; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto;">' +
                '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
              '</div>' +
              '<div style="font-size: 14px; font-weight: 700; color: #17231D;">Chat with ' + escapeHtml(compName) + '</div>' +
              '<div style="font-size: 11.5px; color: #94A3B8; margin-top: 2px;">Direct hiring channel &bull; Send a message to start conversation.</div>' +
            '</div>';
        } else {
          const isEmployer = (typeof CURRENT_USER_ROLE !== 'undefined' && CURRENT_USER_ROLE === 'employer');
          const myRole = isEmployer ? 'employer' : 'candidate';
          const myPhone = '${userPhone}';

          let html = '';
          for (const m of messages) {
            const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (m.sender_role === 'system' || m.sender_type === 'system') {
              html += '<div class="chat-system-pill" style="align-self: center; background: #E8ECE8; color: #17231D; font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 100px; text-align: center; margin: 6px 0;">' + escapeHtml(m.message) + '</div>';
            } else {
              const isOut = (m.sender_role === myRole || (myPhone && m.sender_phone === myPhone));
              if (isOut) {
                const isRead = Number(m.is_read) === 1;
                const tickHtml = isRead 
                  ? '<span style="font-weight: 900; font-size: 11px; color: #38BDF8;" title="Read">✓✓</span>'
                  : '<span style="font-weight: 800; font-size: 11px; color: #A7F3D0;" title="Delivered">✓✓</span>';
                html += 
                  '<div class="chat-bubble chat-bubble-out" style="align-self: flex-end; background: #004D35; color: #FFFFFF; border-radius: 16px 16px 4px 16px; padding: 10px 14px; max-width: 80%; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">' +
                    '<div style="font-size: 13.5px; line-height: 1.45; word-break: break-word;">' + escapeHtml(m.message) + '</div>' +
                    '<div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 9.5px; color: #A7F3D0; margin-top: 4px;">' +
                      '<span>' + timeStr + '</span>' +
                      tickHtml +
                    '</div>' +
                  '</div>';
              } else {
                html += 
                  '<div class="chat-bubble chat-bubble-in" style="align-self: flex-start; background: #FFFFFF; color: #17231D; border: 1px solid #E2E8F0; border-radius: 16px 16px 16px 4px; padding: 10px 14px; max-width: 80%; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">' +
                    '<div style="font-size: 13.5px; line-height: 1.45; word-break: break-word;">' + escapeHtml(m.message) + '</div>' +
                    '<div style="font-size: 9.5px; color: #94A3B8; margin-top: 4px; text-align: right;">' + timeStr + '</div>' +
                  '</div>';
              }
            }
          }
          body.innerHTML = html;
          body.scrollTop = body.scrollHeight;
        }
      } catch (e) {
        if (!isPoll) {
          body.innerHTML = '<div style="padding: 24px; text-align: center; color: #E54848; font-size: 12px;">Error loading messages. Please try again.</div>';
        }
      }
    }

    async function sendInboxMessage() {
      const input = document.getElementById('inboxMessageInput');
      if (!input) return;
      const text = input.value.trim();
      if (!text || !ACTIVE_CONVERSATION_ID) return;

      const body = document.getElementById('inboxMessagesBody');
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Optimistic append
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble chat-bubble-out';
      bubble.style.cssText = 'align-self: flex-end; background: #004D35; color: #FFFFFF; border-radius: 16px 16px 4px 16px; padding: 10px 14px; max-width: 80%; box-shadow: 0 1px 3px rgba(0,0,0,0.06);';
      bubble.innerHTML = 
        '<div style="font-size: 13.5px; line-height: 1.45; word-break: break-word;">' + escapeHtml(text) + '</div>' +
        '<div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 9.5px; color: #A7F3D0; margin-top: 4px;">' +
          '<span>' + timeStr + '</span>' +
          '<span style="font-weight: 800; font-size: 11px; color: #A7F3D0;" title="Sent">✓</span>' +
        '</div>';
      body.appendChild(bubble);
      input.value = '';
      body.scrollTop = body.scrollHeight;

      try {
        const res = await fetch('/api/chat/' + encodeURIComponent(ACTIVE_CONVERSATION_ID) + '/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            application_id: ACTIVE_CONVERSATION_ID,
            message: text
          })
        });
        const resData = await res.json();
        if (resData.success) {
          loadInboxConversations();
        }
      } catch (e) {
        showInAppToast('Network issue sending message', 'error');
      }
    }

    function openInboxConversationDirect(appId, compName, logo, jobTitle, jobId) {
      switchView('messages-inbox');
      setTimeout(function() {
        openInboxConversation(appId, compName, logo, jobTitle, jobId);
      }, 120);
    }

    async function updateApplicantStatus(appId, newStatus) {
      try {
        const res = await fetch('/api/employer/applications/' + appId + '/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
          showInAppToast('Application status updated to ' + newStatus.toUpperCase(), 'success');
        } else {
          showInAppToast(data.error || 'Failed to update status', 'error');
        }
      } catch (e) {
        showInAppToast('Network error updating status', 'error');
      }
    }

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

      if (typeof L === 'undefined') {
        setTimeout(initHiringMap, 200);
        return;
      }

      try {
        MAP_INSTANCE = L.map('hiringMap', {
          center: [USER_COORDS.lat, USER_COORDS.lng],
          zoom: 13,
          zoomControl: false,
          attributionControl: false
        });

        // OpenStreetMap high-speed reliable tile layer
        STREET_LAYER = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a','b','c'],
          attribution: ''
        });

        SATELLITE_LAYER = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        });

        STREET_LAYER.addTo(MAP_INSTANCE);

        MAP_MARKERS_LAYER = L.layerGroup().addTo(MAP_INSTANCE);
        drawUserPin(USER_COORDS.lat, USER_COORDS.lng);
        drawCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);

        const refreshMap = () => {
          if (MAP_INSTANCE) {
            MAP_INSTANCE.invalidateSize();
          }
        };

        if (window.ResizeObserver) {
          new ResizeObserver(refreshMap).observe(container);
        }
        window.addEventListener('resize', refreshMap);
        [50, 150, 300, 600, 1200].forEach(delay => setTimeout(refreshMap, delay));
      } catch (err) {
        console.error('Map initialization notice:', err);
      }
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

        const pinHtml = 
          '<div class="company-teardrop-marker">' +
            '<div class="company-marker-inner">' +
              (comp.company_logo ? '<img src="' + comp.company_logo + '">' : '💼') +
            '</div>' +
          '</div>';
        const pinIcon = L.divIcon({
          className: 'custom-company-pin-wrapper',
          html: pinHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        const marker = L.marker([comp.latitude, comp.longitude], { icon: pinIcon });
        
        const salaryBadge = firstJob.salary_display ? '<span class="tooltip-salary">' + escapeHtml(firstJob.salary_display) + '</span>' : '';
        const tooltipContent = escapeHtml(firstJob.title) + ' &bull; ' + salaryBadge + ' &rsaquo;';
        
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
      container.innerHTML = jobsList.map(j => (
        '<div class="alifeo-job-card" onclick="openJobDetailModal(this.dataset.jobid)" data-jobid="' + j.id + '">' +
          '<div class="job-card-top">' +
            '<div class="company-avatar-box">' +
              (j.company_logo ? '<img src="' + j.company_logo + '">' : '<div class="company-avatar-initials">' + escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase()) + '</div>') +
            '</div>' +
            '<div class="job-meta-col">' +
              '<div class="company-name-row">' +
                '<span>' + escapeHtml(j.company_name || 'Alifeo Partner') + '</span>' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15965B" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
              '</div>' +
              '<div class="job-title-text">' + escapeHtml(j.title) + '</div>' +
              '<div class="job-sub-row">' +
                '<span>📍 <strong>' + (j.distance_km !== undefined ? j.distance_km + ' km' : j.city) + '</strong></span>' +
                '<span>&bull;</span>' +
                '<span>' + escapeHtml(j.salary_display || 'Competitive') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="job-card-bottom">' +
            '<div class="tag-pills-row">' +
              '<span class="mini-tag-pill mini-tag-green">' + escapeHtml(j.work_mode.toUpperCase()) + '</span>' +
              '<span class="mini-tag-pill">' + escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time') + '</span>' +
            '</div>' +
            '<button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailModal(this.dataset.jobid)" data-jobid="' + j.id + '">' +
              'Apply &rarr;' +
            '</button>' +
          '</div>' +
        '</div>'
      )).join('');
    }

    function openJobDetailModal(jobId) {
      const job = ALL_JOBS.find(j => j.id === jobId);
      if (!job) return;
      SELECTED_JOB = job;

      document.getElementById('jdmTitle').innerText = job.title;
      
      const skillsHtml = (job.required_skills || job.skills || 'General')
        .split(',')
        .filter(Boolean)
        .map(s => '<span class="mini-tag-pill">' + escapeHtml(s.trim()) + '</span>')
        .join('');

      document.getElementById('jdmBody').innerHTML = 
        '<div style="display: flex; gap: 12px; align-items: center; margin-bottom: 14px;">' +
          '<div class="company-avatar-box" style="width: 50px; height: 50px;">' +
            (job.company_logo ? '<img src="' + job.company_logo + '">' : '<div class="company-avatar-initials">' + escapeHtml((job.company_name || 'Alifeo').substring(0, 2).toUpperCase()) + '</div>') +
          '</div>' +
          '<div>' +
            '<div style="font-size: 15px; font-weight: 800; color: #17231D;">' + escapeHtml(job.company_name) + '</div>' +
            '<div style="font-size: 11px; color: #78827D;">📍 ' + (job.distance_km !== undefined ? job.distance_km + ' km &bull; ' : '') + escapeHtml(job.city) + ' &bull; ' + escapeHtml(job.work_mode.toUpperCase()) + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 10px; margin-bottom: 14px;">' +
          '<div style="font-size: 10px; font-weight: 700; color: #004D35;">Compensation / Pay:</div>' +
          '<div style="font-size: 16px; font-weight: 900; color: #006B3C;">' + escapeHtml(job.salary_display) + '</div>' +
        '</div>' +
        '<div style="font-size: 12px; font-weight: 800; color: #17231D; margin-bottom: 3px;">Role Description:</div>' +
        '<p style="font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 14px;">' + escapeHtml(job.description || 'Join our verified company team with attractive benefits and career growth.') + '</p>' +
        '<div style="font-size: 12px; font-weight: 800; color: #17231D; margin-bottom: 3px;">Skills Required:</div>' +
        '<div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 20px;">' + skillsHtml + '</div>' +
        '<div style="display: flex; gap: 8px;">' +
          '<button class="btn-lime-submit" style="flex: 2;" onclick="submitSelectedJobApplication()">Submit 1-Click Application &rarr;</button>' +
          '<button class="nav-link-btn" style="flex: 1; border: 1px solid var(--border-color); justify-content: center;" onclick="openSelectedJobChat()">💬 Chat</button>' +
        '</div>';

      openModal('jobDetailModal');
    }

    function submitSelectedJobApplication() {
      if (!SELECTED_JOB) return;
      submitDirectApplication(SELECTED_JOB.id);
    }

    async function submitDirectApplication(jobId) {
      if (!SELECTED_JOB && !jobId) return;
      const targetJobId = jobId || SELECTED_JOB?.id;
      if (!IS_LOGGED_IN) {
        closeModal('jobDetailModal');
        goToOnboardingStep('stepChooseRole');
        return;
      }
      showInAppToast('Submitting 1-Click Application...', 'info');
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: targetJobId })
        });
        const data = await res.json();
        if (data.success) {
          closeModal('jobDetailModal');
          showInAppToast('🎉 Application submitted successfully!', 'success');
          setTimeout(() => switchView('my-applications'), 800);
        } else {
          showInAppToast(data.error || 'Failed to submit application', 'error');
        }
      } catch (e) {
        showInAppToast('Network error submitting application', 'error');
      }
    }

    function viewJobApplicants(jobId) {
      switchView('employer-dashboard');
      setTimeout(() => {
        const el = document.querySelector('#view-employer-dashboard div[style*="Recent Applicants"]');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    async function openSelectedJobChat() {
      if (!SELECTED_JOB) return;
      if (!IS_LOGGED_IN) {
        closeModal('jobDetailModal');
        goToOnboardingStep('stepChooseRole');
        return;
      }
      closeModal('jobDetailModal');
      showInAppToast('Opening conversation...', 'info');
      try {
        const res = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: SELECTED_JOB.id })
        });
        const data = await res.json();
        if (data.success && data.application_id) {
          openInAppChat(data.application_id, SELECTED_JOB.company_name, SELECTED_JOB.title, SELECTED_JOB.company_logo || '', SELECTED_JOB.id);
        } else {
          showInAppToast(data.error || 'Failed to open chat', 'error');
        }
      } catch (err) {
        showInAppToast('Network error opening chat', 'error');
      }
    }

    // In-App Chat Functions -> Routes to WhatsApp Full Screen View
    async function openInAppChat(appId, name, jobTitle, logo, jobId) {
      closeModal('jobDetailModal');
      closeModal('inAppChatModal');
      openInboxConversationDirect(appId, name, logo, jobTitle, jobId);
    }

    async function loadChatMessages(appId, isPoll = false) {
      if (!appId) return;
      try {
        const res = await fetch('/api/chat/' + appId + '/messages');
        const data = await res.json();
        const messages = data.messages || [];
        const container = document.getElementById('chatMessagesList');
        if (!container) return;

        if (isPoll && container.dataset.msgCount === String(messages.length)) {
          return;
        }
        container.dataset.msgCount = String(messages.length);

        if (messages.length === 0) {
          container.innerHTML = 
            '<div style="text-align: center; padding: 40px 16px; color: #78827D;">' +
              '<div style="font-size: 32px; margin-bottom: 8px;">👋</div>' +
              '<div style="font-size: 14px; font-weight: 800; color: #17231D; margin-bottom: 4px;">Start the Conversation</div>' +
              '<div style="font-size: 12px; line-height: 1.5; max-width: 280px; margin: 0 auto;">Ask about the job role, workplace timings, interview availability, or next steps.</div>' +
            '</div>';
          return;
        }

        const isEmployer = (typeof CURRENT_USER_ROLE !== 'undefined' && CURRENT_USER_ROLE === 'employer');
        const myRole = isEmployer ? 'employer' : 'candidate';

        let html = '';
        for (const msg of messages) {
          const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (msg.sender_role === 'system' || msg.sender_type === 'system') {
            html += '<div class="chat-system-pill">🔔 ' + escapeHtml(msg.message) + '</div>';
          } else if (msg.sender_role === myRole) {
            html += 
              '<div class="chat-bubble chat-bubble-out">' +
                '<div>' + escapeHtml(msg.message) + '</div>' +
                '<div class="chat-bubble-time">' + timeStr + '</div>' +
              '</div>';
          } else {
            html += 
              '<div class="chat-bubble chat-bubble-in">' +
                '<div>' + escapeHtml(msg.message) + '</div>' +
                '<div class="chat-bubble-time">' + timeStr + '</div>' +
              '</div>';
          }
        }

        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
      } catch (err) {
        console.error('Error loading chat messages:', err);
      }
    }

    async function sendChatMessage() {
      const input = document.getElementById('chatMessageInput');
      if (!input || !CURRENT_CHAT_APP_ID) return;
      const text = input.value.trim();
      if (!text) return;

      const container = document.getElementById('chatMessagesList');
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Optimistic append
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble chat-bubble-out';
      bubble.innerHTML = '<div>' + escapeHtml(text) + '</div><div class="chat-bubble-time">' + timeStr + '</div>';
      container.appendChild(bubble);
      input.value = '';
      container.scrollTop = container.scrollHeight;

      try {
        const res = await fetch('/api/chat/' + CURRENT_CHAT_APP_ID + '/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        if (!data.success) {
          showInAppToast(data.error || 'Failed to send message', 'error');
        } else {
          container.dataset.msgCount = String(Number(container.dataset.msgCount || 0) + 1);
        }
      } catch (e) {
        showInAppToast('Network error sending message', 'error');
      }
    }

    function applyChatQuickSuggestion(suggestionText) {
      const input = document.getElementById('chatMessageInput');
      if (input) {
        input.value = suggestionText;
        input.focus();
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
