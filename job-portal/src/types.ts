export type UserRole = 'job_seeker' | 'employer';

export interface User {
  phone: string;
  name?: string;
  email?: string;
  active_role: UserRole;
  created_at: number;
  updated_at: number;
}

export interface UserSession {
  phone: string;
  name?: string;
  email?: string;
  active_role: UserRole;
  company_name?: string;
}

export interface JobSeekerProfile {
  phone: string;
  name: string;
  email: string;
  photo_url?: string;
  headline?: string;
  location?: string;
  education?: string;
  experience_summary?: string;
  skills: string; // comma-separated
  portfolio_url?: string;
  linkedin_url?: string;
  preferred_titles?: string;
  job_category?: string;
  industry?: string;
  experience_level?: string;
  years_of_experience?: string;
  preferred_job_types?: string; // full_time,internship,part_time,contract
  salary_expectation?: string;
  preferred_locations?: string;
  work_modes?: string; // remote,hybrid,onsite
  notice_period?: string;
  is_immediate_joiner?: number; // 0 or 1
  current_resume_id?: string;
  created_at: number;
  updated_at: number;
}

export interface Resume {
  id: string;
  user_phone: string;
  filename: string;
  file_data: string; // Base64 data
  file_size: number;
  mime_type: string;
  is_current: number; // 1 or 0
  uploaded_at: number;
}

export type EmployerVerificationStatus = 'unverified' | 'verification_pending' | 'verified' | 'rejected' | 'suspended';

export interface EmployerProfile {
  phone: string;
  company_name: string;
  logo_url?: string;
  industry?: string;
  website?: string;
  official_email?: string;
  phone_contact?: string;
  contact_person?: string;
  company_address?: string;
  description?: string;
  verification_status: EmployerVerificationStatus;
  verification_notes?: string;
  created_at: number;
  updated_at: number;
}

export type JobStatus = 'draft' | 'pending_review' | 'changes_requested' | 'approved' | 'paused' | 'closed' | 'rejected' | 'removed';
export type WorkMode = 'remote' | 'onsite' | 'hybrid';
export type JobType = 'internship' | 'full_time' | 'part_time' | 'contract';

export interface ScreeningQuestion {
  id: string;
  question: string;
  required: boolean;
}

export interface Job {
  id: string;
  employer_phone: string;
  company_name: string;
  company?: string;
  company_logo?: string;
  title: string;
  department?: string;
  category: string;
  description: string;
  responsibilities?: string;
  qualifications?: string;
  required_skills: string;
  skills?: string;
  experience_level: string; // Fresher, 1-2 yrs, etc.
  min_salary?: number;
  max_salary?: number;
  salary_display: string;
  stipend_salary?: string;
  job_type: JobType;
  work_mode: WorkMode;
  city: string;
  openings: number;
  deadline?: string;
  screening_questions_json?: string;
  status: JobStatus;
  admin_feedback?: string;
  
  // Location & Geospatial fields
  workplace_name?: string;
  workplace_address?: string;
  state?: string;
  pincode?: string;
  workplace_type?: string; // Office, Factory, Retail Shop, Warehouse, Hospital, Restaurant, etc.
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  is_hiring_active?: number;

  created_at: number;
  updated_at: number;
}

export interface CompanyLocationGroup {
  company_name: string;
  company_logo?: string;
  workplace_name?: string;
  workplace_address?: string;
  city: string;
  state?: string;
  pincode?: string;
  workplace_type?: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  openings_count: number;
  jobs: Job[];
  verification_status: string;
}

export type ApplicationStatus = 'applied' | 'under_review' | 'shortlisted' | 'interview' | 'selected' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  job_id: string;
  job_title?: string;
  company_name?: string;
  company?: string;
  city?: string;
  work_mode?: string;
  salary_display?: string;
  candidate_phone: string;
  candidate_name: string;
  candidate_email?: string;
  resume_id: string;
  resume_filename: string;
  resume_snapshot_data: string;
  resume_mime_type: string;
  screening_answers_json?: string;
  cover_note?: string;
  status: ApplicationStatus;
  employer_internal_notes?: string;
  created_at: number;
  updated_at: number;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  from_status: string;
  to_status: string;
  changed_by_phone: string;
  changed_by_role: string;
  notes?: string;
  created_at: number;
}

export type InterviewType = 'online' | 'in_person' | 'phone';
export type InterviewStatus = 'scheduled' | 'rescheduled' | 'completed' | 'cancelled';

export interface Interview {
  id: string;
  application_id: string;
  job_id: string;
  candidate_phone: string;
  employer_phone: string;
  scheduled_date: string;
  scheduled_time: string;
  interview_type: InterviewType;
  location_or_link: string;
  instructions?: string;
  status: InterviewStatus;
  reschedule_reason?: string;
  created_at: number;
  updated_at: number;
}

export interface Conversation {
  id: string;
  job_id: string;
  application_id: string;
  candidate_phone: string;
  employer_phone: string;
  is_enabled: number;
  last_message_at: number;
  created_at: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  application_id: string;
  sender_phone: string;
  sender_role: 'candidate' | 'employer';
  sender_name: string;
  message: string;
  is_read: number;
  created_at: number;
}

export interface Report {
  id: string;
  reporter_phone: string;
  reporter_role: string;
  target_type: 'job' | 'employer' | 'conversation' | 'candidate';
  target_id: string;
  reason_category: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: number;
}

export interface AdminAuditLog {
  id: string;
  admin_user: string;
  action: string;
  target_type: string;
  target_id: string;
  reason?: string;
  previous_status?: string;
  new_status?: string;
  created_at: number;
}

export interface NotificationItem {
  id: string;
  recipient_phone: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: number;
  created_at: number;
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
