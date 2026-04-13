-- MediQ - Database Schema
-- PostgreSQL 16+

-- ============================================================
-- 1. LOCATIONS
-- ============================================================
CREATE TABLE locations (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    address         VARCHAR(300),
    phone           VARCHAR(50),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. ROLES
-- ============================================================
CREATE TABLE roles (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(30)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(300),
    active          BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 3. USERS
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(80)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(200),
    phone           VARCHAR(50),
    role_id         INTEGER      NOT NULL REFERENCES roles(id),
    location_id     INTEGER      REFERENCES locations(id),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    last_access     TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. PROFESSIONALS
-- ============================================================
CREATE TABLE professionals (
    id              SERIAL PRIMARY KEY,
    license_number  VARCHAR(50),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    specialty       VARCHAR(150),
    phone           VARCHAR(50),
    email           VARCHAR(200),
    user_id         INTEGER      REFERENCES users(id),
    location_id     INTEGER      REFERENCES locations(id),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. OFFICES
-- ============================================================
CREATE TABLE offices (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER      NOT NULL REFERENCES locations(id),
    code            VARCHAR(20)  NOT NULL,
    name            VARCHAR(150) NOT NULL,
    area_type       VARCHAR(80),
    floor_location  VARCHAR(200),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (location_id, code)
);

-- ============================================================
-- 6. PATIENTS
-- ============================================================
CREATE TABLE patients (
    id              SERIAL PRIMARY KEY,
    document_type   VARCHAR(20)  NOT NULL DEFAULT 'DNI',
    document_number VARCHAR(30)  NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    birth_date      DATE,
    phone           VARCHAR(50),
    email           VARCHAR(200),
    notes           TEXT,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (document_type, document_number)
);

-- ============================================================
-- 7. APPOINTMENT_STATES (catalog)
-- ============================================================
CREATE TABLE appointment_states (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(30)  NOT NULL UNIQUE,
    name            VARCHAR(80)  NOT NULL,
    description     VARCHAR(300),
    sort_order      INTEGER      NOT NULL DEFAULT 0,
    active          BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 8. APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER      NOT NULL REFERENCES locations(id),
    appointment_date DATE        NOT NULL DEFAULT CURRENT_DATE,
    ticket_number   VARCHAR(20)  NOT NULL,
    priority        INTEGER      NOT NULL DEFAULT 0,
    patient_id      INTEGER      REFERENCES patients(id),
    professional_id INTEGER      REFERENCES professionals(id),
    office_id       INTEGER      REFERENCES offices(id),
    status          VARCHAR(30)  NOT NULL DEFAULT 'WAITING' REFERENCES appointment_states(code),
    notes           TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    called_at       TIMESTAMP,
    attended_at     TIMESTAMP,
    finished_at     TIMESTAMP,
    absent_at       TIMESTAMP,
    created_by      INTEGER      REFERENCES users(id),
    updated_by      INTEGER      REFERENCES users(id),
    active          BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ============================================================
-- 9. APPOINTMENT_HISTORY
-- ============================================================
CREATE TABLE appointment_history (
    id              SERIAL PRIMARY KEY,
    appointment_id  INTEGER      NOT NULL REFERENCES appointments(id),
    previous_status VARCHAR(30),
    new_status      VARCHAR(30)  NOT NULL,
    event_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    user_id         INTEGER      REFERENCES users(id),
    comment         TEXT,
    event_source    VARCHAR(50)  NOT NULL DEFAULT 'SYSTEM',
    audio_played    BOOLEAN      NOT NULL DEFAULT FALSE,
    audio_text      TEXT
);

-- ============================================================
-- 10. SETTINGS
-- ============================================================
CREATE TABLE settings (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER      REFERENCES locations(id),
    key             VARCHAR(100) NOT NULL,
    value           TEXT         NOT NULL,
    description     VARCHAR(300),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (location_id, key)
);

-- ============================================================
-- 11. SCREENS
-- ============================================================
CREATE TABLE screens (
    id              SERIAL PRIMARY KEY,
    location_id     INTEGER      NOT NULL REFERENCES locations(id),
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(50)  NOT NULL DEFAULT 'TV_LED',
    floor_location  VARCHAR(200),
    resolution      VARCHAR(20),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. RECENT_CALLS
-- ============================================================
CREATE TABLE recent_calls (
    id              SERIAL PRIMARY KEY,
    appointment_id  INTEGER      NOT NULL REFERENCES appointments(id),
    called_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    retry_count     INTEGER      NOT NULL DEFAULT 0,
    display_text    TEXT,
    audio_text      TEXT,
    screen_id       INTEGER      REFERENCES screens(id),
    user_id         INTEGER      REFERENCES users(id)
);
