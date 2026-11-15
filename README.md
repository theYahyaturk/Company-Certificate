# Alifeo Certificate & Verification Portal

Official digital credential verification and certificate issuance platform for **Alifeo Technologies**.

- **Live URL:** [https://certificate.alifeo.com](https://certificate.alifeo.com)
- **Admin Console:** [https://certificate.alifeo.com/admin](https://certificate.alifeo.com/admin)
- **Demo Verification:** [https://certificate.alifeo.com/verify/ALF-2026-DEMO](https://certificate.alifeo.com/verify/ALF-2026-DEMO)

---

## Features

1. **Public Verification Portal (`/` & `/verify/:id`)**
   - Search by Certificate ID or scan dynamic QR Code.
   - Shows candidate name, internship role, duration, dates, and performance grade.
   - Live **"Official Verified Credential"** badge.
   - **Download PDF / Print:** Formatted directly for A4 landscape high-DPI print/save.
   - **Add to LinkedIn Profile:** 1-Click integration into LinkedIn Licenses & Certifications.
   - **Share / Copy Link** for portfolios and resumes.

2. **Admin Dashboard (`/admin`)**
   - Protected by Master Password (`ADMIN_PASSWORD`).
   - Single Certificate Generation with auto or custom Certificate ID.
   - Bulk Certificate Issue (CSV / multi-line input).
   - Re-send email button and Revoke / Restore status toggle.

3. **Automated Candidate Email (`hr@alifeo.com`)**
   - Instant congratulatory email dispatched to the student via Resend API.
   - Contains direct verification link and LinkedIn share shortcut.

4. **100% Free Cloudflare Serverless Architecture**
   - Cloudflare Workers (Fast, global edge hosting, 0ms cold starts).
   - Cloudflare D1 Database (`alifeo-cert-db`).
   - Cloudflare Custom Domain (`certificate.alifeo.com`) with automated SSL.

---

## Commands

```bash
# Install dependencies
npm install

# Build worker
npm run build

# Deploy to Cloudflare
npm run deploy
```

