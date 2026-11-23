import { GLOBAL_STYLES } from './styles';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';

export interface PredefinedRole {
  id: string;
  title: string;
  department: string;
  type: string; // 'Internship & Job'
  companies: string[]; // ['Alifeo', 'Zifeeo', 'Aabeeo']
  description: string;
  skills: string[];
}

export const PREDEFINED_ROLES: PredefinedRole[] = [
  {
    id: 'sde-1',
    title: 'Software Development Engineer 1 (SDE 1)',
    department: 'Engineering',
    type: 'Internship / Full-Time',
    companies: ['Alifeo', 'Zifeeo', 'Aabeeo'],
    description: 'Build web applications, REST APIs, responsive UIs, and backend services. Hands-on exposure to production architectures.',
    skills: ['TypeScript', 'React / Next.js', 'Node.js', 'PostgreSQL / SQL', 'Tailwind CSS']
  },
  {
    id: 'sde-2',
    title: 'Software Development Engineer 2 (SDE 2)',
    department: 'Engineering',
    type: 'Full-Time / Advanced Internship',
    companies: ['Alifeo', 'Zifeeo'],
    description: 'Lead feature modules, distributed systems, API performance, database optimization, and cloud infrastructure.',
    skills: ['System Design', 'Microservices', 'Cloudflare Workers / AWS', 'High-throughput APIs', 'Architecture']
  },
  {
    id: 'ui-ux',
    title: 'UI / UX Designer',
    department: 'Product & Design',
    type: 'Internship / Full-Time',
    companies: ['Alifeo', 'Aabeeo'],
    description: 'Design intuitive, mobile-first product interfaces, user journeys, wireframes, and high-fidelity clickable prototypes.',
    skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Mobile App UX']
  },
  {
    id: 'product-designer',
    title: 'Product Designer',
    department: 'Product & Design',
    type: 'Internship / Full-Time',
    companies: ['Alifeo', 'Zifeeo'],
    description: 'Own end-to-end product design across mobile and desktop apps. Define cohesive design systems and interaction patterns.',
    skills: ['Figma Design Systems', 'Visual Design', 'Component Libraries', 'Product Thinking']
  },
  {
    id: 'pm',
    title: 'Product Manager (APM / PM)',
    department: 'Product Management',
    type: 'Internship / Full-Time',
    companies: ['Alifeo', 'Zifeeo', 'Aabeeo'],
    description: 'Drive product roadmaps, feature specifications, sprint execution, competitor analysis, and metrics-driven delivery.',
    skills: ['Product Roadmapping', 'User Stories & PRDs', 'Agile / Scrum', 'Analytics', 'Cross-functional Leadership']
  },
  {
    id: 'social-media',
    title: 'Social Media & Content Creator',
    department: 'Marketing & Media',
    type: 'Internship / Full-Time',
    companies: ['Alifeo', 'Zifeeo', 'Aabeeo'],
    description: 'Create engaging short-form videos, reels, LinkedIn posts, viral community content, and brand storytelling.',
    skills: ['Video Editing', 'Content Strategy', 'Reels / Shorts', 'Copywriting', 'Community Engagement']
  },
  {
    id: 'growth-marketing',
    title: 'Growth & Performance Marketing',
    department: 'Marketing & Growth',
    type: 'Internship / Full-Time',
    companies: ['Alifeo', 'Zifeeo'],
    description: 'Execute user acquisition campaigns, SEO strategies, paid ad experiments, analytics tracking, and conversion funnels.',
    skills: ['SEO / SEM', 'Meta & Google Ads', 'Analytics & Funnels', 'A/B Testing', 'Growth Hacking']
  },
  {
    id: 'hr-talent',
    title: 'Human Resources (HR & Talent Acquisition)',
    department: 'People & Operations',
    type: 'Internship / Full-Time',
    companies: ['Alifeo', 'Zifeeo', 'Aabeeo'],
    description: 'Manage candidate screening, interview coordination, onboarding workflows, intern community, and team culture.',
    skills: ['Talent Sourcing', 'Candidate Screening', 'Communication', 'People Operations', 'HRMS']
  },
  {
    id: 'ops-category',
    title: 'Operations & Category Specialist',
    department: 'Operations',
    type: 'Internship / Full-Time',
    companies: ['Zifeeo', 'Alifeo'],
    description: 'Manage vendor coordination, supply logistics, product cataloguing, inventory flows, and daily operational excellence.',
    skills: ['Operational Logistics', 'Data Analytics', 'Vendor Relations', 'Supply Chain', 'Process Automation']
  }
];

export function renderCareersPage(appUrl: string, selectedRole?: string): string {
  const rolesJson = JSON.stringify(PREDEFINED_ROLES);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Careers & Internships | Alifeo Group</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  <style>
    ${GLOBAL_STYLES}

    .careers-hero-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 36px 28px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
      text-align: center;
    }

    .venture-tags {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }

    .venture-pill {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 999px;
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 18px;
      margin-bottom: 36px;
    }

    .role-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 22px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }

    .role-card:hover {
      border-color: #059669;
      box-shadow: 0 8px 24px rgba(25, 86, 62, 0.08);
      transform: translateY(-2px);
    }

    .role-header {
      margin-bottom: 12px;
    }

    .role-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--alifeo-dark);
      margin-bottom: 6px;
    }

    .role-badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .badge-dept {
      font-size: 11px;
      font-weight: 700;
      color: #024a34;
      background: #e6f7f0;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .badge-type {
      font-size: 11px;
      font-weight: 700;
      color: #b45309;
      background: #fef3c7;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .role-desc {
      font-size: 13.5px;
      color: var(--text-body);
      line-height: 1.55;
      margin-bottom: 14px;
    }

    .role-skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-bottom: 18px;
    }

    .skill-tag {
      font-size: 11px;
      background: #f1f5f9;
      color: #475569;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .btn-apply-role {
      width: 100%;
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
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-apply-role:hover {
      background: #0d3827;
    }

    /* Modal */
    .apply-modal-backdrop {
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

    .apply-modal-card {
      background: #ffffff;
      border-radius: 20px;
      max-width: 540px;
      width: 100%;
      margin: auto;
      padding: 28px 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      position: relative;
    }

    .close-modal-btn {
      position: absolute;
      top: 18px;
      right: 18px;
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

    .email-direct-box {
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 18px;
      margin-top: 24px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="top-brand-bar"></div>

  <!-- Header Navbar with Logo Green -->
  <header class="navbar" style="background: #19563e;">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
        <span class="nav-brand-title" style="color: #ffffff;">Alifeo</span>
      </a>
    </div>
    <div class="nav-links">
      <a href="/" class="nav-pill-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        <span>Verify Certificate</span>
      </a>
    </div>
  </header>

  <main class="main-content">
    
    <!-- Hero Banner -->
    <div class="careers-hero-card">
      <div class="verify-badge-pill" style="margin-bottom: 12px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        Careers & Internships
      </div>

      <h1 style="font-size: 28px; font-weight: 800; color: var(--alifeo-dark); margin-bottom: 10px;">
        Join Alifeo & Partner Ventures
      </h1>
      <p style="font-size: 15px; color: var(--text-body); max-width: 620px; margin: 0 auto 16px; line-height: 1.6;">
        Alifeo operates as a parent product ecosystem building tech platforms, consumer products, and digital brands. We offer active opportunities across our group companies:
      </p>

      <div class="venture-tags">
        <span class="venture-pill">🏢 Alifeo (Product & Tech)</span>
        <span class="venture-pill">⚡ Zifeeo (Commerce & Operations)</span>
        <span class="venture-pill">🚀 Aabeeo (Digital Platforms)</span>
      </div>

      <div style="background: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-top: 20px; max-width: 640px; margin-left: auto; margin-right: auto; line-height: 1.5;">
        💡 <strong>Interview & Compensation:</strong> We hire for both Internships (Stipend & Non-Stipend tracks) and Full-time Jobs. Final structure, stipend, or salary is decided post-interview based on portfolio and experience.
      </div>
    </div>

    <!-- Predefined Roles Grid -->
    <div class="roles-grid" id="rolesGrid">
      ${PREDEFINED_ROLES.map(role => `
        <div class="role-card">
          <div>
            <div class="role-header">
              <h3 class="role-title">${role.title}</h3>
              <div class="role-badge-row">
                <span class="badge-dept">${role.department}</span>
                <span class="badge-type">${role.type}</span>
              </div>
            </div>
            <p class="role-desc">${role.description}</p>
            <div class="role-skills-wrap">
              ${role.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
          <div>
            <div style="font-size: 11.5px; color: #64748b; margin-bottom: 8px;">
              Group Ventures: <strong>${role.companies.join(', ')}</strong>
            </div>
            <button class="btn-apply-role" onclick="openApplyModal('${role.id}', '${role.title}')">
              <span>Apply for this Role</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Direct Email Fallback Box -->
    <div class="email-direct-box">
      <h3 style="font-size: 16px; font-weight: 800; color: var(--alifeo-dark); margin-bottom: 4px;">
        Prefer Sending Directly via Email?
      </h3>
      <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px;">
        Send your updated resume, target role, and portfolio directly to our HR team.
      </p>
      <a href="mailto:hr@alifeo.com?subject=Application%20for%20Internship%20/%20Job" class="btn-download-primary" style="display: inline-flex; width: auto; padding: 10px 24px; text-decoration: none;">
        📧 Send Resume to hr@alifeo.com
      </a>
    </div>

  </main>

  <!-- Apply Modal Form -->
  <div class="apply-modal-backdrop" id="applyModal">
    <div class="apply-modal-card">
      <button class="close-modal-btn" onclick="closeApplyModal()">✕</button>
      
      <div style="margin-bottom: 18px;">
        <span class="badge-dept" id="modalRoleBadge">Engineering</span>
        <h2 style="font-size: 20px; font-weight: 800; color: var(--alifeo-dark); margin-top: 6px;" id="modalRoleTitle">
          Apply for Role
        </h2>
        <p style="font-size: 13px; color: var(--text-muted);">Fill details or paste your resume/portfolio link.</p>
      </div>

      <div id="applySuccessMsg" style="display: none; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 16px; border-radius: 12px; margin-bottom: 18px; text-align: center;">
        <div style="font-weight: 800; font-size: 16px; margin-bottom: 4px;">🎉 Application Submitted!</div>
        <p style="font-size: 13px;">Our HR team will review your application. You can also send your resume directly to <strong>hr@alifeo.com</strong>.</p>
      </div>

      <form id="applyForm" onsubmit="submitApplication(event)">
        <input type="hidden" id="formRole" name="role" value="" />
        
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" name="name" class="form-input" placeholder="e.g. Mohd Khalid" required />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input type="email" name="email" class="form-input" placeholder="you@domain.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">WhatsApp Number *</label>
            <input type="tel" name="phone" class="form-input" placeholder="+91 9876543210" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Opportunity Type *</label>
            <select name="type" class="form-select" required>
              <option value="internship">Internship (Stipend / Non-Stipend)</option>
              <option value="job">Full-Time Job</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Target Venture *</label>
            <select name="company" class="form-select" required>
              <option value="Alifeo">Alifeo (Product & Tech)</option>
              <option value="Zifeeo">Zifeeo (Commerce & Operations)</option>
              <option value="Aabeeo">Aabeeo (Digital Platforms)</option>
              <option value="Any Group Venture">Any Group Venture</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Resume / Portfolio Link (Google Drive / GitHub / LinkedIn) *</label>
          <input type="url" name="resume_url" class="form-input" placeholder="https://drive.google.com/... or portfolio URL" required />
        </div>

        <div class="form-group">
          <label class="form-label">Short Note / Why you want to join (Optional)</label>
          <textarea name="cover_note" class="form-textarea" rows="2" placeholder="Tell us about your key skills, projects, or availability..."></textarea>
        </div>

        <button type="submit" class="btn-submit" id="btnSubmitApp" style="background: #19563e;">
          Submit Application
        </button>
      </form>
    </div>
  </div>

  <footer class="footer">
    <p>© 2026 Alifeo</p>
  </footer>

  <script>
    const rolesData = ${rolesJson};

    function openApplyModal(roleId, roleTitle) {
      const modal = document.getElementById('applyModal');
      const titleEl = document.getElementById('modalRoleTitle');
      const badgeEl = document.getElementById('modalRoleBadge');
      const inputRole = document.getElementById('formRole');
      const form = document.getElementById('applyForm');
      const success = document.getElementById('applySuccessMsg');

      const role = rolesData.find(r => r.id === roleId);
      if (titleEl) titleEl.textContent = roleTitle || 'Apply for Role';
      if (badgeEl && role) badgeEl.textContent = role.department;
      if (inputRole) inputRole.value = roleTitle;
      if (form) form.style.display = 'block';
      if (success) success.style.display = 'none';

      modal.style.display = 'flex';
    }

    function closeApplyModal() {
      document.getElementById('applyModal').style.display = 'none';
    }

    async function submitApplication(e) {
      e.preventDefault();
      const form = document.getElementById('applyForm');
      const btn = document.getElementById('btnSubmitApp');
      const successMsg = document.getElementById('applySuccessMsg');

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        role: formData.get('role'),
        type: formData.get('type'),
        company: formData.get('company'),
        resume_url: formData.get('resume_url'),
        cover_note: formData.get('cover_note')
      };

      btn.disabled = true;
      btn.textContent = 'Submitting...';

      try {
        const res = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          form.reset();
          form.style.display = 'none';
          successMsg.style.display = 'block';
        } else {
          alert('Submission error: ' + (data.error || 'Please try again.'));
        }
      } catch (err) {
        alert('Error: ' + err.message + '. You can directly email your resume to hr@alifeo.com');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Application';
      }
    }

    // Close on backdrop click
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('applyModal');
      if (e.target === modal) {
        closeApplyModal();
      }
    });
  </script>
</body>
</html>`;
}
