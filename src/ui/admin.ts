import { Certificate, Template } from '../types';
import { GLOBAL_STYLES } from './styles';
import { ALIFEO_LOGO_BASE64 } from '../logo-base64';
import { YAHYA_SIGNATURE_BASE64, KHALID_SIGNATURE_BASE64 } from '../signatures-base64';

export function renderAdminLoginPage(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Admin Login | Alifeo Certificate Portal</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  <style>${GLOBAL_STYLES}</style>
</head>
<body>
  <div class="top-brand-bar"></div>
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
        <span class="nav-brand-title">Alifeo</span>
      </a>
    </div>
    <div class="nav-links">
      <a href="/" class="nav-pill-link">← Back to Portal</a>
    </div>
  </header>

  <main class="main-content" style="max-width: 440px; margin-top: 50px;">
    <div class="admin-card">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" style="height: 48px; margin-bottom: 12px; object-fit: contain;" />
        <h2 style="font-size: 20px; font-weight: 700; color: var(--alifeo-green-dark);">Admin Authentication</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Sign in to issue certificates & customize templates</p>
      </div>

      ${error ? `<div style="background: #fee2e2; border: 1px solid #fecaca; color: #b91c1c; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 18px; text-align: center;">${error}</div>` : ''}

      <form action="/api/admin/login" method="POST">
        <div class="form-group">
          <label class="form-label">Master Password</label>
          <input type="password" name="password" class="form-input" placeholder="••••••••••••" required autofocus />
        </div>

        <button type="submit" class="btn-submit">Sign In to Dashboard</button>
      </form>
    </div>
  </main>

  <footer class="footer">
    <p>© 2026 Alifeo • Admin Console</p>
  </footer>
</body>
</html>`;
}

export function renderAdminDashboard(
  certs: Certificate[],
  templates: Template[],
  stats: { total: number; verified: number; emailsSent: number },
  appUrl: string
): string {
  const certRows = certs.map(c => `
    <tr>
      <td style="font-family: monospace; font-weight: 700; color: var(--alifeo-green-dark); font-size: 11.5px;">${c.id}</td>
      <td style="font-weight: 600;">${c.student_name}</td>
      <td style="color: #64748b;">${c.student_email}</td>
      <td><span style="font-size: 12px; background: var(--alifeo-light-green); color: var(--alifeo-green-dark); padding: 3px 8px; border-radius: 4px; font-weight: 500;">${c.domain_role}</span></td>
      <td>${c.issue_date}</td>
      <td>
        ${c.status === 'verified' 
          ? '<span style="color: #059669; font-weight: 700;">Active</span>' 
          : '<span style="color: #dc2626; font-weight: 700;">Revoked</span>'}
      </td>
      <td>
        ${c.email_sent 
          ? '<span style="color: #059669; font-size: 12px; font-weight: 600;">Sent ✔</span>' 
          : '<span style="color: #94a3b8; font-size: 12px;">Not Sent</span>'}
      </td>
      <td>
        <a href="/verify/${encodeURIComponent(c.id)}" target="_blank" class="table-btn table-btn-view">View</a>
        <button onclick="resendEmail('${c.id}')" class="table-btn table-btn-resend">Email</button>
        <button onclick="toggleRevoke('${c.id}', '${c.status}')" class="table-btn table-btn-revoke">
          ${c.status === 'verified' ? 'Revoke' : 'Restore'}
        </button>
      </td>
    </tr>
  `).join('');

  const todayStr = new Date().toISOString().split('T')[0];

  const templateOptions = templates.map((t, idx) => 
    `<option value="${t.id}" ${t.is_default || idx === 0 ? 'selected' : ''}>${t.name}</option>`
  ).join('');

  const templateCards = templates.map(t => `
    <div class="template-item" id="tpl_${t.id}">
      <div class="template-thumb">
        <img src="${t.image_data}" alt="${t.name}" />
      </div>
      <div class="template-info" style="flex-direction: column; align-items: stretch; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="template-name" title="${t.name}">${t.name}</span>
          ${t.is_default ? '<span style="font-size: 10px; background: #ecfdf5; color: #059669; font-weight: 800; padding: 2px 6px; border-radius: 4px;">DEFAULT</span>' : ''}
        </div>
        <div style="display: flex; gap: 6px;">
          <button onclick="openCanvasEditor('${t.id}')" class="btn-submit" style="padding: 6px 10px; font-size: 12px; flex: 1;">
            ✏️ Edit Canvas Layout
          </button>
          ${!t.is_default ? `<button onclick="deleteTemplate('${t.id}')" class="table-btn table-btn-revoke" style="font-size: 11px; padding: 4px 8px;">Delete</button>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Admin Dashboard | Alifeo Certificate Portal</title>
  <link rel="icon" type="image/png" href="${ALIFEO_LOGO_BASE64}">
  <style>
    ${GLOBAL_STYLES}

    /* Interactive Canvas Styles */
    .canvas-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: none;
      flex-direction: column;
      overflow-y: auto;
      padding: 16px;
    }

    .canvas-editor-container {
      background: #ffffff;
      border-radius: 16px;
      max-width: 1360px;
      width: 100%;
      margin: auto;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    .editor-top-bar {
      padding: 14px 22px;
      background: #f8fafc;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }

    .editor-main-body {
      display: flex;
      flex-direction: column;
    }

    @media (min-width: 1100px) {
      .editor-main-body {
        flex-direction: row;
      }
    }

    .editor-sidebar {
      width: 100%;
      background: #ffffff;
      border-right: 1px solid var(--border-color);
      padding: 20px;
      box-sizing: border-box;
    }

    @media (min-width: 1100px) {
      .editor-sidebar {
        width: 330px;
        min-width: 330px;
      }
    }

    .editor-canvas-stage {
      flex: 1;
      background: #e2e8f0;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
    }

    .canvas-viewport {
      position: relative;
      width: 1024px;
      height: 706px;
      background: #ffffff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      user-select: none;
    }

    .canvas-bg-render {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: fill;
      pointer-events: none;
      z-index: 1;
    }

    .draggable-box {
      position: absolute;
      cursor: grab;
      z-index: 10;
      border: 1.5px dashed transparent;
      transition: border-color 0.15s;
    }

    .draggable-box:hover {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.05);
    }

    .draggable-box.active-selected {
      border-color: var(--alifeo-green);
      background: rgba(7, 92, 55, 0.08);
      cursor: grabbing;
      box-shadow: 0 0 0 1px var(--alifeo-green);
    }
  </style>
</head>
<body>
  <div class="top-brand-bar"></div>
  <header class="navbar">
    <div class="nav-brand">
      <a href="/" class="nav-logo-box">
        <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" class="nav-logo" />
        <span class="nav-brand-title">Alifeo</span>
      </a>
    </div>
    <div class="nav-links">
      <a href="/" target="_blank" class="nav-pill-link">Live Portal ↗</a>
      <form action="/api/admin/logout" method="POST" style="margin: 0;">
        <button type="submit" class="btn-logout">Logout</button>
      </form>
    </div>
  </header>

  <main class="main-content">
    <!-- Stats Row -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <div class="admin-card" style="padding: 18px 20px;">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Issued</div>
        <div style="font-size: 28px; font-weight: 800; color: var(--alifeo-green-dark); margin-top: 4px;">${stats.total}</div>
      </div>
      <div class="admin-card" style="padding: 18px 20px;">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Active Credentials</div>
        <div style="font-size: 28px; font-weight: 800; color: var(--alifeo-emerald); margin-top: 4px;">${stats.verified}</div>
      </div>
      <div class="admin-card" style="padding: 18px 20px;">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Emails Dispatched</div>
        <div style="font-size: 28px; font-weight: 800; color: #2563eb; margin-top: 4px;">${stats.emailsSent}</div>
      </div>
      <div class="admin-card" style="padding: 18px 20px;">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">HR Sender Address</div>
        <div style="font-size: 15px; font-weight: 700; color: var(--alifeo-green-dark); margin-top: 8px;">hr@alifeo.com</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="admin-nav-tabs">
      <button class="admin-tab-btn active" id="tabBtnIssue" onclick="switchTab('issue')">✨ Issue Certificate</button>
      <button class="admin-tab-btn" id="tabBtnTemplates" onclick="switchTab('templates')">🎨 Certificate Templates & Canvas Editor (${templates.length})</button>
      <button class="admin-tab-btn" id="tabBtnBulk" onclick="switchTab('bulk')">📦 Bulk Generation</button>
    </div>

    <!-- TAB 1: Issue Certificate -->
    <div id="tabContentIssue">
      <div class="admin-grid">
        <!-- Form Column -->
        <div>
          <div class="admin-card">
            <h2 class="admin-card-title">
              <span>📜</span> Issue New Certificate
            </h2>
            <p class="admin-card-desc">Generate official credential & dispatch email from hr@alifeo.com</p>

            <form id="issueForm" onsubmit="handleIssue(event)">
              <div class="form-group" style="background: var(--alifeo-light-green); border: 1px solid var(--alifeo-border-green); padding: 12px; border-radius: 10px; margin-bottom: 18px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label class="form-label" style="color: var(--alifeo-green-dark); margin: 0;">Selected Template *</label>
                  <button type="button" onclick="openCanvasEditor(document.getElementById('templateSelect').value)" style="background: none; border: none; color: var(--alifeo-green); font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: underline;">
                    ✏️ Customize Layout
                  </button>
                </div>
                <select name="template_id" id="templateSelect" class="form-select" onchange="updateTemplatePreview()">
                  ${templateOptions}
                </select>
                <div id="templatePreviewBox" style="display: none; margin-top: 10px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; max-height: 120px;">
                  <img id="templatePreviewImg" src="" style="width: 100%; height: 120px; object-fit: cover;" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Intern Full Name *</label>
                <input type="text" name="student_name" class="form-input" placeholder="e.g. Mohammad Yahya" required />
              </div>

              <div class="form-group">
                <label class="form-label">Intern Email Address *</label>
                <input type="email" name="student_email" class="form-input" placeholder="e.g. intern@example.com" required />
              </div>

              <div class="form-group">
                <label class="form-label">Internship Designation / Role *</label>
                <input type="text" name="domain_role" list="roleOptions" class="form-input" placeholder="e.g. Full Stack Web Development Intern" required />
                <datalist id="roleOptions">
                  <option value="Full Stack Web Development Intern">
                  <option value="AI & Machine Learning Intern">
                  <option value="Frontend Web Development Intern">
                  <option value="Backend & Cloud Engineering Intern">
                  <option value="UI/UX Design Intern">
                  <option value="Product Design Intern">
                  <option value="Data Science Intern">
                  <option value="Software Engineer Intern">
                </datalist>
              </div>

              <div class="form-group">
                <label class="form-label">Department *</label>
                <input type="text" name="department" class="form-input" placeholder="e.g. Technology & Product" value="Technology & Product" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Duration</label>
                  <input type="text" name="duration" class="form-input" placeholder="e.g. 3 Months" value="3 Months" />
                </div>

                <div class="form-group">
                  <label class="form-label">Performance</label>
                  <select name="grade" class="form-select">
                    <option value="Outstanding" selected>Outstanding</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Start Date</label>
                  <input type="text" name="start_date" class="form-input" placeholder="e.g. 01 Nov 2026" value="01 Nov 2026" />
                </div>

                <div class="form-group">
                  <label class="form-label">Completion Date</label>
                  <input type="text" name="end_date" class="form-input" placeholder="e.g. 31 Jan 2027" value="31 Jan 2027" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Certificate ID (Optional: leave blank for auto ALF/INT/2026/XXXX)</label>
                <input type="text" name="id" class="form-input" placeholder="e.g. ALF/INT/2026/0491" />
              </div>

              <div class="form-group" style="margin-top: 14px; margin-bottom: 20px;">
                <label class="form-checkbox-label">
                  <input type="checkbox" name="send_email" class="form-checkbox" checked />
                  <span>Send official certificate email from <strong>hr@alifeo.com</strong></span>
                </label>
              </div>

              <button type="submit" id="btnIssue" class="btn-submit">🚀 Generate & Issue Certificate</button>
            </form>
          </div>
        </div>

        <!-- Records Table Column -->
        <div>
          <div class="admin-card">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
              <h2 class="admin-card-title" style="margin: 0;">Issued Certificate Records</h2>
              <input type="text" id="filterInput" onkeyup="filterTable()" placeholder="Search name, ID or email..." class="form-input" style="width: 220px; padding: 7px 12px; font-size: 13px;" />
            </div>

            <div class="table-container">
              <table class="admin-table" id="certsTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Domain</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${certRows.length > 0 ? certRows : '<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 30px;">No certificates issued yet. Create your first one above!</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Certificate Templates & Visual Editor -->
    <div id="tabContentTemplates" style="display: none;">
      <div class="admin-card" style="margin-bottom: 24px;">
        <h2 class="admin-card-title">
          <span>📤</span> Upload New Certificate Template
        </h2>
        <p class="admin-card-desc">
          Upload any certificate background image (PNG, JPG, SVG). Then click <strong>"✏️ Edit Canvas Layout"</strong> to drag and drop text, names, signatures and QR codes exactly where you want them on your design!
        </p>

        <form id="uploadTemplateForm" onsubmit="handleTemplateUpload(event)" style="max-width: 580px;">
          <div class="form-group">
            <label class="form-label">Template Name *</label>
            <input type="text" id="tplName" class="form-input" placeholder="e.g. Alifeo Green & Lime Edition 2026" required />
          </div>

          <div class="form-group">
            <label class="form-label">Select Certificate Background Image *</label>
            <input type="file" id="tplFile" class="form-input" accept="image/*" onchange="previewTemplateFile(event)" required />
          </div>

          <div id="uploadPreviewContainer" style="display: none; margin-bottom: 16px; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 10px; text-align: center;">
            <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px;">Image Preview:</div>
            <img id="uploadPreviewImg" style="max-width: 100%; max-height: 220px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
          </div>

          <button type="submit" id="btnUploadTpl" class="btn-submit">Upload & Open in Canvas Editor</button>
        </form>
      </div>

      <div class="admin-card">
        <h2 class="admin-card-title">Available Templates</h2>
        <p class="admin-card-desc">Click "Edit Canvas Layout" on any template to drag, reposition, and customize elements.</p>

        <div class="template-grid">
          ${templateCards}
        </div>
      </div>
    </div>

    <!-- TAB 3: Bulk Issue -->
    <div id="tabContentBulk" style="display: none;">
      <div class="admin-card" style="max-width: 720px; margin: 0 auto;">
        <h2 class="admin-card-title">
          <span>📦</span> Bulk Issue (CSV / Multi-line)
        </h2>
        <p class="admin-card-desc">Batch create and dispatch emails to multiple candidates simultaneously</p>
        
        <div class="form-group">
          <label class="form-label">Template for Batch</label>
          <select id="bulkTemplateSelect" class="form-select">
            ${templateOptions}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Data Format: Name, Email, Domain, Duration, Grade, Department (One candidate per line)</label>
          <textarea id="bulkData" class="form-textarea" rows="6" placeholder="Mohammad Yahya, yahya@example.com, Full Stack Web Development Intern, 3 Months, Outstanding, Technology & Product&#10;Priya Patel, priya@example.com, UI/UX Design Intern, 2 Months, Excellent, Product Design"></textarea>
        </div>

        <button type="button" onclick="handleBulkIssue()" id="btnBulk" class="btn-submit">
          ⚡ Process Bulk Certificates
        </button>
      </div>
    </div>
  </main>

  <!-- ========================================================
       FULL INTERACTIVE DRAG & DROP VISUAL CANVAS EDITOR MODAL
       ======================================================== -->
  <div id="canvasEditorModal" class="canvas-modal-overlay">
    <div class="canvas-editor-container">
      
      <!-- Top Bar -->
      <div class="editor-top-bar">
        <div>
          <span style="font-weight: 800; font-size: 16px; color: var(--alifeo-green-dark);" id="editorTplTitle">Canvas Layout Editor</span>
          <span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">(Click & drag any item on canvas to reposition)</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="applySmartCleanPreset()" class="table-btn table-btn-view" style="padding: 7px 14px;">
            ✨ Smart Align (No Duplicate Logo)
          </button>
          <button onclick="saveCanvasLayout()" id="btnSaveLayout" class="btn-submit" style="padding: 7px 18px; width: auto; font-size: 13px;">
            💾 Save Layout Settings
          </button>
          <button onclick="closeCanvasEditor()" class="btn-admin" style="padding: 7px 14px;">
            ✖ Close
          </button>
        </div>
      </div>

      <!-- Main Body -->
      <div class="editor-main-body">
        
        <!-- Left Sidebar: Controls for Selected Element -->
        <div class="editor-sidebar">
          <h3 style="font-size: 14px; font-weight: 700; color: var(--alifeo-green-dark); margin-bottom: 12px;">Active Element Controls</h3>
          
          <div class="form-group">
            <label class="form-label">Selected Element</label>
            <select id="editorElementSelect" class="form-select" onchange="handleElementSelectChange()">
              <option value="title">Certificate Title & Subtitle</option>
              <option value="name" selected>Candidate Full Name</option>
              <option value="role">Role / Designation</option>
              <option value="body">Contribution Paragraph</option>
              <option value="details">Internship Details Box</option>
              <option value="recognition">Recognition Clause</option>
              <option value="khalid_sig">Mohd Khalid Signature (Left)</option>
              <option value="yahya_sig">Mohammad Yahya Signature (Right)</option>
              <option value="qr">QR Code & ID Badge</option>
              <option value="logo">Header Logo (Show/Hide)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Top Position (Y): <span id="valTop">218</span>px</label>
            <input type="range" id="ctrlTop" min="0" max="650" value="218" class="form-input" style="padding: 4px;" oninput="updateLiveStyle('top', this.value)" />
          </div>

          <div class="form-group" id="groupLeftCtrl">
            <label class="form-label">Left Position (X): <span id="valLeft">0</span>px</label>
            <input type="range" id="ctrlLeft" min="0" max="850" value="0" class="form-input" style="padding: 4px;" oninput="updateLiveStyle('left', this.value)" />
          </div>

          <div class="form-group" id="groupFontSize">
            <label class="form-label">Font Size: <span id="valFontSize">36</span>px</label>
            <input type="range" id="ctrlFontSize" min="8" max="60" value="36" class="form-input" style="padding: 4px;" oninput="updateLiveStyle('fontSize', this.value)" />
          </div>

          <div class="form-group" id="groupColor">
            <label class="form-label">Text Color</label>
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="color" id="ctrlColor" value="#084328" style="width: 44px; height: 38px; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer;" oninput="updateLiveStyle('color', this.value)" />
              <input type="text" id="ctrlColorHex" value="#084328" class="form-input" style="font-family: monospace; font-size: 13px;" onchange="updateLiveStyle('color', this.value)" />
            </div>
          </div>

          <div class="form-group" style="margin-top: 18px;">
            <label class="form-checkbox-label">
              <input type="checkbox" id="ctrlVisible" class="form-checkbox" checked onchange="updateLiveStyle('visible', this.checked)" />
              <span>Show this element on Certificate</span>
            </label>
          </div>

          <div style="margin-top: 24px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; color: #64748b;">
            💡 <strong>Quick Tip:</strong> Click directly on any text or signature on the canvas to drag it or edit its color and font size!
          </div>
        </div>

        <!-- Right Stage: Live Interactive Canvas -->
        <div class="editor-canvas-stage">
          <div id="canvasViewport" class="canvas-viewport">
            
            <!-- Base Template Background -->
            <img id="editorBgImg" src="" class="canvas-bg-render" alt="Template" />

            <!-- Draggable Item 1: Logo -->
            <div id="drag_logo" class="draggable-box" style="top: 30px; left: 430px; width: 160px; text-align: center; display: none;" onmousedown="startDrag(event, 'logo')">
              <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" style="height: 40px; pointer-events: none;" />
            </div>

            <!-- Draggable Item 2: Title -->
            <div id="drag_title" class="draggable-box" style="top: 168px; left: 0; width: 100%; text-align: center;" onmousedown="startDrag(event, 'title')">
              <div id="text_title" style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 800; color: #084328; letter-spacing: 2px;">
                CERTIFICATE OF INTERNSHIP COMPLETION
              </div>
              <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #64748b; margin-top: 3px;">
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </div>
            </div>

            <!-- Draggable Item 3: Candidate Name -->
            <div id="drag_name" class="draggable-box active-selected" style="top: 218px; left: 0; width: 100%; text-align: center;" onmousedown="startDrag(event, 'name')">
              <div id="text_name" style="font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #084328;">
                Mohammad Yahya
              </div>
              <div style="width: 220px; height: 2px; background: linear-gradient(90deg, transparent, #d97706, transparent); margin: 6px auto 0;"></div>
            </div>

            <!-- Draggable Item 4: Role -->
            <div id="drag_role" class="draggable-box" style="top: 280px; left: 0; width: 100%; text-align: center;" onmousedown="startDrag(event, 'role')">
              <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">
                In recognition of successfully completing the professional internship program at Alifeo, in the role of
              </div>
              <div id="text_role" style="font-family: 'Cinzel', serif; font-size: 16px; font-weight: 800; color: #084328; background: rgba(236, 253, 245, 0.9); border-left: 3px solid #059669; border-right: 3px solid #059669; padding: 3px 20px; border-radius: 4px; display: inline-block;">
                FULL STACK WEB DEVELOPMENT INTERN
              </div>
            </div>

            <!-- Draggable Item 5: Body Paragraph -->
            <div id="drag_body" class="draggable-box" style="top: 340px; left: 70px; width: 884px; text-align: center;" onmousedown="startDrag(event, 'body')">
              <p id="text_body" style="font-size: 10.5px; line-height: 1.45; color: #334155; margin: 0 auto;">
                During the internship period, the candidate actively contributed to assigned projects, participated in professional workflows, and demonstrated practical knowledge, problem-solving abilities, creativity, and professional commitment.
                The candidate gained hands-on exposure to real-world projects, industry practices, collaborative teamwork, and practical implementation of skills within the organization.
              </p>
            </div>

            <!-- Draggable Item 6: Details Box (4-Column Balanced Grid) -->
            <div id="drag_details" class="draggable-box" style="top: 402px; left: 65px; width: 894px;" onmousedown="startDrag(event, 'details')">
              <div style="background: rgba(248, 250, 252, 0.95); border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 18px; box-sizing: border-box; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; padding-bottom: 3px; border-bottom: 1px solid rgba(226, 232, 240, 0.8);">
                  <span style="font-size: 9.5px; font-weight: 800; letter-spacing: 1.5px; color: #084328;">INTERNSHIP DETAILS</span>
                  <span style="font-size: 8.5px; font-weight: 600; color: #64748b; letter-spacing: 0.5px;">ALIFEO ACCREDITED CREDENTIAL</span>
                </div>

                <div id="text_details" style="display: grid; grid-template-columns: 29% 23% 26% 22%; gap: 5px 12px; font-size: 10.5px; text-align: left;">
                  
                  <div style="display: flex; align-items: baseline; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span style="color: #64748b; font-weight: 700; font-size: 10px;">Position:</span>
                    <span style="font-weight: 700; color: #084328; font-size: 10.5px;">Product Design Intern</span>
                  </div>

                  <div style="display: flex; align-items: baseline; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span style="color: #64748b; font-weight: 700; font-size: 10px;">Department:</span>
                    <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">Technology & Product</span>
                  </div>

                  <div style="display: flex; align-items: baseline; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <span style="color: #64748b; font-weight: 700; font-size: 10px;">Type:</span>
                    <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">Professional Internship</span>
                  </div>

                  <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="color: #64748b; font-weight: 700; font-size: 10px;">Performance:</span>
                    <span style="font-weight: 800; color: #059669; font-size: 10px; background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.2); padding: 0 5px; border-radius: 3px;">Outstanding</span>
                  </div>

                  <div style="display: flex; align-items: baseline; gap: 4px;">
                    <span style="color: #64748b; font-weight: 700; font-size: 10px;">Duration:</span>
                    <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">3 Months</span>
                  </div>

                  <div style="display: flex; align-items: baseline; gap: 4px;">
                    <span style="color: #64748b; font-weight: 700; font-size: 10px;">Start Date:</span>
                    <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">01 Nov 2026</span>
                  </div>

                  <div style="display: flex; align-items: baseline; gap: 4px;">
                    <span style="color: #64748b; font-weight: 700; font-size: 10px;">Completion Date:</span>
                    <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">31 Jan 2027</span>
                  </div>

                  <div style="display: flex; align-items: baseline; gap: 4px;">
                    <span style="color: #64748b; font-weight: 700; font-size: 10px;">Credential:</span>
                    <span style="font-family: monospace; font-weight: 700; color: #084328; font-size: 9.5px;">ALF/INT/2026/G4BP</span>
                  </div>

                </div>
              </div>
            </div>

            <!-- Draggable Item 7: Recognition Note -->
            <div id="drag_recognition" class="draggable-box" style="top: 475px; left: 70px; width: 884px; text-align: center;" onmousedown="startDrag(event, 'recognition')">
              <div id="text_recognition" style="font-size: 10px; color: #475569;">
                <strong>RECOGNITION:</strong> We appreciate the candidate's dedication, contribution, and efforts during the internship. We wish them continued success in their professional career and future endeavours.
              </div>
            </div>

            <!-- Draggable Item 8: Khalid Signature -->
            <div id="drag_khalid_sig" class="draggable-box" style="top: 508px; left: 95px; width: 180px; text-align: center;" onmousedown="startDrag(event, 'khalid_sig')">
              <div style="height: 48px; display: flex; align-items: flex-end; justify-content: center;">
                <img src="${KHALID_SIGNATURE_BASE64}" alt="Mohd Khalid" style="max-height: 46px; max-width: 140px; pointer-events: none;" />
              </div>
              <div style="width: 140px; height: 1px; background: #334155; margin: 2px auto 3px;"></div>
              <div style="font-size: 11.5px; font-weight: 800; color: #084328;">Mohd Khalid</div>
              <div style="font-size: 9px; font-weight: 600; color: #475569;">Founder – Alifeo</div>
            </div>

            <!-- Draggable Item 9: QR Code & ID -->
            <div id="drag_qr" class="draggable-box" style="top: 512px; left: 440px; display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.95); border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 6px;" onmousedown="startDrag(event, 'qr')">
              <div style="width: 48px; height: 48px; background: #084328; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 9px; font-weight: 700;">
                QR
              </div>
              <div style="text-align: left;">
                <div style="font-family: monospace; font-weight: 800; font-size: 10px; color: #084328;">ID: ALF/INT/2026/0491</div>
                <div style="font-size: 8px; color: #64748b;">Scan to verify authentic credential</div>
              </div>
            </div>

            <!-- Draggable Item 10: Yahya Signature -->
            <div id="drag_yahya_sig" class="draggable-box" style="top: 508px; left: 745px; width: 190px; text-align: center;" onmousedown="startDrag(event, 'yahya_sig')">
              <div style="height: 48px; display: flex; align-items: flex-end; justify-content: center;">
                <img src="${YAHYA_SIGNATURE_BASE64}" alt="Mohammad Yahya" style="max-height: 46px; max-width: 150px; pointer-events: none;" />
              </div>
              <div style="width: 150px; height: 1px; background: #334155; margin: 2px auto 3px;"></div>
              <div style="font-size: 11.5px; font-weight: 800; color: #084328;">Mohammad Yahya</div>
              <div style="font-size: 9px; font-weight: 600; color: #475569;">Co-Founder & Product Designer – Alifeo</div>
            </div>

          </div>
        </div>

      </div>

    </div>
  </div>

  <!-- EDIT CERTIFICATE MODAL -->
  <div id="editCertModal" class="canvas-modal-overlay" style="display: none; align-items: center; justify-content: center; z-index: 1000;">
    <div style="background: #ffffff; border-radius: 16px; max-width: 640px; width: 92%; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); position: relative;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 800; color: var(--alifeo-green-dark); margin: 0;">✏️ Edit Certificate Details</h3>
          <span id="editCertIdDisplay" style="font-family: monospace; font-size: 12px; color: #64748b; font-weight: 700;"></span>
        </div>
        <button type="button" onclick="closeEditCertModal()" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #64748b;">✕</button>
      </div>

      <form id="editCertForm" onsubmit="handleEditCertSubmit(event)">
        <input type="hidden" id="editCertId" name="id" />

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Intern Full Name *</label>
            <input type="text" id="editStudentName" name="student_name" class="form-input" required />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Intern Email Address *</label>
            <input type="email" id="editStudentEmail" name="student_email" class="form-input" required />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Domain / Role *</label>
            <input type="text" id="editDomainRole" name="domain_role" class="form-input" required />
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Department *</label>
            <input type="text" id="editDepartment" name="department" class="form-input" required />
          </div>
        </div>

        <!-- TIMELINE & DATES -->
        <div style="background: var(--alifeo-light-green); border: 1px solid var(--alifeo-border-green); border-radius: 10px; padding: 12px; margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 800; color: var(--alifeo-green-dark); margin-bottom: 8px; letter-spacing: 0.5px;">
            🗓️ INTERNSHIP TIMELINE & DATES (Controls Certificate Details Box)
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 11px;">Duration</label>
              <input type="text" id="editDuration" name="duration" class="form-input" placeholder="e.g. 3 Months" />
            </div>
            <div>
              <label class="form-label" style="font-size: 11px;">Start Date</label>
              <input type="text" id="editStartDate" name="start_date" class="form-input" placeholder="e.g. 01 Nov 2026" />
            </div>
            <div>
              <label class="form-label" style="font-size: 11px;">Completion Date</label>
              <input type="text" id="editEndDate" name="end_date" class="form-input" placeholder="e.g. 31 Jan 2027" />
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Performance Grade</label>
            <select id="editGrade" name="grade" class="form-select">
              <option value="Outstanding">Outstanding</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div class="form-group" style="margin: 0;">
            <label class="form-label">Credential Status</label>
            <select id="editStatus" name="status" class="form-select">
              <option value="verified">Active (Verified)</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">Certificate Template</label>
          <select id="editTemplateId" name="template_id" class="form-select">
            ${templateOptions}
          </select>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" onclick="closeEditCertModal()" class="btn-admin" style="padding: 10px 18px;">Cancel</button>
          <button type="submit" id="btnSaveEditCert" class="btn-submit" style="width: auto; padding: 10px 24px;">💾 Save Changes</button>
        </div>
      </form>

    </div>
  </div>
  <footer class="footer">
    <p>© 2026 Alifeo • Admin Console</p>
  </footer>

  <script>
    const certsData = ${JSON.stringify(certs)};
    const templatesData = ${JSON.stringify(templates.map(t => ({
      id: t.id,
      name: t.name,
      image_data: t.image_data,
      layout_config: t.layout_config ? JSON.parse(t.layout_config) : null
    })))};

    let activeTplId = null;
    let currentLayout = {};
    let activeElementKey = 'name';

    const defaultSmartLayout = {
      show_logo: false,
      title: { top: 168, fontSize: 16, color: '#084328', visible: true },
      pre_title: { top: 198, fontSize: 10, color: '#64748b', visible: true },
      name: { top: 218, fontSize: 36, color: '#084328', visible: true },
      role_stmt: { top: 278, fontSize: 12, color: '#475569', visible: true },
      role: { top: 298, fontSize: 16, color: '#084328', visible: true },
      body: { top: 342, fontSize: 10.5, color: '#334155', visible: true },
      details: { top: 402, fontSize: 11, color: '#0f172a', visible: true },
      recognition: { top: 476, fontSize: 10, color: '#475569', visible: true },
      khalid_sig: { top: 508, left: 95, scale: 1, visible: true },
      yahya_sig: { top: 508, left: 745, scale: 1, visible: true },
      qr: { top: 512, left: 440, scale: 1, visible: true }
    };

    function openCanvasEditor(tplId) {
      activeTplId = tplId;
      const tpl = templatesData.find(t => t.id === tplId) || templatesData[0];
      if (!tpl) return alert('Template not found');

      document.getElementById('editorTplTitle').textContent = 'Canvas Layout Editor: ' + tpl.name;
      document.getElementById('editorBgImg').src = tpl.image_data;
      
      currentLayout = JSON.parse(JSON.stringify(tpl.layout_config || defaultSmartLayout));
      
      applyLayoutToDOM(currentLayout);
      selectActiveElement('name');

      document.getElementById('canvasEditorModal').style.display = 'flex';
    }

    function closeCanvasEditor() {
      document.getElementById('canvasEditorModal').style.display = 'none';
    }

    function selectActiveElement(key) {
      activeElementKey = key;
      document.querySelectorAll('.draggable-box').forEach(el => el.classList.remove('active-selected'));
      const activeEl = document.getElementById('drag_' + key);
      if (activeEl) activeEl.classList.add('active-selected');

      document.getElementById('editorElementSelect').value = key;
      syncControlsWithLayout();
    }

    function handleElementSelectChange() {
      selectActiveElement(document.getElementById('editorElementSelect').value);
    }

    function syncControlsWithLayout() {
      const data = currentLayout[activeElementKey] || {};
      
      document.getElementById('ctrlTop').value = data.top || 0;
      document.getElementById('valTop').textContent = data.top || 0;

      if (data.left !== undefined) {
        document.getElementById('groupLeftCtrl').style.display = 'block';
        document.getElementById('ctrlLeft').value = data.left;
        document.getElementById('valLeft').textContent = data.left;
      } else {
        document.getElementById('groupLeftCtrl').style.display = 'none';
      }

      if (data.fontSize) {
        document.getElementById('groupFontSize').style.display = 'block';
        document.getElementById('ctrlFontSize').value = data.fontSize;
        document.getElementById('valFontSize').textContent = data.fontSize;
      } else {
        document.getElementById('groupFontSize').style.display = 'none';
      }

      if (data.color) {
        document.getElementById('groupColor').style.display = 'block';
        document.getElementById('ctrlColor').value = data.color;
        document.getElementById('ctrlColorHex').value = data.color;
      } else {
        document.getElementById('groupColor').style.display = 'none';
      }

      document.getElementById('ctrlVisible').checked = data.visible !== false;
    }

    function updateLiveStyle(property, val) {
      if (!currentLayout[activeElementKey]) currentLayout[activeElementKey] = {};
      
      if (property === 'top') {
        val = parseInt(val, 10);
        currentLayout[activeElementKey].top = val;
        document.getElementById('valTop').textContent = val;
        const el = document.getElementById('drag_' + activeElementKey);
        if (el) el.style.top = val + 'px';
      } else if (property === 'left') {
        val = parseInt(val, 10);
        currentLayout[activeElementKey].left = val;
        document.getElementById('valLeft').textContent = val;
        const el = document.getElementById('drag_' + activeElementKey);
        if (el) el.style.left = val + 'px';
      } else if (property === 'fontSize') {
        val = parseFloat(val);
        currentLayout[activeElementKey].fontSize = val;
        document.getElementById('valFontSize').textContent = val;
        const txt = document.getElementById('text_' + activeElementKey);
        if (txt) txt.style.fontSize = val + 'px';
      } else if (property === 'color') {
        currentLayout[activeElementKey].color = val;
        document.getElementById('ctrlColor').value = val;
        document.getElementById('ctrlColorHex').value = val;
        const txt = document.getElementById('text_' + activeElementKey);
        if (txt) txt.style.color = val;
      } else if (property === 'visible') {
        currentLayout[activeElementKey].visible = val;
        const el = document.getElementById('drag_' + activeElementKey);
        if (el) el.style.display = val ? 'block' : 'none';
        if (activeElementKey === 'logo') {
          currentLayout.show_logo = val;
        }
      }
    }

    function applyLayoutToDOM(cfg) {
      for (const [k, v] of Object.entries(cfg)) {
        if (!v || typeof v !== 'object') continue;
        const el = document.getElementById('drag_' + k);
        const txt = document.getElementById('text_' + k);
        if (el) {
          if (v.top !== undefined) el.style.top = v.top + 'px';
          if (v.left !== undefined) el.style.left = v.left + 'px';
          if (v.visible !== undefined) el.style.display = v.visible ? 'block' : 'none';
        }
        if (txt) {
          if (v.fontSize) txt.style.fontSize = v.fontSize + 'px';
          if (v.color) txt.style.color = v.color;
        }
      }
      if (document.getElementById('drag_logo')) {
        document.getElementById('drag_logo').style.display = cfg.show_logo ? 'block' : 'none';
      }
    }

    function applySmartCleanPreset() {
      currentLayout = JSON.parse(JSON.stringify(defaultSmartLayout));
      applyLayoutToDOM(currentLayout);
      syncControlsWithLayout();
      alert('✔ Smart clean layout applied! Duplicate logo hidden, text perfectly placed in white center.');
    }

    // Dragging Logic
    let dragging = false;
    let dragKey = null;
    let startMouseY = 0;
    let startMouseX = 0;
    let startElTop = 0;
    let startElLeft = 0;

    function startDrag(e, key) {
      e.preventDefault();
      dragging = true;
      dragKey = key;
      selectActiveElement(key);

      const el = document.getElementById('drag_' + key);
      startMouseY = e.clientY;
      startMouseX = e.clientX;
      startElTop = parseInt(el.style.top, 10) || 0;
      startElLeft = parseInt(el.style.left, 10) || 0;

      window.addEventListener('mousemove', onDragging);
      window.addEventListener('mouseup', stopDrag);
    }

    function onDragging(e) {
      if (!dragging || !dragKey) return;
      const deltaY = e.clientY - startMouseY;
      const deltaX = e.clientX - startMouseX;

      const newTop = Math.max(0, Math.min(670, startElTop + deltaY));
      updateLiveStyle('top', newTop);
      document.getElementById('ctrlTop').value = newTop;

      const hasLeft = currentLayout[dragKey]?.left !== undefined;
      if (hasLeft) {
        const newLeft = Math.max(0, Math.min(900, startElLeft + deltaX));
        updateLiveStyle('left', newLeft);
        document.getElementById('ctrlLeft').value = newLeft;
      }
    }

    function stopDrag() {
      dragging = false;
      dragKey = null;
      window.removeEventListener('mousemove', onDragging);
      window.removeEventListener('mouseup', stopDrag);
    }

    async function saveCanvasLayout() {
      if (!activeTplId) return;
      const btn = document.getElementById('btnSaveLayout');
      btn.disabled = true;
      btn.textContent = 'Saving Settings...';

      try {
        const res = await fetch('/api/admin/templates/' + encodeURIComponent(activeTplId) + '/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layout_config: JSON.stringify(currentLayout) })
        });
        const json = await res.json();
        if (json.success) {
          alert('✔ Template canvas layout saved successfully!');
          window.location.reload();
        } else {
          alert('Save error: ' + json.error);
          btn.disabled = false;
          btn.textContent = '💾 Save Layout Settings';
        }
      } catch (err) {
        alert('Network error: ' + err.message);
        btn.disabled = false;
        btn.textContent = '💾 Save Layout Settings';
      }
    }

    // Tab Switching
    function switchTab(tab) {
      document.getElementById('tabContentIssue').style.display = tab === 'issue' ? 'block' : 'none';
      document.getElementById('tabContentTemplates').style.display = tab === 'templates' ? 'block' : 'none';
      document.getElementById('tabContentBulk').style.display = tab === 'bulk' ? 'block' : 'none';

      document.getElementById('tabBtnIssue').classList.toggle('active', tab === 'issue');
      document.getElementById('tabBtnTemplates').classList.toggle('active', tab === 'templates');
      document.getElementById('tabBtnBulk').classList.toggle('active', tab === 'bulk');
    }

    function updateTemplatePreview() {
      const select = document.getElementById('templateSelect');
      const val = select.value;
      const previewBox = document.getElementById('templatePreviewBox');
      const previewImg = document.getElementById('templatePreviewImg');

      const found = templatesData.find(t => t.id === val);
      if (found) {
        previewImg.src = found.image_data;
        previewBox.style.display = 'block';
      } else {
        previewBox.style.display = 'none';
      }
    }

    function previewTemplateFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        document.getElementById('uploadPreviewImg').src = evt.target.result;
        document.getElementById('uploadPreviewContainer').style.display = 'block';
      };
      reader.readAsDataURL(file);
    }

    async function handleTemplateUpload(e) {
      e.preventDefault();
      const name = document.getElementById('tplName').value.trim();
      const fileInput = document.getElementById('tplFile');
      if (!name || !fileInput.files[0]) return alert('Please enter template name and choose image');

      const btn = document.getElementById('btnUploadTpl');
      btn.disabled = true;
      btn.textContent = 'Uploading Template...';

      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = async function(evt) {
        const imageData = evt.target.result;
        try {
          const res = await fetch('/api/admin/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, image_data: imageData, layout_config: JSON.stringify(defaultSmartLayout) })
          });
          const json = await res.json();
          if (json.success) {
            alert('✔ Template uploaded! Opening in Visual Canvas Editor...');
            window.location.reload();
          } else {
            alert('Upload failed: ' + (json.error || 'Server error'));
            btn.disabled = false;
            btn.textContent = 'Upload & Open in Canvas Editor';
          }
        } catch (err) {
          alert('Error: ' + err.message);
          btn.disabled = false;
          btn.textContent = 'Upload & Open in Canvas Editor';
        }
      };
      reader.readAsDataURL(file);
    }

    async function deleteTemplate(id) {
      if (!confirm('Are you sure you want to delete this template?')) return;
      try {
        const res = await fetch('/api/admin/templates/' + encodeURIComponent(id), {
          method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
          window.location.reload();
        } else {
          alert('Delete failed: ' + json.error);
        }
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }

    async function handleIssue(e) {
      e.preventDefault();
      const btn = document.getElementById('btnIssue');
      btn.disabled = true;
      btn.textContent = 'Generating & Sending...';

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      data.send_email = formData.get('send_email') === 'on';

      try {
        const res = await fetch('/api/admin/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.success) {
          alert('✔ Certificate issued successfully! ID: ' + json.certificate.id + (data.send_email ? ' (Email sent via hr@alifeo.com)' : ''));
          window.location.reload();
        } else {
          alert('Error: ' + (json.error || 'Failed to issue'));
          btn.disabled = false;
          btn.textContent = '🚀 Generate & Issue Certificate';
        }
      } catch (err) {
        alert('Network error: ' + err.message);
        btn.disabled = false;
        btn.textContent = '🚀 Generate & Issue Certificate';
      }
    }

    async function handleBulkIssue() {
      const textarea = document.getElementById('bulkData');
      const text = textarea.value.trim();
      if (!text) return alert('Please enter at least one candidate record!');

      const templateId = document.getElementById('bulkTemplateSelect').value;
      const btn = document.getElementById('btnBulk');
      btn.disabled = true;
      btn.textContent = 'Processing Batch...';

      try {
        const res = await fetch('/api/admin/bulk-issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv: text, template_id: templateId })
        });
        const json = await res.json();
        if (json.success) {
          alert('✔ Bulk issue completed! Total issued: ' + json.count);
          window.location.reload();
        } else {
          alert('Error: ' + json.error);
          btn.disabled = false;
          btn.textContent = '⚡ Process Bulk Certificates';
        }
      } catch (err) {
        alert('Bulk issue failed: ' + err.message);
        btn.disabled = false;
        btn.textContent = '⚡ Process Bulk Certificates';
      }
    }

    async function resendEmail(id) {
      if (!confirm('Resend certificate email to candidate for ID: ' + id + '?')) return;
      try {
        const res = await fetch('/api/admin/resend-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const json = await res.json();
        if (json.success) {
          alert('✔ Email dispatched successfully from hr@alifeo.com!');
          window.location.reload();
        } else {
          alert('Error sending email: ' + json.error);
        }
      } catch (err) {
        alert('Failed: ' + err.message);
      }
    }

    async function toggleRevoke(id, currentStatus) {
      const newStatus = currentStatus === 'verified' ? 'revoked' : 'verified';
      if (!confirm('Are you sure you want to change status of ' + id + ' to ' + newStatus + '?')) return;
      try {
        const res = await fetch('/api/admin/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: newStatus })
        });
        const json = await res.json();
        if (json.success) {
          window.location.reload();
        } else {
          alert('Error: ' + json.error);
        }
      } catch (err) {
        alert('Failed: ' + err.message);
      }
    }

    function filterTable() {
      const query = document.getElementById('filterInput').value.toLowerCase();
      const rows = document.querySelectorAll('#certsTable tbody tr');
      rows.forEach(r => {
        r.style.display = r.textContent.toLowerCase().includes(query) ? '' : 'none';
      });
    }

    // Auto init template preview on load
    updateTemplatePreview();
  </script>
</body>
</html>`;
}
