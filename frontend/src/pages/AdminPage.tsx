import { useState, useCallback, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrudTable, type FieldDef } from '@/components/admin/CrudTable';
import {
  locationsApi,
  officesApi,
  professionalsApi,
  usersApi,
  rolesApi,
  settingsApi,
} from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import type { Location, Office, Professional, PublicUser, Role, SettingItem } from '@/types';

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const locationId = user?.locationId ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Administracion</h2>
        <p className="text-muted-foreground">Gestion del sistema</p>
      </div>

      <Tabs defaultValue="locations">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="locations">Sedes</TabsTrigger>
          <TabsTrigger value="offices">Consultorios</TabsTrigger>
          <TabsTrigger value="professionals">Profesionales</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="settings">Configuracion</TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <LocationsTab />
        </TabsContent>
        <TabsContent value="offices">
          <OfficesTab locationId={locationId} />
        </TabsContent>
        <TabsContent value="professionals">
          <ProfessionalsTab locationId={locationId} />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab locationId={locationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// -- Locations Tab --
function LocationsTab() {
  const [items, setItems] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const fields: FieldDef[] = [
    { key: 'code', label: 'Codigo', required: true },
    { key: 'name', label: 'Nombre', required: true },
    { key: 'address', label: 'Direccion' },
    { key: 'phone', label: 'Telefono' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await locationsApi.list()); } finally { setLoading(false); }
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <CrudTable<Location & Record<string, unknown>>
          title="Sedes"
          fields={fields}
          idKey="id"
          displayColumns={['code', 'name', 'address', 'phone']}
          items={items as (Location & Record<string, unknown>)[]}
          loading={loading}
          onLoad={load}
          onCreate={async (data) => { await locationsApi.create(data as unknown as Partial<Location>); }}
          onUpdate={async (id, data) => { await locationsApi.update(id, data as unknown as Partial<Location>); }}
        />
      </CardContent>
    </Card>
  );
}

// -- Offices Tab --
function OfficesTab({ locationId }: { locationId: number }) {
  const [items, setItems] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);

  const fields: FieldDef[] = [
    { key: 'code', label: 'Codigo', required: true },
    { key: 'name', label: 'Nombre', required: true },
    { key: 'area_type', label: 'Tipo Area' },
    { key: 'floor_location', label: 'Ubicacion' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await officesApi.list({ location_id: locationId })); } finally { setLoading(false); }
  }, [locationId]);

  return (
    <Card>
      <CardContent className="pt-6">
        <CrudTable<Office & Record<string, unknown>>
          title="Consultorios"
          fields={fields}
          idKey="id"
          displayColumns={['code', 'name', 'area_type', 'floor_location']}
          items={items as (Office & Record<string, unknown>)[]}
          loading={loading}
          onLoad={load}
          onCreate={async (data) => {
            await officesApi.create({ ...data, location_id: locationId } as unknown as Partial<Office>);
          }}
          onUpdate={async (id, data) => {
            await officesApi.update(id, data as unknown as Partial<Office>);
          }}
        />
      </CardContent>
    </Card>
  );
}

// -- Professionals Tab --
function ProfessionalsTab({ locationId }: { locationId: number }) {
  const [items, setItems] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);

  const fields: FieldDef[] = [
    { key: 'first_name', label: 'Nombre', required: true },
    { key: 'last_name', label: 'Apellido', required: true },
    { key: 'license_number', label: 'Matricula' },
    { key: 'specialty', label: 'Especialidad' },
    { key: 'phone', label: 'Telefono' },
    { key: 'email', label: 'Email', type: 'email' },
  ];

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await professionalsApi.list({ location_id: locationId })); } finally { setLoading(false); }
  }, [locationId]);

  return (
    <Card>
      <CardContent className="pt-6">
        <CrudTable<Professional & Record<string, unknown>>
          title="Profesionales"
          fields={fields}
          idKey="id"
          displayColumns={['first_name', 'last_name', 'license_number', 'specialty']}
          items={items as (Professional & Record<string, unknown>)[]}
          loading={loading}
          onLoad={load}
          onCreate={async (data) => {
            await professionalsApi.create({ ...data, location_id: locationId } as unknown as Partial<Professional>);
          }}
          onUpdate={async (id, data) => {
            await professionalsApi.update(id, data as unknown as Partial<Professional>);
          }}
        />
      </CardContent>
    </Card>
  );
}

// -- Users Tab --
function UsersTab() {
  const [items, setItems] = useState<PublicUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    rolesApi.list().then(setRoles).catch(() => {});
    locationsApi.list().then(setLocations).catch(() => {});
  }, []);

  const fields: FieldDef[] = [
    { key: 'username', label: 'Usuario', required: true },
    { key: 'password', label: 'Contrasena', type: 'password', hideInTable: true },
    { key: 'first_name', label: 'Nombre', required: true },
    { key: 'last_name', label: 'Apellido', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Telefono' },
    {
      key: 'role_id',
      label: 'Rol',
      type: 'select',
      required: true,
      options: roles.map((r) => ({ value: String(r.id), label: r.name })),
    },
    {
      key: 'location_id',
      label: 'Sede',
      type: 'select',
      options: locations.map((l) => ({ value: String(l.id), label: l.name })),
    },
  ];

  function parseUserData(data: Record<string, string>): Record<string, unknown> {
    const parsed: Record<string, unknown> = { ...data };
    if (data.role_id) parsed.role_id = Number(data.role_id);
    if (data.location_id) parsed.location_id = Number(data.location_id);
    else parsed.location_id = null;
    if (!data.email) parsed.email = null;
    if (!data.phone) parsed.phone = null;
    return parsed;
  }

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await usersApi.list()); } finally { setLoading(false); }
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <CrudTable<PublicUser & Record<string, unknown>>
          title="Usuarios"
          fields={fields}
          idKey="id"
          displayColumns={['username', 'first_name', 'last_name', 'role_code']}
          items={items as (PublicUser & Record<string, unknown>)[]}
          loading={loading}
          onLoad={load}
          onCreate={async (data) => { await usersApi.create(parseUserData(data)); }}
          onUpdate={async (id, data) => { await usersApi.update(id, parseUserData(data)); }}
        />
      </CardContent>
    </Card>
  );
}

// -- Settings Tab --
function SettingsTab({ locationId }: { locationId: number }) {
  const [items, setItems] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await settingsApi.list(locationId)); } finally { setLoading(false); }
  }, [locationId]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(key: string, value: string) {
    setSaving(true);
    try {
      await settingsApi.upsert({ key, value, location_id: locationId });
      await load();
      setEditKey('');
    } finally {
      setSaving(false);
    }
  }

  const CONFIG_LABELS: Record<string, string> = {
    INSTITUTION_NAME: 'Nombre de la institucion',
    SCREEN_PRIVACY_MODE: 'Modo privacidad (FULL_NAME, ABBREVIATED_NAME, NUMBER_ONLY)',
    SCREEN_VISIBLE_CALLS: 'Cantidad de llamados visibles en pantalla',
    SCREEN_BG_COLOR: 'Color de fondo de pantalla',
    SCREEN_CALL_COLOR: 'Color del llamado activo',
    AUDIO_ENABLED: 'Audio habilitado (true/false)',
    AUDIO_TEMPLATE: 'Plantilla de audio (usar {number}, {patient_name}, {office}, {professional})',
    AUDIO_VOICE_LANG: 'Idioma de voz (ej: es-AR)',
    AUDIO_VOICE_RATE: 'Velocidad de voz (0.5 - 2.0)',
    AUDIO_VOICE_PITCH: 'Tono de voz (0 - 2.0)',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configuracion General</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(CONFIG_LABELS).map(([configKey, label]) => {
              const item = items.find((i) => i.key === configKey);
              const isEditing = editKey === configKey;

              return (
                <div key={configKey} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    {isEditing ? (
                      <div className="mt-1 flex gap-2">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSave(configKey, editValue)}
                          disabled={saving}
                        >
                          Guardar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditKey('')}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">{item?.value ?? '(no configurado)'}</p>
                    )}
                  </div>
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditKey(configKey);
                        setEditValue(item?.value ?? '');
                      }}
                    >
                      Editar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
