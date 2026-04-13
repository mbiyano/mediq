import { useEffect, useCallback } from 'react';
import { useAppointmentsStore } from '@/stores/appointments.store';
import { useSocketEvent } from '@/hooks/useSocket';
import type { AppointmentDetails } from '@/types';

interface AppointmentSocketPayload {
  appointment: AppointmentDetails;
  audioText?: string | null;
}

export function useAppointmentsRealtime(locationId: number | null) {
  const { fetchAppointments, fetchStats, updateAppointmentInList, addAppointment } = useAppointmentsStore();

  const handleAppointmentEvent = useCallback(
    (data: AppointmentSocketPayload) => {
      updateAppointmentInList(data.appointment);
      if (locationId) fetchStats(locationId);
    },
    [updateAppointmentInList, fetchStats, locationId],
  );

  const handleAppointmentCreated = useCallback(
    (data: AppointmentSocketPayload) => {
      addAppointment(data.appointment);
      if (locationId) fetchStats(locationId);
    },
    [addAppointment, fetchStats, locationId],
  );

  useSocketEvent('appointment:called', handleAppointmentEvent, [handleAppointmentEvent]);
  useSocketEvent('appointment:recalled', handleAppointmentEvent, [handleAppointmentEvent]);
  useSocketEvent('appointment:in_service', handleAppointmentEvent, [handleAppointmentEvent]);
  useSocketEvent('appointment:completed', handleAppointmentEvent, [handleAppointmentEvent]);
  useSocketEvent('appointment:absent', handleAppointmentEvent, [handleAppointmentEvent]);
  useSocketEvent('appointment:cancelled', handleAppointmentEvent, [handleAppointmentEvent]);
  useSocketEvent('appointment:transferred', handleAppointmentEvent, [handleAppointmentEvent]);
  useSocketEvent('appointment:updated', handleAppointmentEvent, [handleAppointmentEvent]);
  useSocketEvent('appointment:created', handleAppointmentCreated, [handleAppointmentCreated]);

  useEffect(() => {
    if (!locationId) return;
    const today = new Date().toISOString().split('T')[0];
    fetchAppointments({ location_id: locationId, date: today });
    fetchStats(locationId, today);
  }, [locationId, fetchAppointments, fetchStats]);
}
