export const JOB_PORTAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    --primary-lime: #CFF92D;
    --primary-lime-hover: #bde81d;
    --primary-dark-green: #006B3C;
    --deep-green: #004D35;
    --white: #FFFFFF;
    --bg-page: #F8FAF7;
    --primary-text: #17231D;
    --secondary-text: #78827D;
    --border-color: #E8ECE8;
    --success: #15965B;
    --error: #E54848;
    
    --shadow-soft: 0 4px 18px rgba(0, 0, 0, 0.05);
    --shadow-elevated: 0 8px 26px rgba(0, 0, 0, 0.09);
    --radius-card: 20px;
    --radius-pill: 100px;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background-color: #E8ECE8;
    color: var(--primary-text);
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* Master Mobile App Frame (390 x 844 reference, responsive on desktop) */
  .mobile-app-frame {
    width: 100%;
    max-width: 440px;
    min-height: 100vh;
    background: var(--bg-page);
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.12);
  }

  @media (min-width: 768px) {
    body {
      padding: 24px 0 40px 0;
    }
    .mobile-app-frame {
      border-radius: 40px;
      overflow: hidden;
      min-height: 880px;
      border: 8px solid #FFFFFF;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.18);
    }
  }

  /* Status Bar (9:41, Cellular, Wifi, Battery) */
  .app-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px 6px 20px;
    font-size: 13px;
    font-weight: 700;
    color: var(--primary-text);
    background: var(--white);
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  .status-bar-icons {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* App Views Container (18 Screens) */
  .screen-view {
    display: none;
    flex-direction: column;
    flex: 1;
    width: 100%;
    padding-bottom: 90px;
    position: relative;
    background: var(--bg-page);
  }
  .screen-view.active {
    display: flex;
    animation: fadeInScreen 0.25s ease-out;
  }
  @keyframes fadeInScreen {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Screen without bottom nav padding */
  .screen-no-nav {
    padding-bottom: 24px;
  }

  /* Screen Header Bar */
  .screen-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background: var(--white);
  }
  .screen-back-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--bg-page);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--primary-text);
    font-size: 16px;
    transition: all 0.15s ease;
  }
  .screen-back-btn:hover {
    background: #FFFFFF;
    border-color: var(--primary-dark-green);
  }
  .screen-header-title {
    font-size: 17px;
    font-weight: 800;
    color: var(--primary-text);
  }

  /* Brand Header (Screen 6) */
  .app-brand-badge {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .app-logo-sq {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: var(--primary-lime);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .app-logo-sq img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .app-brand-name {
    font-size: 22px;
    font-weight: 800;
    color: var(--primary-dark-green);
    letter-spacing: -0.5px;
  }

  .btn-icon-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-page);
    border: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease;
  }
  .btn-icon-circle:hover {
    background: #FFFFFF;
    border-color: var(--primary-dark-green);
  }
  .badge-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: var(--success);
    border-radius: 50%;
    border: 2px solid #FFFFFF;
  }

  /* Candidate Greeting Header (Screen 6) */
  .candidate-hero-header {
    padding: 12px 20px 8px 20px;
    background: var(--white);
  }
  .hero-hyy {
    font-size: 19px;
    font-weight: 700;
    color: var(--primary-text);
  }
  .hero-main-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--primary-text);
    letter-spacing: -0.6px;
    margin-top: 2px;
  }
  .hero-main-title span {
    color: var(--primary-dark-green);
  }

  /* Location Row */
  .loc-pill-row {
    padding: 6px 20px 14px 20px;
    background: var(--white);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .loc-pin-icon {
    color: var(--primary-dark-green);
  }
  .loc-texts {
    display: flex;
    flex-direction: column;
  }
  .loc-tiny {
    font-size: 10px;
    font-weight: 600;
    color: var(--secondary-text);
  }
  .loc-bold {
    font-size: 13px;
    font-weight: 800;
    color: var(--primary-text);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Dual Action Hero Banners (Screen 6) */
  .hero-dual-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 4px 20px 14px 20px;
    background: var(--white);
  }
  .dual-card {
    border-radius: var(--radius-card);
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    position: relative;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .dual-card:hover {
    transform: translateY(-2px);
  }
  .dual-card-hire {
    background: var(--primary-lime);
    box-shadow: 0 4px 14px rgba(207, 249, 45, 0.4);
  }
  .dual-card-job {
    background: var(--bg-page);
    border: 1px solid var(--border-color);
  }
  .dual-card-icon {
    font-size: 22px;
  }
  .dual-card-title {
    font-size: 15px;
    font-weight: 800;
    color: var(--deep-green);
    line-height: 1.25;
  }
  .dual-card-job .dual-card-title {
    color: var(--primary-text);
  }
  .dual-card-sub {
    font-size: 11px;
    font-weight: 500;
    color: #166534;
    margin-top: 3px;
  }
  .dual-card-job .dual-card-sub {
    color: var(--secondary-text);
  }
  .dual-card-arrow {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--primary-dark-green);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
  }

  /* Floating Search Bar */
  .search-bar-wrap {
    padding: 0 20px 14px 20px;
    background: var(--white);
    position: relative;
    z-index: 100;
  }
  .search-pill-container {
    display: flex;
    align-items: center;
    background: #FFFFFF;
    border: 1.5px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 5px 6px 5px 16px;
    box-shadow: var(--shadow-soft);
    transition: all 0.2s ease;
  }
  .search-pill-container:focus-within {
    border-color: var(--primary-dark-green);
    box-shadow: 0 4px 20px rgba(0, 107, 60, 0.12);
  }
  .search-field-input {
    flex: 1;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text);
    background: transparent;
  }
  .search-field-input::placeholder {
    color: #94A3B8;
  }
  .search-filter-lime-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--primary-lime);
    border: none;
    color: var(--deep-green);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(207, 249, 45, 0.4);
    transition: transform 0.15s ease;
  }
  .search-filter-lime-btn:hover {
    transform: scale(1.05);
  }

  /* Interactive Map Section (Alifeo FBS Look) */
  .map-box-wrap {
    position: relative;
    width: 100%;
    height: 380px;
    background: #E8ECE8;
    overflow: hidden;
  }
  #hiringMap {
    width: 100%;
    height: 100%;
  }

  /* Floating Map Pills */
  .map-float-pill {
    position: absolute;
    top: 14px;
    left: 16px;
    z-index: 400;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 6px 14px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 700;
    color: var(--primary-text);
    box-shadow: var(--shadow-soft);
  }
  .map-pill-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
  }
  .map-float-gps-btn {
    position: absolute;
    top: 14px;
    right: 16px;
    z-index: 400;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--primary-text);
    transition: transform 0.2s ease;
  }
  .map-float-gps-btn:hover {
    transform: rotate(90deg);
  }

  /* Floating Map Job Callout Badges */
  .map-job-callout-badge {
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 6px 12px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    font-size: 11px;
    font-weight: 700;
    color: var(--primary-text);
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  .map-job-callout-badge:hover {
    transform: translateY(-2px);
    border-color: var(--primary-dark-green);
  }
  .map-callout-salary-green {
    color: var(--primary-dark-green);
    font-weight: 800;
  }

  /* Teardrop Company Marker */
  .custom-company-pin-wrapper {
    background: transparent;
    border: none;
  }
  .company-teardrop-marker {
    width: 36px;
    height: 36px;
    border-radius: 50% 50% 50% 0;
    background: #10B981;
    border: 2.5px solid #FFFFFF;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  .company-teardrop-marker:hover {
    transform: rotate(-45deg) scale(1.15);
  }
  .company-marker-inner {
    transform: rotate(45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 13px;
  }
  .company-marker-inner img {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: cover;
  }

  /* Pulsing User GPS Marker */
  .user-gps-container {
    background: transparent;
    border: none;
  }
  .user-gps-marker {
    width: 22px;
    height: 22px;
    background: #2563EB;
    border: 3.5px solid #FFFFFF;
    border-radius: 50%;
    position: relative;
    box-shadow: 0 0 14px rgba(37, 99, 235, 0.7);
  }
  .user-gps-pulse {
    position: absolute;
    top: -12px;
    left: -12px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #3B82F6;
    animation: gpsPulse 2s infinite ease-out;
  }
  @keyframes gpsPulse {
    0% { transform: scale(0.6); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }

  /* Nearby Jobs Bottom Drawer (Screen 6) */
  .nearby-jobs-drawer {
    background: var(--white);
    border-radius: 28px 28px 0 0;
    margin-top: -24px;
    position: relative;
    z-index: 500;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.08);
    padding: 14px 20px 24px 20px;
    flex: 1;
  }
  .drawer-drag-pill {
    width: 44px;
    height: 4.5px;
    background: #CBD5E1;
    border-radius: 100px;
    margin: 0 auto 14px auto;
  }
  .drawer-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .drawer-heading-text {
    font-size: 18px;
    font-weight: 800;
    color: var(--primary-text);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .drawer-see-link {
    font-size: 13px;
    font-weight: 700;
    color: var(--primary-dark-green);
    cursor: pointer;
  }

  /* Job Cards */
  .alifeo-job-card {
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-card);
    padding: 16px;
    box-shadow: var(--shadow-soft);
    margin-bottom: 12px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
  }
  .alifeo-job-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-elevated);
  }
  .job-card-top-info {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .company-avatar-box {
    width: 58px;
    height: 58px;
    border-radius: 14px;
    background: #ECFDF5;
    border: 1px solid #D1FAE5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .company-avatar-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .company-avatar-initials {
    font-weight: 800;
    font-size: 18px;
    color: var(--primary-dark-green);
  }
  .job-meta-column {
    flex: 1;
  }
  .company-name-verified {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text);
  }
  .check-green-svg {
    color: var(--success);
    display: inline-flex;
  }
  .job-card-main-title {
    font-size: 16px;
    font-weight: 800;
    color: var(--primary-text);
    margin-top: 2px;
    line-height: 1.25;
  }
  .job-distance-row {
    font-size: 12px;
    font-weight: 600;
    color: var(--secondary-text);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .job-distance-row strong {
    color: var(--primary-dark-green);
  }

  .job-card-bottom-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #F1F5F9;
  }
  .job-tags-group {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .mini-tag-pill {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 9px;
    border-radius: 100px;
    background: #F1F5F9;
    color: var(--secondary-text);
  }
  .mini-tag-green {
    background: #ECFDF5;
    color: #065F46;
  }

  /* Lime Apply Button */
  .btn-lime-apply {
    background: var(--primary-lime);
    color: var(--deep-green);
    font-weight: 800;
    font-size: 13px;
    padding: 8px 18px;
    border-radius: var(--radius-pill);
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 3px 10px rgba(207, 249, 45, 0.4);
    transition: all 0.15s ease;
  }
  .btn-lime-apply:hover {
    background: var(--primary-lime-hover);
    transform: scale(1.04);
  }

  /* Floating Bottom Navigation Bar (Screens 6, 9, 10, 11) */
  .floating-bottom-nav {
    position: fixed;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 400px;
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-elevated);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 8px 10px;
    z-index: 1000;
  }
  .nav-tab-pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 700;
    color: var(--secondary-text);
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 5px 12px;
    border-radius: var(--radius-pill);
  }
  .nav-tab-pill.active {
    background: var(--primary-lime);
    color: var(--deep-green);
  }

  /* Center Elevated FAB */
  .nav-map-center-fab {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--primary-lime);
    border: 3px solid #FFFFFF;
    box-shadow: 0 4px 16px rgba(207, 249, 45, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--deep-green);
    cursor: pointer;
    margin-top: -24px;
    transition: transform 0.15s ease;
  }
  .nav-map-center-fab:hover {
    transform: scale(1.08);
  }

  /* Specific Screen Styles */
  .screen-padded {
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .screen-title-bold {
    font-size: 24px;
    font-weight: 800;
    color: var(--primary-text);
    margin-bottom: 6px;
    line-height: 1.25;
  }
  .screen-desc-muted {
    font-size: 13px;
    font-weight: 500;
    color: var(--secondary-text);
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .form-group-app {
    margin-bottom: 16px;
  }
  .form-label-app {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--primary-text);
    margin-bottom: 6px;
  }
  .form-input-app {
    width: 100%;
    padding: 13px 16px;
    border-radius: 14px;
    border: 1.5px solid var(--border-color);
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text);
    outline: none;
    transition: border-color 0.2s ease;
    background: #FFFFFF;
  }
  .form-input-app:focus {
    border-color: var(--primary-dark-green);
  }

  .btn-lime-full {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius-pill);
    background: var(--primary-lime);
    color: var(--deep-green);
    font-size: 14px;
    font-weight: 800;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(207, 249, 45, 0.4);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-lime-full:hover {
    background: var(--primary-lime-hover);
    transform: translateY(-1px);
  }
  .btn-green-full {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius-pill);
    background: var(--primary-dark-green);
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 800;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 107, 60, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  /* Profile Menu List (Screen 11) */
  .profile-menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .profile-menu-item:hover {
    border-color: var(--primary-dark-green);
    transform: translateX(2px);
  }
  .profile-menu-left {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    font-weight: 700;
    color: var(--primary-text);
  }

  /* Chat Bubbles (Screen 12) */
  .chat-bubble-received {
    align-self: flex-start;
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 18px 18px 18px 4px;
    padding: 12px 16px;
    max-width: 80%;
    font-size: 13px;
    margin-bottom: 8px;
    box-shadow: var(--shadow-soft);
  }
  .chat-bubble-sent {
    align-self: flex-end;
    background: #ECFDF5;
    border: 1px solid #D1FAE5;
    border-radius: 18px 18px 4px 18px;
    padding: 12px 16px;
    max-width: 80%;
    font-size: 13px;
    color: var(--deep-green);
    margin-bottom: 8px;
  }

  /* Screen 1: Splash Screen */
  .splash-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 85vh;
    padding: 40px 20px;
    text-align: center;
    position: relative;
    cursor: pointer;
  }
  .splash-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 280px;
    height: 280px;
    opacity: 0.08;
    pointer-events: none;
  }
  .splash-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #E2E8F0;
    border-top: 3px solid var(--primary-lime);
    border-radius: 50%;
    animation: spinAnim 0.9s linear infinite;
    margin-top: 40px;
  }
  @keyframes spinAnim {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Screen 2: Choose Option */
  .choose-option-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    padding: 30px 20px 20px 20px;
  }
  .choose-card-large {
    border-radius: 24px;
    padding: 24px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 150px;
    position: relative;
  }
  .choose-card-large:hover {
    transform: translateY(-2px);
  }
  .choose-card-hire {
    background: var(--primary-lime);
    box-shadow: 0 8px 24px rgba(207, 249, 45, 0.4);
  }
  .choose-card-job {
    background: #FFFFFF;
    border: 1.5px solid var(--border-color);
    box-shadow: var(--shadow-soft);
  }

  /* Screen 5: Enable Location Graphic */
  .location-circle-graphic {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    background: #ECFDF5;
    border: 8px solid #D1FAE5;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px auto 28px auto;
    color: var(--primary-dark-green);
  }

  /* Screen 7: Map Job Details Floating Sheet */
  .map-floating-bottom-sheet {
    position: absolute;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: #FFFFFF;
    border-radius: 22px;
    padding: 16px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    z-index: 600;
  }

  /* Screen 9: Remote Jobs 100+ Banner */
  .remote-hero-banner {
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    border-radius: 18px;
    padding: 14px 18px;
    margin: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--deep-green);
    font-weight: 800;
  }

  /* Screen 18: Celebration Circle */
  .hire-success-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--primary-lime);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40px auto 20px auto;
    box-shadow: 0 8px 24px rgba(207, 249, 45, 0.5);
    color: var(--deep-green);
  }

  /* Powered by alifeo footer branding */
  .powered-by-alifeo-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 0 16px 0;
    font-size: 13px;
    font-weight: 700;
    color: var(--secondary-text);
  }
  .powered-by-alifeo-bar img {
    height: 24px;
    border-radius: 6px;
  }

  /* Modal Overlay */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    display: none;
    align-items: flex-end;
    justify-content: center;
    z-index: 2000;
  }
  .modal-overlay.active {
    display: flex;
  }
  .modal-content-bottom {
    background: #FFFFFF;
    border-radius: 28px 28px 0 0;
    width: 100%;
    max-width: 440px;
    max-height: 85vh;
    overflow-y: auto;
    padding: 20px;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
    animation: slideModalUp 0.25s ease-out;
  }
  @keyframes slideModalUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  /* Hide Leaflet Controls */
  .leaflet-control-attribution { display: none !important; }
  .leaflet-control-zoom { display: none !important; }
`;
