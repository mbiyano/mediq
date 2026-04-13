import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { useAuthStore } from '@/stores/auth.store';
import { useAppointmentsStore } from '@/stores/appointments.store';
import { useAppointmentsRealtime } from '@/hooks/useAppointments';
import { appointmentsApi } from '@/services/api';
import type { AppointmentStatus, AppointmentDetails } from '@/types';

export default function ReceptionistPage() {
  const user = useAuthStore((s) => s.user);
  const { appointments, loading, fetchAppointments, addAppointment, updateAppointmentInList } = useAppointmentsStore();
  const locationId = user?.locationId ?? 1;

  useAppointmentsRealtime(locationId);

  const [formOpen, setFormOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<Record<string, string | number>>({});

  const handleFilter = useCallback(
    (filters: Record<string, string | number>) => {
      setCurrentFilters(filters);
      fetchAppointments(filters);
    },
    [fetchAppointments],
  );

  const handleChangeStatus = useCallback(
    async (appointmentId: number, status: AppointmentStatus) => {
      try {
        const result = await appointmentsApi.changeStatus(appointmentId, status);
        updateAppointmentInList(result.appointment);
      } catch (err) {
        // Could add toast notification here
      }
    },
    [updateAppointmentInList],
  );

  const handleCreated = useCallback(
    (appointment: AppointmentDetails) => {
      addAppointment(appointment);
    },
    [addAppointment],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Secretaria</h2>
          <p className="text-muted-foreground">Gestion de turnos del dia</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Turno
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentFilters locationId={locationId} onFilter={handleFilter} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Turnos ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={appointments}
            role={user?.role ?? ''}
            onChangeStatus={handleChangeStatus}
            loading={loading}
          />
        </CardContent>
      </Card>

      <AppointmentForm
        locationId={locationId}
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
