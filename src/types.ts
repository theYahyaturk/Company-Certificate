export interface LayoutConfig {
  show_logo?: boolean;
  logo?: { top: number; left: number; width: number; visible?: boolean };
  title?: { top: number; left: number; fontSize: number; color: string; visible?: boolean };
  name?: { top: number; left: number; fontSize: number; color: string; visible?: boolean };
  role?: { top: number; left: number; fontSize: number; color: string; visible?: boolean };
  body?: { top: number; left: number; fontSize: number; color: string; visible?: boolean };
  details?: { top: number; left: number; fontSize: number; color: string; visible?: boolean };
  recognition?: { top: number; left: number; fontSize: number; color: string; visible?: boolean };
  khalid_sig?: { top: number; left: number; scale: number; visible?: boolean };
  yahya_sig?: { top: number; left: number; scale: number; visible?: boolean };
  qr?: { top: number; left: number; scale: number; visible?: boolean };
}

export interface Certificate {
  id: string;
  student_name: string;
  student_email: string;
  domain_role: string;
  department?: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  issue_date: string;
  grade?: string;
  description?: string;
  instructor_name?: string;
  status: 'verified' | 'revoked';
  email_sent: number;
  created_at: number;
  template_id?: string;
  template_bg?: string;
  layout_config?: string; // JSON string of LayoutConfig
}

export interface Template {
  id: string;
  name: string;
  image_data: string;
  is_default: number;
  layout_config?: string; // JSON string of LayoutConfig
  created_at: number;
}

export interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  type: 'internship' | 'job';
  company: string;
  experience?: string;
  portfolio_url?: string;
  resume_url?: string;
  cover_note?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
  created_at: number;
}

export interface Env {
  DB: D1Database;
  MAIL_DB?: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  RESEND_API_KEY: string;
  ADMIN_PASSWORD: string;
  CLOUDFLARE_ZONE_ID: string;
  DOMAIN: string;
  SUBDOMAIN: string;
  APP_URL: string;
  HR_EMAIL: string;
  JWT_SECRET: string;
}
