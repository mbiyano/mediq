# MediQ - Sistema de Gestion de Turnos

Sistema web profesional para administracion, control y visualizacion de turnos en tiempo real.
Diseñado para consultorios medicos y adaptable a laboratorios, odontologia, vacunatorios, centros de diagnostico, cajas, atencion al cliente, oficinas y boxes de atencion.

---

## Requisitos previos

| Software | Version minima | Verificar |
|----------|---------------|-----------|
| Node.js | 20+ | `node -v` |
| pnpm | 8+ | `pnpm -v` |

Si no tenes pnpm instalado:

```bash
npm install -g pnpm
```

---

## 1. Clonar el proyecto

```bash
git clone <url-del-repo> mediq
cd mediq
```

---

## 2. Base de datos (Supabase)

El proyecto usa **Supabase** como base de datos PostgreSQL hosteada. Tambien es compatible con PostgreSQL local si lo preferis (ver seccion alternativa al final).

### 2.1 Crear un proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear una cuenta (gratis)
2. Crear un nuevo proyecto — elegir nombre y contrasena para la DB
3. Esperar a que el proyecto termine de inicializar (~2 minutos)

### 2.2 Obtener el connection string

1. En el dashboard de Supabase, ir a **Project Settings** (icono engranaje) > **Database**
2. En la seccion **Connection string**, seleccionar **URI**
3. Copiar la URI. Se ve algo asi:

```
postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

> Reemplazar `[PASSWORD]` por la contrasena que elegiste al crear el proyecto.

### 2.3 Ejecutar los scripts SQL

En el dashboard de Supabase, ir a **SQL Editor** y ejecutar los siguientes scripts **en orden**. Copiar el contenido de cada archivo y pegarlo en el editor:

1. `backend/sql/001_create_tables.sql` — Crea las 12 tablas con relaciones
2. `backend/sql/002_indexes.sql` — Indices de performance
3. `backend/sql/003_seed_data.sql` — Datos base (roles, estados, config, admin)
4. `backend/sql/004_seed_turnos_example.sql` — Datos de ejemplo (profesionales, pacientes, turnos)

> Ejecutar cada script por separado, haciendo click en **Run** despues de pegar cada uno.

Esto crea:
- 12 tablas con relaciones, claves foraneas e indices
- Roles: ADMIN, SECRETARIA, PROFESIONAL
- 9 estados de turno
- Sede "Centro Medico San Martin"
- 5 consultorios de ejemplo
- 1 pantalla TV registrada
- Configuracion general por defecto (audio, privacidad, pantalla)
- Usuarios, profesionales, pacientes y turnos de ejemplo

---

## 3. Backend

### 3.1 Instalar dependencias

```bash
cd backend
pnpm install
```

### 3.2 Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `backend/.env` y pegar el connection string de Supabase:

```env
PORT=3000
NODE_ENV=development

# Pegar aca el connection string de Supabase (paso 2.2)
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

JWT_SECRET=change-me-in-production-use-a-long-random-string
JWT_REFRESH_SECRET=change-me-too-different-from-access-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGINS=http://localhost:5173

LOG_LEVEL=debug
```

> **Importante:** Reemplazar la `DATABASE_URL` con tu connection string real de Supabase. La conexion SSL se habilita automaticamente cuando se usa `DATABASE_URL`.

### 3.3 Iniciar el backend

```bash
pnpm dev
```

El servidor arranca en `http://localhost:3000`. Deberias ver algo como:

```
[INFO] Server listening on port 3000
```

### 3.4 Verificar que funciona

```bash
curl http://localhost:3000/api/health
```

---

## 4. Frontend

### 4.1 Instalar dependencias

Desde la raiz del proyecto:

```bash
cd frontend
pnpm install
```

### 4.2 Iniciar el frontend

```bash
pnpm dev
```

El frontend arranca en `http://localhost:5173`. Vite ya tiene configurado un proxy que redirige `/api` y `/socket.io` al backend en el puerto 3000.

---

## 5. Acceder a la aplicacion

### Login

Abrir `http://localhost:5173` en el navegador.

### Usuarios de prueba

Todos los usuarios de ejemplo usan la contrasena: **`admin123`**

| Usuario | Contrasena | Rol | Descripcion |
|---------|-----------|-----|-------------|
| `admin` | admin123 | ADMIN | Acceso total al sistema |
| `secretaria1` | admin123 | SECRETARIA | Gestion de turnos y pacientes |
| `dra.sanchez` | admin123 | PROFESIONAL | Dra. Maria Sanchez - Clinica Medica |
| `dr.lopez` | admin123 | PROFESIONAL | Dr. Carlos Lopez - Cardiologia |

### Pantalla publica (TV LED)

La vista de pantalla publica no requiere login. Acceder directamente a:

```
http://localhost:5173/pantalla/1
```

Donde `1` es el ID de la sede. Esta URL es la que se abre en el monitor/TV de la sala de espera.

---

## 6. Estructura del proyecto

```
mediq/
├── backend/
│   ├── src/
│   │   ├── config/          # Variables de entorno, conexion DB
│   │   ├── controllers/     # Handlers de endpoints
│   │   ├── middlewares/      # Auth JWT, validacion Zod, error handler
│   │   ├── repositories/    # Queries SQL (pg con parametros)
│   │   ├── routes/          # Definicion de rutas Express
│   │   ├── services/        # Logica de negocio
│   │   ├── sockets/         # Socket.IO rooms y eventos
│   │   ├── types/           # Interfaces TypeScript
│   │   ├── utils/           # Logger, passwords, tokens
│   │   ├── validations/     # Schemas Zod
│   │   └── app.ts           # Bootstrap Express + Socket.IO
│   ├── sql/                 # Scripts DDL, indices y seed
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Componentes base shadcn/ui
│   │   │   ├── layout/      # Sidebar, Header, AppLayout
│   │   │   ├── turnos/      # TurnoForm, TurnoList, TurnoFilters
│   │   │   └── admin/       # CrudTable generico
│   │   ├── hooks/           # useSocket, useAudio, useTurnos
│   │   ├── pages/           # 7 paginas principales
│   │   ├── services/        # Cliente API (Axios)
│   │   ├── stores/          # Zustand (auth, turnos)
│   │   ├── types/           # Interfaces compartidas
│   │   ├── lib/             # Utilidades (cn)
│   │   ├── router.tsx       # Rutas con guards por rol
│   │   └── main.tsx         # Entry point React
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── CLAUDE.md                # Instrucciones para el agente de IA
└── README.md                # Este archivo
```

---

## 7. Paginas de la aplicacion

| Ruta | Rol requerido | Descripcion |
|------|--------------|-------------|
| `/login` | Publico | Inicio de sesion |
| `/dashboard` | Todos los autenticados | Panel de control con estadisticas del dia |
| `/secretaria` | SECRETARIA, ADMIN | Alta de turnos, listado con filtros, gestion de cola |
| `/profesional` | PROFESIONAL, ADMIN | Cola propia, botones grandes: Llamar, Re-llamar, En Atencion, Finalizar, Ausente |
| `/admin` | ADMIN | ABM de sedes, consultorios, profesionales, usuarios y configuracion |
| `/reportes` | ADMIN, SECRETARIA | Turnos por fecha, tiempos de espera, por profesional, historial |
| `/pantalla/:sedeId` | Publico (sin login) | Vista TV LED: llamado actual, llamados recientes, cola, reloj, audio TTS |

---

## 8. API REST - Endpoints principales

### Autenticacion
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/login` | Login (devuelve access + refresh token) |
| POST | `/api/auth/refresh` | Renovar access token |
| GET | `/api/auth/me` | Datos del usuario autenticado |

### Turnos
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/turnos` | Listar turnos (con filtros: id_sede, fecha, id_profesional, estado) |
| POST | `/api/turnos` | Crear turno (SECRETARIA, ADMIN) |
| PATCH | `/api/turnos/:id/estado` | Cambiar estado (valida maquina de estados y rol) |
| GET | `/api/turnos/stats/:sedeId` | Estadisticas del dia |
| GET | `/api/turnos/:id/historial` | Historial de transiciones |

### CRUD (requieren auth, escritura solo ADMIN)
| Recurso | Ruta base |
|---------|-----------|
| Sedes | `/api/sedes` |
| Consultorios | `/api/consultorios` |
| Profesionales | `/api/profesionales` |
| Pacientes | `/api/pacientes` |
| Usuarios | `/api/usuarios` |
| Roles | `/api/roles` |
| Configuracion | `/api/config` |

### Publicos (sin auth, para pantalla TV)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/public/turnos/sede/:sedeId` | Turnos activos (EN_ESPERA, LLAMANDO, EN_ATENCION) |
| GET | `/api/public/llamados/sede/:sedeId` | Llamados recientes |
| GET | `/api/public/config/sede/:sedeId` | Config de pantalla y audio |

### Reportes
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/reportes/turnos-por-fecha` | Turnos agrupados por estado |
| GET | `/api/reportes/tiempos-espera` | Tiempos promedio de espera y atencion |
| GET | `/api/reportes/atencion-por-profesional` | Metricas por profesional |
| GET | `/api/reportes/historial-eventos` | Log de eventos |

---

## 9. Tiempo real (Socket.IO)

El backend emite eventos a traves de Socket.IO cada vez que cambia el estado de un turno.

### Rooms
- `sede:{idSede}` — todos los clientes de una sede
- `profesional:{idProfesional}` — cola personal del profesional
- `pantalla:{idPantalla}` — instancia de monitor TV

### Eventos servidor -> cliente
| Evento | Cuando se emite |
|--------|----------------|
| `turno:llamado` | Profesional llama a un paciente |
| `turno:en_atencion` | Paciente ingresa al consultorio |
| `turno:finalizado` | Atencion completada |
| `turno:ausente` | Paciente no se presento |
| `turno:cancelado` | Turno cancelado |
| `turno:derivado` | Turno derivado a otro profesional/area |
| `turno:updated` | Cualquier otra actualizacion |
| `config:updated` | Cambio en configuracion |

### Payload de eventos
```json
{
  "turno": { /* TurnoConDetalles completo */ },
  "audioText": "Turno A003. Pedro Rodriguez. Dirigirse al Consultorio 1 con Maria Sanchez."
}
```

---

## 10. Audio del llamado

La pantalla publica reproduce audio cuando se llama a un paciente:

1. Suena una campanilla sintetica (Web Audio API, 880Hz)
2. Pausa de 300ms
3. Voz en espanol argentino via Web Speech API (SpeechSynthesis)

### Configuracion del audio

Desde el panel de administracion (`/admin` > tab Configuracion):

| Clave | Valor por defecto | Descripcion |
|-------|-------------------|-------------|
| `AUDIO_HABILITADO` | `true` | Activar/desactivar audio |
| `AUDIO_PLANTILLA` | `Turno {numero}. {nombre_paciente}. Dirigirse a {consultorio} con {profesional}.` | Texto del llamado |
| `AUDIO_VOZ_LANG` | `es-AR` | Idioma |
| `AUDIO_VOZ_RATE` | `0.9` | Velocidad de voz |
| `AUDIO_VOZ_PITCH` | `1` | Tono de voz |
| `PANTALLA_MODO_PRIVACIDAD` | `NOMBRE_ABREVIADO` | Que mostrar del paciente: `SOLO_NUMERO`, `NOMBRE_ABREVIADO`, `NOMBRE_COMPLETO` |

---

## 11. Build para produccion

### Backend

```bash
cd backend
pnpm build
NODE_ENV=production node dist/app.js
```

### Frontend

```bash
cd frontend
pnpm build
```

Los archivos estaticos quedan en `frontend/dist/`. Servir con nginx, caddy, o cualquier servidor de archivos estaticos, configurando un proxy reverso para `/api` y `/socket.io` al backend.

### Ejemplo nginx

```nginx
server {
    listen 80;
    server_name mediq.ejemplo.com;

    # Frontend
    location / {
        root /var/www/mediq/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API + Socket.IO
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 12. Resumen rapido (TL;DR)

```bash
# Terminal 1 — Base de datos
psql -U postgres -c "CREATE DATABASE mediq;"
psql -U postgres -d mediq -f backend/sql/001_create_tables.sql
psql -U postgres -d mediq -f backend/sql/002_indexes.sql
psql -U postgres -d mediq -f backend/sql/003_seed_data.sql
psql -U postgres -d mediq -f backend/sql/004_seed_turnos_example.sql

# Terminal 2 — Backend
cd backend
pnpm install
cp .env.example .env
pnpm dev

# Terminal 3 — Frontend
cd frontend
pnpm install
pnpm dev

# Abrir en el navegador
# App:      http://localhost:5173         (login: admin / admin123)
# TV LED:   http://localhost:5173/pantalla/1
```
