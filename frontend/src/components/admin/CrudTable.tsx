import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil } from 'lucide-react';

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  hideInTable?: boolean;
}

interface CrudTableProps<T extends Record<string, unknown>> {
  title: string;
  fields: FieldDef[];
  idKey: string;
  displayColumns: string[];
  items: T[];
  loading: boolean;
  onLoad: () => void;
  onCreate: (data: Record<string, string>) => Promise<void>;
  onUpdate: (id: number, data: Record<string, string>) => Promise<void>;
}

export function CrudTable<T extends Record<string, unknown>>({
  title,
  fields,
  idKey,
  displayColumns,
  items,
  loading,
  onLoad,
  onCreate,
  onUpdate,
}: CrudTableProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  function openCreate() {
    setEditing(null);
    const empty: Record<string, string> = {};
    fields.forEach((f) => { empty[f.key] = ''; });
    setForm(empty);
    setError('');
    setDialogOpen(true);
  }

  function openEdit(item: T) {
    setEditing(item);
    const values: Record<string, string> = {};
    fields.forEach((f) => {
      values[f.key] = item[f.key] != null ? String(item[f.key]) : '';
    });
    setForm(values);
    setError('');
    setDialogOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await onUpdate(editing[idKey] as number, form);
      } else {
        await onCreate(form);
      }
      setDialogOpen(false);
      onLoad();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string; message?: string; details?: { field: string; message: string }[] } } };
        const detail = axiosErr.response?.data?.details?.map((d) => `${d.field}: ${d.message}`).join(', ');
        setError(detail ?? axiosErr.response?.data?.error ?? axiosErr.response?.data?.message ?? 'Error al guardar');
      } else {
        setError('Error de conexion');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {displayColumns.map((col) => {
                  const field = fields.find((f) => f.key === col);
                  return (
                    <th key={col} className="px-4 py-2 text-left font-medium">
                      {field?.label ?? col}
                    </th>
                  );
                })}
                <th className="px-4 py-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={String(item[idKey])} className="border-b last:border-0 hover:bg-muted/30">
                  {displayColumns.map((col) => (
                    <td key={col} className="px-4 py-2">
                      {item[col] != null ? String(item[col]) : '-'}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={displayColumns.length + 1} className="px-4 py-8 text-center text-muted-foreground">
                    No hay registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Nuevo'} {title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            {fields
              .filter((f) => !f.hideInTable || !editing)
              .map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs">{field.label}</Label>
                  {field.type === 'select' && field.options ? (
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form[field.key] ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      required={field.required}
                    >
                      <option value="">Seleccionar...</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type={field.type ?? 'text'}
                      value={form[field.key] ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
