export const JOB_PORTAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:ital,wght@0,700;0,800;1,800;1,900&display=swap');

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
    
    --shadow-soft: 0 4px 18px rgba(0, 0, 0, 0.04);
    --shadow-elevated: 0 8px 28px rgba(0, 0, 0, 0.08);
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
    background-color: var(--bg-page);
    color: var(--primary-text);
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* Typography Branding */
  .brand-alifeo-italic {
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    font-style: italic;
    color: var(--primary-dark-green);
    letter-spacing: -0.5px;
  }

  /* Full responsive app canvas */
  .portal-wrapper {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-page);
    position: relative;
  }

  .portal-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    .portal-container {
      padding: 0 14px;
    }
  }

  /* Top Global Header */
  .global-header {
    background: var(--white);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  @media (max-width: 768px) {
    .header-inner {
      height: 58px;
    }
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  .brand-logo-img {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0, 107, 60, 0.15);
  }
  .brand-title-wrap {
    display: flex;
    flex-direction: column;
  }
  .brand-title {
    font-size: 17px;
    font-weight: 900;
    color: var(--primary-text);
    line-height: 1.15;
    letter-spacing: -0.3px;
  }
  .brand-title span {
    color: var(--primary-dark-green);
  }
  .brand-tagline {
    font-size: 11px;
    font-weight: 700;
    color: var(--secondary-text);
    margin-top: 1px;
  }

  /* Header Desktop Navigation */
  .desktop-nav-links {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .nav-link-btn {
    font-size: 13px;
    font-weight: 700;
    color: var(--secondary-text);
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: var(--radius-pill);
    border: none;
    background: transparent;
  }
  .nav-link-btn:hover, .nav-link-btn.active {
    color: var(--primary-dark-green);
    background: #ECFDF5;
  }
  .btn-hiring-partner-pill {
    font-size: 12px;
    font-weight: 800;
    color: var(--deep-green);
    background: var(--primary-lime);
    padding: 7px 16px;
    border-radius: var(--radius-pill);
    box-shadow: 0 2px 10px rgba(207, 249, 45, 0.45);
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  .btn-hiring-partner-pill:hover {
    transform: scale(1.03);
  }

  @media (max-width: 768px) {
    .desktop-nav-links {
      display: none;
    }
  }

  /* Screen View Container */
  .screen-view {
    display: none;
    flex-direction: column;
    flex: 1;
    width: 100%;
  }
  .screen-view.active {
    display: flex;
    animation: fadeInScreen 0.2s ease-out;
  }
  @keyframes fadeInScreen {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Candidate Hero Bar */
  .candidate-hero-bar {
    padding: 14px 0 10px 0;
  }
  .hero-greeting {
    font-size: 14px;
    font-weight: 700;
    color: var(--secondary-text);
  }
  .hero-heading {
    font-size: 24px;
    font-weight: 900;
    color: var(--primary-text);
    letter-spacing: -0.5px;
    line-height: 1.2;
    margin-top: 2px;
  }
  .hero-heading span {
    color: var(--primary-dark-green);
  }

  /* Location Bar & Search Controls */
  .search-location-panel {
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 10px 14px;
    box-shadow: var(--shadow-soft);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .loc-badge-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 10px;
    transition: background 0.15s ease;
  }
  .loc-badge-wrap:hover {
    background: #F8FAF7;
  }
  .search-input-box {
    flex: 1;
    min-width: 200px;
    display: flex;
    align-items: center;
    background: #F8FAF7;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 6px 12px;
  }
  .search-input-box input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--primary-text);
  }

  /* Radius Selector Pills */
  .radius-selector-row {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
  }

  /* Live Map Container Box (Zomato-type map first) */
  .map-container-box {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    height: 420px;
    background: #E8ECE8;
    box-shadow: var(--shadow-soft);
    border: 1px solid var(--border-color);
    margin-bottom: 16px;
  }
  @media (max-width: 768px) {
    .map-container-box {
      height: 380px;
      border-radius: 18px;
    }
  }
  #hiringMap {
    width: 100%;
    height: 100%;
  }

  /* Map Layer Switcher (Streets vs Satellite) */
  .map-layer-switcher {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 400;
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 3px;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: var(--shadow-soft);
  }
  .map-layer-btn {
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: 11px;
    font-weight: 800;
    color: var(--secondary-text);
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .map-layer-btn.active {
    background: var(--primary-dark-green);
    color: #FFFFFF;
    box-shadow: 0 2px 6px rgba(0, 107, 60, 0.25);
  }

  .map-gps-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 400;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--primary-dark-green);
    transition: transform 0.2s ease;
  }
  .map-gps-btn:hover {
    transform: rotate(90deg);
  }

  /* Candidate Primary Discovery Banners (Nearby vs Remote) */
  .candidate-discovery-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 20px;
  }
  @media (max-width: 640px) {
    .candidate-discovery-grid {
      grid-template-columns: 1fr;
    }
  }

  .discovery-card {
    border-radius: 18px;
    padding: 16px;
    cursor: pointer;
    position: relative;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 110px;
  }
  .discovery-card:hover {
    transform: translateY(-2px);
  }
  .discovery-card-nearby {
    background: var(--primary-lime);
    box-shadow: 0 4px 16px rgba(207, 249, 45, 0.35);
  }
  .discovery-card-remote {
    background: #FFFFFF;
    border: 1.5px solid var(--border-color);
    box-shadow: var(--shadow-soft);
  }
  .discovery-badge-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-dark-green);
  }
  .discovery-card-remote .discovery-badge-icon {
    background: #ECFDF5;
  }
  .discovery-title {
    font-size: 16px;
    font-weight: 900;
    line-height: 1.2;
    color: var(--deep-green);
  }
  .discovery-card-remote .discovery-title {
    color: var(--primary-text);
  }
  .discovery-sub {
    font-size: 11px;
    font-weight: 600;
    color: #166534;
    margin-top: 3px;
  }
  .discovery-card-remote .discovery-sub {
    color: var(--secondary-text);
  }

  /* Teardrop Job Pin Marker (Clear, Modern, No Overlap) */
  .custom-company-pin-wrapper {
    background: transparent;
    border: none;
  }
  .company-teardrop-marker {
    width: 36px;
    height: 36px;
    border-radius: 50% 50% 50% 0;
    background: #006B3C;
    border: 2.5px solid #FFFFFF;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(0, 107, 60, 0.4);
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

  /* Real Callout Tooltip Badge: Perfectly Anchored Above Pin Tip */
  .leaflet-tooltip-pane .leaflet-tooltip.clean-job-tooltip {
    background: #FFFFFF !important;
    border: 1.5px solid var(--border-color) !important;
    border-radius: 100px !important;
    padding: 4px 10px !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14) !important;
    font-family: 'Poppins', sans-serif !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    color: var(--primary-text) !important;
    white-space: nowrap !important;
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
    pointer-events: auto !important;
    cursor: pointer !important;
  }
  .leaflet-tooltip-pane .leaflet-tooltip.clean-job-tooltip:before {
    border-top-color: #FFFFFF !important;
  }
  .clean-job-tooltip .tooltip-salary {
    color: var(--primary-dark-green);
    font-weight: 900;
  }

  /* User GPS Pulsing Marker */
  .user-gps-container {
    background: transparent;
    border: none;
  }
  .user-gps-marker {
    width: 20px;
    height: 20px;
    background: #2563EB;
    border: 3px solid #FFFFFF;
    border-radius: 50%;
    position: relative;
    box-shadow: 0 0 16px rgba(37, 99, 235, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .user-gps-label {
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    background: #2563EB;
    color: #FFFFFF;
    font-size: 9px;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 100px;
    white-space: nowrap;
  }
  .user-gps-pulse {
    position: absolute;
    top: -9px;
    left: -9px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid #3B82F6;
    animation: gpsPulse 2s infinite ease-out;
  }
  @keyframes gpsPulse {
    0% { transform: scale(0.6); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  }

  /* Nearby Openings Grid Layout */
  .feed-panel {
    display: flex;
    flex-direction: column;
    margin-bottom: 40px;
  }
  .feed-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .feed-title {
    font-size: 17px;
    font-weight: 900;
    color: var(--primary-text);
  }

  .alifeo-job-card {
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 14px;
    box-shadow: var(--shadow-soft);
    margin-bottom: 12px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
  }
  .alifeo-job-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-elevated);
    border-color: #A7F3D0;
  }
  .job-card-top {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .company-avatar-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
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
    font-size: 15px;
    color: var(--primary-dark-green);
  }
  .job-meta-col {
    flex: 1;
  }
  .company-name-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 700;
    color: var(--secondary-text);
  }
  .job-title-text {
    font-size: 15px;
    font-weight: 800;
    color: var(--primary-text);
    margin-top: 2px;
    line-height: 1.25;
  }
  .job-sub-row {
    font-size: 11px;
    font-weight: 600;
    color: var(--secondary-text);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .job-sub-row strong {
    color: var(--primary-dark-green);
  }

  .job-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid #F1F5F9;
  }
  .tag-pills-row {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .mini-tag-pill {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: var(--radius-pill);
    background: #F1F5F9;
    color: var(--secondary-text);
    border: none;
    cursor: pointer;
  }
  .mini-tag-green {
    background: #ECFDF5;
    color: #065F46;
  }

  .btn-lime-apply {
    background: var(--primary-lime);
    color: var(--deep-green);
    font-weight: 800;
    font-size: 12px;
    padding: 7px 16px;
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

  /* Modals */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 14px;
  }
  .modal-overlay.active {
    display: flex;
  }
  .modal-card {
    background: #FFFFFF;
    border-radius: 22px;
    width: 100%;
    max-width: 460px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    animation: zoomModalIn 0.2s ease-out;
    position: relative;
  }
  @keyframes zoomModalIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .modal-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .modal-title-text {
    font-size: 17px;
    font-weight: 800;
    color: var(--primary-text);
  }
  .modal-close-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #F1F5F9;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    color: var(--secondary-text);
  }

  .form-group-ui {
    margin-bottom: 14px;
  }
  .form-label-ui {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--primary-text);
    margin-bottom: 6px;
  }
  .form-input-ui {
    width: 100%;
    padding: 11px 14px;
    border-radius: 12px;
    border: 1.5px solid var(--border-color);
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text);
    outline: none;
    background: #FFFFFF;
  }
  .form-input-ui:focus {
    border-color: var(--primary-dark-green);
  }

  .btn-lime-submit {
    width: 100%;
    padding: 12px;
    border-radius: var(--radius-pill);
    background: var(--primary-lime);
    color: var(--deep-green);
    font-size: 13px;
    font-weight: 800;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(207, 249, 45, 0.4);
    transition: all 0.15s ease;
  }
  .btn-lime-submit:hover {
    background: var(--primary-lime-hover);
    transform: translateY(-1px);
  }

  /* In-App Toast System (Replaces browser alert) */
  .inapp-toast-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    z-index: 9999;
    background: #FFFFFF;
    border: 1.5px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 10px 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 700;
    color: var(--primary-text);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    opacity: 0;
    pointer-events: none;
    max-width: 90vw;
  }
  .inapp-toast-container.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
    pointer-events: auto;
  }
  .inapp-toast-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 900;
    flex-shrink: 0;
  }
  .inapp-toast-success .inapp-toast-icon {
    background: #ECFDF5;
    color: #15965B;
  }
  .inapp-toast-error .inapp-toast-icon {
    background: #FEE2E2;
    color: #E54848;
  }
  .inapp-toast-info .inapp-toast-icon {
    background: #EFF6FF;
    color: #2563EB;
  }

  /* Full Screen Onboarding Flow Container (Before Login) */
  .onboarding-screen-wrapper {
    position: fixed;
    inset: 0;
    background: var(--bg-page);
    z-index: 3000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  /* Step 1: Splash Screen */
  .splash-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    animation: fadeInScreen 0.4s ease-out;
  }
  .splash-logo-img {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    box-shadow: 0 8px 24px rgba(0, 107, 60, 0.2);
    margin-bottom: 16px;
    animation: pulseLogo 2s infinite ease-in-out;
  }
  @keyframes pulseLogo {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  .splash-heading-small {
    font-size: 14px;
    font-weight: 700;
    color: var(--secondary-text);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .splash-heading-main {
    font-size: 32px;
    font-weight: 900;
    color: var(--primary-dark-green);
    letter-spacing: -0.8px;
    margin-top: 2px;
  }
  .splash-powered {
    font-size: 13px;
    font-weight: 600;
    color: var(--secondary-text);
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .splash-loader-bar {
    width: 140px;
    height: 4px;
    background: #E2E8F0;
    border-radius: 100px;
    overflow: hidden;
    margin-top: 28px;
  }
  .splash-loader-progress {
    width: 100%;
    height: 100%;
    background: var(--primary-dark-green);
    border-radius: 100px;
    animation: splashFill 1.2s ease-in-out infinite;
  }
  @keyframes splashFill {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* Step 2: Choose Option Cards */
  .choose-option-wrapper {
    width: 100%;
    max-width: 420px;
    text-align: center;
    animation: fadeInScreen 0.3s ease-out;
  }
  .choose-option-brand {
    margin-bottom: 22px;
  }
  .choose-option-brand .title {
    font-size: 26px;
    font-weight: 900;
    color: var(--primary-dark-green);
    letter-spacing: -0.5px;
  }
  .choose-option-brand .sub {
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text);
    margin-top: 2px;
  }
  .choose-card {
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .choose-card:hover {
    transform: translateY(-2px);
  }
  .choose-card-hire {
    background: var(--primary-lime);
    box-shadow: 0 6px 20px rgba(207, 249, 45, 0.45);
  }
  .choose-card-job {
    background: #FFFFFF;
    border: 1.5px solid var(--border-color);
    box-shadow: var(--shadow-soft);
  }
  .choose-card-title {
    font-size: 19px;
    font-weight: 900;
    color: var(--deep-green);
    line-height: 1.2;
  }
  .choose-card-job .choose-card-title {
    color: var(--primary-text);
  }
  .choose-card-sub {
    font-size: 12px;
    font-weight: 600;
    color: #166534;
    margin-top: 3px;
  }
  .choose-card-job .choose-card-sub {
    color: var(--secondary-text);
  }
  .choose-circle-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--deep-green);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 800;
    flex-shrink: 0;
  }

  /* Step 4: Complete Profile Screen */
  .profile-setup-card {
    width: 100%;
    max-width: 440px;
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 22px;
    padding: 24px;
    box-shadow: var(--shadow-elevated);
    animation: fadeInScreen 0.3s ease-out;
  }
  .profile-avatar-uploader {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #F8FAF7;
    border: 2px dashed var(--primary-dark-green);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px auto;
    cursor: pointer;
    overflow: hidden;
    position: relative;
  }
  .skills-chip-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 8px 0 16px 0;
  }
  .skill-selectable-chip {
    padding: 5px 12px;
    border-radius: var(--radius-pill);
    background: #F1F5F9;
    border: 1px solid var(--border-color);
    font-size: 11px;
    font-weight: 700;
    color: var(--secondary-text);
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .skill-selectable-chip.selected {
    background: var(--primary-lime);
    color: var(--deep-green);
    border-color: var(--primary-lime);
  }

  /* Step 5: Enable Location Screen */
  .enable-loc-card {
    width: 100%;
    max-width: 400px;
    text-align: center;
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 24px;
    padding: 32px 24px;
    box-shadow: var(--shadow-elevated);
    animation: fadeInScreen 0.3s ease-out;
  }
  .loc-illustration-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #ECFDF5;
    border: 2px solid #A7F3D0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 18px auto;
    color: var(--primary-dark-green);
  }

  /* City Picker Modal Styles */
  .city-chips-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 12px 0 18px 0;
  }
  .city-chip-btn {
    background: #F8FAF7;
    border: 1.5px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--primary-text);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s ease;
  }
  .city-chip-btn:hover {
    background: #ECFDF5;
    border-color: var(--primary-dark-green);
    color: var(--primary-dark-green);
    transform: translateY(-1px);
  }

  /* Application Status Badges */
  .status-pill {
    font-size: 11px;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .status-pill-applied {
    background: #EFF6FF;
    color: #2563EB;
    border: 1px solid #BFDBFE;
  }
  .status-pill-under_review {
    background: #FEF3C7;
    color: #D97706;
    border: 1px solid #FDE68A;
  }
  .status-pill-shortlisted {
    background: #ECFDF5;
    color: #059669;
    border: 1px solid #A7F3D0;
  }
  .status-pill-interview {
    background: #F3E8FF;
    color: #7C3AED;
    border: 1px solid #DDD6FE;
  }
  .status-pill-selected, .status-pill-hired {
    background: var(--primary-lime);
    color: var(--deep-green);
    border: 1px solid #BEF264;
  }
  .status-pill-rejected {
    background: #FEE2E2;
    color: #DC2626;
    border: 1px solid #FECACA;
  }
  .status-pill-withdrawn {
    background: #F1F5F9;
    color: #64748B;
    border: 1px solid #E2E8F0;
  }

  /* Tab Navigation inside Modals & Views */
  .tab-nav-bar {
    display: flex;
    gap: 6px;
    border-bottom: 1.5px solid var(--border-color);
    margin-bottom: 18px;
    overflow-x: auto;
  }
  .tab-nav-item {
    font-size: 13px;
    font-weight: 700;
    color: var(--secondary-text);
    padding: 8px 14px;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }
  .tab-nav-item:hover, .tab-nav-item.active {
    color: var(--primary-dark-green);
    border-bottom-color: var(--primary-dark-green);
  }

  /* Resume Management Styles */
  .resume-list-item {
    background: #F8FAF7;
    border: 1.5px solid var(--border-color);
    border-radius: 16px;
    padding: 14px 16px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  @media (min-width: 600px) {
    .resume-list-item {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
  }
  .resume-filename-box {
    flex: 1;
    min-width: 0;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
  .resume-default-badge {
    font-size: 10px;
    font-weight: 800;
    background: var(--primary-lime);
    color: var(--deep-green);
    padding: 3px 8px;
    border-radius: 100px;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    letter-spacing: 0.5px;
  }
  .resume-actions-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    flex-shrink: 0;
  }

  /* Dedicated Messages / Inbox Layout */
  .inbox-container {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 0;
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    overflow: hidden;
    height: 74vh;
    box-shadow: var(--shadow-soft);
    margin-bottom: 30px;
  }
  @media (max-width: 768px) {
    .inbox-container {
      grid-template-columns: 1fr;
      height: 80vh;
    }
  }
  .inbox-conversations-sidebar {
    border-right: 1px solid var(--border-color);
    overflow-y: auto;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
  }
  .convo-item {
    padding: 12px 14px;
    border-bottom: 1px solid #F1F5F9;
    cursor: pointer;
    display: flex;
    gap: 12px;
    align-items: center;
    transition: all 0.15s ease;
    border-left: 3px solid transparent;
  }
  .convo-item:hover {
    background: #F8FAF7;
  }
  .convo-item.active {
    background: #F0FDF4;
    border-left: 3px solid #004D35;
  }
  .inbox-chat-pane {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #F8FAF7;
    position: relative;
  }

  /* Form 2-Column Responsive Layout */
  .form-row-2col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 600px) {
    .form-row-2col {
      grid-template-columns: 1fr;
    }
  }

  /* Floating Bottom Nav for Mobile Only */
  .mobile-bottom-nav {
    display: none;
  }
  @media (max-width: 768px) {
    .mobile-bottom-nav {
      position: fixed;
      bottom: 12px;
      left: 14px;
      right: 14px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-pill);
      box-shadow: var(--shadow-elevated);
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 5px 8px;
      z-index: 1000;
    }
    .mobile-tab-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-size: 10px;
      font-weight: 700;
      color: var(--secondary-text);
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px 12px;
      border-radius: var(--radius-pill);
    }
    .mobile-tab-btn.active {
      background: var(--primary-lime);
      color: var(--deep-green);
    }
  }

  /* Global Clean Footer */
  .global-footer {
    background: #FFFFFF;
    border-top: 1px solid var(--border-color);
    padding: 20px 0;
    margin-top: auto;
  }
  .footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: var(--secondary-text);
  }
  .footer-brand {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 800;
    color: var(--primary-dark-green);
  }

  /* Hide Leaflet Controls */
  .leaflet-control-attribution { display: none !important; }
  .leaflet-control-zoom { display: none !important; }

  /* ============================================================= */
  /* MODERN IN-APP CHAT (WHATSAPP / IOS STYLE)                     */
  /* ============================================================= */
  .chat-modal-card {
    max-width: 440px !important;
    width: 100%;
    height: 600px;
    max-height: 92vh;
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    border-radius: 24px !important;
    overflow: hidden;
    background: #FFFFFF;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.22);
  }
  @media (max-width: 640px) {
    .chat-modal-card {
      max-width: 100% !important;
      height: 100% !important;
      max-height: 100% !important;
      border-radius: 0 !important;
    }
  }

  .chat-header {
    background: #FFFFFF;
    border-bottom: 1px solid var(--border-color);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    gap: 8px;
  }
  .chat-header-user {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .chat-avatar-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: #ECFDF5;
    border: 1.5px solid #A7F3D0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 800;
    color: var(--primary-dark-green);
    overflow: hidden;
    flex-shrink: 0;
  }
  .chat-avatar-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .chat-back-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #F1F5F9;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--primary-text);
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .chat-back-btn:hover {
    background: #E2E8F0;
  }

  .chat-messages-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #F8FAF7;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .chat-system-pill {
    align-self: center;
    background: #E8ECE8;
    color: var(--primary-text);
    font-size: 11px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 100px;
    text-align: center;
    max-width: 85%;
    margin: 6px 0;
  }

  .chat-bubble {
    max-width: 80%;
    padding: 10px 14px;
    font-size: 13px;
    line-height: 1.45;
    word-break: break-word;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    animation: fadeInBubble 0.15s ease-out;
  }
  @keyframes fadeInBubble {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .chat-bubble-in {
    align-self: flex-start;
    background: #FFFFFF;
    color: var(--primary-text);
    border: 1px solid var(--border-color);
    border-radius: 18px 18px 18px 4px;
  }
  .chat-bubble-out {
    align-self: flex-end;
    background: var(--primary-dark-green);
    color: #FFFFFF;
    border-radius: 18px 18px 4px 18px;
  }

  .chat-bubble-time {
    font-size: 10px;
    margin-top: 4px;
    text-align: right;
  }
  .chat-bubble-in .chat-bubble-time {
    color: #94A3B8;
  }
  .chat-bubble-out .chat-bubble-time {
    color: #A7F3D0;
  }

  .chat-assignment-box {
    background: #FFFFFF;
    border: 1.5px solid #CFF92D;
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    box-shadow: var(--shadow-soft);
    margin: 4px 0;
    align-self: stretch;
  }

  .chat-quick-suggestions {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 6px 12px;
    background: #FFFFFF;
    border-top: 1px solid #F1F5F9;
    flex-shrink: 0;
    scrollbar-width: none;
  }
  .chat-quick-suggestions::-webkit-scrollbar {
    display: none;
  }
  .chat-quick-chip {
    font-size: 11px;
    font-weight: 600;
    color: var(--primary-dark-green);
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    border-radius: 100px;
    padding: 4px 10px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }
  .chat-quick-chip:hover {
    background: var(--primary-lime);
    color: var(--deep-green);
    border-color: var(--primary-lime);
  }

  .chat-input-bar {
    background: #FFFFFF;
    border-top: 1px solid var(--border-color);
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .chat-input-field {
    flex: 1;
    background: #F1F5F9;
    border: 1.5px solid transparent;
    border-radius: 24px;
    padding: 10px 16px;
    font-size: 13px;
    font-family: inherit;
    color: var(--primary-text);
    outline: none;
    transition: border-color 0.15s ease;
  }
  .chat-input-field:focus {
    border-color: var(--primary-dark-green);
    background: #FFFFFF;
  }
  .chat-send-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--primary-lime);
    color: var(--deep-green);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(207, 249, 45, 0.4);
    transition: all 0.15s ease;
  }
  .chat-send-btn:hover {
    transform: scale(1.08);
    background: var(--primary-lime-hover);
  }
  .chat-send-btn:active {
    transform: scale(0.95);
  }

  /* ============================================================= */
  /* AI RESUME INTELLIGENCE SCANNER & VERIFICATION UI              */
  /* ============================================================= */
  .ai-scan-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(8px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    padding: 16px;
    animation: fadeInOverlay 0.2s ease-out;
  }
  .ai-scan-overlay.active {
    display: flex;
  }
  @keyframes fadeInOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .ai-scan-card {
    background: #FFFFFF;
    border-radius: 24px;
    width: 100%;
    max-width: 440px;
    padding: 28px 24px;
    text-align: center;
    box-shadow: 0 30px 70px rgba(0, 77, 53, 0.25);
    border: 1.5px solid #A7F3D0;
    position: relative;
    overflow: hidden;
    animation: zoomModalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Laser scanner container */
  .ai-scanner-doc-box {
    width: 76px;
    height: 96px;
    margin: 0 auto 18px auto;
    background: #FFFFFF;
    border: 2px solid #15965B;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 25px rgba(21, 150, 91, 0.2);
  }
  .ai-scanner-doc-lines {
    width: 60%;
    height: 3px;
    background: #E2E8F0;
    margin: 4px 0;
    border-radius: 2px;
  }
  .ai-scanner-laser {
    position: absolute;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, #CFF92D, #15965B, #CFF92D, transparent);
    box-shadow: 0 0 12px #CFF92D, 0 0 20px #15965B;
    animation: laserScan 1.3s ease-in-out infinite alternate;
  }
  @keyframes laserScan {
    0% { top: 4%; opacity: 0.6; }
    50% { opacity: 1; }
    100% { top: 92%; opacity: 0.6; }
  }

  /* Scanning steps checklist */
  .ai-scan-steps-list {
    text-align: left;
    margin: 18px 0;
    background: #F8FAF7;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ai-scan-step-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text);
    transition: all 0.25s ease;
  }
  .ai-scan-step-row.completed {
    color: var(--primary-dark-green);
  }
  .ai-scan-step-icon {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #E2E8F0;
    color: #64748B;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    flex-shrink: 0;
    transition: all 0.25s ease;
  }
  .ai-scan-step-row.completed .ai-scan-step-icon {
    background: #CFF92D;
    color: var(--deep-green);
    font-weight: 900;
  }
  .ai-scan-step-row.active .ai-scan-step-icon {
    background: #ECFDF5;
    color: #006B3C;
    border: 2px solid #006B3C;
    animation: spinStep 1s linear infinite;
  }
  @keyframes spinStep {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Verified Result Card in Form */
  .ai-result-hero-card {
    background: #FFFFFF;
    border: 1.5px solid #15965B;
    border-radius: 20px;
    padding: 18px 18px 14px 18px;
    margin-top: 14px;
    margin-bottom: 14px;
    box-shadow: 0 10px 30px rgba(21, 150, 91, 0.08);
    position: relative;
    animation: fadeInBubble 0.25s ease-out;
  }
  .ai-result-badge-top {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #CFF92D;
    color: var(--deep-green);
    font-size: 11px;
    font-weight: 800;
    padding: 4px 12px;
    border-radius: 100px;
    margin-bottom: 12px;
  }
  .ai-role-highlight-box {
    background: #F8FAF7;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 12px 14px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .ai-role-title-text {
    font-size: 14px;
    font-weight: 800;
    color: var(--primary-dark-green);
  }
  .ai-skills-clean-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
  .ai-skill-chip-pill {
    background: #ECFDF5;
    border: 1px solid #A7F3D0;
    color: var(--primary-dark-green);
    font-size: 11px;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 100px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
  }
  .ai-skill-chip-pill:hover {
    background: #CFF92D;
    color: var(--deep-green);
    border-color: #CFF92D;
  }
  .ai-skill-chip-remove {
    cursor: pointer;
    font-weight: 800;
    font-size: 12px;
    color: #94A3B8;
  }
  .ai-skill-chip-remove:hover {
    color: #E54848;
  }
  .ai-add-skill-box {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }
`;
