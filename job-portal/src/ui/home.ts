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
  // Dynamic Name: NEVER hardcode "Aabeeo" in the frontend. Use user's real profile or session name, defaulting to 'Candidate'.
  const userName = userProfile?.name || session?.name || 'Candidate';
  const userPhone = session?.phone || '';
  const userEmail = userProfile?.email || session?.email || (userPhone ? userPhone + '@alifeo.com' : 'guest@alifeo.com');
  const userPhoto = userProfile?.photo_url || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Where Is My Job? by alifeo — Find. Apply. Grow.</title>
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
  <div class="mobile-app-frame">
    
    <!-- Native Mobile Status Bar (9:41, Cellular, Wifi, Battery) -->
    <div class="app-status-bar">
      <span>9:41</span>
      <div class="status-bar-icons">
        <svg width="15" height="11" viewBox="0 0 17 11" fill="none"><rect width="3" height="4" rx="0.5" fill="#17231D"/><rect x="4.5" y="2" width="3" height="6" rx="0.5" fill="#17231D"/><rect x="9" y="4" width="3" height="7" rx="0.5" fill="#17231D"/><rect x="13.5" y="6" width="3" height="9" rx="0.5" fill="#17231D"/></svg>
        <svg width="15" height="11" viewBox="0 0 16 12" fill="none"><path d="M8 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="#17231D"/><path d="M4.5 7a5 5 0 017 0" stroke="#17231D" stroke-width="1.5" stroke-linecap="round"/><path d="M1.5 4a9 9 0 0113 0" stroke="#17231D" stroke-width="1.5" stroke-linecap="round"/></svg>
        <svg width="22" height="11" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="#17231D"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="#17231D"/><path d="M23 4v4" stroke="#17231D" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 1: SPLASH SCREEN -->
    <!-- ============================================================= -->
    <div class="screen-view active screen-no-nav" id="screen-1-splash" onclick="handleSplashClick()">
      <div class="splash-container">
        <!-- Stylized watermark behind -->
        <svg class="splash-watermark" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" stroke="#CFF92D" stroke-width="10"/>
          <text x="50" y="68" font-family="'Poppins', sans-serif" font-weight="900" font-size="52" fill="#006B3C" text-anchor="middle">a</text>
        </svg>

        <div style="margin-bottom: 24px;">
          <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Alifeo" style="width: 72px; height: 72px; border-radius: 20px; box-shadow: 0 8px 24px rgba(0, 107, 60, 0.15);">
        </div>

        <div style="font-size: 15px; font-weight: 700; color: #78827D; letter-spacing: 0.5px;">where is</div>
        <div style="font-size: 32px; font-weight: 900; color: #006B3C; letter-spacing: -0.8px; margin-top: -2px;">
          My Job<span style="color: #84CC16;">?</span>
        </div>
        <div style="font-size: 14px; font-weight: 700; color: #17231D; margin-top: 4px;">by alifeo</div>
        
        <div class="splash-spinner"></div>
        <div style="font-size: 11px; font-weight: 600; color: #94A3B8; margin-top: 14px;">Tap anywhere to enter</div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 2: CHOOSE OPTION (Want to Hire / Get a Job) -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-2-choose">
      <div class="choose-option-wrapper">
        <div>
          <div style="text-align: center; margin: 20px 0 32px 0;">
            <div style="font-size: 14px; font-weight: 700; color: #78827D;">where is</div>
            <div style="font-size: 28px; font-weight: 900; color: #006B3C; letter-spacing: -0.5px;">My Job</div>
            <div style="font-size: 13px; font-weight: 700; color: #17231D;">by alifeo</div>
          </div>

          <!-- 1. Want to Hire? (Lime Card) -->
          <div class="choose-card-large choose-card-hire" onclick="handleChooseHire()">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span style="font-size: 28px;">💼</span>
              <div class="dual-card-arrow">&rarr;</div>
            </div>
            <div>
              <div style="font-size: 22px; font-weight: 900; color: #004D35; line-height: 1.2;">Want to<br>Hire?</div>
              <div style="font-size: 12px; font-weight: 600; color: #166534; margin-top: 4px;">Post a Job &amp; Find Talent</div>
            </div>
          </div>

          <!-- 2. Get a Job? (White Card) -->
          <div class="choose-card-large choose-card-job" onclick="handleChooseJob()">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <span style="font-size: 28px;">🔍</span>
              <div class="dual-card-arrow">&rarr;</div>
            </div>
            <div>
              <div style="font-size: 22px; font-weight: 900; color: #17231D; line-height: 1.2;">Get a<br>Job?</div>
              <div style="font-size: 12px; font-weight: 600; color: #78827D; margin-top: 4px;">Explore Nearby &amp; Remote Opportunities</div>
            </div>
          </div>
        </div>

        <!-- City skyline line-art illustration at bottom -->
        <div style="text-align: center; opacity: 0.25; margin-top: 20px;">
          <svg width="100%" height="60" viewBox="0 0 340 60" fill="none">
            <path d="M0 60H340V50H320V35H290V50H260V20H230V50H210V10H180V50H150V30H120V50H90V25H60V50H30V40H0V60Z" fill="#006B3C"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 3: LOGIN WITH WHATSAPP -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-3-login">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-2-choose')">&larr;</button>
        <div class="screen-header-title">Sign In</div>
        <div style="width: 38px;"></div>
      </div>

      <div class="screen-padded">
        <div style="text-align: center; margin: 16px 0 24px 0;">
          <div style="width: 80px; height: 80px; border-radius: 24px; background: #ECFDF5; border: 2px solid #A7F3D0; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <!-- WhatsApp Phone Graphic -->
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          </div>
          <h2 class="screen-title-bold" style="font-size: 22px;">Login with WhatsApp</h2>
          <p class="screen-desc-muted" style="margin-bottom: 8px;">Get started in seconds to explore jobs</p>
          <div id="loginRoleBadge" style="display: inline-block; padding: 4px 12px; border-radius: 100px; background: #CFF92D; color: #004D35; font-size: 11px; font-weight: 800;">Candidate Mode</div>
        </div>

        <div id="authStep1">
          <div class="form-group-app">
            <label class="form-label-app" for="authPhone">WhatsApp Mobile Number</label>
            <div style="display: flex; gap: 8px;">
              <div style="padding: 13px 14px; border: 1.5px solid var(--border-color); border-radius: 14px; background: #F1F5F9; font-weight: 700; font-size: 14px;">🇮🇳 +91</div>
              <input type="tel" id="authPhone" class="form-input-app" placeholder="9876543210" maxlength="10" value="${userPhone}">
            </div>
          </div>

          <div class="form-group-app">
            <label class="form-label-app" for="authName">Your Name <span style="font-weight: 500; color: #78827D;">(Optional)</span></label>
            <input type="text" id="authName" class="form-input-app" placeholder="e.g. John Doe">
          </div>

          <button type="button" class="btn-lime-full" onclick="sendAuthOtp()">
            Continue with WhatsApp &rarr;
          </button>
        </div>

        <div id="authStep2" style="display: none;">
          <div class="form-group-app">
            <label class="form-label-app" for="authOtp">Enter 6-Digit WhatsApp OTP</label>
            <input type="text" id="authOtp" class="form-input-app" maxlength="6" placeholder="••••••" style="text-align: center; letter-spacing: 6px; font-size: 20px; font-weight: 800;">
            <div id="testOtpDisplay" style="color: #059669; font-size: 12px; font-weight: 700; margin-top: 8px; text-align: center;"></div>
          </div>
          <button type="button" class="btn-lime-full" onclick="verifyAuthOtp()">Verify &amp; Continue &rarr;</button>
          <div style="text-align: center; margin-top: 14px;">
            <button type="button" style="background: none; border: none; color: #78827D; font-size: 13px; font-weight: 600; cursor: pointer;" onclick="resetAuthStep()">&larr; Change Phone Number</button>
          </div>
        </div>

        <div style="font-size: 11px; text-align: center; color: #94A3B8; margin-top: 32px; line-height: 1.5;">
          By continuing, you agree to our <strong>Terms</strong> &amp; <strong>Privacy Policy</strong>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 4: COMPLETE PROFILE -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-4-profile">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-6-map')">&larr;</button>
        <div class="screen-header-title">Complete Profile</div>
        <div style="width: 38px;"></div>
      </div>

      <div class="screen-padded">
        <h2 class="screen-title-bold">Complete Your Profile</h2>
        <p class="screen-desc-muted">Help us personalize your job experience</p>

        <!-- Avatar Uploader -->
        <div style="text-align: center; margin-bottom: 20px;">
          <div onclick="document.getElementById('profilePhotoInput').click()" style="width: 86px; height: 86px; border-radius: 50%; border: 3px solid #CFF92D; background: #F1F5F9; overflow: hidden; margin: 0 auto; cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
            <img id="spPhotoPreview" src="${userPhoto}" style="${userPhoto ? '' : 'display: none;'} width: 100%; height: 100%; object-fit: cover;">
            <div id="spPhotoPlaceholder" style="${userPhoto ? 'display: none;' : ''} font-size: 26px;">👤</div>
            <div style="position: absolute; bottom: 0; right: 0; background: #006B3C; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 11px;">✎</div>
          </div>
          <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;" onchange="handleProfilePhotoUpload(event)">
          <input type="hidden" id="spPhotoUrl" value="${userPhoto}">
          <div style="font-size: 11px; font-weight: 600; color: #78827D; margin-top: 6px;">Tap to change photo</div>
        </div>

        <form id="seekerProfileForm" onsubmit="handleSaveSeekerProfile(event)">
          <div class="form-group-app">
            <label class="form-label-app" for="spName">Full Name</label>
            <input type="text" id="spName" class="form-input-app" value="${escapeHtml(userName !== 'Candidate' ? userName : '')}" placeholder="Your Full Name" required>
          </div>

          <div class="form-group-app">
            <label class="form-label-app">Upload Resume <span style="font-weight: 500; color: #78827D;">(PDF, DOC, DOCX Max 5MB)</span></label>
            <div onclick="document.getElementById('seekerResumeInput').click()" style="border: 2px dashed #006B3C; border-radius: 16px; padding: 18px; text-align: center; background: #F8FAF7; cursor: pointer;">
              <div style="font-size: 24px;">📄</div>
              <div style="font-size: 13px; font-weight: 700; color: #004D35; margin-top: 4px;" id="resumeUploadLabel">${currentResume ? escapeHtml(currentResume.filename) : 'Upload Resume'}</div>
              <div style="font-size: 11px; color: #78827D;">Tap to select file from device</div>
              <input type="file" id="seekerResumeInput" accept=".pdf,.doc,.docx" style="display: none;" onchange="handleResumeFileChange(event)">
            </div>
          </div>

          <div class="form-group-app">
            <label class="form-label-app">Select Skills</label>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
              <span class="mini-tag-pill mini-tag-green" onclick="toggleSkillTag(this, 'UI/UX')">UI/UX +</span>
              <span class="mini-tag-pill mini-tag-green" onclick="toggleSkillTag(this, 'Design')">Design +</span>
              <span class="mini-tag-pill mini-tag-green" onclick="toggleSkillTag(this, 'React')">React +</span>
              <span class="mini-tag-pill mini-tag-green" onclick="toggleSkillTag(this, 'Product')">Product +</span>
              <span class="mini-tag-pill mini-tag-green" onclick="toggleSkillTag(this, 'Sales')">Sales +</span>
            </div>
            <input type="text" id="spSkills" class="form-input-app" placeholder="e.g. UI/UX, Design, React" value="${escapeHtml(userProfile?.skills || '')}">
          </div>

          <div class="form-group-app">
            <label class="form-label-app" for="spPortfolio">Portfolio Link <span style="font-weight: 500; color: #78827D;">(Optional)</span></label>
            <input type="url" id="spPortfolio" class="form-input-app" placeholder="https://yourportfolio.com">
          </div>

          <button type="submit" class="btn-lime-full" style="margin-top: 10px;">
            Continue &rarr;
          </button>
        </form>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 5: ENABLE LOCATION -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-5-location">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-4-profile')">&larr;</button>
        <div class="screen-header-title">Location</div>
        <div style="width: 38px;"></div>
      </div>

      <div class="screen-padded" style="justify-content: center; text-align: center; min-height: 75vh;">
        <div class="location-circle-graphic">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#006B3C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>

        <h2 class="screen-title-bold" style="font-size: 24px;">Enable Location</h2>
        <p class="screen-desc-muted" style="max-width: 280px; margin: 0 auto 36px auto;">
          Find nearby jobs &amp; opportunities near your workplace, factory or office.
        </p>

        <button type="button" class="btn-lime-full" onclick="handleEnableLocationGPS()">
          Enable Location
        </button>

        <div style="margin-top: 18px;">
          <button type="button" style="background: none; border: none; color: #78827D; font-size: 14px; font-weight: 700; cursor: pointer;" onclick="handleSkipLocation()">
            Not Now
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 6: HOME - MAP VIEW (Candidate Main View) -->
    <!-- ============================================================= -->
    <div class="screen-view" id="screen-6-map">
      <!-- Top Brand Header Bar -->
      <header class="screen-top-bar" style="padding: 12px 20px 8px 20px;">
        <div class="app-brand-badge">
          <div class="app-logo-sq">
            <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Alifeo">
          </div>
          <div class="app-brand-name">alifeo</div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="btn-icon-circle" onclick="showNotificationAlert()" title="Alerts">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17231D" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <div class="badge-dot"></div>
          </button>

          ${session ? `
            <button class="btn-icon-circle" onclick="switchScreen('screen-11-profile')" style="padding: 0; overflow: hidden;" title="My Account">
              ${userPhoto ? `<img src="${userPhoto}" style="width: 100%; height: 100%; object-fit: cover;">` : `<span style="font-weight: 800; font-size: 14px; color: #006B3C;">${escapeHtml(userName.charAt(0).toUpperCase())}</span>`}
            </button>
          ` : `
            <button class="btn-lime-apply" style="padding: 6px 14px; font-size: 12px;" onclick="openLoginModal('job_seeker')">Sign In</button>
          `}
        </div>
      </header>

      <!-- Greeting & Title -->
      <div class="candidate-hero-header">
        <div class="hero-hyy" id="candidateGreetingText">Hyy, ${escapeHtml(userName)} 👋</div>
        <h1 class="hero-main-title">Where is <span>My Job?</span></h1>
      </div>

      <!-- Location Dropdown Pill -->
      <div class="loc-pill-row" onclick="handleLocationPickerClick()">
        <svg class="loc-pin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <div class="loc-texts">
          <span class="loc-tiny">Your Location</span>
          <div class="loc-bold">
            <span id="currentLocHeader">Moradabad, India</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>

      <!-- Dual Action Hero Cards -->
      <div class="hero-dual-cards">
        <!-- 1. Want to Hire? (Lime Card) -->
        <div class="dual-card dual-card-hire" onclick="handleHireClick()">
          <span class="dual-card-icon">🪑</span>
          <div>
            <div class="dual-card-title">Want to<br>Hire?</div>
            <div class="dual-card-sub">Post a Job &amp; Find</div>
          </div>
          <div class="dual-card-arrow">&rarr;</div>
        </div>

        <!-- 2. Get a Job? (White Card) -->
        <div class="dual-card dual-card-job" onclick="switchScreen('screen-10-jobs-list')">
          <span class="dual-card-icon">💼</span>
          <div>
            <div class="dual-card-title">Get a<br>Job?</div>
            <div class="dual-card-sub">Explore Jobs</div>
          </div>
          <div class="dual-card-arrow">&rarr;</div>
        </div>
      </div>

      <!-- Floating Search Bar with Filter FAB -->
      <div class="search-bar-wrap">
        <div class="search-pill-container">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78827D" stroke-width="2" style="margin-right: 8px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="mapSearchInput" class="search-field-input" placeholder="Search jobs, companies, skills..." oninput="handleSearchMapJobs()">
          <button class="search-filter-lime-btn" onclick="toggleRadiusSelector()" title="Filter Distance Radius">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
          </button>
        </div>

        <!-- Radius Filter Selector Chips -->
        <div id="radiusFilterBar" style="display: none; gap: 6px; overflow-x: auto; padding: 10px 0 2px 0;">
          <button class="mini-tag-pill" data-radius="20" onclick="selectRadiusKm(20)">20 km</button>
          <button class="mini-tag-pill mini-tag-green" data-radius="30" onclick="selectRadiusKm(30)">30 km</button>
          <button class="mini-tag-pill" data-radius="50" onclick="selectRadiusKm(50)">50 km</button>
          <button class="mini-tag-pill" data-radius="100" onclick="selectRadiusKm(100)">100 km</button>
          <button class="mini-tag-pill" data-radius="250" onclick="selectRadiusKm(250)">250 km</button>
          <button class="mini-tag-pill" data-radius="1000" onclick="selectRadiusKm(1000)">Pan India</button>
        </div>
      </div>

      <!-- Live Interactive Map Section -->
      <div class="map-box-wrap" id="mapBoxWrap">
        <div id="hiringMap"></div>

        <!-- Floating Top-Left Status Pill -->
        <div class="map-float-pill">
          <div class="map-pill-status-dot"></div>
          <span>Your Location</span>
        </div>

        <!-- Floating Top-Right GPS Re-center FAB -->
        <button class="map-float-gps-btn" onclick="handleEnableLocationGPS()" title="Center GPS Location">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
        </button>
      </div>

      <!-- Nearby Jobs Bottom Drawer -->
      <div class="nearby-jobs-drawer">
        <div class="drawer-drag-pill"></div>

        <div class="drawer-top-row">
          <div class="drawer-heading-text">
            <span>💼</span> Nearby Jobs
            <span style="font-size: 12px; font-weight: 700; color: #006B3C;" id="nearbyCountBadge">${jobs.length} Openings</span>
          </div>
          <div class="drawer-see-link" onclick="switchScreen('screen-10-jobs-list')">See All &rarr;</div>
        </div>

        <!-- Nearby Jobs Card List -->
        <div id="nearbyJobsListContainer">
          ${jobs.slice(0, 6).map(j => `
            <div class="alifeo-job-card" onclick="openJobDetailById('${j.id}')">
              <div class="job-card-top-info">
                <div class="company-avatar-box">
                  ${j.company_logo ? `<img src="${j.company_logo}" alt="${escapeHtml(j.company_name)}">` : `<div class="company-avatar-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
                </div>
                <div class="job-meta-column">
                  <div class="company-name-verified">
                    <span>${escapeHtml(j.company_name || 'Alifeo Partner')}</span>
                    <span class="check-green-svg" title="Verified Employer">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </span>
                  </div>
                  <div class="job-card-main-title">${escapeHtml(j.title)}</div>
                  <div class="job-distance-row">
                    <span>📍 <strong>${j.distance_km !== undefined ? j.distance_km + ' km' : 'Nearby'}</strong></span>
                    <span>&bull;</span>
                    <span>${escapeHtml(j.city)}</span>
                    <span>&bull;</span>
                    <span>${escapeHtml(j.salary_display || 'Competitive')}</span>
                  </div>
                </div>
              </div>

              <div class="job-card-bottom-bar">
                <div class="job-tags-group">
                  <span class="mini-tag-pill mini-tag-green">${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
                  <span class="mini-tag-pill">${escapeHtml(j.work_mode.toUpperCase())}</span>
                  <span class="mini-tag-pill">${escapeHtml((j.required_skills || j.skills || 'General').split(',')[0] || 'Direct')}</span>
                </div>
                <button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailById('${j.id}')">
                  Apply &rarr;
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 7: MAP JOB DETAILS (Floating bottom sheet over map) -->
    <!-- ============================================================= -->
    <div class="screen-view" id="screen-7-map-details">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-6-map')">&larr;</button>
        <div class="screen-header-title">Map View</div>
        <div style="width: 38px;"></div>
      </div>

      <div style="position: relative; flex: 1; min-height: 500px;">
        <div id="hiringMapExpanded" style="width: 100%; height: 100%; position: absolute; inset: 0;"></div>

        <div class="map-floating-bottom-sheet" id="mapFloatingCard">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <div class="company-name-verified" style="font-size: 13px;">
                <span id="mfcCompany">Alifeo Pvt Ltd</span>
                <span class="check-green-svg">✓</span>
              </div>
              <div style="font-size: 17px; font-weight: 800; color: #17231D; margin-top: 2px;" id="mfcTitle">Senior Product Designer</div>
            </div>
            <button class="screen-back-btn" style="width: 30px; height: 30px; font-size: 14px;" onclick="switchScreen('screen-6-map')">&times;</button>
          </div>

          <div style="font-size: 15px; font-weight: 800; color: #006B3C; margin-bottom: 8px;" id="mfcSalary">₹30K - ₹60K / Month</div>
          <div style="font-size: 12px; color: #78827D; margin-bottom: 14px;" id="mfcLocation">📍 0.8 km &bull; Full Time</div>

          <div style="display: flex; gap: 8px;">
            <button class="btn-lime-full" id="mfcViewBtn" onclick="handleViewDetailsFromMapSheet()">
              View Details &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 8: JOB DETAILS (Full View with Apply Now) -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-8-job-details">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-6-map')">&larr;</button>
        <div style="display: flex; gap: 8px;">
          <button class="btn-icon-circle" onclick="alert('Job link copied!')" title="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
          <button class="btn-icon-circle" onclick="alert('Job saved to your bookmarks!')" title="Save Job">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>

      <!-- Hero Office Photo Banner -->
      <div style="width: 100%; height: 180px; background: #E2E8F0; overflow: hidden; position: relative;">
        <img id="jdHeroBanner" src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover;">
      </div>

      <div class="screen-padded" style="padding-top: 16px;">
        <div class="company-name-verified" style="font-size: 13px;">
          <span id="jdCompany">Alifeo Pvt Ltd</span>
          <span class="check-green-svg">✓</span>
        </div>
        <h1 class="screen-title-bold" id="jdMainTitle" style="font-size: 22px; margin-top: 2px;">Senior Product Designer</h1>
        
        <div style="font-size: 13px; color: #78827D; margin-bottom: 6px;" id="jdMetaRow">📍 0.8 km &bull; Moradabad</div>
        <div style="font-size: 18px; font-weight: 900; color: #006B3C; margin-bottom: 12px;" id="jdSalaryDisplay">₹30,000 - ₹60,000 / month</div>

        <!-- Badges -->
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px;" id="jdTagsRow">
          <span class="mini-tag-pill mini-tag-green">Full Time</span>
          <span class="mini-tag-pill">On-Site</span>
          <span class="mini-tag-pill">Design</span>
        </div>

        <div style="font-size: 14px; font-weight: 800; color: #17231D; margin-bottom: 6px;">About Company</div>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 18px;" id="jdAboutText">
          Alifeo is building the next generation hyper-local and digital discovery ecosystem, empowering local employment and direct corporate careers.
        </p>

        <div style="font-size: 14px; font-weight: 800; color: #17231D; margin-bottom: 6px;">Job Description &amp; Responsibilities</div>
        <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px;" id="jdDescriptionText">
          Looking for a passionate and dedicated candidate to join our expanding team. Responsibilities include cross-functional coordination, high quality deliverables, and direct team alignment.
        </p>

        <div style="position: sticky; bottom: 0; background: #FFFFFF; padding: 12px 0; border-top: 1px solid var(--border-color); display: flex; gap: 10px;">
          <button class="btn-lime-full" id="jdApplyBtn" onclick="handleJobApplyClick()">
            Apply Now &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 9: REMOTE JOBS (Dedicated 100+ Remote Jobs tab) -->
    <!-- ============================================================= -->
    <div class="screen-view" id="screen-9-remote-jobs">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-6-map')">&larr;</button>
        <div class="screen-header-title">Remote Jobs</div>
        <div style="width: 38px;"></div>
      </div>

      <!-- Filter Chips -->
      <div style="display: flex; gap: 6px; padding: 10px 20px; overflow-x: auto;">
        <span class="mini-tag-pill" onclick="switchScreen('screen-10-jobs-list')">All</span>
        <span class="mini-tag-pill mini-tag-green">Remote</span>
        <span class="mini-tag-pill" onclick="switchScreen('screen-10-jobs-list')">Hybrid</span>
        <span class="mini-tag-pill">Freelance</span>
      </div>

      <!-- 100+ Remote Jobs Hero Banner -->
      <div class="remote-hero-banner">
        <span>🌐 100+ Remote Jobs Available</span>
        <span style="font-size: 11px; background: #CFF92D; color: #004D35; padding: 4px 10px; border-radius: 100px;">Pan India</span>
      </div>

      <!-- Remote Job Cards Container -->
      <div style="padding: 0 20px;">
        <div id="remoteJobsListContainer">
          ${jobs.filter(j => j.work_mode === 'remote').map(j => `
            <div class="alifeo-job-card" onclick="openJobDetailById('${j.id}')">
              <div class="job-card-top-info">
                <div class="company-avatar-box">
                  ${j.company_logo ? `<img src="${j.company_logo}">` : `<div class="company-avatar-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
                </div>
                <div class="job-meta-column">
                  <div class="company-name-verified">
                    <span>${escapeHtml(j.company_name || 'Alifeo Partner')}</span>
                    <span class="check-green-svg">✓</span>
                  </div>
                  <div class="job-card-main-title">${escapeHtml(j.title)}</div>
                  <div class="job-distance-row">
                    <span>🏠 <strong>Work From Home</strong></span>
                    <span>&bull;</span>
                    <span>${escapeHtml(j.salary_display || 'Competitive')}</span>
                  </div>
                </div>
              </div>
              <div class="job-card-bottom-bar">
                <div class="job-tags-group">
                  <span class="mini-tag-pill mini-tag-green">REMOTE</span>
                  <span class="mini-tag-pill">${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
                </div>
                <button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailById('${j.id}')">
                  Apply +
                </button>
              </div>
            </div>
          `).join('') || `
            <div class="alifeo-job-card" onclick="openJobDetailById('sample-remote-1')">
              <div class="job-card-top-info">
                <div class="company-avatar-box"><div class="company-avatar-initials">AL</div></div>
                <div class="job-meta-column">
                  <div class="company-name-verified"><span>Alifeo Tech</span><span class="check-green-svg">✓</span></div>
                  <div class="job-card-main-title">Frontend Developer (React / Next)</div>
                  <div class="job-distance-row"><span>🏠 <strong>Remote</strong></span><span>&bull;</span><span>₹30K - ₹60K / Month</span></div>
                </div>
              </div>
              <div class="job-card-bottom-bar">
                <div class="job-tags-group"><span class="mini-tag-pill mini-tag-green">REMOTE</span><span class="mini-tag-pill">Full Time</span></div>
                <button class="btn-lime-apply">Apply +</button>
              </div>
            </div>
            <div class="alifeo-job-card" onclick="openJobDetailById('sample-remote-2')">
              <div class="job-card-top-info">
                <div class="company-avatar-box"><div class="company-avatar-initials">ZF</div></div>
                <div class="job-meta-column">
                  <div class="company-name-verified"><span>Zifeeo B2B</span><span class="check-green-svg">✓</span></div>
                  <div class="job-card-main-title">Product Designer (UI/UX)</div>
                  <div class="job-distance-row"><span>🏠 <strong>Work From Home</strong></span><span>&bull;</span><span>₹25K - ₹45K / Month</span></div>
                </div>
              </div>
              <div class="job-card-bottom-bar">
                <div class="job-tags-group"><span class="mini-tag-pill mini-tag-green">REMOTE</span><span class="mini-tag-pill">Design</span></div>
                <button class="btn-lime-apply">Apply +</button>
              </div>
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 10: JOBS LIST VIEW (All Jobs with Filters) -->
    <!-- ============================================================= -->
    <div class="screen-view" id="screen-10-jobs-list">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-6-map')">&larr;</button>
        <div class="screen-header-title">All Jobs</div>
        <div style="width: 38px;"></div>
      </div>

      <!-- Tab Pills -->
      <div style="display: flex; gap: 8px; padding: 10px 20px;">
        <span class="mini-tag-pill mini-tag-green" onclick="filterJobList('all')">All</span>
        <span class="mini-tag-pill" onclick="filterJobList('nearby')">Nearby</span>
        <span class="mini-tag-pill" onclick="switchScreen('screen-9-remote-jobs')">Remote</span>
        <span class="mini-tag-pill" onclick="filterJobList('hybrid')">Hybrid</span>
      </div>

      <div style="padding: 0 20px;" id="allJobsFeedList">
        ${jobs.map(j => `
          <div class="alifeo-job-card" onclick="openJobDetailById('${j.id}')">
            <div class="job-card-top-info">
              <div class="company-avatar-box">
                ${j.company_logo ? `<img src="${j.company_logo}">` : `<div class="company-avatar-initials">${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>`}
              </div>
              <div class="job-meta-column">
                <div class="company-name-verified">
                  <span>${escapeHtml(j.company_name || 'Alifeo Partner')}</span>
                  <span class="check-green-svg">✓</span>
                </div>
                <div class="job-card-main-title">${escapeHtml(j.title)}</div>
                <div class="job-distance-row">
                  <span>📍 <strong>${j.distance_km !== undefined ? j.distance_km + ' km' : j.city}</strong></span>
                  <span>&bull;</span>
                  <span>${escapeHtml(j.salary_display || 'Competitive')}</span>
                </div>
              </div>
            </div>
            <div class="job-card-bottom-bar">
              <div class="job-tags-group">
                <span class="mini-tag-pill mini-tag-green">${escapeHtml(j.work_mode.toUpperCase())}</span>
                <span class="mini-tag-pill">${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
              </div>
              <button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailById('${j.id}')">
                Apply +
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 11: SETTINGS & PROFILE (Candidate Account) -->
    <!-- ============================================================= -->
    <div class="screen-view" id="screen-11-profile">
      <div class="screen-top-bar">
        <div style="width: 38px;"></div>
        <div class="screen-header-title">Settings &amp; Profile</div>
        <div style="width: 38px;"></div>
      </div>

      <div class="screen-padded" style="padding-top: 10px;">
        <!-- Profile Card -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 20px; padding: 20px; text-align: center; margin-bottom: 20px; box-shadow: var(--shadow-soft);">
          <div style="width: 72px; height: 72px; border-radius: 50%; border: 3px solid #CFF92D; background: #F1F5F9; overflow: hidden; margin: 0 auto 10px auto;">
            ${userPhoto ? `<img src="${userPhoto}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="font-weight: 800; font-size: 26px; line-height: 72px; color: #006B3C;">${escapeHtml(userName.charAt(0).toUpperCase())}</div>`}
          </div>
          <div style="font-size: 18px; font-weight: 800; color: #17231D;" id="profileCardName">${escapeHtml(userName)}</div>
          <div style="font-size: 12px; font-weight: 600; color: #78827D;" id="profileCardEmail">${escapeHtml(userEmail)}</div>
        </div>

        <!-- Menu List Items -->
        <div class="profile-menu-item" onclick="switchScreen('screen-4-profile')">
          <div class="profile-menu-left">
            <span>👤</span> My Profile
          </div>
          <span style="color: #94A3B8;">&rsaquo;</span>
        </div>

        <div class="profile-menu-item" onclick="switchScreen('screen-10-jobs-list')">
          <div class="profile-menu-left">
            <span>💼</span> My Jobs
          </div>
          <span style="color: #94A3B8;">&rsaquo;</span>
        </div>

        <div class="profile-menu-item" onclick="alert('You have 3 saved jobs.')">
          <div class="profile-menu-left">
            <span>🔖</span> Saved Jobs
          </div>
          <span style="color: #94A3B8;">&rsaquo;</span>
        </div>

        <div class="profile-menu-item" onclick="alert('Application Status: All active applications in review.')">
          <div class="profile-menu-left">
            <span>📊</span> Application Status
          </div>
          <span style="color: #94A3B8;">&rsaquo;</span>
        </div>

        <div class="profile-menu-item" onclick="switchScreen('screen-12-chat')">
          <div class="profile-menu-left">
            <span>💬</span> In-App Chat
          </div>
          <span style="color: #94A3B8;">&rsaquo;</span>
        </div>

        <!-- Switch to Hiring (Strict Account Isolation - New Number) -->
        <div class="profile-menu-item" onclick="switchScreen('screen-13-switch-hiring')" style="border-left: 4px solid #CFF92D;">
          <div class="profile-menu-left">
            <span>🏢</span> Switch to Hiring (Hiring Partner)
          </div>
          <span style="color: #006B3C; font-weight: 800;">&rsaquo;</span>
        </div>

        <div class="profile-menu-item" onclick="alert('Settings configured.')">
          <div class="profile-menu-left">
            <span>⚙️</span> Settings
          </div>
          <span style="color: #94A3B8;">&rsaquo;</span>
        </div>

        <div class="profile-menu-item" onclick="alert('Contact support at hr@alifeo.com or WhatsApp support.')">
          <div class="profile-menu-left">
            <span>❓</span> Help &amp; Support
          </div>
          <span style="color: #94A3B8;">&rsaquo;</span>
        </div>

        ${session ? `
          <div class="profile-menu-item" onclick="handleLogout()" style="margin-top: 14px; border-color: #FECACA;">
            <div class="profile-menu-left" style="color: #E54848;">
              <span>🚪</span> Logout
            </div>
            <span style="color: #E54848;">&rarr;</span>
          </div>
        ` : `
          <div class="profile-menu-item" onclick="openLoginModal('job_seeker')" style="margin-top: 14px; background: #CFF92D;">
            <div class="profile-menu-left" style="color: #004D35;">
              <span>🔑</span> Sign In with WhatsApp
            </div>
            <span style="color: #004D35;">&rarr;</span>
          </div>
        `}
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 12: CHAT & APPLY FLOW (Real-time in-app conversation) -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-12-chat">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-6-map')">&larr;</button>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="company-avatar-box" style="width: 34px; height: 34px; border-radius: 50%;">
            <span style="font-size: 12px; font-weight: 800; color: #006B3C;">AL</span>
          </div>
          <div>
            <div class="screen-header-title" style="font-size: 14px;">Alifeo Pvt Ltd</div>
            <div style="font-size: 10px; color: #15965B; font-weight: 700;">● Online</div>
          </div>
        </div>
        <div style="width: 38px;"></div>
      </div>

      <div style="flex: 1; display: flex; flex-direction: column; padding: 16px 20px; overflow-y: auto;" id="chatThreadContainer">
        <!-- Message Bubbles -->
        <div class="chat-bubble-received">
          Hello! Thanks for applying. Please complete the assessment to proceed with the interview.
          <div style="font-size: 10px; color: #94A3B8; text-align: right; margin-top: 4px;">9:41 AM</div>
        </div>

        <div class="chat-bubble-sent">
          Sure, sending now.
          <div style="font-size: 10px; color: #059669; text-align: right; margin-top: 4px;">9:42 AM</div>
        </div>

        <!-- Assignment Attachment Box -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-color); border-radius: 16px; padding: 14px; margin: 8px 0; display: flex; align-items: center; gap: 12px; box-shadow: var(--shadow-soft);">
          <div style="font-size: 26px;">📄</div>
          <div style="flex: 1;">
            <div style="font-size: 13px; font-weight: 800; color: #17231D;">UI_Design_Assignment.pdf</div>
            <div style="font-size: 11px; color: #78827D;">245 KB &bull; Verified Attachment</div>
          </div>
          <button class="mini-tag-pill mini-tag-green" onclick="alert('Downloading assignment...')">Download</button>
        </div>

        <!-- Action Badge -->
        <div style="text-align: center; margin: 12px 0;">
          <span style="font-size: 11px; background: #ECFDF5; color: #004D35; padding: 4px 12px; border-radius: 100px; font-weight: 700;">
            Send Assessment &bull; Share Resume &bull; Schedule Interview
          </span>
        </div>
      </div>

      <!-- Message Input Bar -->
      <div style="padding: 10px 16px; background: #FFFFFF; border-top: 1px solid var(--border-color); display: flex; gap: 8px; align-items: center;">
        <input type="text" id="chatInputMessage" class="form-input-app" placeholder="Type a message..." style="padding: 10px 14px; font-size: 13px;">
        <button class="search-filter-lime-btn" style="width: 42px; height: 42px;" onclick="handleSendLiveChatMessage()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 13: SWITCH TO HIRING (Strict Account Isolation - New Number) -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-13-switch-hiring">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-6-map')">&larr;</button>
        <div class="screen-header-title">Hiring Partner</div>
        <div style="width: 38px;"></div>
      </div>

      <div class="screen-padded" style="justify-content: center; text-align: center; min-height: 75vh;">
        <div style="width: 100px; height: 100px; border-radius: 50%; background: #CFF92D; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto; box-shadow: 0 8px 24px rgba(207, 249, 45, 0.4);">
          <span style="font-size: 40px;">💼</span>
        </div>

        <h2 class="screen-title-bold" style="font-size: 20px; line-height: 1.3;">
          Use a different mobile number to become a Hiring Partner
        </h2>
        
        <p class="screen-desc-muted" style="max-width: 290px; margin: 10px auto 32px auto;">
          To ensure verified hiring and security, Candidate and Employer accounts are kept strictly separate on Alifeo.
        </p>

        <button type="button" class="btn-lime-full" onclick="handleSwitchToHiringLogout()">
          Logout &amp; Continue &rarr;
        </button>

        <div style="margin-top: 18px;">
          <button type="button" style="background: none; border: none; color: #78827D; font-size: 13px; font-weight: 700; cursor: pointer;" onclick="switchScreen('screen-6-map')">
            Cancel &bull; Stay as Candidate
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 14: WANT TO HIRE - POST JOB -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-14-post-job">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-15-posted-jobs')">&larr;</button>
        <div class="screen-header-title">Post a New Job</div>
        <div style="width: 38px;"></div>
      </div>

      <div class="screen-padded">
        <form id="employerPostJobForm" onsubmit="event.preventDefault(); submitPostJobForm();">
          <!-- Company Logo Uploader (Pins on map!) -->
          <div style="background: #F8FAFC; border: 1.5px dashed #006B3C; border-radius: 16px; padding: 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
            <div onclick="document.getElementById('pjLogoInput').click()" style="width: 52px; height: 52px; border-radius: 14px; background: #CFF92D; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; flex-shrink: 0;">
              <img id="pjLogoImg" style="display: none; width: 100%; height: 100%; object-fit: cover;">
              <div id="pjLogoPlaceholder" style="font-size: 10px; font-weight: 800; color: #004D35;">+ Logo</div>
            </div>
            <input type="file" id="pjLogoInput" accept="image/*" style="display: none;" onchange="handleJobLogoUpload(event)">
            <input type="hidden" id="pjLogoUrl">
            <div style="font-size: 12px; color: #64748B;">Upload company logo to display on candidate live maps!</div>
          </div>

          <div class="form-group-app">
            <label class="form-label-app">Job Title</label>
            <input type="text" id="pjTitle" class="form-input-app" placeholder="e.g. Software Developer" required>
          </div>

          <div class="form-group-app">
            <label class="form-label-app">Company Name</label>
            <input type="text" id="pjCompany" class="form-input-app" value="${escapeHtml(userProfile?.company_name || 'My Company')}" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group-app">
              <label class="form-label-app">Job Type</label>
              <select id="pjType" class="form-input-app">
                <option value="full_time">Full Time</option>
                <option value="internship">Internship</option>
                <option value="part_time">Part Time</option>
              </select>
            </div>
            <div class="form-group-app">
              <label class="form-label-app">Experience</label>
              <select id="pjExp" class="form-input-app">
                <option value="Fresher - 2 Years">Fresher - 2 Years</option>
                <option value="2 - 5 Years">2 - 5 Years</option>
                <option value="5+ Years">5+ Years</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group-app">
              <label class="form-label-app">Work Location</label>
              <input type="text" id="pjCity" class="form-input-app" value="Moradabad" required>
            </div>
            <div class="form-group-app">
              <label class="form-label-app">Salary / Pay</label>
              <input type="text" id="pjSalary" class="form-input-app" placeholder="e.g. ₹30K - ₹60K" required>
            </div>
          </div>

          <div class="form-group-app">
            <label class="form-label-app">Skills Required</label>
            <input type="text" id="pjSkills" class="form-input-app" placeholder="e.g. React, UI/UX, Sales">
          </div>

          <div class="form-group-app">
            <label class="form-label-app">Role Description</label>
            <textarea id="pjDesc" class="form-input-app" rows="3" placeholder="Brief job responsibilities..."></textarea>
          </div>

          <button type="submit" class="btn-lime-full" style="margin-top: 8px;">
            Post Job &rarr;
          </button>
        </form>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 15: MY POSTED JOBS (Employer Dashboard) -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-15-posted-jobs">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-6-map')">&larr;</button>
        <div class="screen-header-title">My Posted Jobs</div>
        <button class="btn-lime-apply" style="padding: 6px 12px; font-size: 11px;" onclick="switchScreen('screen-14-post-job')">+ Post</button>
      </div>

      <!-- Status Tabs -->
      <div style="display: flex; gap: 8px; padding: 10px 20px;">
        <span class="mini-tag-pill mini-tag-green">Active (${employerJobs.filter(j => j.status === 'approved').length || 2})</span>
        <span class="mini-tag-pill">Pending (${employerJobs.filter(j => j.status === 'pending').length || 1})</span>
        <span class="mini-tag-pill">Draft (1)</span>
      </div>

      <div style="padding: 0 20px;">
        <!-- Card 1 -->
        <div class="alifeo-job-card" onclick="switchScreen('screen-16-applicant-details')">
          <div style="font-size: 16px; font-weight: 800; color: #17231D;">Senior Product Designer</div>
          <div style="font-size: 12px; color: #78827D; margin: 2px 0 10px 0;">Moradabad &bull; Full Time &bull; Applications: 24</div>
          <button class="btn-lime-apply" style="width: 100%; justify-content: center;">
            View Applicants &rarr;
          </button>
        </div>

        <!-- Card 2 -->
        <div class="alifeo-job-card" onclick="switchScreen('screen-16-applicant-details')">
          <div style="font-size: 16px; font-weight: 800; color: #17231D;">Internship - UI/UX Design</div>
          <div style="font-size: 12px; color: #78827D; margin: 2px 0 10px 0;">Moradabad &bull; Internship &bull; Applications: 120</div>
          <button class="btn-lime-apply" style="width: 100%; justify-content: center;">
            View Applicants &rarr;
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 16: APPLICANT DETAILS (Shortlist, Hire, Resume, Chat) -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-16-applicant-details">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-15-posted-jobs')">&larr;</button>
        <div class="screen-header-title">Applicant Details</div>
        <div style="width: 38px;"></div>
      </div>

      <div class="screen-padded" style="padding-top: 10px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: #E2E8F0; overflow: hidden; margin: 0 auto 8px auto;">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div style="font-size: 18px; font-weight: 800; color: #17231D;">Rohit Sharma</div>
          <div style="font-size: 12px; color: #78827D;">2+ years experience &bull; Moradabad</div>
        </div>

        <!-- Action Buttons -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
          <button class="btn-icon-circle" style="width: 100%; border-radius: 100px; font-weight: 700; font-size: 13px;" onclick="alert('Candidate Shortlisted!')">Shortlist</button>
          <button class="btn-lime-full" onclick="switchScreen('screen-18-hire-success')">Hire</button>
        </div>

        <!-- Tabs: Resume | Chat | Assessments -->
        <div style="display: flex; gap: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 14px;">
          <span style="font-size: 13px; font-weight: 800; color: #006B3C; border-bottom: 2px solid #006B3C; padding-bottom: 4px;">Resume</span>
          <span style="font-size: 13px; font-weight: 600; color: #78827D; cursor: pointer;" onclick="switchScreen('screen-12-chat')">Chat</span>
          <span style="font-size: 13px; font-weight: 600; color: #78827D; cursor: pointer;" onclick="switchScreen('screen-17-assessment')">Assessments</span>
        </div>

        <!-- Resume Preview Card -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-color); border-radius: 16px; padding: 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">📄</span>
            <div>
              <div style="font-size: 13px; font-weight: 800; color: #17231D;">Resume.pdf</div>
              <div style="font-size: 11px; color: #78827D;">2.4 MB &bull; Uploaded</div>
            </div>
          </div>
          <button class="mini-tag-pill mini-tag-green" onclick="alert('Viewing candidate resume...')">View</button>
        </div>

        <!-- Skills Tags -->
        <div style="font-size: 13px; font-weight: 800; color: #17231D; margin-bottom: 8px;">Skills</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px;">
          <span class="mini-tag-pill">React</span>
          <span class="mini-tag-pill">Figma</span>
          <span class="mini-tag-pill">UI/UX</span>
        </div>

        <button class="btn-green-full" onclick="switchScreen('screen-17-assessment')">
          Send Assessment &rarr;
        </button>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 17: ASSESSMENT & SHORTLIST (Custom test dispatch) -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-17-assessment">
      <div class="screen-top-bar">
        <button class="screen-back-btn" onclick="switchScreen('screen-16-applicant-details')">&larr;</button>
        <div class="screen-header-title">Send Assessment</div>
        <div style="width: 38px;"></div>
      </div>

      <div class="screen-padded" style="justify-content: space-between; min-height: 70vh;">
        <div>
          <h2 class="screen-title-bold" style="font-size: 22px;">Send Assessment</h2>
          <p class="screen-desc-muted">Share a custom assessment test with selected candidate.</p>

          <div style="background: #FFFFFF; border: 1.5px solid var(--border-color); border-radius: 20px; padding: 18px; box-shadow: var(--shadow-soft); margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <span style="font-size: 28px;">📝</span>
              <div>
                <div style="font-size: 15px; font-weight: 800; color: #17231D;">UI/UX Design Test</div>
                <div style="font-size: 12px; color: #78827D;">10 Questions &bull; 20 min</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #475569; line-height: 1.5;">
              Evaluates Figma proficiency, component auto-layout, typography hierarchy, and design thinking.
            </div>
          </div>
        </div>

        <div>
          <button class="btn-green-full" onclick="handleSendAssessmentConfirm()">
            Send Assessment &rarr;
          </button>
          <div style="text-align: center; margin-top: 14px;">
            <button type="button" style="background: none; border: none; color: #78827D; font-size: 13px; font-weight: 700; cursor: pointer;" onclick="switchScreen('screen-16-applicant-details')">Back</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- SCREEN 18: HIRE SUCCESS (Candidate Hired!) -->
    <!-- ============================================================= -->
    <div class="screen-view screen-no-nav" id="screen-18-hire-success">
      <div class="screen-padded" style="justify-content: center; text-align: center; min-height: 80vh;">
        <div class="hire-success-circle">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#004D35" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <h1 class="screen-title-bold" style="font-size: 28px; margin-bottom: 8px;">Candidate Hired!</h1>
        <p class="screen-desc-muted" style="max-width: 280px; margin: 0 auto 36px auto;">
          You can manage them from My Team section and coordinate direct onboarding.
        </p>

        <button type="button" class="btn-lime-full" onclick="switchScreen('screen-15-posted-jobs')">
          View Team &rarr;
        </button>

        <div style="margin-top: 16px;">
          <button type="button" style="background: none; border: none; color: #78827D; font-size: 13px; font-weight: 700; cursor: pointer;" onclick="switchScreen('screen-6-map')">
            Back to Map
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================= -->
    <!-- FLOATING BOTTOM NAVIGATION (Active on Screens 6, 9, 10, 11) -->
    <!-- ============================================================= -->
    <nav class="floating-bottom-nav" id="mainBottomNav" style="display: none;">
      <button class="nav-tab-pill active" id="navTabHome" onclick="switchScreen('screen-6-map')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span>Home</span>
      </button>

      <button class="nav-tab-pill" id="navTabMap" onclick="switchScreen('screen-7-map-details')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
        <span>Map</span>
      </button>

      <!-- Center Elevated Lime FAB -->
      <div class="nav-map-center-fab" onclick="handleCenterMapFab()" title="Live Hiring Map">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>

      <button class="nav-tab-pill" id="navTabJobs" onclick="switchScreen('screen-10-jobs-list')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>Jobs</span>
      </button>

      <button class="nav-tab-pill" id="navTabProfile" onclick="switchScreen('screen-11-profile')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </button>
    </nav>

    <!-- Powered by alifeo footer branding -->
    <div class="powered-by-alifeo-bar">
      <span>Powered by</span>
      <img src="${WHERE_IS_MY_JOB_LOGO_BASE64}" alt="Alifeo">
      <span style="font-weight: 800; color: #006B3C;">alifeo</span>
    </div>

  </div>

  <!-- ============================================================= -->
  <!-- CLIENT RUNTIME JAVASCRIPT -->
  <!-- ============================================================= -->
  <script>
    let ACTIVE_SCREEN = 'screen-1-splash';
    let MAP_INSTANCE = null;
    let MAP_MARKERS_LAYER = null;
    let MAP_RADIUS_CIRCLE = null;
    let USER_LOCATION_MARKER = null;
    let USER_COORDS = { lat: 28.8386, lng: 78.7733 }; // Moradabad Hub
    let CURRENT_RADIUS_KM = 30;
    let ALL_JOBS = ${JSON.stringify(jobs)};
    let SELECTED_JOB = ALL_JOBS[0] || null;
    let CURRENT_AUTH_ROLE = 'job_seeker';
    const IS_LOGGED_IN = ${session ? 'true' : 'false'};
    const ACTIVE_USER_ROLE = '${session?.active_role || ''}';

    window.addEventListener('DOMContentLoaded', () => {
      // Screen initialization
      if (IS_LOGGED_IN) {
        if (ACTIVE_USER_ROLE === 'employer') {
          switchScreen('screen-15-posted-jobs');
        } else {
          switchScreen('screen-6-map');
        }
      } else {
        // Splash auto transitions to screen 2 after 1.4s
        setTimeout(() => {
          if (ACTIVE_SCREEN === 'screen-1-splash') {
            switchScreen('screen-2-choose');
          }
        }, 1400);
      }
    });

    // 18 Screens Switcher
    function switchScreen(screenId) {
      document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(screenId);
      if (target) {
        target.classList.add('active');
        ACTIVE_SCREEN = screenId;
      }

      // Bottom nav visibility
      const bottomNav = document.getElementById('mainBottomNav');
      const screensWithNav = ['screen-6-map', 'screen-9-remote-jobs', 'screen-10-jobs-list', 'screen-11-profile'];
      
      if (bottomNav) {
        if (screensWithNav.includes(screenId)) {
          bottomNav.style.display = 'flex';
          updateBottomNavHighlight(screenId);
        } else {
          bottomNav.style.display = 'none';
        }
      }

      // Invalidate Leaflet Map when map screens become visible
      if (screenId === 'screen-6-map') {
        setTimeout(() => {
          initHiringMap();
          if (MAP_INSTANCE) MAP_INSTANCE.invalidateSize();
        }, 150);
      } else if (screenId === 'screen-7-map-details') {
        setTimeout(() => {
          initExpandedMap();
        }, 150);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateBottomNavHighlight(screenId) {
      document.querySelectorAll('.nav-tab-pill').forEach(btn => btn.classList.remove('active'));
      if (screenId === 'screen-6-map') document.getElementById('navTabHome')?.classList.add('active');
      else if (screenId === 'screen-10-jobs-list') document.getElementById('navTabJobs')?.classList.add('active');
      else if (screenId === 'screen-11-profile') document.getElementById('navTabProfile')?.classList.add('active');
    }

    function handleSplashClick() {
      if (IS_LOGGED_IN) {
        switchScreen(ACTIVE_USER_ROLE === 'employer' ? 'screen-15-posted-jobs' : 'screen-6-map');
      } else {
        switchScreen('screen-2-choose');
      }
    }

    function handleChooseHire() {
      if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'job_seeker') {
        // Enforce strict account isolation rule: Candidate cannot switch into hiring partner without separate phone!
        switchScreen('screen-13-switch-hiring');
      } else if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'employer') {
        switchScreen('screen-15-posted-jobs');
      } else {
        CURRENT_AUTH_ROLE = 'employer';
        const badge = document.getElementById('loginRoleBadge');
        if (badge) { badge.innerText = 'Employer / Hiring Mode'; badge.style.background = '#CFF92D'; }
        switchScreen('screen-3-login');
      }
    }

    function handleChooseJob() {
      switchScreen('screen-6-map');
    }

    function handleHireClick() {
      if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'job_seeker') {
        switchScreen('screen-13-switch-hiring');
      } else if (IS_LOGGED_IN && ACTIVE_USER_ROLE === 'employer') {
        switchScreen('screen-14-post-job');
      } else {
        CURRENT_AUTH_ROLE = 'employer';
        const badge = document.getElementById('loginRoleBadge');
        if (badge) badge.innerText = 'Employer / Hiring Mode';
        switchScreen('screen-3-login');
      }
    }

    function handleCenterMapFab() {
      switchScreen('screen-6-map');
      handleEnableLocationGPS();
    }

    function openLoginModal(role = 'job_seeker') {
      CURRENT_AUTH_ROLE = role;
      const badge = document.getElementById('loginRoleBadge');
      if (badge) badge.innerText = role === 'employer' ? 'Employer / Hiring Mode' : 'Candidate Mode';
      switchScreen('screen-3-login');
    }

    // Leaflet Interactive Map View (Alifeo FBS Mobile Look)
    function initHiringMap() {
      const container = document.getElementById('hiringMap');
      if (!container || MAP_INSTANCE) return;

      MAP_INSTANCE = L.map('hiringMap', {
        center: [USER_COORDS.lat, USER_COORDS.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      // Free OpenStreetMap Tiles (Clean, street-level view, no watermark, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(MAP_INSTANCE);

      MAP_MARKERS_LAYER = L.layerGroup().addTo(MAP_INSTANCE);
      drawUserLocationPin(USER_COORDS.lat, USER_COORDS.lng);
      drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    }

    let EXPANDED_MAP_INSTANCE = null;
    function initExpandedMap() {
      const container = document.getElementById('hiringMapExpanded');
      if (!container) return;
      if (EXPANDED_MAP_INSTANCE) {
        EXPANDED_MAP_INSTANCE.invalidateSize();
        return;
      }
      EXPANDED_MAP_INSTANCE = L.map('hiringMapExpanded', {
        center: [USER_COORDS.lat, USER_COORDS.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(EXPANDED_MAP_INSTANCE);
      L.marker([USER_COORDS.lat, USER_COORDS.lng]).addTo(EXPANDED_MAP_INSTANCE);
    }

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
        color: '#15965B',
        fillColor: '#CFF92D',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4',
        radius: radiusKm * 1000
      }).addTo(MAP_INSTANCE);
    }

    function handleEnableLocationGPS() {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        switchScreen('screen-6-map');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          USER_COORDS = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const locEl = document.getElementById('currentLocHeader');
          if (locEl) locEl.innerText = 'Near You, India';
          switchScreen('screen-6-map');
          if (MAP_INSTANCE) {
            MAP_INSTANCE.flyTo([USER_COORDS.lat, USER_COORDS.lng], 13);
            drawUserLocationPin(USER_COORDS.lat, USER_COORDS.lng);
            drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
            loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
          }
        },
        () => {
          switchScreen('screen-6-map');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    function handleSkipLocation() {
      switchScreen('screen-6-map');
    }

    function handleLocationPickerClick() {
      const city = prompt('Enter City (e.g. Moradabad, Delhi, Noida, Bangalore):', 'Moradabad');
      if (city) {
        const locEl = document.getElementById('currentLocHeader');
        if (locEl) locEl.innerText = city + ', India';
        loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM, city);
      }
    }

    function toggleRadiusSelector() {
      const el = document.getElementById('radiusFilterBar');
      if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none';
    }

    function selectRadiusKm(km) {
      CURRENT_RADIUS_KM = km;
      drawRadiusCircle(USER_COORDS.lat, USER_COORDS.lng, km);
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, km);
      toggleRadiusSelector();
    }

    async function loadMapJobs(lat, lng, radiusKm, cityQuery = '') {
      try {
        const q = document.getElementById('mapSearchInput')?.value.trim() || cityQuery || '';
        const res = await fetch('/api/jobs/map?lat=' + lat + '&lng=' + lng + '&radius=' + radiusKm + '&q=' + encodeURIComponent(q));
        const data = await res.json();
        if (data.success) {
          ALL_JOBS = data.jobs || [];
          renderMapMarkers(data.companies || []);
          renderNearbyFeed(ALL_JOBS);
          const badge = document.getElementById('nearbyCountBadge');
          if (badge) badge.innerText = data.total_jobs + ' Openings';
        }
      } catch (e) {
        console.error('Error fetching jobs:', e);
      }
    }

    function handleSearchMapJobs() {
      loadMapJobs(USER_COORDS.lat, USER_COORDS.lng, CURRENT_RADIUS_KM);
    }

    // Render Markers & Callout Badges on Leaflet Map
    function renderMapMarkers(companies) {
      if (!MAP_MARKERS_LAYER) return;
      MAP_MARKERS_LAYER.clearLayers();

      companies.forEach((comp, idx) => {
        if (!comp.latitude || !comp.longitude) return;

        // Physical green teardrop marker (On-site & Hybrid only)
        const pinHtml = \`
          <div class="company-teardrop-marker" onclick="openMapDetailsSheet('\${comp.jobs[0]?.id}')">
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
        marker.on('click', () => {
          if (comp.jobs[0]) openMapDetailsSheet(comp.jobs[0].id);
        });
        MAP_MARKERS_LAYER.addLayer(marker);

        // Floating Callout Badge above first few jobs (matching screenshot!)
        if (comp.jobs && comp.jobs[0] && idx < 3) {
          const firstJob = comp.jobs[0];
          const offsetLat = comp.latitude + (idx === 0 ? 0.0035 : idx === 1 ? -0.003 : 0.0025);
          const offsetLng = comp.longitude + (idx === 0 ? 0.004 : idx === 1 ? -0.004 : -0.004);

          const calloutHtml = \`
            <div class="map-job-callout-badge" onclick="openJobDetailById('\${firstJob.id}')">
              <span>\${firstJob.title.length > 18 ? firstJob.title.substring(0, 16) + '...' : firstJob.title}</span>
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
          calloutMarker.on('click', () => openJobDetailById(firstJob.id));
          MAP_MARKERS_LAYER.addLayer(calloutMarker);
        }
      });
    }

    function renderNearbyFeed(jobsList) {
      const c = document.getElementById('nearbyJobsListContainer');
      if (!c) return;
      if (!jobsList || jobsList.length === 0) {
        c.innerHTML = '<div style="text-align: center; color: #78827D; padding: 24px; font-size: 13px;">No openings found matching this radius.</div>';
        return;
      }
      c.innerHTML = jobsList.slice(0, 6).map(j => \`
        <div class="alifeo-job-card" onclick="openJobDetailById('\${j.id}')">
          <div class="job-card-top-info">
            <div class="company-avatar-box">
              \${j.company_logo ? \`<img src="\${j.company_logo}">\` : \`<div class="company-avatar-initials">\${escapeHtml((j.company_name || 'Alifeo').substring(0, 2).toUpperCase())}</div>\`}
            </div>
            <div class="job-meta-column">
              <div class="company-name-verified">
                <span>\${escapeHtml(j.company_name || 'Alifeo Partner')}</span>
                <span class="check-green-svg">✓</span>
              </div>
              <div class="job-card-main-title">\${escapeHtml(j.title)}</div>
              <div class="job-distance-row">
                <span>📍 <strong>\${j.distance_km !== undefined ? j.distance_km + ' km' : 'Nearby'}</strong></span>
                <span>&bull;</span>
                <span>\${escapeHtml(j.city)}</span>
                <span>&bull;</span>
                <span>\${escapeHtml(j.salary_display || 'Competitive')}</span>
              </div>
            </div>
          </div>
          <div class="job-card-bottom-bar">
            <div class="job-tags-group">
              <span class="mini-tag-pill mini-tag-green">\${escapeHtml(j.job_type === 'internship' ? 'Internship' : 'Full Time')}</span>
              <span class="mini-tag-pill">\${escapeHtml(j.work_mode.toUpperCase())}</span>
              <span class="mini-tag-pill">\${escapeHtml((j.required_skills || j.skills || 'General').split(',')[0] || 'Direct')}</span>
            </div>
            <button class="btn-lime-apply" onclick="event.stopPropagation(); openJobDetailById('\${j.id}')">
              Apply &rarr;
            </button>
          </div>
        </div>
      \`).join('');
    }

    // Screen 7: Map Details Sheet
    function openMapDetailsSheet(jobId) {
      const job = ALL_JOBS.find(j => j.id === jobId);
      if (!job) return;
      SELECTED_JOB = job;

      document.getElementById('mfcCompany').innerText = job.company_name || 'Alifeo Partner';
      document.getElementById('mfcTitle').innerText = job.title;
      document.getElementById('mfcSalary').innerText = job.salary_display || 'Competitive';
      document.getElementById('mfcLocation').innerText = '📍 ' + (job.distance_km !== undefined ? job.distance_km + ' km' : 'Nearby') + ' • ' + (job.job_type === 'internship' ? 'Internship' : 'Full Time');

      switchScreen('screen-7-map-details');
    }

    function handleViewDetailsFromMapSheet() {
      if (SELECTED_JOB) openJobDetailById(SELECTED_JOB.id);
    }

    // Screen 8: Job Details Full View
    function openJobDetailById(jobId) {
      const job = ALL_JOBS.find(j => j.id === jobId);
      if (!job) return;
      SELECTED_JOB = job;

      document.getElementById('jdCompany').innerText = job.company_name || 'Alifeo Partner';
      document.getElementById('jdMainTitle').innerText = job.title;
      document.getElementById('jdMetaRow').innerText = '📍 ' + (job.distance_km !== undefined ? job.distance_km + ' km' : 'Nearby') + ' • ' + job.city;
      document.getElementById('jdSalaryDisplay').innerText = job.salary_display || 'Competitive';
      document.getElementById('jdDescriptionText').innerText = job.description || 'Join our verified company team with attractive benefits.';

      switchScreen('screen-8-job-details');
    }

    async function handleJobApplyClick() {
      if (!IS_LOGGED_IN) {
        openLoginModal('job_seeker');
        return;
      }
      if (!SELECTED_JOB) return;

      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id: SELECTED_JOB.id })
        });
        const data = await res.json();
        if (data.success) {
          alert('Application successfully submitted to ' + SELECTED_JOB.company_name + '!');
          switchScreen('screen-12-chat');
        } else {
          alert(data.error || 'Failed to submit application');
        }
      } catch (e) {
        alert('Network error submitting application');
      }
    }

    // Screen 3: WhatsApp OTP Auth
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
        alert('Network error sending OTP');
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

    // Screen 4: Profile Photos & Resumes
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

    function handleResumeFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      document.getElementById('resumeUploadLabel').innerText = file.name;
    }

    function toggleSkillTag(el, skillName) {
      const input = document.getElementById('spSkills');
      if (!input) return;
      let current = input.value.split(',').map(s => s.trim()).filter(Boolean);
      if (current.includes(skillName)) {
        current = current.filter(s => s !== skillName);
        el.classList.remove('mini-tag-green');
      } else {
        current.push(skillName);
        el.classList.add('mini-tag-green');
      }
      input.value = current.join(', ');
    }

    async function handleSaveSeekerProfile(event) {
      event.preventDefault();
      const name = document.getElementById('spName')?.value.trim() || '';
      const photo_url = document.getElementById('spPhotoUrl')?.value || '';
      const skills = document.getElementById('spSkills')?.value.trim() || '';

      try {
        const res = await fetch('/api/profile/seeker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, photo_url, skills })
        });
        const data = await res.json();
        if (data.success) {
          switchScreen('screen-5-location');
        } else {
          alert(data.error || 'Failed to update profile');
        }
      } catch (e) {
        switchScreen('screen-5-location');
      }
    }

    // Screen 12: Live Chat
    function handleSendLiveChatMessage() {
      const input = document.getElementById('chatInputMessage');
      const text = input?.value.trim();
      if (!text) return;
      const thread = document.getElementById('chatThreadContainer');
      if (thread) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble-sent';
        bubble.innerHTML = escapeHtml(text) + '<div style="font-size: 10px; color: #059669; text-align: right; margin-top: 4px;">Just now</div>';
        thread.appendChild(bubble);
        thread.scrollTop = thread.scrollHeight;
      }
      input.value = '';
    }

    // Screen 13: Strict Account Isolation Switching
    async function handleSwitchToHiringLogout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      CURRENT_AUTH_ROLE = 'employer';
      const badge = document.getElementById('loginRoleBadge');
      if (badge) badge.innerText = 'Employer / Hiring Mode';
      switchScreen('screen-3-login');
    }

    // Screen 14: Post Job Free
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

    async function submitPostJobForm() {
      const title = document.getElementById('pjTitle').value.trim();
      const company_name = document.getElementById('pjCompany').value.trim();
      const company_logo = document.getElementById('pjLogoUrl')?.value || '';
      const job_type = document.getElementById('pjType').value;
      const experience_level = document.getElementById('pjExp').value;
      const city = document.getElementById('pjCity').value.trim();
      const salary_display = document.getElementById('pjSalary').value.trim();
      const required_skills = document.getElementById('pjSkills').value.trim();
      const description = document.getElementById('pjDesc').value.trim();

      if (!title || !company_name || !city) {
        alert('Please fill out required fields');
        return;
      }

      try {
        const res = await fetch('/api/employer/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title, company_name, company_logo, job_type, experience_level,
            city, salary_display, required_skills, description,
            work_mode: 'onsite', submit_for_review: true
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('Job posted! Live on candidate map after review.');
          switchScreen('screen-15-posted-jobs');
        } else {
          alert(data.error || 'Failed to post job');
        }
      } catch (e) {
        alert('Network error posting job');
      }
    }

    // Screen 17: Assessment Confirm
    function handleSendAssessmentConfirm() {
      alert('UI/UX Design Test sent to candidate chat thread!');
      switchScreen('screen-12-chat');
    }

    async function handleLogout() {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    }

    function showNotificationAlert() {
      alert('🔔 Job Alerts: 2 new opportunities match your skills in Moradabad!');
    }

    function filterJobList(type) {
      // filter list
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
