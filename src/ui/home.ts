import { GLOBAL_STYLES } from './styles';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';

export function renderHomePage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Verify Internship Certificate | Alifeo</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  <style>${GLOBAL_STYLES}</style>
</head>
<body>
  <div class="top-brand-bar"></div>

  <!-- Header Navbar with Logo Dark Green -->
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
        <span class="nav-brand-title">Alifeo</span>
      </a>
    </div>
    <div class="nav-links">
      <a href="/careers" class="nav-pill-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        <span>Apply for Internship / Jobs</span>
      </a>
    </div>
  </header>

  <!-- Main Content -->
  <main class="main-content">
    <div class="verify-hero-container">
      <div class="verify-badge-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        Official Verification
      </div>

      <h1 class="verify-title">Verify Internship Certificate</h1>
      <p class="verify-subtitle">Enter your Certificate ID to verify and download.</p>

      <!-- Clean Search Card -->
      <form class="search-card-clean" onsubmit="event.preventDefault(); verifyNow();">
        <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          id="certIdInput" 
          class="search-input-clean" 
          placeholder="e.g. ALF/INT/2026/Q5M6" 
          required 
          autocomplete="off"
          autofocus
        />
        <button type="submit" class="btn-verify-clean">Verify</button>
      </form>

      <p class="search-hint-text">Format: ALF/INT/2026/XXXX</p>
    </div>

    <!-- Career Opportunities Banner -->
    <div class="career-promo-card">
      <div class="career-promo-content">
        <span class="badge-dept" style="margin-bottom: 6px; display: inline-block;">Hiring Interns & Full-Time</span>
        <h3>Want to work at Alifeo or group ventures?</h3>
        <p>We are hiring for SDE 1, SDE 2, UI/UX, Product Designers, PMs, HR, Marketing, and Operations across Alifeo, Zifeeo, and Aabeeo.</p>
      </div>
      <div class="career-promo-actions">
        <a href="/careers" class="btn-career-primary">View Roles & Apply</a>
        <a href="mailto:hr@alifeo.com?subject=Application%20for%20Internship/Job" class="btn-career-outline">Email hr@alifeo.com</a>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <p>© 2026 Alifeo</p>
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
