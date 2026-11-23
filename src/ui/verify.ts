import { Certificate } from '../types';
import { GLOBAL_STYLES } from './styles';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';
import { renderCertificateHtml } from '../certificate-template';

export async function renderVerifyPage(cert: Certificate | null, certId: string, appUrl: string): Promise<string> {
  const currentUrl = `${appUrl}/verify/${encodeURIComponent(certId)}`;

  if (!cert) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Certificate Not Found | Alifeo</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  <style>${GLOBAL_STYLES}</style>
</head>
<body>
  <div class="top-brand-bar"></div>
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
      </a>
      <span class="nav-badge">
        <span class="nav-badge-dot" style="background: #f87171; box-shadow: 0 0 8px #f87171;"></span>
        Credential Lookup
      </span>
    </div>
    <div class="nav-links">
      <a href="/" class="nav-pill-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        <span>Verify Another</span>
      </a>
    </div>
  </header>

  <main class="main-content" style="text-align: center; padding-top: 48px; max-width: 580px; margin: 0 auto;">
    <div style="width: 64px; height: 64px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #dc2626;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
    </div>
    
    <h1 style="font-size: 26px; font-weight: 800; margin-bottom: 10px; color: #0f172a;">Certificate Not Found</h1>
    <p style="color: var(--text-muted); margin: 0 auto 28px; font-size: 15px; line-height: 1.6;">
      No official Alifeo internship certificate matches the ID <strong style="color: #0f172a; font-family: monospace;">${certId}</strong>. Please check the ID or try re-entering below.
    </p>

    <!-- Search Retry Box -->
    <div class="search-card-hero" style="margin-bottom: 24px; border: 1px solid var(--border-color); box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
      <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input 
        type="text" 
        id="retryId" 
        class="search-input-hero" 
        placeholder="e.g. ALF/INT/2026/Q5M6" 
        required 
        autocomplete="off" 
      />
      <button 
        type="button" 
        class="btn-search-hero" 
        onclick="const v = document.getElementById('retryId').value.trim(); if(v) window.location.href='/verify/' + encodeURIComponent(v);"
      >
        <span>Verify</span>
      </button>
    </div>

    <div>
      <a href="/" class="btn-outline-action" style="display: inline-flex; width: auto; padding: 11px 24px;">
        ← Back to Verification Portal
      </a>
    </div>
  </main>

  <footer class="footer" style="margin-top: 60px;">
    <div class="footer-links">
      <a href="https://alifeo.in" target="_blank" class="footer-link-item">alifeo.in</a>
      <span>•</span>
      <a href="https://app.alifeo.com" target="_blank" class="footer-link-item">app.alifeo.com</a>
    </div>
    <p>© 2026 Alifeo Technologies Pvt Ltd. All rights reserved.</p>
  </footer>
</body>
</html>`;
  }

  const isVerified = cert.status === 'verified';
  const certHtml = await renderCertificateHtml(cert, appUrl);
  const issueYear = cert.issue_date ? cert.issue_date.slice(0, 4) : '2026';
  const issueMonth = cert.issue_date && cert.issue_date.length >= 7 ? parseInt(cert.issue_date.slice(5, 7)) : 1;
  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.domain_role)}&organizationName=${encodeURIComponent('Alifeo')}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${encodeURIComponent(currentUrl)}&certId=${encodeURIComponent(cert.id)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${cert.student_name} - Verified Internship Certificate | Alifeo</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  
  <meta property="og:title" content="${cert.student_name} - ${cert.domain_role} | Alifeo Certificate" />
  <meta property="og:description" content="Verified Certificate of Internship Completion issued by Alifeo to ${cert.student_name}." />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${currentUrl}" />

  <style>
    ${GLOBAL_STYLES}
    
    .cert-background-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: fill;
      z-index: 1;
      pointer-events: none;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @media print {
      .cert-background-image {
        display: block !important;
        visibility: visible !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
</head>
<body>
  <div class="top-brand-bar"></div>

  <!-- Header Navbar (Matching app.alifeo.com) -->
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
      </a>
      <span class="nav-badge">
        <span class="nav-badge-dot"></span>
        Internship Verified
      </span>
    </div>
    <div class="nav-links">
      <a href="/" class="nav-pill-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        <span>Verify Another</span>
      </a>
      <a href="https://app.alifeo.com" target="_blank" class="nav-pill-link-secondary" style="display: none;" id="navAppBtn">
        Alifeo App
      </a>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="main-content">

    <!-- Top Status Bar & Responsive View Controls -->
    <div class="verify-top-badge-bar">
      <div>
        ${isVerified 
          ? `<span class="status-badge-verified">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              Official Verified Credential • Alifeo Corporate Internship
            </span>`
          : `<span class="status-badge-revoked">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Credential Revoked / Inactive
            </span>`
        }
      </div>

      <div class="cert-view-controls">
        <div class="view-mode-buttons">
          <button id="btnFitScreen" class="view-mode-btn active" onclick="setCertificateViewMode('fit')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            Fit Screen
          </button>
          <button id="btnZoom100" class="view-mode-btn" onclick="setCertificateViewMode('zoom')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            100% Zoom
          </button>
        </div>
      </div>
    </div>

    <!-- 1. CERTIFICATE FIRST (DISPLAYED PROMINENTLY UP FRONT!) -->
    <div class="certificate-stage-wrapper">
      ${certHtml}
    </div>

    <!-- 2. ACTION BUTTONS (DIRECTLY BELOW THE CERTIFICATE) -->
    <div class="cert-actions-card">
      <div class="cert-btn-group-grid">
        <!-- 1-Click High-Res PNG Download -->
        <button class="btn-download-primary" onclick="downloadCertificatePng()" id="btnDownloadPng">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span id="pngBtnText">Download Certificate (PNG)</span>
        </button>

        <!-- Official Add to LinkedIn Button -->
        <a href="${linkedInUrl}" target="_blank" class="btn-linkedin-action">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
          Add to LinkedIn
        </a>

        <!-- Share Direct Link -->
        <button class="btn-outline-action" onclick="copyCertLink()" id="btnShareLink">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span id="copyText">Share Link</span>
        </button>

        <!-- Print or Save PDF -->
        <button class="btn-outline-action" onclick="window.print()" title="Print / Save PDF">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          <span>Print / PDF</span>
        </button>
      </div>
    </div>

    <!-- 3. CANDIDATE & INTERNSHIP META DETAILS CARD -->
    <div class="candidate-meta-card">
      <div class="meta-col">
        <span class="meta-label">Candidate Name</span>
        <span class="meta-val">${cert.student_name}</span>
      </div>
      <div class="meta-col">
        <span class="meta-label">Domain / Role</span>
        <span class="meta-val meta-val-highlight">${cert.domain_role}</span>
      </div>
      <div class="meta-col">
        <span class="meta-label">Department</span>
        <span class="meta-val">${cert.department || 'Technology & Product'}</span>
      </div>
      <div class="meta-col">
        <span class="meta-label">Duration</span>
        <span class="meta-val">${cert.duration || '3 Months'}</span>
      </div>
      <div class="meta-col">
        <span class="meta-label">Start Date</span>
        <span class="meta-val">${cert.start_date || '01 Nov 2026'}</span>
      </div>
      <div class="meta-col">
        <span class="meta-label">Completion Date</span>
        <span class="meta-val">${cert.end_date || cert.issue_date}</span>
      </div>
      <div class="meta-col">
        <span class="meta-label">Performance Grade</span>
        <span class="meta-val" style="color: #059669;">${cert.grade || 'Outstanding'}</span>
      </div>
      <div class="meta-col">
        <span class="meta-label">Credential ID</span>
        <span class="meta-val" style="font-family: monospace; color: var(--alifeo-dark);">${cert.id}</span>
      </div>
    </div>

    <!-- 4. OFFICIAL CORPORATE AUTHENTICITY GUARANTEE -->
    <div class="authenticity-guarantee-card">
      <div class="guarantee-left">
        <div class="guarantee-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        </div>
        <div class="guarantee-info">
          <h4>Official Alifeo Corporate Internship Program</h4>
          <p>This credential certifies successful completion of real-world corporate deliverables at Alifeo. Registered under corporate database records.</p>
        </div>
      </div>
      <div class="guarantee-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Tamper-Proof Record</span>
      </div>
    </div>

  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-links">
      <a href="https://alifeo.in" target="_blank" class="footer-link-item">alifeo.in</a>
      <span>•</span>
      <a href="https://app.alifeo.com" target="_blank" class="footer-link-item">app.alifeo.com</a>
      <span>•</span>
      <a href="mailto:hr@alifeo.com" class="footer-link-item">HR & Verification Support</a>
    </div>
    <p>© 2026 Alifeo Technologies Pvt Ltd. All rights reserved. • Official Corporate Internship Verification Portal</p>
  </footer>

  <script>
    let currentViewMode = 'fit';

    function copyCertLink() {
      navigator.clipboard.writeText('${currentUrl}').then(() => {
        const span = document.getElementById('copyText');
        span.textContent = 'Copied! ✔';
        setTimeout(() => { span.textContent = 'Share Link'; }, 2000);
      });
    }

    function autoScaleCertificate() {
      const stage = document.getElementById('certificate-stage');
      const scaler = document.getElementById('certificate-scaler');
      const sheet = document.getElementById('certificate-sheet');
      if (!stage || !scaler || !sheet) return;

      if (currentViewMode === 'zoom') {
        scaler.style.transform = 'none';
        stage.style.height = '720px';
        stage.style.overflowX = 'auto';
        stage.style.display = 'block';
        return;
      }

      // 'fit' mode - perfectly scales to container on any device
      stage.style.overflowX = 'hidden';
      stage.style.display = 'flex';
      
      const parentWidth = stage.parentElement ? stage.parentElement.clientWidth : window.innerWidth;
      const padding = window.innerWidth <= 640 ? 0 : 8;
      const availableWidth = Math.max(260, parentWidth - padding);
      const baseWidth = 1024;
      const baseHeight = 706;

      if (availableWidth < baseWidth) {
        const scale = availableWidth / baseWidth;
        scaler.style.transform = 'scale(' + scale + ')';
        scaler.style.transformOrigin = 'top center';
        stage.style.height = Math.ceil(baseHeight * scale) + 'px';
      } else {
        scaler.style.transform = 'none';
        stage.style.height = baseHeight + 'px';
      }
    }

    function setCertificateViewMode(mode) {
      currentViewMode = mode;
      const btnFit = document.getElementById('btnFitScreen');
      const btnZoom = document.getElementById('btnZoom100');
      if (btnFit && btnZoom) {
        if (mode === 'fit') {
          btnFit.classList.add('active');
          btnZoom.classList.remove('active');
        } else {
          btnZoom.classList.add('active');
          btnFit.classList.remove('active');
        }
      }
      autoScaleCertificate();
    }

    window.addEventListener('resize', autoScaleCertificate);
    window.addEventListener('orientationchange', autoScaleCertificate);
    document.addEventListener('DOMContentLoaded', autoScaleCertificate);
    setTimeout(autoScaleCertificate, 20);
    setTimeout(autoScaleCertificate, 150);
    setTimeout(autoScaleCertificate, 400);

    async function downloadCertificatePng() {
      const btn = document.getElementById('btnDownloadPng');
      const text = document.getElementById('pngBtnText');
      const scaler = document.getElementById('certificate-scaler');
      const prevTransform = scaler ? scaler.style.transform : '';
      const prevOrigin = scaler ? scaler.style.transformOrigin : '';

      btn.disabled = true;
      text.textContent = 'Generating High-Res Image...';

      if (scaler) {
        scaler.style.transform = 'none';
      }

      const sheet = document.getElementById('certificate-sheet');
      try {
        const canvas = await html2canvas(sheet, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        const safeName = '${cert.student_name.replace(/[^a-zA-Z0-9]/g, '_')}';
        link.download = 'Alifeo-Internship-Certificate-' + safeName + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        text.textContent = 'Downloaded! ✔';
        setTimeout(() => {
          text.textContent = 'Download Certificate (PNG)';
          btn.disabled = false;
        }, 2500);
      } catch (err) {
        alert('Download error: ' + err.message + '. Please use the Print button as an alternative.');
        text.textContent = 'Download Certificate (PNG)';
        btn.disabled = false;
      } finally {
        if (scaler) {
          scaler.style.transform = prevTransform;
          scaler.style.transformOrigin = prevOrigin;
        }
      }
    }
  </script>
</body>
</html>`;
}
