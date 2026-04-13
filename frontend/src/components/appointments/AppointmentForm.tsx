import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { appointmentsApi, professionalsApi, officesApi } from '@/services/api';
import type { Professional, Office, AppointmentDetails } from '@/types';

interface AppointmentFormProps {
  locationId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (appointment: AppointmentDetails) => void;
}

export function AppointmentForm({ locationId, open, onOpenChange, onCreated }: AppointmentFormProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    patient_first_name: '',
    patient_last_name: '',
    patient_document: '',
    professional_id: '',
    office_id: '',
    notes: '',
    priority: '0',
  });

  useEffect(() => {
    if (!open) return;
    professionalsApi.list({ location_id: locationId }).then(setProfessionals).catch(() => {});
    officesApi.list({ location_id: locationId }).then(setOffices).catch(() => {});
  }, [open, locationId]);

  function resetForm() {
    setForm({
      patient_first_name: '',
      patient_last_name: '',
      patient_document: '',
      professional_id: '',
      office_id: '',
      notes: '',
      priority: '0',
    });
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const appointment = await appointmentsApi.create({
        location_id: locationId,
        patient_first_name: form.patient_first_name || undefined,
        patient_last_name: form.patient_last_name || undefined,
        patient_document: form.patient_document || undefined,
        professional_id: form.professional_id ? Number(form.professional_id) : undefined,
        office_id: form.office_id ? Number(form.office_id) : undefined,
        notes: form.notes || undefined,
        priority: Number(form.priority),
      });
      onCreated(appointment);
      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message ?? 'Error al crear turno');
      } else {
        setError('Error de conexion');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Turno</DialogTitle>
          <DialogDescription>Complete los datos para registrar un nuevo turno</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nombre</Label>
              <Input
                value={form.patient_first_name}
                onChange={(e) => setForm((f) => ({ ...f, patient_first_name: e.target.value }))}
                placeholder="Nombre del paciente"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Apellido</Label>
              <Input
                value={form.patient_last_name}
                onChange={(e) => setForm((f) => ({ ...f, patient_last_name: e.target.value }))}
                placeholder="Apellido del paciente"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Documento</Label>
            <Input
              value={form.patient_document}
              onChange={(e) => setForm((f) => ({ ...f, patient_document: e.target.value }))}
              placeholder="DNI"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Profesional</Label>
              <Select
                value={form.professional_id}
                onValueChange={(v) => setForm((f) => ({ ...f, professional_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
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
                value={form.office_id}
                onValueChange={(v) => setForm((f) => ({ ...f, office_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Prioridad</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">Alta</SelectItem>
                  <SelectItem value="2">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Observaciones</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Observaciones (opcional)"
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Turno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
