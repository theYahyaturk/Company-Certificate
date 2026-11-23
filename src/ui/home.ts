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

  <!-- Header Navbar -->
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
        <span class="nav-brand-title">Alifeo</span>
      </a>
    </div>
    <div class="nav-links">
      <span class="nav-badge-simple">Internship Verification</span>
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
