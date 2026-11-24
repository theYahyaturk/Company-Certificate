export const JOB_PORTAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --alifeo-green: #19563e;
    --alifeo-dark: #0f3d2a;
    --alifeo-emerald: #059669;
    --alifeo-light-green: #ecfdf5;
    --alifeo-border-green: #a7f3d0;
    --gold: #d97706;
    --gold-light: #fef3c7;
    
    --bg-page: #f8fafc;
    --card-bg: #ffffff;
    --border-color: #e2e8f0;
    --border-hover: #cbd5e1;
    
    --text-title: #0f172a;
    --text-body: #334155;
    --text-muted: #64748b;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: var(--bg-page);
    color: var(--text-body);
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    padding-bottom: 70px;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* Top decorative green bar */
  .top-brand-bar {
    height: 3px;
    background: linear-gradient(90deg, #19563e 0%, #059669 50%, #10b981 100%);
    width: 100%;
  }

  /* Header Navbar */
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #19563e;
    color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-logo-box {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .nav-logo {
    height: 32px;
    width: 32px;
    border-radius: 6px;
    object-fit: cover;
    display: block;
  }

  .nav-brand-title {
    font-size: 19px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  .nav-tagline {
    font-size: 11px;
    background: rgba(255, 255, 255, 0.18);
    padding: 2px 8px;
    border-radius: 100px;
    font-weight: 600;
    margin-left: 4px;
    color: #e2e8f0;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Role Switcher Pill */
  .role-toggle-pill {
    display: inline-flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 100px;
    padding: 2px;
    font-size: 12px;
    font-weight: 700;
  }

  .role-btn {
    padding: 5px 12px;
    border-radius: 100px;
    border: none;
    background: transparent;
    color: #cbd5e1;
    cursor: pointer;
    transition: 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .role-btn.active {
    background: #ffffff;
    color: #19563e;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    text-decoration: none;
  }

  .btn-primary {
    background: #19563e;
    color: #ffffff;
  }
  .btn-primary:hover {
    background: #134532;
  }

  .btn-accent {
    background: #d97706;
    color: #ffffff;
  }
  .btn-accent:hover {
    background: #b45309;
  }

  .btn-outline {
    background: transparent;
    border: 1.5px solid #e2e8f0;
    color: #334155;
  }
  .btn-outline:hover {
    border-color: #cbd5e1;
    background: #f8fafc;
  }

  .btn-outline-white {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #ffffff;
  }
  .btn-outline-white:hover {
    background: rgba(255, 255, 255, 0.22);
  }

  .btn-sm {
    padding: 6px 12px;
    font-size: 12px;
    border-radius: 6px;
  }

  .btn-danger {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fca5a5;
  }
  .btn-danger:hover {
    background: #fecaca;
  }

  /* Bottom Mobile Navigation */
  .bottom-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    padding: 8px 12px;
    z-index: 999;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    justify-content: space-around;
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    background: none;
    border: none;
  }

  .bottom-nav-item.active {
    color: #19563e;
    font-weight: 700;
  }

  /* Main Container */
  .main-container {
    max-width: 1160px;
    width: 100%;
    margin: 0 auto;
    padding: 16px;
    flex: 1;
  }

  /* View Switcher Bar */
  .view-switcher-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .mode-toggle-group {
    display: inline-flex;
    background: #e2e8f0;
    padding: 3px;
    border-radius: 10px;
  }

  .mode-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    background: transparent;
    cursor: pointer;
    transition: 0.15s;
  }

  .mode-toggle-btn.active {
    background: #ffffff;
    color: #19563e;
    box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  }

  /* Search & Filter Bar */
  .search-hero-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 16px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
    margin-bottom: 16px;
  }

  .search-input-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .search-field {
    flex: 1;
    min-width: 180px;
    position: relative;
  }

  .search-field input, .search-field select {
    width: 100%;
    padding: 10px 14px 10px 36px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    color: #1e293b;
    background: #ffffff;
    transition: 0.15s;
  }

  .search-field input:focus, .search-field select:focus {
    border-color: #19563e;
    box-shadow: 0 0 0 3px rgba(25, 86, 62, 0.12);
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  .filter-pills-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .filter-pill {
    padding: 5px 12px;
    border-radius: 100px;
    background: #f1f5f9;
    color: #475569;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    white-space: nowrap;
    transition: 0.15s;
  }

  .filter-pill.active {
    background: #19563e;
    color: #ffffff;
    border-color: #19563e;
  }

  /* Radius Selector Bar */
  .radius-selector-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #e2e8f0;
    overflow-x: auto;
  }

  .radius-label {
    font-size: 12px;
    font-weight: 700;
    color: #475569;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    margin-right: 4px;
  }

  .radius-pill {
    padding: 4px 10px;
    border-radius: 6px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #334155;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: 0.15s;
  }

  .radius-pill.active {
    background: #0284c7;
    color: #ffffff;
    border-color: #0284c7;
  }

  /* ============================================================= */
  /* HIRING MAP COMPONENT & MARKERS */
  /* ============================================================= */
  .map-wrapper-card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 18px rgba(0,0,0,0.04);
    position: relative;
    margin-bottom: 20px;
  }

  #hiringMap {
    height: 480px;
    width: 100%;
    z-index: 10;
  }

  /* GPS Floating Button */
  .btn-gps-fab {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 500;
    background: #ffffff;
    border: 2px solid #19563e;
    color: #19563e;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: 0.2s ease;
  }

  .btn-gps-fab:hover {
    background: #19563e;
    color: #ffffff;
  }

  /* Location Info Banner on Map */
  .map-location-banner {
    position: absolute;
    bottom: 14px;
    left: 14px;
    right: 14px;
    z-index: 500;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  /* Custom Leaflet Marker Icon */
  .company-marker-pin {
    background: #ffffff;
    border: 2px solid #19563e;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: 0 3px 10px rgba(0,0,0,0.25);
    transition: transform 0.15s ease;
  }

  .company-marker-pin:hover {
    transform: scale(1.15);
    border-color: #d97706;
  }

  .company-marker-img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .company-marker-initials {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #19563e;
    color: #ffffff;
    font-weight: 800;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .company-marker-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #d97706;
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    padding: 2px 5px;
    border-radius: 10px;
    border: 1.5px solid #ffffff;
    line-height: 1;
  }

  /* Bottom Sheet Preview (Mobile) / Side Panel (Desktop) */
  .map-preview-sheet {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 340px;
    max-height: 450px;
    background: #ffffff;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.18);
    border: 1px solid #cbd5e1;
    z-index: 600;
    display: none;
    flex-direction: column;
    overflow: hidden;
    animation: slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideInRight {
    from { transform: translateX(20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  .map-preview-sheet.active {
    display: flex;
  }

  .map-preview-header {
    padding: 12px 16px;
    background: #19563e;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .map-preview-body {
    padding: 14px 16px;
    overflow-y: auto;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Two Column Feed or Dashboard */
  .layout-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  @media (min-width: 900px) {
    .layout-grid {
      grid-template-columns: 2fr 1fr;
    }
  }

  /* Section Header */
  .section-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .section-heading {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .count-badge {
    font-size: 11px;
    font-weight: 700;
    background: #ecfdf5;
    color: #059669;
    padding: 2px 8px;
    border-radius: 100px;
  }

  /* Job Cards */
  .job-card {
    background: #ffffff;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.18s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  }

  .job-card:hover {
    border-color: #19563e;
    box-shadow: 0 6px 18px rgba(25, 86, 62, 0.08);
    transform: translateY(-1px);
  }

  .job-card.highlighted {
    border-color: #0284c7;
    background: #f0f9ff;
    box-shadow: 0 0 0 2px #0284c7;
  }

  .job-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .job-card-title {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.3;
  }

  .job-card-company {
    font-size: 13px;
    font-weight: 600;
    color: #19563e;
    margin-top: 3px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .verified-badge {
    display: inline-flex;
    align-items: center;
    color: #0284c7;
    font-size: 11px;
  }

  .distance-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    font-weight: 700;
    color: #0369a1;
    background: #e0f2fe;
    padding: 2px 7px;
    border-radius: 6px;
    margin-left: 6px;
  }

  .job-card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 12px 0 10px 0;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .tag-salary {
    background: #ecfdf5;
    color: #065f46;
    border-color: #a7f3d0;
    font-weight: 700;
  }

  .tag-type {
    background: #eff6ff;
    color: #1e40af;
    border-color: #bfdbfe;
  }

  .tag-mode {
    background: #fef3c7;
    color: #92400e;
    border-color: #fde68a;
  }

  .job-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #f1f5f9;
    padding-top: 10px;
    font-size: 11px;
    color: #94a3b8;
  }

  /* Modals */
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
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .modal-overlay.active {
    display: flex;
  }

  .modal-content {
    background: #ffffff;
    border-radius: 16px;
    width: 100%;
    max-width: 580px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes modalPop {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .modal-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: #ffffff;
    z-index: 10;
  }

  .modal-title {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
  }

  .modal-close-btn {
    background: #f1f5f9;
    border: none;
    border-radius: 100px;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #64748b;
  }

  .modal-body {
    padding: 22px;
  }

  .modal-footer {
    padding: 14px 22px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    background: #f8fafc;
  }

  /* Form Elements */
  .form-group {
    margin-bottom: 16px;
  }

  .form-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    margin-bottom: 6px;
  }

  .form-label span {
    color: #94a3b8;
    font-weight: 500;
    font-size: 11px;
    margin-left: 4px;
  }

  .form-control {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    color: #1e293b;
    outline: none;
    transition: 0.15s;
    background: #ffffff;
  }

  .form-control:focus {
    border-color: #19563e;
    box-shadow: 0 0 0 3px rgba(25, 86, 62, 0.12);
  }

  textarea.form-control {
    min-height: 80px;
    resize: vertical;
  }

  /* Resume Upload Box */
  .resume-dropzone {
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    background: #f8fafc;
    cursor: pointer;
    transition: 0.18s;
  }

  .resume-dropzone:hover {
    border-color: #19563e;
    background: #ecfdf5;
  }

  .resume-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border: 1.5px solid #a7f3d0;
    background: #ecfdf5;
    border-radius: 10px;
    margin-top: 10px;
  }

  .resume-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .resume-name {
    font-weight: 700;
    font-size: 13px;
    color: #065f46;
  }

  .resume-size {
    font-size: 11px;
    color: #047857;
  }

  /* Status Pills */
  .status-pill {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
  }

  .status-applied { background: #f1f5f9; color: #475569; }
  .status-under_review { background: #e0f2fe; color: #0369a1; }
  .status-shortlisted { background: #ede9fe; color: #6d28d9; }
  .status-interview { background: #fce7f3; color: #be185d; }
  .status-selected { background: #dcfce7; color: #15803d; }
  .status-rejected { background: #fee2e2; color: #b91c1c; }
  .status-withdrawn { background: #f3f4f6; color: #6b7280; }

  .status-draft { background: #f1f5f9; color: #475569; }
  .status-pending_review { background: #fef3c7; color: #b45309; }
  .status-approved { background: #ecfdf5; color: #059669; }
  .status-changes_requested { background: #ffedd5; color: #c2410c; }
  .status-paused { background: #e2e8f0; color: #475569; }

  /* Metrics Grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .metric-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  }

  .metric-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .metric-value {
    font-size: 26px;
    font-weight: 800;
    color: #19563e;
    margin-top: 4px;
  }

  /* Chat Interface */
  .chat-box {
    display: flex;
    flex-direction: column;
    height: 380px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #f8fafc;
  }

  .chat-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.4;
  }

  .chat-bubble.mine {
    align-self: flex-end;
    background: #19563e;
    color: #ffffff;
    border-bottom-right-radius: 2px;
  }

  .chat-bubble.theirs {
    align-self: flex-start;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #1e293b;
    border-bottom-left-radius: 2px;
  }

  .chat-time {
    font-size: 10px;
    opacity: 0.7;
    margin-top: 4px;
    text-align: right;
  }

  .chat-input-row {
    display: flex;
    padding: 10px;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    gap: 8px;
  }

  .chat-input-row input {
    flex: 1;
    padding: 10px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    outline: none;
    font-size: 13px;
  }

  .chat-input-row input:focus {
    border-color: #19563e;
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 10px 14px;
    }
    .bottom-nav {
      display: flex;
    }
    .main-container {
      padding: 12px 8px;
    }
    .search-input-row {
      flex-direction: column;
    }
    .search-field {
      width: 100%;
    }
    .nav-tagline {
      display: none;
    }
    #hiringMap {
      height: 380px;
    }
    .map-preview-sheet {
      top: auto;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: 60vh;
      border-radius: 16px 16px 0 0;
      border-bottom: none;
    }
  }
`;
