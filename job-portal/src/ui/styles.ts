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
    padding: 12px 24px;
    background: #19563e;
    color: #ffffff;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .nav-logo-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-logo {
    height: 32px;
    width: 32px;
    border-radius: 6px;
    object-fit: cover;
  }

  .nav-brand-title {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  .nav-brand-badge {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #a7f3d0;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .btn-nav-primary {
    background: #ffffff;
    color: var(--alifeo-green);
    font-size: 13px;
    font-weight: 700;
    padding: 7px 16px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-nav-primary:hover {
    background: #ecfdf5;
    transform: translateY(-1px);
  }

  .btn-nav-outline {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    padding: 7px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-nav-outline:hover {
    background: rgba(255, 255, 255, 0.22);
  }

  /* Main Container */
  .main-content {
    flex: 1;
    padding: 20px 16px 40px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  /* Hero Section */
  .job-hero {
    background: linear-gradient(135deg, #19563e 0%, #0f3d2a 100%);
    border-radius: 20px;
    padding: 32px 24px;
    color: #ffffff;
    text-align: center;
    margin-bottom: 24px;
    box-shadow: 0 10px 25px rgba(25, 86, 62, 0.2);
    position: relative;
    overflow: hidden;
  }

  .job-hero-title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.6px;
    margin-bottom: 8px;
  }

  .job-hero-sub {
    font-size: 15px;
    color: #d1fae5;
    max-width: 600px;
    margin: 0 auto 24px;
  }

  /* Search & Filter Bar */
  .search-filter-box {
    background: #ffffff;
    border-radius: 16px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    max-width: 760px;
    margin: 0 auto;
    flex-wrap: wrap;
  }

  .search-input-group {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 220px;
    padding: 6px 8px;
  }

  .search-input-field {
    width: 100%;
    border: none;
    outline: none;
    font-size: 14.5px;
    font-weight: 600;
    color: var(--text-title);
    font-family: inherit;
  }

  .search-input-field::placeholder {
    color: #94a3b8;
    font-weight: 400;
  }

  .filter-select {
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-title);
    outline: none;
    background: #f8fafc;
    font-family: inherit;
    cursor: pointer;
  }

  .btn-search-main {
    background: #19563e;
    color: #ffffff;
    border: none;
    font-weight: 700;
    font-size: 14px;
    padding: 10px 22px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-search-main:hover {
    background: #0f3d2a;
  }

  /* Category Filter Pills */
  .category-tabs {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow-x: auto;
    padding: 4px 0 16px;
    margin-bottom: 12px;
    scrollbar-width: none;
  }

  .category-tabs::-webkit-scrollbar {
    display: none;
  }

  .cat-pill {
    background: #ffffff;
    border: 1px solid var(--border-color);
    padding: 7px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-body);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
  }

  .cat-pill:hover, .cat-pill.active {
    background: #19563e;
    color: #ffffff;
    border-color: #19563e;
  }

  /* View Switcher: List vs Map */
  .view-switcher-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .job-count-text {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-title);
  }

  .view-toggle-btns {
    display: inline-flex;
    background: #e2e8f0;
    padding: 3px;
    border-radius: 999px;
  }

  .view-toggle-btn {
    border: none;
    background: transparent;
    padding: 5px 14px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-muted);
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: inherit;
  }

  .view-toggle-btn.active {
    background: #ffffff;
    color: var(--alifeo-green);
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  /* Job Listings Grid */
  .jobs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }

  .job-card {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
  }

  .job-card:hover {
    border-color: var(--alifeo-green);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(25, 86, 62, 0.08);
  }

  .job-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .job-company-avatar {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: var(--alifeo-green);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 16px;
    flex-shrink: 0;
  }

  .job-title {
    font-size: 16.5px;
    font-weight: 800;
    color: var(--alifeo-dark);
    margin-bottom: 3px;
  }

  .job-company {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .job-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .job-pill-tag {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .pill-type-internship {
    background: #fef3c7;
    color: #b45309;
  }

  .pill-type-job {
    background: #ecfdf5;
    color: #065f46;
  }

  .pill-mode {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .pill-city {
    background: #f1f5f9;
    color: #475569;
  }

  .job-stipend-val {
    font-size: 14.5px;
    font-weight: 800;
    color: var(--alifeo-green);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .job-desc-snippet {
    font-size: 13px;
    color: var(--text-body);
    line-height: 1.5;
    margin-bottom: 14px;
  }

  .job-skills-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 16px;
  }

  .job-skill-chip {
    font-size: 11px;
    background: #f1f5f9;
    color: #475569;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
  }

  .job-card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-apply-job {
    flex: 1;
    background: #19563e;
    color: #ffffff;
    border: none;
    padding: 10px 16px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 13.5px;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
    text-align: center;
  }

  .btn-apply-job:hover {
    background: #0f3d2a;
  }

  /* Map Container */
  #mapViewContainer {
    height: 480px;
    width: 100%;
    border-radius: 16px;
    border: 1px solid var(--border-color);
    margin-bottom: 30px;
    display: none;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }

  /* Modals (Pre-Login, WhatsApp Auth, Apply, Post Job, Chat) */
  .modal-backdrop {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(4px);
    z-index: 1000;
    overflow-y: auto;
    padding: 20px 16px;
    align-items: center;
    justify-content: center;
  }

  .modal-card {
    background: #ffffff;
    border-radius: 20px;
    max-width: 500px;
    width: 100%;
    margin: auto;
    padding: 28px 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .close-modal-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #f1f5f9;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .intent-card-choice {
    border: 2px solid var(--border-color);
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .intent-card-choice:hover {
    border-color: var(--alifeo-green);
    background: #ecfdf5;
  }

  .form-group {
    margin-bottom: 14px;
  }

  .form-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--alifeo-green);
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
    box-shadow: 0 0 0 3px rgba(25, 86, 62, 0.12);
  }

  .btn-submit {
    width: 100%;
    background: #19563e;
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    padding: 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
    font-family: inherit;
  }

  .btn-submit:hover {
    background: #0f3d2a;
  }

  /* Chat Pane */
  .chat-box-container {
    display: flex;
    flex-direction: column;
    height: 400px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    background: #f8fafc;
  }

  .chat-messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .chat-bubble {
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.4;
  }

  .chat-bubble-me {
    align-self: flex-end;
    background: #19563e;
    color: #ffffff;
    border-bottom-right-radius: 2px;
  }

  .chat-bubble-them {
    align-self: flex-start;
    background: #ffffff;
    color: var(--text-title);
    border: 1px solid var(--border-color);
    border-bottom-left-radius: 2px;
  }

  .chat-input-bar {
    display: flex;
    padding: 8px;
    background: #ffffff;
    border-top: 1px solid var(--border-color);
    gap: 8px;
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

  /* Mobile Tweaks */
  @media (max-width: 640px) {
    .navbar {
      padding: 10px 14px;
    }

    .nav-brand-title {
      font-size: 17px;
    }

    .btn-nav-primary {
      font-size: 11.5px;
      padding: 6px 12px;
    }

    .job-hero {
      padding: 24px 14px;
      border-radius: 16px;
    }

    .job-hero-title {
      font-size: 24px;
    }

    .jobs-grid {
      grid-template-columns: 1fr;
    }

    .search-filter-box {
      flex-direction: column;
      align-items: stretch;
    }

    .btn-search-main {
      justify-content: center;
    }
  }
`;
