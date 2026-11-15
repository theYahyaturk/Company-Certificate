import { Certificate, Env } from './types';
import { ALIFEO_LOGO_BASE64 } from './logo-base64';

export async function sendCertificateEmail(cert: Certificate, env: Env): Promise<{ success: boolean; error?: string }> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'Missing RESEND_API_KEY' };
  }

  const certUrl = `${env.APP_URL || 'https://certificate.alifeo.com'}/verify/${cert.id}`;

  // LinkedIn Add to Profile URL
  const issueYear = cert.issue_date.slice(0, 4) || '2026';
  const issueMonth = cert.issue_date.slice(5, 7) || '1';
  const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.domain_role)}&organizationName=${encodeURIComponent('Alifeo')}&issueYear=${issueYear}&issueMonth=${parseInt(issueMonth)}&certUrl=${encodeURIComponent(certUrl)}&certId=${encodeURIComponent(cert.id)}`;

  const subject = `🎓 Congratulations ${cert.student_name}! Your Alifeo Certificate of Completion (${cert.id})`;
  const snippet = `Congratulations, ${cert.student_name}! Official Certificate of Completion & Internship for ${cert.domain_role}. Credential ID: ${cert.id}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Alifeo Certificate of Completion</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 36px 30px 24px; background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%); border-bottom: 1px solid #312e81;">
              <img src="${ALIFEO_LOGO_BASE64}" alt="Alifeo" style="height: 48px; max-width: 180px; object-fit: contain; margin-bottom: 16px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Congratulations, ${cert.student_name}! 🎓</h1>
              <p style="margin: 8px 0 0; color: #a5b4fc; font-size: 14px;">Official Certificate of Completion & Internship</p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Dear <strong>${cert.student_name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                We are proud to recognize your outstanding dedication and successful completion of your internship tenure at <strong>Alifeo</strong>. Your official digital credential is now live and cryptographically verified on our portal.
              </p>

              <!-- Certificate Detail Box -->
              <table role="presentation" width="100%" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; margin-bottom: 28px; padding: 18px 20px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px; width: 40%;">Domain / Role:</td>
                  <td style="padding: 6px 0; color: #38bdf8; font-size: 14px; font-weight: 600;">${cert.domain_role}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Credential ID:</td>
                  <td style="padding: 6px 0; color: #f1f5f9; font-size: 14px; font-family: monospace; font-weight: 700;">${cert.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Duration:</td>
                  <td style="padding: 6px 0; color: #e2e8f0; font-size: 13px;">${cert.duration || 'Full Internship Period'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Issue Date:</td>
                  <td style="padding: 6px 0; color: #e2e8f0; font-size: 13px;">${cert.issue_date}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Performance:</td>
                  <td style="padding: 6px 0; color: #4ade80; font-size: 13px; font-weight: 600;">${cert.grade || 'Outstanding'}</td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="${certUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                      View & Download Certificate 📄
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${linkedInUrl}" target="_blank" style="display: inline-block; background-color: #0077b5; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 8px; font-size: 13px; font-weight: 600;">
                      + Add to LinkedIn Profile 🚀
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5; text-align: center;">
                Anyone can verify the authenticity of your credential by scanning the QR code on your certificate or visiting: <br/>
                <a href="${certUrl}" style="color: #38bdf8; word-break: break-all;">${certUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 14px; font-weight: 600; color: #f1f5f9;">Alifeo HR & Verification Team</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Website: <a href="https://alifeo.com" style="color: #64748b; text-decoration: underline;">alifeo.com</a> | Verification: <a href="https://certificate.alifeo.com" style="color: #64748b; text-decoration: underline;">certificate.alifeo.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Alifeo HR <${env.HR_EMAIL || 'hr@alifeo.com'}>`,
        to: [cert.student_email],
        subject,
        html: htmlContent
      })
    });

    const resData = await res.json() as any;
    if (!res.ok) {
      return { success: false, error: resData.message || JSON.stringify(resData) };
    }

    // Save outbound record to mail.alifeo.com's database (so it appears in Sent folder)
    if (env.MAIL_DB) {
      try {
        const emailId = `cert_mail_${crypto.randomUUID()}`;
        const threadId = resData.id || emailId;
        const now = new Date().toISOString();
        await env.MAIL_DB.prepare(`
          INSERT INTO emails (
            id, message_id, thread_id, direction, folder,
            sender, sender_name, recipient, subject, snippet,
            text_body, html_body, is_read, is_starred, has_attachments, created_at
          ) VALUES (?, ?, ?, 'outbound', 'sent', 'hr@alifeo.com', 'Alifeo HR', ?, ?, ?, ?, ?, 1, 0, 0, ?)
        `).bind(
          emailId,
          resData.id || null,
          threadId,
          cert.student_email,
          subject,
          snippet,
          snippet,
          htmlContent,
          now
        ).run();
      } catch (mailDbErr) {
        console.warn('[MAIL_DB Warning] Failed to log sent email to mail.alifeo.com:', mailDbErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
