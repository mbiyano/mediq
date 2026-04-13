# MediQ — Sistema de Gestión de Turnos

Sistema web profesional para administración, control y visualización de turnos en tiempo real. Diseñado para consultorios médicos y adaptable a laboratorios, odontología, vacunatorios, centros de diagnóstico, cajas, atención al cliente, oficinas y boxes de atención.

## Services

| Directory | Description |
|-----------|-------------|
| `backend/` | API REST Node.js/Express + Socket.IO para tiempo real |
| `frontend/` | SPA React + Vite con vistas operativas y pantalla pública TV LED |

---

## Tech Stack

### Frontend

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Bundler | Vite 5 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Components | shadcn/ui |
| Routing | React Router 6 |
| State | Zustand (or React Context for simpler cases) |
| Real-time | socket.io-client |
| Audio | Web Speech API / SpeechSynthesis |
| HTTP | Axios |

### Backend

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Real-time | Socket.IO 4 |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Zod 3 |
| Database | PostgreSQL 16 |
| ORM/Query | pg (node-postgres) — raw queries with typed helpers |
| Logging | pino |
| Package manager | pnpm |
| Tests | Vitest |
| Linting | ESLint 9 + TypeScript ESLint |

---

## Architecture

```
Browser (localhost:5173)
  │
  ├─ HTTP  → Backend REST API (localhost:3000)
  │           ├─ /api/auth/*         (login, refresh, me)
  │           ├─ /api/sedes/*        (CRUD sedes)
  │           ├─ /api/consultorios/* (CRUD consultorios/boxes)
  │           ├─ /api/profesionales/*(CRUD profesionales)
  │           ├─ /api/pacientes/*    (CRUD pacientes)
  │           ├─ /api/turnos/*       (CRUD + state transitions)
  │           ├─ /api/usuarios/*     (CRUD usuarios)
  │           ├─ /api/config/*       (configuración general)
  │           ├─ /api/reportes/*     (reports & history)
  │           └─ /api/health         (healthcheck)
  │
  └─ WS   → Socket.IO (same port :3000)
              ├─ room: sede:{idSede}           (all clients watching a sede)
              ├─ room: profesional:{idProf}    (professional's personal queue)
              ├─ room: pantalla:{idPantalla}   (TV screen instance)
              │
              ├─ server→client events:
              │   ├─ turno:created
              │   ├─ turno:updated
              │   ├─ turno:llamado       (includes audio text)
              │   ├─ turno:rellamado
              │   ├─ turno:en_atencion
              │   ├─ turno:finalizado
              │   ├─ turno:ausente
              │   ├─ turno:cancelado
              │   ├─ turno:derivado
              │   └─ config:updated
              │
              └─ client→server events:
                  ├─ join:sede
                  ├─ join:profesional
                  ├─ join:pantalla
                  └─ leave:*
```

---

## Directory Structure

### Backend (`backend/`)

```
backend/
├── src/
│   ├── config/          # env vars, DB connection, app config
│   ├── middlewares/      # auth, roles, error handler, validation
│   ├── routes/          # Express routers per domain
│   ├── controllers/     # Request/response handling
│   ├── services/        # Business logic
│   ├── repositories/    # Database queries (raw SQL with pg)
│   ├── sockets/         # Socket.IO event handlers and room management
│   ├── utils/           # Helpers: password hash, token generation, etc.
│   ├── types/           # Shared TypeScript types/interfaces
│   ├── validations/     # Zod schemas for request validation
│   └── app.ts           # Express + Socket.IO bootstrap
├── sql/
│   ├── 001_create_tables.sql
│   ├── 002_indexes.sql
│   ├── 003_seed_data.sql
│   └── 004_seed_turnos_example.sql
├── tests/
├── .env.example
├── package.json
└── tsconfig.json
```

### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn/ui base components
│   │   ├── layout/      # Sidebar, Header, FullscreenWrapper
│   │   ├── turnos/      # TurnoCard, TurnoList, TurnoForm, TurnoFilters
│   │   ├── llamado/     # CurrentCallDisplay, CallHistory, AudioPlayer
│   │   └── admin/       # CRUD forms for sedes, consultorios, users, etc.
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SecretariaPage.tsx
│   │   ├── ProfesionalPage.tsx
│   │   ├── PantallaPublicaPage.tsx  # TV LED fullscreen view
│   │   ├── AdminPage.tsx
│   │   └── ReportesPage.tsx
│   ├── hooks/           # useSocket, useAuth, useTurnos, useAudio
│   ├── services/        # API client wrappers (axios instances)
│   ├── stores/          # Zustand stores (auth, turnos, config)
│   ├── types/           # Shared TS interfaces mirroring backend
│   ├── lib/             # Utilities, constants, audio engine
│   ├── router.tsx       # Route definitions with role guards
│   └── main.tsx
├── public/
│   └── sounds/          # Bell/chime audio files
├── index.html
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## Database (PostgreSQL)

### Tables

| Table | Purpose |
|-------|---------|
| `sedes` | Physical locations / branches |
| `roles` | User roles (ADMIN, SECRETARIA, PROFESIONAL) |
| `usuarios` | System users with auth credentials |
| `profesionales` | Doctors / professionals linked optionally to usuarios |
| `consultorios` | Offices, boxes, service points per sede |
| `pacientes` | Patients / clients |
| `estados_turno` | Catalog of valid turn states |
| `turnos` | Active and historical appointment queue entries |
| `historial_turno` | Audit log of every state transition |
| `configuracion_general` | Key-value config per sede or global |
| `pantallas` | Registered TV/monitor displays |
| `llamados_recientes` | Log of call announcements with audio text |

### Turn States

```
PENDIENTE → EN_ESPERA → LLAMANDO → EN_ATENCION → FINALIZADO
                ↓           ↓          ↓
              AUSENTE    AUSENTE    CANCELADO
                ↓           ↓
            REPROGRAMADO  REPROGRAMADO
                            ↓
                         DERIVADO
```

Valid transitions by role:

| From | To | Allowed roles |
|------|----|---------------|
| — | EN_ESPERA | SECRETARIA, ADMIN |
| EN_ESPERA | LLAMANDO | PROFESIONAL, ADMIN |
| LLAMANDO | LLAMANDO | PROFESIONAL (re-call) |
| LLAMANDO | EN_ATENCION | PROFESIONAL, ADMIN |
| LLAMANDO | AUSENTE | PROFESIONAL, SECRETARIA, ADMIN |
| EN_ATENCION | FINALIZADO | PROFESIONAL, ADMIN |
| EN_ATENCION | CANCELADO | PROFESIONAL, ADMIN |
| EN_ESPERA | CANCELADO | SECRETARIA, ADMIN |
| EN_ESPERA | DERIVADO | SECRETARIA, PROFESIONAL, ADMIN |
| LLAMANDO | DERIVADO | PROFESIONAL, ADMIN |
| AUSENTE | REPROGRAMADO | SECRETARIA, ADMIN |
| AUSENTE | EN_ESPERA | SECRETARIA, ADMIN (re-queue) |

---

## Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **ADMIN** | Full access: CRUD sedes, consultorios, profesionales, usuarios. Configure system. View reports. All turn operations. |
| **SECRETARIA** | Create turns, manage patient queue, mark absent, cancel, reschedule, derive. View all turns for the day. |
| **PROFESIONAL** | View own queue. Call next, re-call, mark in-attention, finalize, mark absent, derive. |
| **PUBLICO** | No login. Read-only TV view: current call, recent calls, queue status. |

---

## Real-time (Socket.IO)

- Each sede has a room `sede:{id}` — all clients in that sede join it.
- Each profesional has a room `profesional:{id}` — their personal queue updates.
- TV screens join `pantalla:{id}` or `sede:{id}` depending on config.
- Every turn state change emits to the relevant sede room.
- Call events (`turno:llamado`, `turno:rellamado`) include the audio text payload so TV clients can trigger TTS.
- JWT authentication on socket connection via `auth` handshake.

---

## Audio System

- **Chime**: Short bell sound played before voice announcement.
- **Voice**: Web Speech API `SpeechSynthesis` with Spanish (`es-AR`) voice.
- **Template**: Configurable per sede. Default: `"Turno {numero}. {nombre_paciente}. Dirigirse a {consultorio} con {profesional}."`
- **Privacy modes**: number-only, number + abbreviated name, full name.
- **Fallback**: If SpeechSynthesis unavailable, show visual-only alert with animation.
- **Architecture**: Decoupled `AudioEngine` interface to swap for server-side TTS later.

---

## Security

- **JWT auth**: Access token (15min) + refresh token (7d). Tokens in httpOnly cookies or Authorization header.
- **Password**: bcrypt with salt rounds ≥ 12.
- **Role middleware**: Every protected route checks role via middleware before controller.
- **Zod validation**: All request bodies validated server-side with Zod schemas.
- **Sanitization**: Input sanitization on all string fields.
- **CORS**: Restricted to configured origins (default: `http://localhost:5173`).
- **Environment**: All secrets in env vars; `.env` is gitignored.
- **Error handling**: Global error handler — never leak stack traces to client in production.
- **Rate limiting**: On auth endpoints.
- **Public routes**: TV screen endpoint requires no auth but exposes only queue data (no PII beyond configured display fields).

---

## Agent Behavioral Principles

### Identity

You are a Staff Software Engineer and technical lead specializing in full-stack TypeScript applications, real-time systems with Socket.IO, PostgreSQL database design, and production-grade UX for operational applications. You write clean, modular, typed, tested code that another engineer can run locally with minimal setup.

### Workflow

- Read existing modules before creating new ones. Reuse interfaces and patterns already established.
- Follow the directory structure defined above strictly.
- All user-facing text (UI labels, button text, audio prompts, error messages shown to users) is in **Spanish (Argentina)**. Code (variable names, types, comments, commit messages) in English.
- Prefer interfaces over concrete classes at module boundaries.
- Build features incrementally: database → repository → service → controller → route → frontend.

### Decision-Making

- **Zod everywhere** — validate all external inputs (env vars, HTTP bodies, query params, socket payloads) with Zod. Never trust raw data.
- **Pino for logging** — structured logs with request correlation IDs. Never `console.log` in production code.
- **No secrets to browser** — never return JWT secrets, DB credentials, or internal error details in API responses.
- **State machine for turns** — all turn state transitions must go through the service layer which validates the transition is legal for the current state and role.
- **Minimal dependencies** — the dependency list is intentionally lean. Don't add packages without justification.
- **Local-first** — `pnpm dev` must work with only PostgreSQL running locally. No external services required.
- **PostgreSQL raw queries** — use `pg` with parameterized queries. No ORM. Type the results manually. This keeps queries visible and optimizable.
- **Idempotent operations** — socket events and API calls should be safe to retry.

### Testing

- Use Vitest for both backend and frontend unit tests.
- Mock database calls in service tests; use a test database for repository integration tests.
- Test state transitions exhaustively — every valid and invalid combination.
- Test socket events with mock Socket.IO clients.
- Frontend: test critical hooks and state logic. Visual testing is optional.

### UX Principles

- **TV LED view**: Maximum legibility — large fonts, high contrast, minimal elements. Must be readable from 5+ meters.
- **Professional view**: Large touch-friendly buttons for primary actions (call, attend, finalize). Minimal clicks to complete a workflow.
- **Secretary view**: Efficient data entry with keyboard shortcuts. Quick turn creation flow.
- **Responsive**: Desktop-first but functional on tablets. TV view adapts to horizontal and vertical orientations.
- **Animations**: Subtle and purposeful — highlight current call, smooth transitions. Never distracting.

### Communication

- State what module is being changed and why. Don't narrate obvious steps.
- Surface architectural concerns early — if a change couples two modules that should be independent, flag it.
- When making database changes, always provide the SQL alongside the code change.
