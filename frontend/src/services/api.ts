import axios from 'axios';
import type {
  LoginResponse,
  AppointmentDetails,
  Location,
  Professional,
  Office,
  Patient,
  PublicUser,
  Role,
  RecentCall,
  SettingItem,
  DashboardStats,
} from '@/types';

// In dev: VITE_API_URL is empty, Vite proxy handles /api → localhost:3000
// In prod: VITE_API_URL = https://mediq-backend.onrender.com (or similar)
export const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — try refresh (skip for auth endpoints)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post<LoginResponse>(`${API_BASE}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──
export const authApi = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post<LoginResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),
  me: () => api.get<{ user: LoginResponse['user'] }>('/auth/me').then((r) => r.data.user),
};

// ── Appointments ──
export const appointmentsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<AppointmentDetails[]>('/appointments', { params }).then((r) => r.data),
  getById: (id: number) =>
    api.get<AppointmentDetails>(`/appointments/${id}`).then((r) => r.data),
  create: (data: {
    location_id: number;
    patient_id?: number | null;
    professional_id?: number | null;
    office_id?: number | null;
    priority?: number;
    notes?: string | null;
    patient_first_name?: string;
    patient_last_name?: string;
    patient_document?: string;
  }) => api.post<AppointmentDetails>('/appointments', data).then((r) => r.data),
  changeStatus: (
    id: number,
    status: string,
    comment?: string | null,
    transfer?: { target_professional_id?: number; target_office_id?: number },
  ) =>
    api
      .patch<{ appointment: AppointmentDetails; audioText: string | null }>(`/appointments/${id}/status`, {
        status,
        comment,
        ...transfer,
      })
      .then((r) => r.data),
  getStats: (locationId: number, date?: string) =>
    api.get<DashboardStats>(`/appointments/stats/${locationId}`, { params: date ? { date } : {} }).then((r) => r.data),
  getHistory: (id: number) =>
    api.get(`/appointments/${id}/history`).then((r) => r.data),
};

// ── Locations ──
export const locationsApi = {
  list: () => api.get<Location[]>('/locations').then((r) => r.data),
  getById: (id: number) => api.get<Location>(`/locations/${id}`).then((r) => r.data),
  create: (data: Partial<Location>) => api.post<Location>('/locations', data).then((r) => r.data),
  update: (id: number, data: Partial<Location>) => api.put<Location>(`/locations/${id}`, data).then((r) => r.data),
};

// ── Professionals ──
export const professionalsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<Professional[]>('/professionals', { params }).then((r) => r.data),
  getById: (id: number) => api.get<Professional>(`/professionals/${id}`).then((r) => r.data),
  create: (data: Partial<Professional>) => api.post<Professional>('/professionals', data).then((r) => r.data),
  update: (id: number, data: Partial<Professional>) =>
    api.put<Professional>(`/professionals/${id}`, data).then((r) => r.data),
};

// ── Offices ──
export const officesApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<Office[]>('/offices', { params }).then((r) => r.data),
  getById: (id: number) => api.get<Office>(`/offices/${id}`).then((r) => r.data),
  create: (data: Partial<Office>) => api.post<Office>('/offices', data).then((r) => r.data),
  update: (id: number, data: Partial<Office>) =>
    api.put<Office>(`/offices/${id}`, data).then((r) => r.data),
};

// ── Patients ──
export const patientsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<Patient[]>('/patients', { params }).then((r) => r.data),
  getById: (id: number) => api.get<Patient>(`/patients/${id}`).then((r) => r.data),
  create: (data: Partial<Patient>) => api.post<Patient>('/patients', data).then((r) => r.data),
  update: (id: number, data: Partial<Patient>) =>
    api.put<Patient>(`/patients/${id}`, data).then((r) => r.data),
};

// ── Users ──
export const usersApi = {
  list: () => api.get<PublicUser[]>('/users').then((r) => r.data),
  getById: (id: number) => api.get<PublicUser>(`/users/${id}`).then((r) => r.data),
  create: (data: Record<string, unknown>) => api.post<PublicUser>('/users', data).then((r) => r.data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put<PublicUser>(`/users/${id}`, data).then((r) => r.data),
};

// ── Roles ──
export const rolesApi = {
  list: () => api.get<Role[]>('/roles').then((r) => r.data),
};

// ── Settings ──
export const settingsApi = {
  list: (locationId?: number) =>
    api.get<SettingItem[]>('/settings', { params: locationId ? { location_id: locationId } : {} }).then((r) => r.data),
  upsert: (data: { key: string; value: string; location_id?: number; description?: string }) =>
    api.put<SettingItem>('/settings', data).then((r) => r.data),
};

// ── Reports ──
export const reportsApi = {
  appointmentsByDate: (params: { date_from: string; date_to: string; location_id?: number }) =>
    api.get('/reports/appointments-by-date', { params }).then((r) => r.data),
  waitTimes: (params: { date_from: string; date_to: string; location_id?: number }) =>
    api.get('/reports/wait-times', { params }).then((r) => r.data),
  byProfessional: (params: { date_from: string; date_to: string; location_id?: number }) =>
    api.get('/reports/by-professional', { params }).then((r) => r.data),
  eventHistory: (params: { date_from: string; date_to: string; location_id?: number }) =>
    api.get('/reports/event-history', { params }).then((r) => r.data),
};

// ── Public (no auth) ──
export const publicApi = {
  appointments: (locationId: number) =>
    axios.get<AppointmentDetails[]>(`${API_BASE}/api/public/appointments/location/${locationId}`).then((r) => r.data),
  calls: (locationId: number, limit = 5) =>
    axios.get<RecentCall[]>(`${API_BASE}/api/public/calls/location/${locationId}`, { params: { limit } }).then((r) => r.data),
  settings: (locationId: number) =>
    axios.get<SettingItem[]>(`${API_BASE}/api/public/settings/location/${locationId}`).then((r) => r.data),
};

export default api;
