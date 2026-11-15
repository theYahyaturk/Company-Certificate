import QRCode from 'qrcode';
import { Certificate, LayoutConfig } from './types';
import { ALIFEO_LOGO_BASE64 } from './logo-base64';
import { YAHYA_SIGNATURE_BASE64, KHALID_SIGNATURE_BASE64 } from './signatures-base64';
import { ALIFEO_OFFICIAL_TEMPLATE_BASE64 } from './default-template';

export async function generateQrSvg(verifyUrl: string): Promise<string> {
  return await QRCode.toString(verifyUrl, {
    type: 'svg',
    margin: 1,
    color: {
      dark: '#084328',
      light: '#ffffff'
    }
  });
}

export function parseLayoutConfig(raw?: string): LayoutConfig {
  if (!raw) {
    return {
      show_logo: false, // Default template already has logo
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
    } as any;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return parseLayoutConfig();
  }
}

export async function renderCertificateHtml(cert: Certificate, appUrl: string): Promise<string> {
  const verifyUrl = `${appUrl}/verify/${encodeURIComponent(cert.id)}`;
  const qrSvg = await generateQrSvg(verifyUrl);

  const bgImage = cert.template_bg || ALIFEO_OFFICIAL_TEMPLATE_BASE64;
  const cfg = parseLayoutConfig(cert.layout_config);

  const showLogo = cfg.show_logo ?? false;

  return `
  <div id="certificate-stage" class="certificate-stage">
    <div id="certificate-scaler" class="certificate-scaler">
      <div id="certificate-sheet" class="certificate-sheet canvas-sheet" style="position: relative; width: 1024px; height: 706px; overflow: hidden; background: #ffffff;">
        
        <!-- Template Background Image (Real <img> tag so print & download ALWAYS capture it) -->
        <img 
          id="cert-bg-image" 
          src="${bgImage}" 
          alt="Alifeo Certificate Template" 
          class="cert-background-image" 
          crossorigin="anonymous"
        />

        <!-- Dynamic Layer Layout based on Admin Custom Canvas Config -->
        <div id="cert-elements-layer" class="cert-elements-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
          
          <!-- 1. Header Logo (Only shown if enabled in layout) -->
          ${showLogo ? `
          <div id="layer_logo" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.logo?.top ?? 30)}px; left: ${(cfg.logo?.left ?? 430)}px; text-align: center; width: 160px;">
            <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" style="height: 40px; object-fit: contain;" />
          </div>
          ` : ''}

          <!-- 2. Certificate Title -->
          <div id="layer_title" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.title?.top ?? 168)}px; left: 0; width: 100%; text-align: center;">
            <div style="font-family: 'Cinzel', serif; font-size: ${(cfg.title?.fontSize ?? 16)}px; font-weight: 800; color: ${(cfg.title?.color ?? '#084328')}; letter-spacing: 2px;">
              CERTIFICATE OF INTERNSHIP COMPLETION
            </div>
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #64748b; margin-top: 4px;">
              THIS CERTIFICATE IS PROUDLY PRESENTED TO
            </div>
          </div>

          <!-- 3. Candidate Full Name -->
          <div id="layer_name" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.name?.top ?? 218)}px; left: 0; width: 100%; text-align: center;">
            <div style="font-family: 'Playfair Display', serif; font-size: ${(cfg.name?.fontSize ?? 36)}px; font-weight: 700; color: ${(cfg.name?.color ?? '#084328')}; line-height: 1.1;">
              ${cert.student_name}
            </div>
            <div style="width: 220px; height: 2px; background: linear-gradient(90deg, transparent, #d97706, transparent); margin: 6px auto 0;"></div>
          </div>

          <!-- 4. Role & Introductory Statement -->
          <div id="layer_role" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.role?.top ?? 280)}px; left: 0; width: 100%; text-align: center;">
            <div style="font-size: 12px; color: #475569; margin-bottom: 4px;">
              In recognition of successfully completing the professional internship program at Alifeo, in the role of
            </div>
            <div style="font-family: 'Cinzel', serif; font-size: ${(cfg.role?.fontSize ?? 16)}px; font-weight: 800; color: ${(cfg.role?.color ?? '#084328')}; background: rgba(236, 253, 245, 0.9); border-left: 3px solid #059669; border-right: 3px solid #059669; padding: 3px 20px; border-radius: 4px; display: inline-block; letter-spacing: 0.5px;">
              ${cert.domain_role}
            </div>
          </div>

          <!-- 5. Body Contribution Paragraphs -->
          <div id="layer_body" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.body?.top ?? 340)}px; left: 70px; right: 70px; text-align: center;">
            <p style="font-size: ${(cfg.body?.fontSize ?? 10.5)}px; line-height: 1.45; color: ${(cfg.body?.color ?? '#334155')}; margin: 0 auto; max-width: 820px;">
              During the internship period, the candidate actively contributed to assigned projects, participated in professional workflows, and demonstrated practical knowledge, problem-solving abilities, creativity, and professional commitment.
            </p>
            <p style="font-size: ${(cfg.body?.fontSize ?? 10.5)}px; line-height: 1.45; color: ${(cfg.body?.color ?? '#334155')}; margin: 3px auto 0; max-width: 820px;">
              The candidate gained hands-on exposure to real-world projects, industry practices, collaborative teamwork, and practical implementation of skills within the organization.
            </p>
          </div>

          <!-- 6. Structured Internship Details Box (Aligned 4-Column Grid) -->
          <div id="layer_details" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.details?.top ?? 402)}px; left: ${(cfg.details?.left ?? 65)}px; width: ${(cfg.details?.left ? 'calc(1024px - ' + (cfg.details.left * 2) + 'px)' : '894px')}; display: ${(cfg.details?.visible !== false ? 'block' : 'none')};">
            <div style="background: rgba(248, 250, 252, 0.95); border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 18px; box-sizing: border-box; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              
              <!-- Header Bar of Details Box -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; padding-bottom: 3px; border-bottom: 1px solid rgba(226, 232, 240, 0.8);">
                <span style="font-size: 9.5px; font-weight: 800; letter-spacing: 1.5px; color: #084328;">INTERNSHIP DETAILS</span>
                <span style="font-size: 8.5px; font-weight: 600; color: #64748b; letter-spacing: 0.5px;">ALIFEO ACCREDITED CREDENTIAL</span>
              </div>

              <!-- 4-Column Balanced Grid: Every column lines up vertically -->
              <div style="display: grid; grid-template-columns: 29% 23% 26% 22%; gap: 5px 12px; font-size: ${(cfg.details?.fontSize ?? 10.5)}px; text-align: left;">
                
                <!-- ROW 1 -->
                <div style="display: flex; align-items: baseline; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <span style="color: #64748b; font-weight: 700; font-size: 10px;">Position:</span>
                  <span style="font-weight: 700; color: #084328; font-size: 10.5px; overflow: hidden; text-overflow: ellipsis;">${cert.domain_role}</span>
                </div>

                <div style="display: flex; align-items: baseline; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <span style="color: #64748b; font-weight: 700; font-size: 10px;">Department:</span>
                  <span style="font-weight: 700; color: #0f172a; font-size: 10.5px; overflow: hidden; text-overflow: ellipsis;">${cert.department || 'Technology & Product'}</span>
                </div>

                <div style="display: flex; align-items: baseline; gap: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <span style="color: #64748b; font-weight: 700; font-size: 10px;">Type:</span>
                  <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">Professional Internship</span>
                </div>

                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="color: #64748b; font-weight: 700; font-size: 10px;">Performance:</span>
                  <span style="font-weight: 800; color: #059669; font-size: 10px; background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.2); padding: 0 5px; border-radius: 3px;">${cert.grade || 'Outstanding'}</span>
                </div>

                <!-- ROW 2 -->
                <div style="display: flex; align-items: baseline; gap: 4px;">
                  <span style="color: #64748b; font-weight: 700; font-size: 10px;">Duration:</span>
                  <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">${cert.duration || '3 Months'}</span>
                </div>

                <div style="display: flex; align-items: baseline; gap: 4px;">
                  <span style="color: #64748b; font-weight: 700; font-size: 10px;">Start Date:</span>
                  <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">${cert.start_date || '01 Nov 2026'}</span>
                </div>

                <div style="display: flex; align-items: baseline; gap: 4px;">
                  <span style="color: #64748b; font-weight: 700; font-size: 10px;">Completion Date:</span>
                  <span style="font-weight: 700; color: #0f172a; font-size: 10.5px;">${cert.end_date || cert.issue_date}</span>
                </div>

                <div style="display: flex; align-items: baseline; gap: 4px;">
                  <span style="color: #64748b; font-weight: 700; font-size: 10px;">Credential:</span>
                  <span style="font-family: monospace; font-weight: 700; color: #084328; font-size: 9.5px;">${cert.id}</span>
                </div>

              </div>
            </div>
          </div>

          <!-- 7. Recognition Note -->
          <div id="layer_recognition" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.recognition?.top ?? 475)}px; left: 70px; right: 70px; text-align: center;">
            <div style="font-size: ${(cfg.recognition?.fontSize ?? 10)}px; color: #475569; max-width: 820px; margin: 0 auto; line-height: 1.35;">
              <strong>RECOGNITION:</strong> We appreciate the candidate's dedication, contribution, and efforts during the internship. We wish them continued success in their professional career and future endeavours.
            </div>
          </div>

          <!-- 8. Signatory Left: Mohd Khalid (Founder) -->
          <div id="layer_khalid" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.khalid_sig?.top ?? 508)}px; left: ${(cfg.khalid_sig?.left ?? 95)}px; width: 180px; text-align: center;">
            <div style="height: 48px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">
              <img src="${KHALID_SIGNATURE_BASE64}" alt="Mohd Khalid" class="real-signature-img" style="max-height: 46px; max-width: 140px; object-fit: contain;" />
            </div>
            <div style="width: 140px; height: 1px; background: #334155; margin: 2px auto 3px;"></div>
            <div style="font-size: 11.5px; font-weight: 800; color: #084328;">Mohd Khalid</div>
            <div style="font-size: 9px; font-weight: 600; color: #475569;">Founder – Alifeo</div>
          </div>

          <!-- 9. Middle QR Code & Verification ID -->
          <div id="layer_qr" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.qr?.top ?? 512)}px; left: ${(cfg.qr?.left ?? 440)}px; display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.95); border: 1px solid #e2e8f0; padding: 4px 8px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="width: 48px; height: 48px;">
              ${qrSvg}
            </div>
            <div style="text-align: left;">
              <div style="font-family: monospace; font-weight: 800; font-size: 10px; color: #084328;">ID: ${cert.id}</div>
              <div style="font-size: 8px; color: #64748b;">Scan to verify authentic credential</div>
            </div>
          </div>

          <!-- 10. Signatory Right: Mohammad Yahya (Co-Founder) -->
          <div id="layer_yahya" class="cert-dynamic-el" style="position: absolute; top: ${(cfg.yahya_sig?.top ?? 508)}px; left: ${(cfg.yahya_sig?.left ?? 745)}px; width: 190px; text-align: center;">
            <div style="height: 48px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">
              <img src="${YAHYA_SIGNATURE_BASE64}" alt="Mohammad Yahya" class="real-signature-img" style="max-height: 46px; max-width: 150px; object-fit: contain;" />
            </div>
            <div style="width: 150px; height: 1px; background: #334155; margin: 2px auto 3px;"></div>
            <div style="font-size: 11.5px; font-weight: 800; color: #084328;">Mohammad Yahya</div>
            <div style="font-size: 9px; font-weight: 600; color: #475569;">Co-Founder & Product Designer – Alifeo</div>
          </div>

        </div>
      </div>
    </div>
  </div>
  `;
}
