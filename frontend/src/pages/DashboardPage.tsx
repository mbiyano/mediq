import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useAppointmentsStore } from '@/stores/appointments.store';
import { useAppointmentsRealtime } from '@/hooks/useAppointments';
import { STATUS_COLORS, STATUS_LABELS, type AppointmentDetails } from '@/types';
import { cn } from '@/lib/utils';
import {
  Clock,
  PhoneCall,
  UserCheck,
  CheckCircle2,
  UserX,
  Users,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { stats, appointments } = useAppointmentsStore();
  const locationId = user?.locationId ?? 1;

  useAppointmentsRealtime(locationId);

  const calling = appointments.filter((a) => a.status === 'CALLING');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Panel de Control</h2>
        <p className="text-muted-foreground">Resumen operativo del dia</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="En espera" value={stats?.WAITING ?? 0} icon={Clock} color="bg-blue-500" />
        <StatCard title="Llamando" value={stats?.CALLING ?? 0} icon={PhoneCall} color="bg-yellow-500" />
        <StatCard title="En atencion" value={stats?.IN_SERVICE ?? 0} icon={UserCheck} color="bg-green-500" />
        <StatCard title="Finalizados" value={stats?.COMPLETED ?? 0} icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard title="Ausentes" value={stats?.ABSENT ?? 0} icon={UserX} color="bg-red-500" />
        <StatCard title="Total" value={stats?.TOTAL ?? 0} icon={Users} color="bg-gray-600" />
      </div>

      {/* Current calls */}
      {calling.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-yellow-500" />
              Llamados activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {calling.map((appointment) => (
                <ActiveCallCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent queue */}
      <Card>
        <CardHeader>
          <CardTitle>Cola de espera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {appointments
              .filter((a) => a.status === 'WAITING')
              .slice(0, 10)
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold">{appointment.ticket_number}</span>
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.patient_first_name} {appointment.patient_last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.professional_first_name} {appointment.professional_last_name} - {appointment.office_name}
                      </p>
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[appointment.status]}>
                    {STATUS_LABELS[appointment.status]}
                  </Badge>
                </div>
              ))}
            {appointments.filter((a) => a.status === 'WAITING').length === 0 && (
              <p className="py-8 text-center text-muted-foreground">No hay pacientes en espera</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActiveCallCard({ appointment }: { appointment: AppointmentDetails }) {
  return (
    <div className="animate-pulse-call rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4">
      <div className="text-center">
        <p className="text-3xl font-bold text-yellow-800">{appointment.ticket_number}</p>
        <p className="mt-1 text-sm font-medium text-yellow-700">
          {appointment.patient_first_name} {appointment.patient_last_name}
        </p>
        <p className="mt-1 text-xs text-yellow-600">
          {appointment.office_name} - {appointment.professional_first_name} {appointment.professional_last_name}
        </p>
      </div>
    </div>
  );
}
