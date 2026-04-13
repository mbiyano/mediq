import { create } from 'zustand';
import { appointmentsApi } from '@/services/api';
import type { AppointmentDetails, DashboardStats } from '@/types';

interface AppointmentsState {
  appointments: AppointmentDetails[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;

  fetchAppointments: (filters?: Record<string, string | number>) => Promise<void>;
  fetchStats: (locationId: number, date?: string) => Promise<void>;
  updateAppointmentInList: (appointment: AppointmentDetails) => void;
  addAppointment: (appointment: AppointmentDetails) => void;
  removeAppointment: (id: number) => void;
}

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  appointments: [],
  stats: null,
  loading: false,
  error: null,

  fetchAppointments: async (filters) => {
    set({ loading: true, error: null });
    try {
      const appointments = await appointmentsApi.list(filters);
      set({ appointments, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar turnos';
      set({ error: message, loading: false });
    }
  },

  fetchStats: async (locationId, date) => {
    try {
      const stats = await appointmentsApi.getStats(locationId, date);
      set({ stats });
    } catch {
      // stats are non-critical
    }
  },

  updateAppointmentInList: (appointment) => {
    set({
      appointments: get().appointments.map((a) => (a.id === appointment.id ? appointment : a)),
    });
  },

  addAppointment: (appointment) => {
    set({ appointments: [appointment, ...get().appointments] });
  },

  removeAppointment: (id) => {
    set({ appointments: get().appointments.filter((a) => a.id !== id) });
  },
}));
