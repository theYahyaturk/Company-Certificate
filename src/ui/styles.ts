export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    --alifeo-dark: #013824;
    --alifeo-dark-rgb: 1, 56, 36;
    --alifeo-green-dark: #024a34;
    --alifeo-green: #035e41;
    --alifeo-green-hover: #02432e;
    --alifeo-emerald: #059669;
    --alifeo-light-green: #ecfdf5;
    --alifeo-border-green: #a7f3d0;
    --alifeo-mint: #d1fae5;
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

  /* Header Navbar (Matching app.alifeo.com signature forest green) */
  .navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 28px;
    background: linear-gradient(135deg, #013824 0%, #024a34 50%, #035e41 100%);
    color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 4px 16px rgba(1, 56, 36, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
    height: 36px;
    max-width: 130px;
    object-fit: contain;
    filter: brightness(0) invert(1); /* Clean white logo on deep green header */
  }

  .nav-badge {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    letter-spacing: 0.4px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    backdrop-filter: blur(4px);
  }

  .nav-badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34d399;
    box-shadow: 0 0 8px #34d399;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .nav-pill-link {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    padding: 7px 16px;
    border-radius: 999px;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
  }

  .nav-pill-link:hover {
    background: rgba(255, 255, 255, 0.22);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
    color: #ffffff;
  }

  .nav-pill-link-secondary {
    background: transparent;
    border: 1px solid transparent;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 600;
    padding: 7px 12px;
    border-radius: 999px;
    transition: all 0.2s;
  }

  .nav-pill-link-secondary:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  .btn-admin {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffffff;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 12.5px;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-admin:hover {
    background: #ffffff;
    color: var(--alifeo-dark);
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
    padding: 24px 20px 48px;
    max-width: 1180px;
    margin: 0 auto;
    width: 100%;
  }

  /* ===================================================
     HOME PAGE HERO & CARDS (Matching app.alifeo.com style)
     =================================================== */
  .brand-hero-section {
    background: linear-gradient(145deg, #013824 0%, #024a34 50%, #035e41 100%);
    border-radius: 24px;
    padding: 44px 32px 48px;
    color: #ffffff;
    text-align: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 16px 36px -10px rgba(1, 56, 36, 0.35);
    margin-bottom: 36px;
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .hero-glow-circle {
    position: absolute;
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(52, 211, 153, 0.18) 0%, transparent 70%);
    top: -120px;
    right: -100px;
    pointer-events: none;
  }

  .hero-glow-circle-left {
    position: absolute;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, transparent 70%);
    bottom: -100px;
    left: -80px;
    pointer-events: none;
  }

  .hero-pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.22);
    color: #a7f3d0;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 999px;
    margin-bottom: 18px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
  }

  .hero-title {
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.8px;
    line-height: 1.2;
    margin-bottom: 14px;
    color: #ffffff;
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  .hero-title span {
    background: linear-gradient(90deg, #6ee7b7, #a7f3d0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero-subtitle {
    color: #d1fae5;
    font-size: 15.5px;
    line-height: 1.6;
    margin: 0 auto 32px;
    max-width: 620px;
    font-weight: 400;
  }

  /* App-style Search Box (Rounded Pill like app.alifeo.com search bar) */
  .search-card-hero {
    background: #ffffff;
    border-radius: 999px;
    padding: 6px 8px 6px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
    max-width: 580px;
    margin: 0 auto;
    border: 2px solid transparent;
    transition: all 0.2s ease;
  }

  .search-card-hero:focus-within {
    border-color: #34d399;
    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.28), 0 0 0 4px rgba(52, 211, 153, 0.25);
  }

  .search-icon-svg {
    width: 20px;
    height: 20px;
    color: #64748b;
    flex-shrink: 0;
  }

  .search-input-hero {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #0f172a;
    font-size: 15px;
    font-weight: 600;
    padding: 10px 4px;
    font-family: inherit;
  }

  .search-input-hero::placeholder {
    color: #94a3b8;
    font-weight: 500;
  }

  .btn-search-hero {
    background: linear-gradient(135deg, #013824 0%, #035e41 100%);
    border: none;
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 12px 26px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(1, 56, 36, 0.3);
  }

  .btn-search-hero:hover {
    background: linear-gradient(135deg, #024a34 0%, #059669 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(1, 56, 36, 0.4);
  }

  .hero-helper-text {
    margin-top: 14px;
    font-size: 12px;
    color: #a7f3d0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
  }

  /* Promotion Banner (Like FirstOrder coupon banner on app.alifeo.com) */
  .brand-announcement-card {
    background: linear-gradient(135deg, #024a34 0%, #013824 100%);
    border: 1px solid #059669;
    border-radius: 16px;
    padding: 16px 24px;
    margin-bottom: 32px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    box-shadow: 0 6px 18px rgba(1, 56, 36, 0.12);
  }

  .announcement-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .announcement-badge {
    background: #d97706;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 6px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .announcement-text {
    font-size: 14px;
    font-weight: 600;
    color: #f8fafc;
  }

  .announcement-text strong {
    color: #34d399;
  }

  .announcement-btn {
    background: #ffffff;
    color: var(--alifeo-dark);
    font-size: 12.5px;
    font-weight: 700;
    padding: 8px 18px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .announcement-btn:hover {
    background: #ecfdf5;
    transform: translateY(-1px);
  }

  /* 3-Column Features Grid */
  .section-heading-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--alifeo-dark);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-link {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--alifeo-green);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .section-link:hover {
    color: var(--alifeo-dark);
    text-decoration: underline;
  }

  .features-grid-brand {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 36px;
  }

  .feature-card-brand {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.25s ease;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .feature-card-brand:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 24px rgba(1, 56, 36, 0.08);
    border-color: var(--alifeo-border-green);
  }

  .feature-card-brand::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #013824, #10b981);
    opacity: 0;
    transition: opacity 0.25s;
  }

  .feature-card-brand:hover::before {
    opacity: 1;
  }

  .feature-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--alifeo-green-dark);
    margin-bottom: 16px;
  }

  .feature-title-brand {
    font-size: 16px;
    font-weight: 700;
    color: var(--alifeo-dark);
    margin-bottom: 8px;
  }

  .feature-desc-brand {
    color: var(--text-muted);
    font-size: 13.5px;
    line-height: 1.6;
  }

  /* How to Verify Steps Card */
  .guide-card-brand {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 28px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    margin-bottom: 36px;
  }

  .guide-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 20px;
  }

  .guide-step {
    display: flex;
    gap: 14px;
  }

  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--alifeo-dark);
    color: #ffffff;
    font-weight: 800;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .step-content h4 {
    font-size: 14.5px;
    font-weight: 700;
    color: var(--alifeo-dark);
    margin-bottom: 4px;
  }

  .step-content p {
    font-size: 12.5px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  /* ===================================================
     VERIFY PAGE LAYOUT (CERTIFICATE FIRST DESIGN)
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
    gap: 8px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #065f46;
    padding: 8px 18px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 13.5px;
    box-shadow: 0 2px 6px rgba(5, 150, 105, 0.08);
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

  .cert-view-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .view-mode-buttons {
    display: inline-flex;
    background: #e2e8f0;
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
    color: #475569;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Certificate Preview Stage */
  .certificate-stage-wrapper {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 16px;
    box-shadow: 0 12px 36px -8px rgba(1, 56, 36, 0.12);
    margin-bottom: 24px;
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
    border-radius: 12px;
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
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

  /* Action Buttons Box (Directly below Certificate) */
  .cert-actions-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
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
    padding: 13px 20px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(1, 56, 36, 0.25);
    font-family: inherit;
  }

  .btn-download-primary:hover {
    background: linear-gradient(135deg, #024a34 0%, #059669 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(1, 56, 36, 0.35);
  }

  .btn-linkedin-action {
    background-color: #0a66c2;
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 13px 18px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(10, 102, 194, 0.2);
    font-family: inherit;
  }

  .btn-linkedin-action:hover {
    background-color: #084e96;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(10, 102, 194, 0.3);
  }

  .btn-outline-action {
    background: #f8fafc;
    color: var(--text-title);
    border: 1px solid var(--border-color);
    font-weight: 600;
    font-size: 13.5px;
    padding: 13px 16px;
    border-radius: 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
    font-family: inherit;
  }

  .btn-outline-action:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
    color: var(--alifeo-dark);
  }

  /* Candidate & Internship Meta Details Card */
  .candidate-meta-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 24px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 20px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
  }

  .meta-col {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .meta-label {
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .meta-val {
    font-size: 15.5px;
    color: var(--text-title);
    font-weight: 700;
  }

  .meta-val-highlight {
    color: var(--alifeo-green);
    font-weight: 800;
  }

  /* Authenticity & Program Guarantee Card */
  .authenticity-guarantee-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 22px 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .guarantee-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .guarantee-icon-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: var(--alifeo-green-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .guarantee-info h4 {
    font-size: 15px;
    font-weight: 700;
    color: var(--alifeo-dark);
    margin-bottom: 3px;
  }

  .guarantee-info p {
    font-size: 13px;
    color: var(--text-muted);
  }

  .guarantee-badge {
    background: #f1f5f9;
    border: 1px solid var(--border-color);
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    color: var(--alifeo-dark);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  /* Footer */
  .footer {
    border-top: 1px solid var(--border-color);
    padding: 26px 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    background: #ffffff;
    margin-top: auto;
  }

  .footer-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  .footer-link-item {
    color: var(--text-muted);
    font-weight: 600;
    transition: color 0.2s;
  }

  .footer-link-item:hover {
    color: var(--alifeo-green);
  }

  /* ===================================================
     MOBILE RESPONSIVENESS (SUPER POLISHED FOR SMARTPHONES)
     =================================================== */
  @media (max-width: 860px) {
    .features-grid-brand {
      grid-template-columns: 1fr;
    }

    .guide-grid {
      grid-template-columns: 1fr;
    }

    .cert-btn-group-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 640px) {
    .navbar {
      padding: 12px 16px;
    }

    .nav-logo {
      height: 28px;
      max-width: 95px;
    }

    .nav-badge {
      font-size: 9.5px;
      padding: 3px 8px;
    }

    .nav-pill-link {
      font-size: 11.5px;
      padding: 5px 12px;
    }

    .main-content {
      padding: 16px 12px 36px;
    }

    .brand-hero-section {
      padding: 28px 16px 32px;
      border-radius: 18px;
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: 24px;
      letter-spacing: -0.4px;
    }

    .hero-subtitle {
      font-size: 13.5px;
      margin-bottom: 22px;
    }

    .search-card-hero {
      padding: 5px 6px 5px 14px;
      border-radius: 999px;
    }

    .search-input-hero {
      font-size: 13.5px;
      padding: 8px 2px;
    }

    .btn-search-hero {
      font-size: 13px;
      padding: 10px 18px;
    }

    .brand-announcement-card {
      padding: 14px 16px;
      border-radius: 14px;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .certificate-stage-wrapper {
      padding: 10px 8px;
      border-radius: 16px;
      margin-bottom: 16px;
    }

    .cert-actions-card {
      padding: 16px;
      border-radius: 16px;
      margin-bottom: 16px;
    }

    .cert-btn-group-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .btn-download-primary, .btn-linkedin-action, .btn-outline-action {
      width: 100%;
      padding: 13px;
      font-size: 14px;
    }

    .candidate-meta-card {
      grid-template-columns: 1fr 1fr;
      padding: 16px;
      gap: 12px;
      border-radius: 16px;
      margin-bottom: 16px;
    }

    .meta-val {
      font-size: 13.5px;
    }

    .authenticity-guarantee-card {
      padding: 16px;
      border-radius: 16px;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  @media (max-width: 420px) {
    .candidate-meta-card {
      grid-template-columns: 1fr;
    }
  }

  /* ===================================================
     ADMIN DASHBOARD & FORM STYLES
     =================================================== */
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
    color: var(--alifeo-dark);
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
    color: var(--alifeo-dark);
    border-bottom-color: var(--alifeo-dark);
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
    background: linear-gradient(135deg, var(--alifeo-dark), var(--alifeo-green));
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 13px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(1, 56, 36, 0.2);
    font-family: inherit;
  }

  .btn-submit:hover {
    background: var(--alifeo-green-hover);
    transform: translateY(-1px);
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

  /* ===================================================
     PRINT STYLES FOR CRISP HIGH-RES PDF EXPORT
     =================================================== */
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

    .top-brand-bar, .navbar, .footer, .cert-actions-card, .candidate-meta-card, .authenticity-guarantee-card, .verify-top-badge-bar, .cert-view-controls {
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
