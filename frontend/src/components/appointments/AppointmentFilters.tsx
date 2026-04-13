import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { professionalsApi, officesApi } from '@/services/api';
import type { Professional, Office, AppointmentStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import { Search, X } from 'lucide-react';

interface Filters {
  date: string;
  professional_id: string;
  office_id: string;
  status: string;
}

interface AppointmentFiltersProps {
  locationId: number;
  onFilter: (filters: Record<string, string | number>) => void;
}

const FILTERABLE_STATUSES: AppointmentStatus[] = [
  'WAITING',
  'CALLING',
  'IN_SERVICE',
  'COMPLETED',
  'ABSENT',
  'CANCELLED',
  'TRANSFERRED',
];

export function AppointmentFilters({ locationId, onFilter }: AppointmentFiltersProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [filters, setFilters] = useState<Filters>({
    date: new Date().toISOString().split('T')[0],
    professional_id: '',
    office_id: '',
    status: '',
  });

  useEffect(() => {
    professionalsApi.list({ location_id: locationId }).then(setProfessionals).catch(() => {});
    officesApi.list({ location_id: locationId }).then(setOffices).catch(() => {});
  }, [locationId]);

  function applyFilters() {
    const params: Record<string, string | number> = { location_id: locationId };
    if (filters.date) params.date = filters.date;
    if (filters.professional_id) params.professional_id = Number(filters.professional_id);
    if (filters.office_id) params.office_id = Number(filters.office_id);
    if (filters.status) params.status = filters.status;
    onFilter(params);
  }

  function clearFilters() {
    const cleared: Filters = {
      date: new Date().toISOString().split('T')[0],
      professional_id: '',
      office_id: '',
      status: '',
    };
    setFilters(cleared);
    onFilter({ location_id: locationId, date: cleared.date });
  }

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Fecha</Label>
        <Input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
          className="w-40"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Profesional</Label>
        <Select
          value={filters.professional_id}
          onValueChange={(v) => setFilters((f) => ({ ...f, professional_id: v }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.first_name} {p.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Consultorio</Label>
        <Select
          value={filters.office_id}
          onValueChange={(v) => setFilters((f) => ({ ...f, office_id: v }))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {offices.map((o) => (
              <SelectItem key={o.id} value={String(o.id)}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Estado</Label>
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {FILTERABLE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={applyFilters} size="sm" className="gap-1.5">
        <Search className="h-4 w-4" />
        Filtrar
      </Button>
      <Button onClick={clearFilters} variant="ghost" size="sm" className="gap-1.5">
        <X className="h-4 w-4" />
        Limpiar
      </Button>
    </div>
  );
}
