import { Env, Certificate, Template } from './types';
import { renderHomePage } from './ui/home';
import { renderVerifyPage } from './ui/verify';
import { renderAdminLoginPage, renderAdminDashboard } from './ui/admin';
import { sendCertificateEmail } from './email';

function isAdminAuthenticated(req: Request, env: Env): boolean {
  const cookie = req.headers.get('Cookie') || '';
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return false;
  const token = match[1];
  return token === env.JWT_SECRET || token === 'alifeo_admin_active';
}

function generateCertId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ALF/INT/2026/${rand}`;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Route: GET /
    if (path === '/' && method === 'GET') {
      const html = renderHomePage(env.APP_URL || url.origin);
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Route: GET /verify/...
    if (path.startsWith('/verify/') && method === 'GET') {
      const rawId = decodeURIComponent(path.slice(8)).trim();
      const certIdUpper = rawId.toUpperCase();
      const certIdHyphen = rawId.replace(/\//g, '-').toUpperCase();
      const certIdSlash = rawId.replace(/-/g, '/').toUpperCase();
      let cert: Certificate | null = null;

      try {
        const row = await env.DB.prepare(
          'SELECT * FROM certificates WHERE UPPER(id) = ? OR UPPER(id) = ? OR UPPER(id) = ? LIMIT 1'
        ).bind(certIdUpper, certIdHyphen, certIdSlash).first<Certificate>();
        cert = row || null;

        // Log verification
        if (cert) {
          const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
          const userAgent = request.headers.get('User-Agent') || 'unknown';
          ctx.waitUntil(
            env.DB.prepare('INSERT INTO verification_logs (certificate_id, ip, user_agent, verified_at) VALUES (?, ?, ?, ?)')
              .bind(cert.id, clientIp, userAgent, Date.now())
              .run()
          );
        }
      } catch (err) {
        console.error('Database query error:', err);
      }

      const html = await renderVerifyPage(cert, rawId, env.APP_URL || url.origin);
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Route: GET /api/cert/...
    if (path.startsWith('/api/cert/') && method === 'GET') {
      const rawId = decodeURIComponent(path.slice(10)).trim();
      try {
        const cert = await env.DB.prepare(
          'SELECT * FROM certificates WHERE UPPER(id) = ? OR UPPER(id) = ? OR UPPER(id) = ? LIMIT 1'
        ).bind(rawId.toUpperCase(), rawId.replace(/\//g, '-').toUpperCase(), rawId.replace(/-/g, '/').toUpperCase()).first<Certificate>();
        if (!cert) return new Response(JSON.stringify({ error: 'Certificate not found' }), { status: 404 });
        return new Response(JSON.stringify(cert), { headers: { 'Content-Type': 'application/json' } });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Route: GET /admin
    if (path === '/admin' && method === 'GET') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(renderAdminLoginPage(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }

      try {
        const { results: certRows } = await env.DB.prepare('SELECT * FROM certificates ORDER BY created_at DESC LIMIT 100').all<Certificate>();
        const certs = certRows || [];

        const { results: tplRows } = await env.DB.prepare('SELECT * FROM templates ORDER BY is_default DESC, created_at DESC').all<Template>();
        const templates = tplRows || [];

        const total = certs.length;
        const verified = certs.filter(c => c.status === 'verified').length;
        const emailsSent = certs.filter(c => c.email_sent === 1).length;

        const html = renderAdminDashboard(certs, templates, { total, verified, emailsSent }, env.APP_URL || url.origin);
        return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      } catch (err: any) {
        return new Response('Database error: ' + err.message, { status: 500 });
      }
    }

    // Route: POST /api/admin/login
    if (path === '/api/admin/login' && method === 'POST') {
      const formData = await request.formData();
      const password = formData.get('password');

      if (password === env.ADMIN_PASSWORD) {
        const token = env.JWT_SECRET || 'alifeo_admin_active';
        return new Response(null, {
          status: 302,
          headers: {
            'Location': '/admin',
            'Set-Cookie': `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
          }
        });
      } else {
        return new Response(renderAdminLoginPage('Incorrect admin password. Please try again.'), {
          status: 401,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    }

    // Route: POST /api/admin/logout
    if (path === '/api/admin/logout' && method === 'POST') {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/admin',
          'Set-Cookie': `admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
        }
      });
    }

    // Route: POST /api/admin/templates (Upload template)
    if (path === '/api/admin/templates' && method === 'POST') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      try {
        const body = await request.json() as any;
        const id = `tpl_${crypto.randomUUID().slice(0, 8)}`;
        const name = (body.name || 'Custom Template').trim();
        const imageData = body.image_data;
        const layoutConfig = body.layout_config || null;

        if (!imageData) {
          return new Response(JSON.stringify({ error: 'Missing image data' }), { status: 400 });
        }

        await env.DB.prepare(`
          INSERT INTO templates (id, name, image_data, is_default, layout_config, created_at)
          VALUES (?, ?, ?, 0, ?, ?)
        `).bind(id, name, imageData, layoutConfig, Date.now()).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Route: POST /api/admin/templates/:id/layout (Save canvas layout)
    if (path.startsWith('/api/admin/templates/') && path.endsWith('/layout') && method === 'POST') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const tplId = decodeURIComponent(path.slice(21, -7)).trim();
      try {
        const body = await request.json() as any;
        const layoutConfig = body.layout_config;

        await env.DB.prepare('UPDATE templates SET layout_config = ? WHERE id = ?').bind(layoutConfig, tplId).run();
        
        // Also update existing certificates that use this template
        await env.DB.prepare('UPDATE certificates SET layout_config = ? WHERE template_id = ?').bind(layoutConfig, tplId).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Route: DELETE /api/admin/templates/:id
    if (path.startsWith('/api/admin/templates/') && method === 'DELETE') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      const tplId = decodeURIComponent(path.slice(21)).trim();
      try {
        await env.DB.prepare('DELETE FROM templates WHERE id = ? AND is_default = 0').bind(tplId).run();
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Protected API: POST /api/admin/certificates
        // Route: POST /api/admin/certificates/update (Edit certificate details)
    if (path === '/api/admin/certificates/update' && method === 'POST') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      try {
        const body = await request.json() as any;
        const certId = body.id;
        if (!certId) {
          return new Response(JSON.stringify({ error: 'Missing certificate id' }), { status: 400 });
        }

        const existing = await env.DB.prepare('SELECT * FROM certificates WHERE id = ?').bind(certId).first<Certificate>();
        if (!existing) {
          return new Response(JSON.stringify({ error: 'Certificate not found' }), { status: 404 });
        }

        const student_name = body.student_name ?? existing.student_name;
        const student_email = body.student_email ?? existing.student_email;
        const domain_role = body.domain_role ?? existing.domain_role;
        const department = body.department ?? existing.department ?? 'Technology & Product';
        const duration = body.duration ?? existing.duration ?? '3 Months';
        const start_date = body.start_date ?? existing.start_date;
        const end_date = body.end_date ?? existing.end_date;
        const issue_date = body.issue_date ?? existing.issue_date;
        const grade = body.grade ?? existing.grade ?? 'Outstanding';
        const status = body.status ?? existing.status;
        const template_id = body.template_id ?? existing.template_id;

        let template_bg = existing.template_bg;
        let layout_config = existing.layout_config;
        if (body.template_id && body.template_id !== existing.template_id) {
          const tpl = await env.DB.prepare('SELECT * FROM templates WHERE id = ?').bind(body.template_id).first<Template>();
          if (tpl) {
            template_bg = tpl.image_data;
            layout_config = tpl.layout_config;
          }
        }

        await env.DB.prepare(`
          UPDATE certificates 
          SET student_name = ?, student_email = ?, domain_role = ?, department = ?, duration = ?,
              start_date = ?, end_date = ?, issue_date = ?, grade = ?, status = ?,
              template_id = ?, template_bg = ?, layout_config = ?
          WHERE id = ?
        `).bind(
          student_name, student_email, domain_role, department, duration,
          start_date, end_date, issue_date, grade, status,
          template_id, template_bg, layout_config, certId
        ).run();

        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    if (path === '/api/admin/certificates' && method === 'POST') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      try {
        const body = await request.json() as any;
        const certId = (body.id && body.id.trim()) ? body.id.trim() : generateCertId();

        // Check if custom template was selected
        let templateId = body.template_id || 'tpl_official_waves';
        let templateBg = null;
        let layoutConfig = null;

        const tpl = await env.DB.prepare('SELECT image_data, layout_config FROM templates WHERE id = ?').bind(templateId).first<any>();
        if (tpl) {
          templateBg = tpl.image_data;
          layoutConfig = tpl.layout_config;
        }

        const cert: Certificate = {
          id: certId,
          student_name: body.student_name.trim(),
          student_email: body.student_email.trim(),
          domain_role: body.domain_role.trim(),
          department: body.department ? body.department.trim() : 'Technology & Product',
          duration: body.duration ? body.duration.trim() : '3 Months',
          start_date: body.start_date || '01 Nov 2026',
          end_date: body.end_date || '31 Jan 2027',
          issue_date: body.issue_date || new Date().toISOString().split('T')[0],
          grade: body.grade || 'Outstanding',
          description: body.description || '',
          instructor_name: body.instructor_name || 'Yahya',
          status: 'verified',
          email_sent: 0,
          created_at: Date.now(),
          template_id: templateId,
          template_bg: templateBg || undefined,
          layout_config: layoutConfig || undefined
        };

        // Insert into D1
        await env.DB.prepare(`
          INSERT INTO certificates (id, student_name, student_email, domain_role, duration, start_date, end_date, issue_date, grade, description, instructor_name, status, email_sent, created_at, template_id, template_bg, department, layout_config)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          cert.id, cert.student_name, cert.student_email, cert.domain_role, cert.duration,
          cert.start_date, cert.end_date, cert.issue_date, cert.grade, cert.description,
          cert.instructor_name, cert.status, cert.email_sent, cert.created_at,
          cert.template_id || 'tpl_official_waves', cert.template_bg || null, cert.department || 'Technology & Product',
          cert.layout_config || null
        ).run();

        // Dispatch email via Resend if requested
        if (body.send_email) {
          const emailRes = await sendCertificateEmail(cert, env);
          if (emailRes.success) {
            cert.email_sent = 1;
            await env.DB.prepare('UPDATE certificates SET email_sent = 1 WHERE id = ?').bind(cert.id).run();
          } else {
            console.warn('Email send warning:', emailRes.error);
          }
        }

        return new Response(JSON.stringify({ success: true, certificate: cert }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Protected API: POST /api/admin/resend-email
    if (path === '/api/admin/resend-email' && method === 'POST') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      try {
        const body = await request.json() as any;
        const cert = await env.DB.prepare('SELECT * FROM certificates WHERE id = ?').bind(body.id).first<Certificate>();
        if (!cert) return new Response(JSON.stringify({ error: 'Certificate not found' }), { status: 404 });

        const emailRes = await sendCertificateEmail(cert, env);
        if (emailRes.success) {
          await env.DB.prepare('UPDATE certificates SET email_sent = 1 WHERE id = ?').bind(cert.id).run();
          return new Response(JSON.stringify({ success: true }));
        } else {
          return new Response(JSON.stringify({ error: emailRes.error || 'Failed to send email' }), { status: 500 });
        }
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Protected API: POST /api/admin/revoke
    if (path === '/api/admin/revoke' && method === 'POST') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      try {
        const body = await request.json() as any;
        await env.DB.prepare('UPDATE certificates SET status = ? WHERE id = ?').bind(body.status, body.id).run();
        return new Response(JSON.stringify({ success: true }));
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Protected API: POST /api/admin/bulk-issue
    if (path === '/api/admin/bulk-issue' && method === 'POST') {
      if (!isAdminAuthenticated(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }

      try {
        const body = await request.json() as any;
        const lines = (body.csv || '').split('\n').map((l: string) => l.trim()).filter(Boolean);
        const templateId = body.template_id || 'tpl_official_waves';
        let templateBg = null;
        let layoutConfig = null;

        const tpl = await env.DB.prepare('SELECT image_data, layout_config FROM templates WHERE id = ?').bind(templateId).first<any>();
        if (tpl) {
          templateBg = tpl.image_data;
          layoutConfig = tpl.layout_config;
        }

        let count = 0;
        for (const line of lines) {
          const parts = line.split(',').map((p: string) => p.trim());
          if (parts.length < 3) continue;

          const [name, email, role, duration, grade, dept] = parts;
          const cert: Certificate = {
            id: generateCertId(),
            student_name: name,
            student_email: email,
            domain_role: role,
            department: dept || 'Technology & Product',
            duration: duration || '3 Months',
            start_date: '01 Nov 2026',
            end_date: '31 Jan 2027',
            issue_date: new Date().toISOString().split('T')[0],
            grade: grade || 'Outstanding',
            description: '',
            instructor_name: 'Yahya',
            status: 'verified',
            email_sent: 0,
            created_at: Date.now(),
            template_id: templateId,
            template_bg: templateBg || undefined,
            layout_config: layoutConfig || undefined
          };

          await env.DB.prepare(`
            INSERT INTO certificates (id, student_name, student_email, domain_role, duration, start_date, end_date, issue_date, grade, description, instructor_name, status, email_sent, created_at, template_id, template_bg, department, layout_config)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            cert.id, cert.student_name, cert.student_email, cert.domain_role, cert.duration,
            cert.start_date, cert.end_date, cert.issue_date, cert.grade, cert.description,
            cert.instructor_name, cert.status, cert.email_sent, cert.created_at,
            cert.template_id || 'tpl_official_waves', cert.template_bg || null, cert.department || 'Technology & Product',
            cert.layout_config || null
          ).run();

          // Dispatch email
          const emailRes = await sendCertificateEmail(cert, env);
          if (emailRes.success) {
            await env.DB.prepare('UPDATE certificates SET email_sent = 1 WHERE id = ?').bind(cert.id).run();
          }
          count++;
        }

        return new Response(JSON.stringify({ success: true, count }));
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // 404 Fallback (Clean page with Back to Check Your Certificate)
    const notFoundHtml = await renderVerifyPage(null, 'Page Not Found', env.APP_URL || url.origin);
    return new Response(notFoundHtml, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
};
