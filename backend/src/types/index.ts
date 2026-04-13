// Domain types

export interface Location {
  id: number;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role_id: number;
  location_id: number | null;
  active: boolean;
  last_access: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role_id: number;
  role_code: string;
  location_id: number | null;
  active: boolean;
  last_access: Date | null;
}

export interface Professional {
  id: number;
  license_number: string | null;
  first_name: string;
  last_name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  user_id: number | null;
  location_id: number | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Office {
  id: number;
  location_id: number;
  code: string;
  name: string;
  area_type: string | null;
  floor_location: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Patient {
  id: number;
  document_type: string;
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: Date | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'WAITING'
  | 'CALLING'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'ABSENT'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'TRANSFERRED';

export interface Appointment {
  id: number;
  location_id: number;
  appointment_date: Date;
  ticket_number: string;
  priority: number;
  patient_id: number | null;
  professional_id: number | null;
  office_id: number | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: Date;
  called_at: Date | null;
  attended_at: Date | null;
  finished_at: Date | null;
  absent_at: Date | null;
  created_by: number | null;
  updated_by: number | null;
  active: boolean;
}

export interface AppointmentDetails extends Appointment {
  patient_first_name: string | null;
  patient_last_name: string | null;
  patient_document: string | null;
  professional_first_name: string | null;
  professional_last_name: string | null;
  professional_specialty: string | null;
  office_name: string | null;
  office_code: string | null;
  location_name: string | null;
}

export interface HistoryEntry {
  id: number;
  appointment_id: number;
  previous_status: string | null;
  new_status: string;
  event_at: Date;
  user_id: number | null;
  comment: string | null;
  event_source: string;
  audio_played: boolean;
  audio_text: string | null;
}

export interface Setting {
  id: number;
  location_id: number | null;
  key: string;
  value: string;
  description: string | null;
  active: boolean;
  updated_at: Date;
}

export interface Screen {
  id: number;
  location_id: number;
  name: string;
  type: string;
  floor_location: string | null;
  resolution: string | null;
  active: boolean;
  created_at: Date;
}

export interface RecentCall {
  id: number;
  appointment_id: number;
  called_at: Date;
  retry_count: number;
  display_text: string | null;
  audio_text: string | null;
  screen_id: number | null;
  user_id: number | null;
}

// State machine
export const VALID_TRANSITIONS: Record<AppointmentStatus, { to: AppointmentStatus; roles: string[] }[]> = {
  PENDING: [
    { to: 'WAITING', roles: ['RECEPTIONIST', 'ADMIN'] },
  ],
  WAITING: [
    { to: 'CALLING',     roles: ['PROFESSIONAL', 'ADMIN'] },
    { to: 'CANCELLED',   roles: ['RECEPTIONIST', 'ADMIN'] },
    { to: 'TRANSFERRED', roles: ['RECEPTIONIST', 'PROFESSIONAL', 'ADMIN'] },
    { to: 'ABSENT',      roles: ['RECEPTIONIST', 'ADMIN'] },
  ],
  CALLING: [
    { to: 'CALLING',     roles: ['PROFESSIONAL', 'ADMIN'] }, // re-call
    { to: 'IN_SERVICE',  roles: ['PROFESSIONAL', 'ADMIN'] },
    { to: 'ABSENT',      roles: ['PROFESSIONAL', 'RECEPTIONIST', 'ADMIN'] },
    { to: 'TRANSFERRED', roles: ['PROFESSIONAL', 'ADMIN'] },
  ],
  IN_SERVICE: [
    { to: 'COMPLETED',  roles: ['PROFESSIONAL', 'ADMIN'] },
    { to: 'CANCELLED',  roles: ['PROFESSIONAL', 'ADMIN'] },
  ],
  COMPLETED: [],
  ABSENT: [
    { to: 'RESCHEDULED', roles: ['RECEPTIONIST', 'ADMIN'] },
    { to: 'WAITING',     roles: ['RECEPTIONIST', 'ADMIN'] },
  ],
  CANCELLED: [],
  RESCHEDULED: [
    { to: 'WAITING', roles: ['RECEPTIONIST', 'ADMIN'] },
  ],
  TRANSFERRED: [
    { to: 'WAITING', roles: ['RECEPTIONIST', 'ADMIN'] },
  ],
};

// Auth types
export interface AuthUser {
  userId: number;
  username: string;
  role: string;
  locationId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
