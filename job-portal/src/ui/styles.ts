export const JOB_PORTAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --accent-lime: #CFF92D;
    --accent-lime-hover: #bde81d;
    --accent-lime-tint: #f4fdc7;
    --alifeo-forest: #064E3B;
    --alifeo-dark: #0B3B24;
    --alifeo-emerald: #059669;
    --alifeo-light: #F0FDF4;
    
    --bg-app: #F8FAFC;
    --card-bg: #FFFFFF;
    --border-subtle: #F1F5F9;
    --border-card: #E2E8F0;
    
    --text-primary: #0F172A;
    --text-secondary: #334155;
    --text-muted: #64748B;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background-color: var(--bg-app);
    color: var(--text-primary);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    padding-bottom: 90px;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* App Shell Container (Mobile-first app canvas) */
  .app-canvas {
    width: 100%;
    max-width: 480px;
    min-height: 100vh;
    background: #FFFFFF;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.06);
    position: relative;
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    body {
      background-color: #E2E8F0;
      padding-top: 20px;
      padding-bottom: 40px;
    }
    .app-canvas {
      border-radius: 36px;
      overflow: hidden;
      min-height: 900px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      border: 6px solid #FFFFFF;
    }
  }

  /* Top Status Bar (Native mobile aesthetic) */
  .status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px 6px 20px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
  }
  .status-bar-icons {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* App Header Bar */
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background: #FFFFFF;
  }
  .app-brand-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .app-logo-badge {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: var(--accent-lime);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(207, 249, 45, 0.4);
    overflow: hidden;
  }
  .app-logo-badge img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .app-brand-text {
    font-size: 22px;
    font-weight: 800;
    color: var(--alifeo-forest);
    letter-spacing: -0.6px;
  }

  .btn-icon-round {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #F8FAFC;
    border: 1px solid var(--border-card);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
  }
  .btn-icon-round:hover {
    background: #F1F5F9;
  }
  .unread-dot {
    position: absolute;
    top: 6px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: #10B981;
    border-radius: 50%;
    border: 2px solid #FFFFFF;
  }

  /* Greeting & Headline */
  .hero-greeting-section {
    padding: 12px 20px 8px 20px;
    background: #FFFFFF;
  }
  .greeting-sub {
    font-size: 19px;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .greeting-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.5px;
    margin-top: 2px;
  }
  .greeting-title span {
    color: var(--alifeo-forest);
  }

  /* Location Selector Row */
  .app-location-row {
    padding: 8px 20px 14px 20px;
    background: #FFFFFF;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .loc-icon-pin {
    color: var(--alifeo-forest);
  }
  .loc-details-wrap {
    display: flex;
    flex-direction: column;
  }
  .loc-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
  }
  .loc-name {
    font-size: 14px;
    font-weight: 800;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Dual Action Hero Banners (Side-by-Side as in mockup) */
  .dual-banners-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 6px 20px 16px 20px;
    background: #FFFFFF;
  }
  .banner-card {
    border-radius: 20px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    min-height: 118px;
  }
  .banner-card:hover {
    transform: translateY(-2px);
  }
  
  .banner-hire {
    background: var(--accent-lime);
    box-shadow: 0 4px 14px rgba(207, 249, 45, 0.35);
  }
  .banner-job {
    background: #F1F5F9;
    border: 1px solid var(--border-card);
  }

  .banner-top-visual {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 6px;
  }
  .banner-icon-badge {
    font-size: 26px;
  }

  .banner-title {
    font-size: 15px;
    font-weight: 800;
    color: var(--alifeo-dark);
    line-height: 1.2;
  }
  .banner-job .banner-title {
    color: var(--text-primary);
  }
  .banner-sub {
    font-size: 11px;
    font-weight: 600;
    color: #166534;
    margin-top: 3px;
  }
  .banner-job .banner-sub {
    color: var(--text-muted);
  }

  .banner-arrow-circle {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--alifeo-forest);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
  }

  /* Floating Search Pill Bar */
  .search-floating-wrap {
    padding: 0 20px 14px 20px;
    background: #FFFFFF;
    position: relative;
    z-index: 100;
  }
  .search-pill-box {
    display: flex;
    align-items: center;
    background: #FFFFFF;
    border: 1.5px solid #E2E8F0;
    border-radius: 100px;
    padding: 5px 6px 5px 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }
  .search-pill-box:focus-within {
    border-color: var(--alifeo-forest);
    box-shadow: 0 4px 20px rgba(6, 78, 59, 0.12);
  }
  .search-pill-input {
    flex: 1;
    border: none;
    outline: none;
    font-family: inherit;
    font-size: 14px;
    color: var(--text-primary);
    background: transparent;
  }
  .search-pill-input::placeholder {
    color: #94A3B8;
  }
  .search-filter-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--accent-lime);
    border: none;
    color: var(--alifeo-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(207, 249, 45, 0.4);
    transition: transform 0.15s ease;
  }
  .search-filter-btn:hover {
    transform: scale(1.05);
  }

  /* Interactive Live Map Section (Alifeo FBS Mobile View) */
  .map-section-wrap {
    position: relative;
    width: 100%;
    height: 380px;
    background: #E5E7EB;
    overflow: hidden;
  }
  #hiringMap {
    width: 100%;
    height: 100%;
  }

  /* Map Floating Pill (Top-Left) */
  .map-pill-location {
    position: absolute;
    top: 14px;
    left: 16px;
    z-index: 400;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid #E2E8F0;
    border-radius: 100px;
    padding: 7px 14px;
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-primary);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  }
  .map-pill-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #059669;
  }

  /* Map GPS FAB (Top-Right) */
  .map-gps-circle-btn {
    position: absolute;
    top: 14px;
    right: 16px;
    z-index: 400;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-primary);
    transition: transform 0.2s ease;
  }
  .map-gps-circle-btn:hover {
    background: #F8FAFC;
    transform: rotate(90deg);
  }

  /* Leaflet Map Pulsing GPS User Marker */
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

  /* Green Teardrop Company Location Pin */
  .custom-company-pin-wrapper {
    background: transparent;
    border: none;
  }
  .company-teardrop-pin {
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
  .company-teardrop-pin:hover {
    transform: rotate(-45deg) scale(1.15);
  }
  .company-teardrop-inner {
    transform: rotate(45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 14px;
  }
  .company-teardrop-logo {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    object-fit: cover;
  }

  /* Floating Map Job Callout Badges (as in mockup!) */
  .map-callout-badge {
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 6px 12px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    font-size: 11px;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    cursor: pointer;
    transition: transform 0.15s ease;
  }
  .map-callout-badge:hover {
    transform: translateY(-2px);
    border-color: var(--alifeo-forest);
  }
  .map-callout-salary {
    color: var(--alifeo-forest);
    font-weight: 800;
  }

  /* Bottom Drawer / Nearby Jobs Sheet */
  .nearby-drawer {
    background: #FFFFFF;
    border-radius: 28px 28px 0 0;
    margin-top: -24px;
    position: relative;
    z-index: 500;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.08);
    padding: 14px 20px 24px 20px;
  }
  .drawer-handle-bar {
    width: 44px;
    height: 4.5px;
    background: #CBD5E1;
    border-radius: 100px;
    margin: 0 auto 14px auto;
  }
  .drawer-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .drawer-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .drawer-see-all {
    font-size: 13px;
    font-weight: 700;
    color: #059669;
    cursor: pointer;
  }

  /* App Job Card (matching mockup!) */
  .app-job-card {
    background: #FFFFFF;
    border: 1px solid var(--border-subtle);
    border-radius: 20px;
    padding: 16px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
    margin-bottom: 12px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
  }
  .app-job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  .app-card-top {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .app-company-thumbnail {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    background: #ECFDF5;
    border: 1px solid #D1FAE5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .app-company-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .app-company-initials {
    font-weight: 800;
    font-size: 20px;
    color: var(--alifeo-forest);
  }

  .app-card-meta {
    flex: 1;
  }
  .app-company-name-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-muted);
  }
  .verified-badge-green {
    color: #10B981;
    display: inline-flex;
    align-items: center;
  }
  .app-job-title {
    font-size: 16px;
    font-weight: 800;
    color: var(--text-primary);
    margin-top: 2px;
    line-height: 1.25;
  }
  .app-loc-distance-row {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .app-loc-distance-row strong {
    color: #059669;
  }

  /* Tags & Lime Apply Button */
  .app-card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #F1F5F9;
  }
  .app-tag-pills {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .app-tag {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 9px;
    border-radius: 100px;
    background: #F1F5F9;
    color: #475569;
  }
  .app-tag-mode {
    background: #ECFDF5;
    color: #065F46;
  }

  /* ELECTRIC NEON LIME APPLY BUTTON */
  .btn-apply-lime {
    background: var(--accent-lime);
    color: var(--alifeo-dark);
    font-weight: 800;
    font-size: 13px;
    padding: 8px 18px;
    border-radius: 100px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 3px 10px rgba(207, 249, 45, 0.4);
    transition: all 0.15s ease;
  }
  .btn-apply-lime:hover {
    background: var(--accent-lime-hover);
    transform: scale(1.04);
  }

  /* Floating Bottom Navigation Bar (iOS pill style as in mockup!) */
  .floating-bottom-nav {
    position: fixed;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 32px);
    max-width: 440px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 100px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 8px 12px;
    z-index: 1000;
  }
  .nav-tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    font-weight: 700;
    color: #64748B;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 4px 10px;
    border-radius: 100px;
  }
  .nav-tab-item.active {
    background: var(--accent-lime-tint);
    color: var(--alifeo-dark);
  }

  /* Center Elevated Map FAB on Nav Bar */
  .nav-center-map-fab {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--accent-lime);
    border: 3px solid #FFFFFF;
    box-shadow: 0 4px 16px rgba(207, 249, 45, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--alifeo-dark);
    cursor: pointer;
    margin-top: -24px;
    transition: transform 0.15s ease;
  }
  .nav-center-map-fab:hover {
    transform: scale(1.08);
  }

  /* Modals (Clean App Bottom Sheets / Drawers) */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 2000;
    display: none;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
  }
  .modal-overlay.active {
    display: flex;
  }
  .modal-content {
    background: #FFFFFF;
    width: 100%;
    max-width: 480px;
    border-radius: 28px 28px 0 0;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
    animation: slideUpModal 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes slideUpModal {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: #FFFFFF;
    z-index: 10;
  }
  .modal-title {
    font-size: 17px;
    font-weight: 800;
    color: var(--text-primary);
  }
  .modal-close-btn {
    background: #F1F5F9;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 18px;
    color: #64748B;
    cursor: pointer;
  }
  .modal-body {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 16px;
  }
  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }
  .form-control {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #CBD5E1;
    font-family: inherit;
    font-size: 14px;
    outline: none;
  }
  .form-control:focus {
    border-color: var(--alifeo-forest);
    box-shadow: 0 0 0 3px rgba(6, 78, 59, 0.1);
  }

  .btn-primary-app {
    width: 100%;
    padding: 13px;
    border-radius: 100px;
    background: var(--alifeo-forest);
    color: #FFFFFF;
    font-weight: 800;
    font-size: 14px;
    border: none;
    cursor: pointer;
  }

  /* Hide Leaflet Attribution */
  .leaflet-control-attribution {
    display: none !important;
  }
`;
