import { useCallback, useMemo } from 'react';
import {
  PhoneCall,
  PhoneForwarded,
  UserCheck,
  CheckCircle2,
  UserX,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useAppointmentsStore } from '@/stores/appointments.store';
import { useAppointmentsRealtime } from '@/hooks/useAppointments';
import { useAudio } from '@/hooks/useAudio';
import { appointmentsApi } from '@/services/api';
import { STATUS_COLORS, STATUS_LABELS, type AppointmentStatus, type AppointmentDetails } from '@/types';
import { cn } from '@/lib/utils';

export default function ProfessionalPage() {
  const user = useAuthStore((s) => s.user);
  const { appointments, updateAppointmentInList, fetchAppointments } = useAppointmentsStore();
  const { speak, isSupported } = useAudio();
  const locationId = user?.locationId ?? 1;

  useAppointmentsRealtime(locationId);

  // Filter appointments for this professional
  const myAppointments = useMemo(() => {
    if (!user?.professionalId) return appointments;
    return appointments.filter((a) => a.professional_id === user.professionalId);
  }, [appointments, user?.professionalId]);

  const waiting = myAppointments.filter((a) => a.status === 'WAITING');
  const calling = myAppointments.find((a) => a.status === 'CALLING');
  const inService = myAppointments.find((a) => a.status === 'IN_SERVICE');

  const handleAction = useCallback(
    async (appointmentId: number, status: AppointmentStatus) => {
      try {
        const result = await appointmentsApi.changeStatus(appointmentId, status);
        updateAppointmentInList(result.appointment);

        // Play audio on call
        if (status === 'CALLING' && result.audioText && isSupported) {
          speak(result.audioText);
        }
      } catch {
        // Could add error toast
      }
    },
    [updateAppointmentInList, speak, isSupported],
  );

  const handleCallNext = useCallback(() => {
    if (waiting.length === 0) return;
    // Pick the highest priority, earliest appointment
    const next = [...waiting].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    })[0];
    handleAction(next.id, 'CALLING');
  }, [waiting, handleAction]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mi Cola de Turnos</h2>
        <p className="text-muted-foreground">
          {waiting.length} en espera
          {calling && ' - 1 llamando'}
          {inService && ' - 1 en atencion'}
        </p>
      </div>

      {/* Current call highlight */}
      {calling && (
        <Card className="border-2 border-yellow-400 bg-yellow-50 animate-pulse-call">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-yellow-600 font-medium mb-2">LLAMANDO</p>
            <p className="text-5xl font-bold text-yellow-800 mb-2">{calling.ticket_number}</p>
            <p className="text-xl text-yellow-700">
              {calling.patient_first_name} {calling.patient_last_name}
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              {calling.office_name}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                size="xl"
                variant="warning"
                className="gap-2"
                onClick={() => handleAction(calling.id, 'CALLING')}
              >
                <PhoneForwarded className="h-5 w-5" />
                Re-llamar
              </Button>
              <Button
                size="xl"
                variant="success"
                className="gap-2"
                onClick={() => handleAction(calling.id, 'IN_SERVICE')}
              >
                <UserCheck className="h-5 w-5" />
                En Atencion
              </Button>
              <Button
                size="xl"
                variant="destructive"
                className="gap-2"
                onClick={() => handleAction(calling.id, 'ABSENT')}
              >
                <UserX className="h-5 w-5" />
                Ausente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current attention */}
      {inService && (
        <Card className="border-2 border-green-400 bg-green-50">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-green-600 font-medium mb-2">EN ATENCION</p>
            <p className="text-4xl font-bold text-green-800 mb-2">{inService.ticket_number}</p>
            <p className="text-lg text-green-700">
              {inService.patient_first_name} {inService.patient_last_name}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                size="xl"
                variant="success"
                className="gap-2"
                onClick={() => handleAction(inService.id, 'COMPLETED')}
              >
                <CheckCircle2 className="h-5 w-5" />
                Finalizar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call next button */}
      {!calling && !inService && waiting.length > 0 && (
        <div className="flex justify-center">
          <Button
            size="xl"
            className="h-20 px-16 text-xl gap-3"
            onClick={handleCallNext}
          >
            <PhoneCall className="h-7 w-7" />
            Llamar Siguiente
          </Button>
        </div>
      )}

      {!calling && !inService && waiting.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-lg text-muted-foreground">No hay pacientes en espera</p>
          </CardContent>
        </Card>
      )}

      {/* Queue list */}
      {waiting.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cola de Espera ({waiting.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {waiting
                .sort((a, b) => {
                  if (b.priority !== a.priority) return b.priority - a.priority;
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                })
                .map((appointment, index) => (
                  <div
                    key={appointment.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-4',
                      appointment.priority >= 2 && 'border-l-4 border-l-red-500',
                      appointment.priority === 1 && 'border-l-4 border-l-orange-400',
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-bold">{appointment.ticket_number}</span>
                          {appointment.priority >= 2 && <Badge variant="destructive">Urgente</Badge>}
                          {appointment.priority === 1 && <Badge className="bg-orange-100 text-orange-800">Alta</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {appointment.patient_first_name} {appointment.patient_last_name}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => handleAction(appointment.id, 'CALLING')}
                    >
                      <PhoneCall className="h-4 w-4" />
                      Llamar
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
