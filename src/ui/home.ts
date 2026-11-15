import { GLOBAL_STYLES } from './styles';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';

export function renderHomePage(appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Verify Your Certificate | Alifeo</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  <style>
    ${GLOBAL_STYLES}
    
    .home-hero-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(75vh - 100px);
      text-align: center;
      padding: 40px 16px 60px;
      max-width: 620px;
      margin: 0 auto;
    }

    .home-title {
      font-size: 36px;
      font-weight: 800;
      color: var(--alifeo-green-dark);
      letter-spacing: -0.5px;
      margin-bottom: 12px;
      line-height: 1.2;
    }

    .home-subtitle {
      color: #64748b;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
      max-width: 500px;
    }

    @media (max-width: 640px) {
      .home-hero-container {
        padding: 30px 14px 40px;
        min-height: auto;
      }
      .home-title {
        font-size: 26px;
      }
      .home-subtitle {
        font-size: 13.5px;
        margin-bottom: 22px;
      }
    }
  </style>
</head>
<body>
  <!-- Top decorative green bar -->
  <div class="top-brand-bar"></div>

  <!-- Header Navbar -->
  <header class="navbar">
    <div class="nav-brand">
      <a href="/"><img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" /></a>
    </div>
    <div class="nav-links">
      <a href="https://alifeo.in" target="_blank" class="nav-link" style="color: var(--alifeo-green); font-weight: 600;">alifeo.in</a>
    </div>
  </header>

  <!-- Main Content: Simple, Clean & Minimalist -->
  <main class="main-content">
    <div class="home-hero-container">
      <h1 class="home-title">Verify Your Certificate</h1>
      <p class="home-subtitle">
        Enter your Certificate ID to verify credentials and download your authentic Alifeo internship certificate.
      </p>

      <!-- Search Form -->
      <form class="search-card" style="width: 100%; max-width: 540px;" onsubmit="event.preventDefault(); verifyNow();">
        <input 
          type="text" 
          id="certIdInput" 
          class="search-input" 
          placeholder="e.g. ALF/INT/2026/G4BP" 
          required 
          autocomplete="off"
          autofocus
        />
        <button type="submit" class="btn-search">Verify</button>
      </form>
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <p>© 2026 Alifeo. All rights reserved. • <a href="https://alifeo.in" target="_blank" style="color: var(--alifeo-green); font-weight: 600;">alifeo.in</a></p>
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
