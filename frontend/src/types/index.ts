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

export interface AppointmentDetails {
  id: number;
  location_id: number;
  appointment_date: string;
  ticket_number: string;
  priority: number;
  patient_id: number | null;
  professional_id: number | null;
  office_id: number | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  called_at: string | null;
  attended_at: string | null;
  finished_at: string | null;
  absent_at: string | null;
  patient_first_name: string | null;
  patient_last_name: string | null;
  patient_document: string | null;
  professional_first_name: string | null;
  professional_last_name: string | null;
  professional_specialty: string | null;
  office_name: string | null;
  office_code: string | null;
  location_name: string | null;
  active: boolean;
}

export interface Location {
  id: number;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
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
}

export interface Office {
  id: number;
  location_id: number;
  code: string;
  name: string;
  area_type: string | null;
  floor_location: string | null;
  active: boolean;
}

export interface Patient {
  id: number;
  document_type: string;
  document_number: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
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
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

export interface RecentCall {
  id: number;
  appointment_id: number;
  called_at: string;
  retry_count: number;
  display_text: string | null;
  audio_text: string | null;
  ticket_number: string;
  patient_first_name: string | null;
  patient_last_name: string | null;
  office_name: string | null;
  office_code: string | null;
  professional_first_name: string | null;
  professional_last_name: string | null;
}

export interface SettingItem {
  id: number;
  location_id: number | null;
  key: string;
  value: string;
  description: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    locationId: number | null;
    professionalId: number | null;
  };
}

export interface DashboardStats {
  WAITING: number;
  CALLING: number;
  IN_SERVICE: number;
  COMPLETED: number;
  ABSENT: number;
  CANCELLED: number;
  TOTAL: number;
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  WAITING: 'bg-blue-100 text-blue-800',
  CALLING: 'bg-yellow-100 text-yellow-800',
  IN_SERVICE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  ABSENT: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-200 text-gray-600',
  RESCHEDULED: 'bg-purple-100 text-purple-800',
  TRANSFERRED: 'bg-orange-100 text-orange-800',
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  WAITING: 'En espera',
  CALLING: 'Llamando',
  IN_SERVICE: 'En atencion',
  COMPLETED: 'Finalizado',
  ABSENT: 'Ausente',
  CANCELLED: 'Cancelado',
  RESCHEDULED: 'Reprogramado',
  TRANSFERRED: 'Derivado',
};
