-- MediQ - Base seed data (roles, states, default config)

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (code, name, description) VALUES
('ADMIN',         'Administrator',   'Full system access'),
('RECEPTIONIST',  'Receptionist',    'Appointment and patient management'),
('PROFESSIONAL',  'Professional',    'Patient care and personal queue management');

-- ============================================================
-- APPOINTMENT STATES
-- ============================================================
INSERT INTO appointment_states (code, name, description, sort_order) VALUES
('PENDING',       'Pending',         'Scheduled appointment, not yet in queue',        0),
('WAITING',       'Waiting',         'Patient in the waiting room',                    1),
('CALLING',       'Calling',         'Patient being called via screen/audio',           2),
('IN_SERVICE',    'In Service',      'Patient inside the office',                      3),
('COMPLETED',     'Completed',       'Service completed',                              4),
('ABSENT',        'Absent',          'Patient did not respond to the call',            5),
('CANCELLED',     'Cancelled',       'Appointment cancelled',                          6),
('RESCHEDULED',   'Rescheduled',     'Appointment rescheduled for another date/time',  7),
('TRANSFERRED',   'Transferred',     'Appointment transferred to another professional or area', 8);

-- ============================================================
-- DEFAULT LOCATION
-- ============================================================
INSERT INTO locations (code, name, address, phone) VALUES
('SEDE01', 'Sede Central', 'Av. Corrientes 1234, CABA', '011-4444-5555');

-- ============================================================
-- ADMIN USER (password: admin123)
-- bcrypt hash for "admin123" with 12 rounds
-- ============================================================
INSERT INTO users (username, password_hash, first_name, last_name, email, role_id, location_id) VALUES
('admin', '$2b$12$XAXygLpvYwlW0JwxJXXGjuER7taJDYpihN0//50RY5ML8yRUUgUY.', 'Admin', 'Sistema', 'admin@mediq.local', 1, 1);

-- ============================================================
-- DEFAULT SETTINGS
-- ============================================================
INSERT INTO settings (location_id, key, value, description) VALUES
(NULL, 'INSTITUTION_NAME',       'MediQ',                                      'Name shown on public screen'),
(NULL, 'AUDIO_ENABLED',          'true',                                            'Enable call audio'),
(NULL, 'AUDIO_TEMPLATE',         'Turno {number}. {patient_name}. Dirigirse a {office} con {professional}.', 'Audio text template'),
(NULL, 'AUDIO_VOICE_LANG',       'es-AR',                                           'SpeechSynthesis voice language'),
(NULL, 'AUDIO_VOICE_RATE',       '0.9',                                             'Voice speed (0.1 to 10)'),
(NULL, 'AUDIO_VOICE_PITCH',      '1',                                               'Voice pitch (0 to 2)'),
(NULL, 'SCREEN_PRIVACY_MODE',    'ABBREVIATED_NAME',                                'Privacy mode: NUMBER_ONLY, ABBREVIATED_NAME, FULL_NAME'),
(NULL, 'SCREEN_VISIBLE_CALLS',   '5',                                               'Number of recent calls visible on TV'),
(NULL, 'SCREEN_BG_COLOR',        '#1e293b',                                         'Public screen background color'),
(NULL, 'SCREEN_CALL_COLOR',      '#2563eb',                                         'Active call highlight color'),
(NULL, 'TICKET_PREFIX',          'A',                                               'Ticket number prefix'),
(NULL, 'TICKET_DAILY_RESET',     'true',                                            'Reset ticket numbering each day'),
(1,    'INSTITUTION_NAME',       'Centro Medico San Martin',                        'Name for the main location');

-- ============================================================
-- SAMPLE OFFICES
-- ============================================================
INSERT INTO offices (location_id, code, name, area_type, floor_location) VALUES
(1, 'C1',  'Consultorio 1',  'OFFICE',      'Ground Floor'),
(1, 'C2',  'Consultorio 2',  'OFFICE',      'Ground Floor'),
(1, 'C3',  'Consultorio 3',  'OFFICE',      'First Floor'),
(1, 'LAB', 'Laboratorio',    'LABORATORY',  'Basement'),
(1, 'RX',  'Rayos X',        'DIAGNOSTICS', 'Basement');

-- ============================================================
-- SAMPLE SCREEN
-- ============================================================
INSERT INTO screens (location_id, name, type, floor_location, resolution) VALUES
(1, 'TV Sala de Espera PB', 'TV_LED', 'Waiting Room - Ground Floor', '1920x1080');
