export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --alifeo-dark: #013824;
    --alifeo-green-dark: #024a34;
    --alifeo-green: #035e41;
    --alifeo-green-hover: #02432e;
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
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  /* Top decorative green bar */
  .top-brand-bar {
    height: 3px;
    background: linear-gradient(90deg, #013824 0%, #059669 50%, #10b981 100%);
    width: 100%;
  }

  /* Header Navbar (Exact Logo Dark Green #19563e) */
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background: #19563e;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-logo-box {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  /* Original Logo (Untouched, No Color Filters) */
  .nav-logo {
    height: 32px;
    width: 32px;
    border-radius: 6px;
    object-fit: cover;
    display: block;
  }

  .nav-brand-title {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-badge-simple {
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    font-weight: 600;
  }

  .nav-pill-white {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 999px;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
  }

  .nav-pill-white:hover {
    background: #ffffff;
    color: #19563e;
  }

  .nav-pill-link {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.25);
    font-size: 13px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 999px;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
  }

  .nav-pill-link:hover {
    background: #ffffff;
    color: #19563e;
  }

  /* Career Promo Card (for Verify Page & Home Page) */
  .career-promo-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 22px 24px;
    margin-top: 24px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .career-promo-content h3 {
    font-size: 17px;
    font-weight: 800;
    color: var(--alifeo-dark);
    margin-bottom: 4px;
  }

  .career-promo-content p {
    font-size: 13.5px;
    color: var(--text-body);
    line-height: 1.5;
  }

  .career-promo-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn-career-primary {
    background: #19563e;
    color: #ffffff;
    font-weight: 700;
    font-size: 13.5px;
    padding: 10px 18px;
    border-radius: 10px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s;
  }

  .btn-career-primary:hover {
    background: #0d3827;
  }

  .btn-career-outline {
    background: #f8fafc;
    color: var(--text-title);
    border: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 13.5px;
    padding: 10px 16px;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.15s;
  }

  .btn-career-outline:hover {
    background: #e2e8f0;
    color: var(--alifeo-dark);
  }

  /* Main Container */
  .main-content {
    flex: 1;
    padding: 24px 16px 48px;
    max-width: 1120px;
    margin: 0 auto;
    width: 100%;
  }

  /* ===================================================
     CLEAN MINIMALIST HOME HERO
     =================================================== */
  .verify-hero-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 60px 16px 80px;
    max-width: 620px;
    margin: 0 auto;
  }

  .verify-badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 14px;
    border-radius: 999px;
    margin-bottom: 16px;
  }

  .verify-title {
    font-size: 36px;
    font-weight: 800;
    color: var(--alifeo-dark);
    letter-spacing: -0.6px;
    margin-bottom: 10px;
    line-height: 1.2;
  }

  .verify-subtitle {
    color: #64748b;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 28px;
    max-width: 480px;
  }

  .search-card-clean {
    background: #ffffff;
    border: 1.5px solid var(--border-color);
    border-radius: 999px;
    padding: 6px 8px 6px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    width: 100%;
    max-width: 520px;
    transition: all 0.2s ease;
  }

  .search-card-clean:focus-within {
    border-color: #059669;
    box-shadow: 0 12px 28px -5px rgba(5, 150, 105, 0.12), 0 0 0 3px rgba(167, 243, 208, 0.4);
  }

  .search-icon-svg {
    width: 18px;
    height: 18px;
    color: #94a3b8;
    flex-shrink: 0;
  }

  .search-input-clean {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #0f172a;
    font-size: 15px;
    font-weight: 600;
    padding: 8px 0;
    font-family: inherit;
  }

  .search-input-clean::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  .btn-verify-clean {
    background: linear-gradient(135deg, #013824 0%, #035e41 100%);
    border: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 11px 24px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    box-shadow: 0 2px 8px rgba(1, 56, 36, 0.2);
  }

  .btn-verify-clean:hover {
    background: linear-gradient(135deg, #024a34 0%, #059669 100%);
    transform: translateY(-1px);
  }

  .search-hint-text {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 14px;
    font-weight: 500;
  }

  /* ===================================================
     VERIFY PAGE LAYOUT (CERTIFICATE FIRST)
     =================================================== */
  .verify-top-badge-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 14px;
  }

  .status-badge-verified {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    padding: 7px 16px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13.5px;
  }

  .status-badge-revoked {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #991b1b;
    padding: 7px 16px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13.5px;
  }

  .cert-view-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .view-mode-buttons {
    display: inline-flex;
    background: #f1f5f9;
    border: 1px solid var(--border-color);
    border-radius: 999px;
    padding: 3px;
    gap: 2px;
  }

  .view-mode-btn {
    background: transparent;
    border: none;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: inherit;
  }

  .view-mode-btn.active {
    background: #ffffff;
    color: var(--alifeo-dark);
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  /* Certificate Preview Stage */
  .certificate-stage-wrapper {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 8px 30px -6px rgba(0, 0, 0, 0.06);
    margin-bottom: 20px;
    position: relative;
  }

  .certificate-stage {
    width: 100%;
    max-width: 1024px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    border-radius: 10px;
  }

  .certificate-scaler {
    transform-origin: top center;
    transition: transform 0.1s ease-out;
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
    border-radius: 8px;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
    user-select: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }

  /* Action Buttons Box (Directly below Certificate) */
  .cert-actions-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  }

  .cert-btn-group-grid {
    display: grid;
    grid-template-columns: 1.5fr 1.3fr 1fr 1fr;
    gap: 12px;
  }

  .btn-download-primary {
    background: linear-gradient(135deg, #013824 0%, #035e41 60%, #059669 100%);
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 12px 18px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    font-family: inherit;
    box-shadow: 0 2px 8px rgba(1, 56, 36, 0.2);
  }

  .btn-download-primary:hover {
    background: linear-gradient(135deg, #024a34 0%, #059669 100%);
    transform: translateY(-1px);
  }

  .btn-linkedin-action {
    background-color: #0a66c2;
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 12px 16px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    font-family: inherit;
  }

  .btn-linkedin-action:hover {
    background-color: #084e96;
    transform: translateY(-1px);
  }

  .btn-outline-action {
    background: #f8fafc;
    color: var(--text-title);
    border: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 13.5px;
    padding: 12px 14px;
    border-radius: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.15s;
    font-family: inherit;
  }

  .btn-outline-action:hover {
    background: #e2e8f0;
    color: var(--alifeo-dark);
  }

  /* Candidate & Internship Meta Details Card */
  .candidate-meta-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  }

  .meta-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .meta-label {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .meta-val {
    font-size: 15px;
    color: var(--text-title);
    font-weight: 700;
  }

  .meta-val-highlight {
    color: var(--alifeo-green);
    font-weight: 800;
  }

  /* Footer */
  .footer {
    border-top: 1px solid var(--border-color);
    padding: 22px 16px;
    text-align: center;
    color: #94a3b8;
    font-size: 13px;
    background: #ffffff;
    margin-top: auto;
  }

  /* ===================================================
     MOBILE RESPONSIVENESS
     =================================================== */
  @media (max-width: 860px) {
    .cert-btn-group-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 640px) {
    .navbar {
      padding: 10px 16px;
    }

    .nav-logo {
      height: 28px;
      width: 28px;
    }

    .nav-brand-title {
      font-size: 18px;
    }

    .main-content {
      padding: 16px 12px 32px;
    }

    .verify-hero-container {
      padding: 36px 12px 50px;
    }

    .verify-title {
      font-size: 26px;
    }

    .verify-subtitle {
      font-size: 13.5px;
      margin-bottom: 22px;
    }

    .search-card-clean {
      padding: 5px 6px 5px 14px;
    }

    .btn-verify-clean {
      padding: 10px 18px;
      font-size: 13px;
    }

    .certificate-stage-wrapper {
      padding: 10px 6px;
      border-radius: 14px;
      margin-bottom: 14px;
    }

    .cert-actions-card {
      padding: 14px;
      border-radius: 14px;
      margin-bottom: 14px;
    }

    .cert-btn-group-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .btn-download-primary, .btn-linkedin-action, .btn-outline-action {
      width: 100%;
      padding: 12px;
      font-size: 13.5px;
    }

    .candidate-meta-card {
      grid-template-columns: 1fr 1fr;
      padding: 16px;
      gap: 12px;
      border-radius: 14px;
    }

    .meta-val {
      font-size: 13.5px;
    }
  }

  @media (max-width: 420px) {
    .candidate-meta-card {
      grid-template-columns: 1fr;
    }
  }

  /* Admin Styles */
  .admin-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
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
    color: var(--alifeo-dark);
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
    box-shadow: 0 0 0 3px rgba(3, 94, 65, 0.12);
  }

  .btn-submit {
    width: 100%;
    background: linear-gradient(135deg, var(--alifeo-dark), var(--alifeo-green));
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 13px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .btn-submit:hover {
    background: var(--alifeo-green-hover);
  }

  .btn-logout {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

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
  }

  .admin-table td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-body);
  }

  .table-btn {
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    margin-right: 4px;
    font-family: inherit;
  }

  .table-btn-view {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  }

  .table-btn-resend {
    background: var(--alifeo-light-green);
    color: var(--alifeo-dark);
    border: 1px solid var(--alifeo-border-green);
  }

  .table-btn-revoke {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  /* Template grid */
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
  }

  .template-thumb {
    width: 100%;
    height: 120px;
    object-fit: cover;
    background: #f1f5f9;
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

  /* Print Styles */
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

    .top-brand-bar, .navbar, .footer, .cert-actions-card, .candidate-meta-card, .verify-top-badge-bar, .cert-view-controls {
      display: none !important;
    }

    .main-content {
      padding: 0 !important;
      max-width: none !important;
      margin: 0 !important;
    }

    .certificate-stage-wrapper {
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      margin: 0 !important;
      background: transparent !important;
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
