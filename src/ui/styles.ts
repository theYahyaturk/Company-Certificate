export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Great+Vibes&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Poppins:wght@400;500;600;700&display=swap');

  :root {
    --alifeo-green-dark: #084328;
    --alifeo-green: #075c37;
    --alifeo-green-hover: #05482b;
    --alifeo-emerald: #059669;
    --alifeo-light-green: #ecfdf5;
    --alifeo-border-green: #a7f3d0;
    --gold: #d97706;
    --gold-light: #fef3c7;
    
    --bg-light: #f8fafc;
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
    background-color: var(--bg-light);
    color: var(--text-body);
    font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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

  /* Top decorative green bar like mail.alifeo.com */
  .top-brand-bar {
    height: 4px;
    background: linear-gradient(90deg, #084328, #059669, #10b981);
    width: 100%;
  }

  /* Header Navbar */
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: #ffffff;
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-logo {
    height: 38px;
    max-width: 130px;
    object-fit: contain;
  }

  .nav-badge {
    background: var(--alifeo-light-green);
    border: 1px solid var(--alifeo-border-green);
    color: var(--alifeo-green-dark);
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .nav-link {
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: var(--alifeo-green-dark);
  }

  .btn-admin {
    background: #f1f5f9;
    border: 1px solid var(--border-color);
    color: var(--text-title);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-admin:hover {
    background: #e2e8f0;
    color: var(--alifeo-green-dark);
  }

  .btn-logout {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-logout:hover {
    background: #fca5a5;
  }

  /* Main Container */
  .main-content {
    flex: 1;
    padding: 28px 16px;
    max-width: 1240px;
    margin: 0 auto;
    width: 100%;
  }

  /* Verification Hero */
  .verify-hero {
    text-align: center;
    max-width: 700px;
    margin: 30px auto 40px;
  }

  .verify-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--alifeo-light-green);
    border: 1px solid var(--alifeo-border-green);
    color: var(--alifeo-green-dark);
    font-size: 12px;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 999px;
    margin-bottom: 16px;
  }

  .verify-title {
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -0.5px;
    line-height: 1.25;
    margin-bottom: 12px;
    color: var(--alifeo-green-dark);
  }

  @media (max-width: 640px) {
    .verify-title {
      font-size: 26px;
    }
  }

  .verify-desc {
    color: var(--text-muted);
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 26px;
  }

  /* Search Card */
  .search-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 6px;
    display: flex;
    gap: 8px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
    max-width: 580px;
    margin: 0 auto;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .search-card:focus-within {
    border-color: var(--alifeo-green);
    box-shadow: 0 10px 25px -5px rgba(8, 67, 40, 0.12);
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-title);
    font-size: 15px;
    padding: 10px 16px;
  }

  .search-input::placeholder {
    color: #94a3b8;
  }

  .btn-search {
    background: linear-gradient(135deg, var(--alifeo-green-dark), var(--alifeo-green));
    border: none;
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 24px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-search:hover {
    background: var(--alifeo-green-hover);
  }

  /* Features Grid */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 48px;
  }

  .feature-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.06);
    border-color: var(--alifeo-border-green);
  }

  .feature-icon {
    font-size: 26px;
    margin-bottom: 12px;
    display: inline-block;
  }

  .feature-title {
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 6px;
    color: var(--alifeo-green-dark);
  }

  .feature-desc {
    color: var(--text-muted);
    font-size: 13.5px;
    line-height: 1.55;
  }

  /* Action Bar on Verify Page */
  .cert-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 18px 22px;
    margin-bottom: 24px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
  }

  .status-badge-verified {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--alifeo-light-green);
    border: 1px solid var(--alifeo-border-green);
    color: var(--alifeo-green-dark);
    padding: 8px 18px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13.5px;
  }

  .status-badge-revoked {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #991b1b;
    padding: 8px 18px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13.5px;
  }

  .cert-btn-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn-download {
    background: linear-gradient(135deg, var(--alifeo-green-dark), var(--alifeo-green));
    color: #ffffff;
    font-weight: 600;
    font-size: 13.5px;
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s;
  }

  .btn-download:hover {
    background: var(--alifeo-green-hover);
    transform: translateY(-1px);
  }

  .btn-linkedin {
    background-color: #0077b5;
    color: #ffffff;
    font-weight: 600;
    font-size: 13.5px;
    padding: 10px 18px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s;
  }

  .btn-linkedin:hover {
    background-color: #005e93;
    transform: translateY(-1px);
  }

  .btn-copy-link {
    background: #f1f5f9;
    color: var(--text-title);
    border: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 13.5px;
    padding: 10px 16px;
    border-radius: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s;
  }

  .btn-copy-link:hover {
    background: #e2e8f0;
  }

  /* Candidate Summary Card */
  .candidate-meta-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 22px;
    margin-bottom: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
  }

  .meta-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .meta-label {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .meta-val {
    font-size: 15px;
    color: var(--text-title);
    font-weight: 600;
  }

  .meta-val-highlight {
    color: var(--alifeo-green);
    font-weight: 700;
  }

  /* Mobile scroll hint for certificate */
  .mobile-cert-hint {
    display: none;
    background: #fef3c7;
    border: 1px solid #fde68a;
    color: #92400e;
    font-size: 12px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 8px;
    margin-bottom: 12px;
    text-align: center;
  }

  @media (max-width: 900px) {
    .mobile-cert-hint {
      display: block;
    }
  }

    /* ===================================================
     RESPONSIVE CERTIFICATE CONTAINER & SCALING ENGINE
     =================================================== */
  .cert-view-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1024px;
    margin: 0 auto 12px;
    padding: 0 4px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .view-mode-buttons {
    display: inline-flex;
    background: #e2e8f0;
    border-radius: 8px;
    padding: 3px;
    gap: 4px;
  }

  .view-mode-btn {
    background: transparent;
    border: none;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .view-mode-btn.active {
    background: #ffffff;
    color: var(--alifeo-green-dark);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .cert-zoom-info {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
  }

  .certificate-stage {
    width: 100%;
    max-width: 1024px;
    margin: 8px auto 30px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }

  .certificate-scaler {
    transform-origin: top center;
    transition: transform 0.12s ease-out;
    will-change: transform;
    display: flex;
    justify-content: center;
    width: 1024px;
  }

  .certificate-sheet {
    width: 1024px !important;
    height: 706px !important;
    min-width: 1024px !important;
    max-width: 1024px !important;
    min-height: 706px !important;
    max-height: 706px !important;
    background: #ffffff;
    color: #0f172a;
    box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
    user-select: none;
  }

  /* Mobile & Small Screen Media Queries */
  @media (max-width: 768px) {
    .navbar {
      padding: 10px 16px;
    }

    .nav-logo {
      height: 32px;
      max-width: 110px;
    }

    .nav-badge {
      font-size: 9.5px;
      padding: 2px 8px;
    }

    .main-content {
      padding: 16px 12px 30px;
    }

    .verify-hero {
      margin: 14px auto 20px;
    }

    .verify-title {
      font-size: 22px;
    }

    .verify-desc {
      font-size: 13px;
      margin-bottom: 16px;
    }

    .cert-action-bar {
      flex-direction: column;
      align-items: stretch;
      padding: 14px;
      gap: 12px;
    }

    .status-badge-verified, .status-badge-revoked {
      justify-content: center;
    }

    .cert-btn-group {
      flex-direction: column;
      width: 100%;
      gap: 8px;
    }

    .btn-download, .btn-linkedin, .btn-copy-link {
      width: 100%;
      justify-content: center;
      padding: 11px 16px;
    }

    .candidate-meta-card {
      grid-template-columns: repeat(2, 1fr);
      padding: 14px;
      gap: 10px;
    }

    .meta-label {
      font-size: 10px;
    }

    .meta-val {
      font-size: 13px;
    }

    .cert-view-controls {
      margin-bottom: 8px;
    }
  }

  @media (max-width: 440px) {
    .candidate-meta-card {
      grid-template-columns: 1fr 1fr;
      padding: 12px;
      gap: 8px;
    }

    .meta-col:nth-child(2) {
      grid-column: span 2;
    }
  }


  /* Modern Green Waves Sheet (Like the user's template) */
  .modern-green-sheet {
    background: #ffffff;
  }

  .corner-wave-tl {
    position: absolute;
    top: 0;
    left: 0;
    width: 330px;
    height: 270px;
    pointer-events: none;
    z-index: 1;
  }

  .corner-wave-br {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 360px;
    height: 290px;
    pointer-events: none;
    z-index: 1;
  }

  .vertical-brand-strip {
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%) rotate(90deg);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    color: #059669;
    opacity: 0.6;
    pointer-events: none;
    z-index: 2;
  }

  /* Custom Template Background Style */
  .certificate-sheet.custom-template-sheet {
    background-size: 100% 100% !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
  }

  .cert-modern-layout {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 24px 64px 20px;
  }

  .cert-modern-layout.on-custom-bg {
    padding: 36px 64px 20px;
  }

  .cert-header-block {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .cert-alifeo-logo {
    height: 44px;
    max-width: 180px;
    object-fit: contain;
    margin-bottom: 2px;
  }

  .cert-alifeo-tm {
    font-size: 11px;
    font-weight: 800;
    color: var(--alifeo-green-dark);
    letter-spacing: 2px;
  }

  .cert-type-title {
    font-family: 'Cinzel', serif;
    font-size: 17px;
    font-weight: 800;
    color: var(--alifeo-green-dark);
    letter-spacing: 2px;
    margin-top: 4px;
  }

  .cert-pre-name {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #64748b;
    margin-top: 3px;
  }

  .cert-student-fullname {
    font-family: 'Playfair Display', serif;
    font-size: 38px;
    font-weight: 700;
    color: var(--alifeo-green-dark);
    letter-spacing: 0.5px;
    margin: 4px 0 2px;
    line-height: 1.1;
  }

  .cert-gold-bar {
    width: 240px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #d97706, transparent);
    margin: 0 auto 8px;
  }

  .cert-role-statement {
    font-size: 12.5px;
    color: #475569;
  }

  .cert-role-pill {
    font-family: 'Cinzel', serif;
    font-size: 17px;
    font-weight: 800;
    color: var(--alifeo-green-dark);
    background: #ecfdf5;
    border-left: 3px solid #059669;
    border-right: 3px solid #059669;
    padding: 4px 22px;
    border-radius: 4px;
    display: inline-block;
    margin: 4px 0 8px;
    letter-spacing: 0.5px;
  }

  .cert-para {
    font-size: 11px;
    line-height: 1.45;
    color: #334155;
    max-width: 820px;
    margin: 0 auto;
  }

  .cert-details-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 18px;
    width: 92%;
    margin: 8px 0;
    box-sizing: border-box;
  }

  .cert-box-title {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: var(--alifeo-green-dark);
    text-align: left;
    margin-bottom: 4px;
  }

  .cert-grid-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
  }

  .cert-grid-cell {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .cell-k {
    font-weight: 700;
    color: #64748b;
  }

  .cell-v {
    font-weight: 700;
    color: #0f172a;
  }

  .grade-text {
    color: var(--alifeo-emerald);
    font-weight: 800;
  }

  .cert-recognition-text {
    font-size: 10.5px;
    color: #475569;
    max-width: 820px;
    margin: 4px 0 8px;
    line-height: 1.4;
  }

  .cert-bottom-signatures {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 94%;
    margin-top: auto;
    padding-top: 6px;
  }

  .signatory-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 220px;
  }

  .sig-img-container {
    height: 52px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 2px;
  }

  .real-signature-img {
    max-height: 50px;
    max-width: 160px;
    object-fit: contain;
  }

  .sig-divider-line {
    width: 160px;
    height: 1px;
    background: #334155;
    margin: 2px 0 4px;
  }

  .sig-person-name {
    font-size: 12px;
    font-weight: 800;
    color: var(--alifeo-green-dark);
  }

  .sig-person-title {
    font-size: 9.5px;
    font-weight: 600;
    color: #475569;
  }

  .cert-verification-center {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    padding: 4px 10px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .cert-qr-wrapper {
    width: 52px;
    height: 52px;
  }

  .cert-qr-wrapper svg {
    width: 100%;
    height: 100%;
  }

  .cert-qr-text {
    text-align: left;
  }

  .cert-id-string {
    font-family: monospace;
    font-weight: 800;
    font-size: 10.5px;
    color: var(--alifeo-green-dark);
  }

  .cert-verify-link {
    font-size: 8.5px;
    color: #64748b;
  }

  /* =========================================
     ADMIN DASHBOARD (WHITE & GREEN)
     ========================================= */
  .admin-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (min-width: 960px) {
    .admin-grid {
      grid-template-columns: 460px 1fr;
    }
  }

  .admin-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
  }

  .admin-card-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--alifeo-green-dark);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .admin-card-desc {
    font-size: 13px;
    color: var(--text-muted);
    margin-bottom: 20px;
  }

  .admin-nav-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 20px;
  }

  .admin-tab-btn {
    padding: 10px 16px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-muted);
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .admin-tab-btn.active {
    color: var(--alifeo-green-dark);
    border-bottom-color: var(--alifeo-green-dark);
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-label {
    display: block;
    font-size: 12.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--alifeo-green-dark);
    margin-bottom: 6px;
  }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    background: #f8fafc;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-title);
    font-size: 14px;
    padding: 10px 14px;
    outline: none;
    transition: all 0.2s;
    font-family: inherit;
  }

  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: var(--alifeo-green);
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(7, 92, 55, 0.12);
  }

  .form-checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--text-body);
    cursor: pointer;
    user-select: none;
  }

  .form-checkbox {
    width: 16px;
    height: 16px;
    accent-color: var(--alifeo-green);
    cursor: pointer;
  }

  .btn-submit {
    width: 100%;
    background: linear-gradient(135deg, var(--alifeo-green-dark), var(--alifeo-green));
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 13px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    box-shadow: 0 4px 6px -1px rgba(8, 67, 40, 0.2);
  }

  .btn-submit:hover {
    background: var(--alifeo-green-hover);
    transform: translateY(-1px);
  }

  /* Admin Table */
  .table-container {
    overflow-x: auto;
    margin-top: 14px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }

  .admin-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    text-align: left;
    background: #ffffff;
  }

  .admin-table th {
    background: #f8fafc;
    padding: 12px 14px;
    color: #475569;
    font-weight: 700;
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .admin-table td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-body);
  }

  .admin-table tr:last-child td {
    border-bottom: none;
  }

  .admin-table tr:hover td {
    background: #f8fafc;
  }

  .table-btn {
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    margin-right: 4px;
  }

  .table-btn-view {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  }

  .table-btn-resend {
    background: var(--alifeo-light-green);
    color: var(--alifeo-green-dark);
    border: 1px solid var(--alifeo-border-green);
  }

  .table-btn-revoke {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  /* Template Card Preview Grid */
  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 16px;
  }

  .template-item {
    border: 2px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .template-item:hover {
    border-color: var(--alifeo-green);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px -4px rgba(0,0,0,0.08);
  }

  .template-item.selected {
    border-color: var(--alifeo-green);
    box-shadow: 0 0 0 2px var(--alifeo-green);
  }

  .template-thumb {
    width: 100%;
    height: 120px;
    object-fit: cover;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .template-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .template-info {
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .template-name {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-title);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Footer */
  .footer {
    border-top: 1px solid var(--border-color);
    padding: 22px 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    background: #ffffff;
    margin-top: auto;
  }

  /* =========================================
     PRINT STYLES FOR CRISP HIGH-RES PDF EXPORT
     ========================================= */
  @media print {
    @page {
      size: landscape;
      margin: 0;
    }

    body {
      background: #ffffff !important;
      color: #000000 !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .top-brand-bar, .navbar, .footer, .cert-action-bar, .candidate-meta-card, .btn-download, .btn-linkedin, .btn-copy-link, .mobile-cert-hint, .cert-view-controls {
      display: none !important;
    }

    .main-content {
      padding: 0 !important;
      max-width: none !important;
      margin: 0 !important;
    }

    .certificate-stage {
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .certificate-scaler {
      transform: none !important;
    }

    .certificate-sheet {
      width: 100vw !important;
      height: 100vh !important;
      min-width: 100% !important;
      min-height: 100% !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      border: none !important;
      page-break-inside: avoid;
    }
  }
`;
