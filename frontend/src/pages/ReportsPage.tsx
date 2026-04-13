import { useState, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { reportsApi } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { STATUS_COLORS, STATUS_LABELS, type AppointmentStatus } from '@/types';
import { Search, Clock, Users, BarChart3, FileText } from 'lucide-react';

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const locationId = user?.locationId ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reportes</h2>
        <p className="text-muted-foreground">Estadisticas e historial</p>
      </div>

      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Turnos por Fecha
          </TabsTrigger>
          <TabsTrigger value="wait-times" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Tiempos
          </TabsTrigger>
          <TabsTrigger value="by-professional" className="gap-1.5">
            <Users className="h-4 w-4" />
            Por Profesional
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <AppointmentsByDateTab locationId={locationId} />
        </TabsContent>
        <TabsContent value="wait-times">
          <WaitTimesTab locationId={locationId} />
        </TabsContent>
        <TabsContent value="by-professional">
          <ByProfessionalTab locationId={locationId} />
        </TabsContent>
        <TabsContent value="history">
          <EventHistoryTab locationId={locationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DateRangeFilter({ onSearch }: { onSearch: (from: string, to: string) => void }) {
  const [dateFrom, setDateFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="flex items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Desde</Label>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Hasta</Label>
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
      </div>
      <Button onClick={() => onSearch(dateFrom, dateTo)} className="gap-1.5">
        <Search className="h-4 w-4" />
        Consultar
      </Button>
    </div>
  );
}

// -- Appointments by Date --
function AppointmentsByDateTab({ locationId }: { locationId: number }) {
  const [data, setData] = useState<{ appointment_date: string; status: string; count: number }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (dateFrom: string, dateTo: string) => {
      setLoading(true);
      try {
        const result = await reportsApi.appointmentsByDate({ date_from: dateFrom, date_to: dateTo, location_id: locationId });
        setData(Array.isArray(result) ? result : []);
      } finally {
        setLoading(false);
      }
    },
    [locationId],
  );

  // Aggregate by status for display
  const statusCounts = data?.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + Number(row.count);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Turnos por Fecha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRangeFilter onSearch={search} />

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {statusCounts && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="rounded-lg border p-4 text-center">
                <Badge className={STATUS_COLORS[status as AppointmentStatus] ?? 'bg-gray-100 text-gray-800'}>
                  {STATUS_LABELS[status as AppointmentStatus] ?? status}
                </Badge>
                <p className="mt-2 text-3xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -- Wait Times --
function WaitTimesTab({ locationId }: { locationId: number }) {
  const [data, setData] = useState<{ ticket_number: string; patient: string; professional: string; wait_minutes: number | null; service_minutes: number | null }[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (dateFrom: string, dateTo: string) => {
      setLoading(true);
      try {
        const result = await reportsApi.waitTimes({ date_from: dateFrom, date_to: dateTo, location_id: locationId });
        setData(Array.isArray(result) ? result : []);
      } finally {
        setLoading(false);
      }
    },
    [locationId],
  );

  const avgWait = data.length > 0 ? data.reduce((sum, r) => sum + (r.wait_minutes ?? 0), 0) / data.length : null;
  const avgService = data.length > 0 ? data.reduce((sum, r) => sum + (r.service_minutes ?? 0), 0) / data.length : null;
  const maxWait = data.length > 0 ? Math.max(...data.map((r) => r.wait_minutes ?? 0)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tiempos de Espera y Atencion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRangeFilter onSearch={search} />

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border p-6 text-center">
              <p className="text-sm text-muted-foreground">Tiempo promedio de espera</p>
              <p className="mt-2 text-4xl font-bold">{avgWait?.toFixed(1) ?? '-'}</p>
              <p className="text-sm text-muted-foreground">minutos</p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <p className="text-sm text-muted-foreground">Tiempo promedio de atencion</p>
              <p className="mt-2 text-4xl font-bold">{avgService?.toFixed(1) ?? '-'}</p>
              <p className="text-sm text-muted-foreground">minutos</p>
            </div>
            <div className="rounded-lg border p-6 text-center">
              <p className="text-sm text-muted-foreground">Espera maxima</p>
              <p className="mt-2 text-4xl font-bold">{maxWait?.toFixed(1) ?? '-'}</p>
              <p className="text-sm text-muted-foreground">minutos</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// -- By Professional --
function ByProfessionalTab({ locationId }: { locationId: number }) {
  const [data, setData] = useState<{ professional: string; specialty: string; total: number; completed: number; absent: number; avg_service_minutes: number | null }[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (dateFrom: string, dateTo: string) => {
      setLoading(true);
      try {
        const result = await reportsApi.byProfessional({ date_from: dateFrom, date_to: dateTo, location_id: locationId });
        setData(Array.isArray(result) ? result : []);
      } finally {
        setLoading(false);
      }
    },
    [locationId],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Atencion por Profesional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRangeFilter onSearch={search} />

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left">Profesional</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Finalizados</th>
                  <th className="px-4 py-2 text-right">Ausentes</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-4 py-2 font-medium">{row.professional}</td>
                    <td className="px-4 py-2 text-right">{row.total}</td>
                    <td className="px-4 py-2 text-right text-green-600">{row.completed}</td>
                    <td className="px-4 py-2 text-right text-red-600">{row.absent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">Seleccione un rango de fechas para consultar</p>
        )}
      </CardContent>
    </Card>
  );
}

// -- Event History --
function EventHistoryTab({ locationId }: { locationId: number }) {
  const [data, setData] = useState<{ event_at: string; previous_status: string; new_status: string; comment: string; ticket_number?: string; user_name?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(
    async (dateFrom: string, dateTo: string) => {
      setLoading(true);
      try {
        const result = await reportsApi.eventHistory({ date_from: dateFrom, date_to: dateTo, location_id: locationId });
        setData(Array.isArray(result) ? result : []);
      } finally {
        setLoading(false);
      }
    },
    [locationId],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial de Eventos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DateRangeFilter onSearch={search} />

        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="max-h-[500px] overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Fecha/Hora</th>
                  <th className="px-4 py-2 text-left">Turno</th>
                  <th className="px-4 py-2 text-left">Transicion</th>
                  <th className="px-4 py-2 text-left">Comentario</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                      {new Date(row.event_at).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-2 font-mono">{row.ticket_number ?? '-'}</td>
                    <td className="px-4 py-2">
                      <span className="text-muted-foreground">{row.previous_status ?? '-'}</span>
                      {' → '}
                      <Badge className={STATUS_COLORS[row.new_status as AppointmentStatus] ?? ''} >
                        {STATUS_LABELS[row.new_status as AppointmentStatus] ?? row.new_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{row.comment ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">Seleccione un rango de fechas para consultar</p>
        )}
      </CardContent>
    </Card>
  );
}
