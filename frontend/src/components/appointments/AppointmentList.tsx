import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { STATUS_COLORS, STATUS_LABELS, type AppointmentDetails, type AppointmentStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Ban, UserX, RotateCcw } from 'lucide-react';

interface AppointmentListProps {
  appointments: AppointmentDetails[];
  role: string;
  onChangeStatus: (appointmentId: number, status: AppointmentStatus) => void;
  loading?: boolean;
}

const SECRETARY_ACTIONS: Record<string, { status: AppointmentStatus; label: string; icon: React.ComponentType<{ className?: string }>; variant: 'default' | 'destructive' | 'outline' | 'ghost' }[]> = {
  WAITING: [
    { status: 'CANCELLED', label: 'Cancelar', icon: Ban, variant: 'destructive' },
  ],
  ABSENT: [
    { status: 'WAITING', label: 'Reencolar', icon: RotateCcw, variant: 'outline' },
  ],
  CALLING: [
    { status: 'ABSENT', label: 'Ausente', icon: UserX, variant: 'destructive' },
  ],
};

export function AppointmentList({ appointments, role, onChangeStatus, loading }: AppointmentListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No se encontraron turnos</p>;
  }

  return (
    <div className="space-y-2">
      {/* Table header */}
      <div className="hidden md:grid md:grid-cols-[80px_1fr_1fr_1fr_120px_1fr] gap-3 rounded-lg bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
        <div>Turno</div>
        <div>Paciente</div>
        <div>Profesional</div>
        <div>Consultorio</div>
        <div>Estado</div>
        <div>Acciones</div>
      </div>

      {appointments.map((appointment) => {
        const actions = (role === 'RECEPTIONIST' || role === 'ADMIN')
          ? (SECRETARY_ACTIONS[appointment.status] ?? [])
          : [];

        return (
          <div
            key={appointment.id}
            className={cn(
              'grid items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
              'md:grid-cols-[80px_1fr_1fr_1fr_120px_1fr]',
              appointment.status === 'CALLING' && 'border-yellow-400 bg-yellow-50',
              appointment.status === 'IN_SERVICE' && 'border-green-300 bg-green-50',
              appointment.priority >= 2 && 'border-l-4 border-l-red-500',
              appointment.priority === 1 && 'border-l-4 border-l-orange-400',
            )}
          >
            {/* Ticket number */}
            <div className="font-mono text-lg font-bold">{appointment.ticket_number}</div>

            {/* Patient */}
            <div>
              <p className="text-sm font-medium">
                {appointment.patient_first_name} {appointment.patient_last_name}
              </p>
              {appointment.patient_document && (
                <p className="text-xs text-muted-foreground">{appointment.patient_document}</p>
              )}
            </div>

            {/* Professional */}
            <div className="text-sm">
              {appointment.professional_first_name} {appointment.professional_last_name}
              {appointment.professional_specialty && (
                <p className="text-xs text-muted-foreground">{appointment.professional_specialty}</p>
              )}
            </div>

            {/* Office */}
            <div className="text-sm">{appointment.office_name ?? '-'}</div>

            {/* Status */}
            <Badge className={cn('w-fit', STATUS_COLORS[appointment.status])}>
              {STATUS_LABELS[appointment.status]}
            </Badge>

            {/* Actions */}
            <div className="flex flex-wrap gap-1.5">
              {actions.map((action) => (
                <Button
                  key={action.status}
                  size="sm"
                  variant={action.variant}
                  className="gap-1 text-xs"
                  onClick={() => onChangeStatus(appointment.id, action.status)}
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </Button>
              ))}
              {appointment.notes && (
                <span className="text-xs text-muted-foreground italic" title={appointment.notes}>
                  Obs: {appointment.notes.substring(0, 30)}...
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
