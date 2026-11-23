import { GLOBAL_STYLES } from './styles';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';

export function renderHomePage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Verify Company Internship Certificate | Alifeo</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  <style>
    ${GLOBAL_STYLES}
  </style>
</head>
<body>
  <!-- Top brand line -->
  <div class="top-brand-bar"></div>

  <!-- Header Navbar (Matching app.alifeo.com branding) -->
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
      </a>
      <span class="nav-badge">
        <span class="nav-badge-dot"></span>
        Internship Credentials
      </span>
    </div>
    <div class="nav-links">
      <a href="https://app.alifeo.com" target="_blank" class="nav-pill-link">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Alifeo App</span>
      </a>
      <a href="https://alifeo.in" target="_blank" class="nav-pill-link-secondary">
        alifeo.in
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="main-content">
    
    <!-- Hero Section (Forest Green Aesthetic like app.alifeo.com) -->
    <section class="brand-hero-section">
      <div class="hero-glow-circle"></div>
      <div class="hero-glow-circle-left"></div>

      <div class="hero-pill-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        Official Alifeo Corporate Verification
      </div>

      <h1 class="hero-title">
        Verify Company <span>Internship Certificate</span>
      </h1>
      
      <p class="hero-subtitle">
        Enter your Certificate ID to verify credentials, role designations, and download your authentic Alifeo corporate internship certificate.
      </p>

      <!-- App-style Search Bar (Rounded Pill with Icon & Verify Button) -->
      <form class="search-card-hero" onsubmit="event.preventDefault(); verifyNow();">
        <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          id="certIdInput" 
          class="search-input-hero" 
          placeholder="Enter Certificate ID (e.g. ALF/INT/2026/Q5M6)" 
          required 
          autocomplete="off"
          autofocus
        />
        <button type="submit" class="btn-search-hero">
          <span>Verify</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </form>

      <div class="hero-helper-text">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        Format: ALF/INT/YYYY/XXXX • Issued for Alifeo Corporate Internship Cohorts
      </div>
    </section>

    <!-- Brand Announcement Card (Matches coupon/reward banner from app.alifeo.com) -->
    <div class="brand-announcement-card">
      <div class="announcement-left">
        <span class="announcement-badge">Official Registry</span>
        <div class="announcement-text">
          Authentic certificates issued for <strong>Alifeo Company Internships</strong> across Engineering, Design & Product.
        </div>
      </div>
      <a href="https://app.alifeo.com" target="_blank" class="announcement-btn">
        Explore Alifeo App
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </a>
    </div>

    <!-- Features Section (App-style cards) -->
    <div class="section-heading-bar">
      <h2 class="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--alifeo-emerald);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        Corporate Credential Verification
      </h2>
      <a href="https://alifeo.in" target="_blank" class="section-link">
        About Alifeo 
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </a>
    </div>

    <div class="features-grid-brand">
      <div class="feature-card-brand">
        <div class="feature-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h3 class="feature-title-brand">Company Internship Program</h3>
        <p class="feature-desc-brand">
          Recognizes genuine contributions to Alifeo's production ecosystem, design systems, and software platforms during the structured corporate internship.
        </p>
      </div>

      <div class="feature-card-brand">
        <div class="feature-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3 class="feature-title-brand">Cryptographically Signed</h3>
        <p class="feature-desc-brand">
          Each credential carries a verified unique ID and encoded QR code linked directly to the permanent Alifeo corporate database registry.
        </p>
      </div>

      <div class="feature-card-brand">
        <div class="feature-icon-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </div>
        <h3 class="feature-title-brand">1-Click LinkedIn & Export</h3>
        <p class="feature-desc-brand">
          Instantly add the credential to your LinkedIn profile with verified issuer accreditation or download crisp 2x resolution PNG / print PDF.
        </p>
      </div>
    </div>

    <!-- Verification Guide Card -->
    <div class="guide-card-brand">
      <h3 style="font-size: 17px; font-weight: 800; color: var(--alifeo-dark); margin-bottom: 4px;">
        How Verification Works
      </h3>
      <p style="font-size: 13.5px; color: var(--text-muted);">
        Simple 3-step verification for interns, HR teams, universities, and recruiters.
      </p>

      <div class="guide-grid">
        <div class="guide-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>Enter Credential ID</h4>
            <p>Locate the ID on the certificate (e.g. ALF/INT/2026/XXXX) and enter it in the search bar above.</p>
          </div>
        </div>

        <div class="guide-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>Instant Record Lookup</h4>
            <p>Our verification engine validates the record in real-time against Alifeo's corporate internship registry.</p>
          </div>
        </div>

        <div class="guide-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Inspect & Download</h4>
            <p>View verified role, tenure, and department details. Download authentic certificate or export to LinkedIn.</p>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- Footer (Matching Alifeo Brand Ecosystem) -->
  <footer class="footer">
    <div class="footer-links">
      <a href="https://alifeo.in" target="_blank" class="footer-link-item">Alifeo Corporate (alifeo.in)</a>
      <span>•</span>
      <a href="https://app.alifeo.com" target="_blank" class="footer-link-item">Alifeo App (app.alifeo.com)</a>
      <span>•</span>
      <a href="mailto:hr@alifeo.com" class="footer-link-item">HR & Verification Support</a>
    </div>
    <p>© 2026 Alifeo Technologies Pvt Ltd. All rights reserved. • Official Corporate Internship Verification Network</p>
  </footer>

  <script>
    function verifyNow() {
      const id = document.getElementById('certIdInput').value.trim();
      if (id) {
        window.location.href = '/verify/' + encodeURIComponent(id);
      }
    }
  </script>
</body>
</html>`;
}
