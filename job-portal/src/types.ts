export interface Job {
  id: string;
  title: string;
  company: string;
  company_logo?: string;
  city: string;
  work_mode: 'remote' | 'onsite' | 'hybrid';
  job_type: 'internship' | 'full_time' | 'part_time';
  stipend_salary: string;
  experience?: string;
  description: string;
  requirements?: string;
  skills: string; // comma-separated
  assignment_text?: string;
  employer_phone: string;
  status: 'approved' | 'pending_review';
  created_at: number;
}

export interface Application {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  candidate_name: string;
  candidate_phone: string;
  candidate_email: string;
  resume_url: string;
  portfolio_url?: string;
  experience?: string;
  cover_note?: string;
  status: 'applied' | 'under_review' | 'assignment_given' | 'shortlisted' | 'interview' | 'hired' | 'rejected';
  assignment_text?: string;
  assignment_submission?: string;
  created_at: number;
}

export interface ChatMessage {
  id: string;
  application_id: string;
  sender_type: 'candidate' | 'employer';
  sender_name: string;
  message: string;
  created_at: number;
}

export interface UserSession {
  phone: string;
  name?: string;
  role: 'candidate' | 'employer';
  company_name?: string;
}

export interface Env {
  DB: D1Database;
  DOMAIN: string;
  SUBDOMAIN: string;
  APP_URL: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_WABA_ID: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_TEMPLATE_NAME: string;
  WHATSAPP_TEMPLATE_LANGUAGE_CODE: string;
  WHATSAPP_VERIFY_TOKEN: string;
  ABLY_API_KEY: string;
}
