-- MediQ - Indexes for operational performance

-- Appointments: daily queue lookups
CREATE INDEX idx_appointments_location_date ON appointments (location_id, appointment_date);
CREATE INDEX idx_appointments_professional_date ON appointments (professional_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments (status);
CREATE INDEX idx_appointments_office_date ON appointments (office_id, appointment_date);
CREATE INDEX idx_appointments_patient ON appointments (patient_id);
CREATE INDEX idx_appointments_date_status ON appointments (appointment_date, status) WHERE active = TRUE;

-- History: audit trail lookups
CREATE INDEX idx_history_appointment ON appointment_history (appointment_id);
CREATE INDEX idx_history_event_at ON appointment_history (event_at);
CREATE INDEX idx_history_user ON appointment_history (user_id);

-- Recent calls: TV screen queries
CREATE INDEX idx_calls_appointment ON recent_calls (appointment_id);
CREATE INDEX idx_calls_called_at ON recent_calls (called_at DESC);
CREATE INDEX idx_calls_screen ON recent_calls (screen_id, called_at DESC);

-- Patients: document search
CREATE INDEX idx_patients_document ON patients (document_type, document_number);
CREATE INDEX idx_patients_last_name ON patients (last_name);

-- Professionals: location lookup
CREATE INDEX idx_professionals_location ON professionals (location_id) WHERE active = TRUE;

-- Offices: location lookup
CREATE INDEX idx_offices_location ON offices (location_id) WHERE active = TRUE;

-- Users: login
CREATE INDEX idx_users_username ON users (username) WHERE active = TRUE;
CREATE INDEX idx_users_role ON users (role_id);

-- Settings: key lookup
CREATE INDEX idx_settings_location_key ON settings (location_id, key) WHERE active = TRUE;
