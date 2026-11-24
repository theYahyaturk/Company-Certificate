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

  /* Full responsive app canvas: full desktop width on desktop, full mobile width on phones */
  .portal-wrapper {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-page);
  }

  .portal-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  @media (max-width: 768px) {
    .portal-container {
      padding: 0 16px;
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
    height: 68px;
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
    border-radius: 10px;
    object-fit: cover;
  }
  .brand-title-wrap {
    display: flex;
    flex-direction: column;
  }
  .brand-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--primary-dark-green);
    line-height: 1.1;
    letter-spacing: -0.4px;
  }
  .brand-tagline {
    font-size: 10px;
    font-weight: 600;
    color: var(--secondary-text);
  }

  /* Header Desktop Navigation */
  .desktop-nav-links {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .nav-link-btn {
    font-size: 13px;
    font-weight: 700;
    color: var(--secondary-text);
    cursor: pointer;
    transition: color 0.15s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: var(--radius-pill);
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
    box-shadow: 0 2px 8px rgba(207, 249, 45, 0.4);
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
    padding: 24px 0 16px 0;
  }
  .hero-greeting {
    font-size: 16px;
    font-weight: 700;
    color: var(--secondary-text);
  }
  .hero-heading {
    font-size: 30px;
    font-weight: 900;
    color: var(--primary-text);
    letter-spacing: -0.6px;
    line-height: 1.2;
    margin-top: 4px;
  }
  .hero-heading span {
    color: var(--primary-dark-green);
  }

  /* Candidate Primary Discovery Banners (Nearby vs Remote) */
  .candidate-discovery-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (max-width: 640px) {
    .candidate-discovery-grid {
      grid-template-columns: 1fr;
    }
  }

  .discovery-card {
    border-radius: var(--radius-card);
    padding: 20px;
    cursor: pointer;
    position: relative;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 130px;
  }
  .discovery-card:hover {
    transform: translateY(-2px);
  }
  .discovery-card-nearby {
    background: var(--primary-lime);
    box-shadow: 0 4px 16px rgba(207, 249, 45, 0.4);
  }
  .discovery-card-remote {
    background: #FFFFFF;
    border: 1.5px solid var(--border-color);
    box-shadow: var(--shadow-soft);
  }
  .discovery-badge-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
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
    font-size: 18px;
    font-weight: 900;
    line-height: 1.2;
    color: var(--deep-green);
  }
  .discovery-card-remote .discovery-title {
    color: var(--primary-text);
  }
  .discovery-sub {
    font-size: 12px;
    font-weight: 600;
    color: #166534;
    margin-top: 3px;
  }
  .discovery-card-remote .discovery-sub {
    color: var(--secondary-text);
  }

  /* Location Row & Search Controls */
  .search-location-panel {
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 14px 18px;
    box-shadow: var(--shadow-soft);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .loc-badge-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .search-input-box {
    flex: 1;
    min-width: 240px;
    display: flex;
    align-items: center;
    background: #F8FAF7;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 6px 14px;
  }
  .search-input-box input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text);
  }

  /* Live Map & Feed Layout (Side-by-Side on Desktop, Stacked on Mobile) */
  .map-feed-layout {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 24px;
    margin-bottom: 40px;
  }
  @media (max-width: 900px) {
    .map-feed-layout {
      grid-template-columns: 1fr;
    }
  }

  .map-container-box {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    height: 480px;
    background: #E8ECE8;
    box-shadow: var(--shadow-soft);
    border: 1px solid var(--border-color);
  }
  #hiringMap {
    width: 100%;
    height: 100%;
  }

  /* Floating Map Pills */
  .map-pill-loc {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 400;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-pill);
    padding: 6px 14px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    box-shadow: var(--shadow-soft);
  }
  .map-pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
  }
  .map-gps-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 400;
    width: 40px;
    height: 40px;
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
  .map-gps-btn:hover {
    transform: rotate(90deg);
  }

  /* Dynamic Map Job Callout Badges (Read directly from database) */
  .custom-company-pin-wrapper {
    background: transparent;
    border: none;
  }
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

  /* Teardrop Company Pin Marker */
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
  }
  .company-marker-inner img {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: cover;
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
    box-shadow: 0 0 14px rgba(37, 99, 235, 0.7);
  }
  .user-gps-pulse {
    position: absolute;
    top: -10px;
    left: -10px;
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

  /* Job Feed Cards */
  .feed-panel {
    display: flex;
    flex-direction: column;
  }
  .feed-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .feed-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--primary-text);
  }

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
    border-color: #A7F3D0;
  }
  .job-card-top {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .company-avatar-box {
    width: 52px;
    height: 52px;
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
    font-size: 16px;
    color: var(--primary-dark-green);
  }
  .job-meta-col {
    flex: 1;
  }
  .company-name-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text);
  }
  .job-title-text {
    font-size: 16px;
    font-weight: 800;
    color: var(--primary-text);
    margin-top: 2px;
    line-height: 1.25;
  }
  .job-sub-row {
    font-size: 12px;
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
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: var(--radius-pill);
    background: #F1F5F9;
    color: var(--secondary-text);
  }
  .mini-tag-green {
    background: #ECFDF5;
    color: #065F46;
  }

  .btn-lime-apply {
    background: var(--primary-lime);
    color: var(--deep-green);
    font-weight: 800;
    font-size: 13px;
    padding: 7px 18px;
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

  /* Employer / Hiring Partner Dashboard Styles */
  .employer-panel-header {
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    box-shadow: var(--shadow-soft);
  }
  .emp-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  @media (max-width: 768px) {
    .emp-stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .stat-card {
    background: #FFFFFF;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 16px;
    text-align: center;
    box-shadow: var(--shadow-soft);
  }
  .stat-number {
    font-size: 26px;
    font-weight: 900;
    color: var(--primary-dark-green);
  }
  .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--secondary-text);
    margin-top: 2px;
  }

  /* Modals */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
  }
  .modal-overlay.active {
    display: flex;
  }
  .modal-card {
    background: #FFFFFF;
    border-radius: 24px;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 24px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    animation: zoomModalIn 0.2s ease-out;
  }
  @keyframes zoomModalIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .modal-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .modal-title-text {
    font-size: 18px;
    font-weight: 800;
    color: var(--primary-text);
  }
  .modal-close-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #F1F5F9;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--secondary-text);
  }

  .form-group-ui {
    margin-bottom: 16px;
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
    padding: 12px 16px;
    border-radius: 12px;
    border: 1.5px solid var(--border-color);
    font-family: inherit;
    font-size: 14px;
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
    padding: 13px;
    border-radius: var(--radius-pill);
    background: var(--primary-lime);
    color: var(--deep-green);
    font-size: 14px;
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

  /* Floating Bottom Nav for Mobile Only */
  .mobile-bottom-nav {
    display: none;
  }
  @media (max-width: 768px) {
    .mobile-bottom-nav {
      position: fixed;
      bottom: 12px;
      left: 16px;
      right: 16px;
      background: #FFFFFF;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-pill);
      box-shadow: var(--shadow-elevated);
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 6px 10px;
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
      padding: 4px 12px;
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
    padding: 24px 0;
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
`;
