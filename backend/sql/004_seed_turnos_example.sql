-- MediQ - Example data for development/demo
-- Run AFTER 003_seed_data.sql

-- ============================================================
-- SAMPLE PROFESSIONALS
-- ============================================================
INSERT INTO users (username, password_hash, first_name, last_name, email, role_id, location_id) VALUES
('dra.sanchez',  '$2b$12$LJ3m4ys3Lk0TSwHiPnGBe.5Gw5fC7FG7Ng3lXcH0aPmGZPfmVlYa', 'Maria',   'Sanchez',   'sanchez@mediq.local',  3, 1),
('dr.lopez',     '$2b$12$LJ3m4ys3Lk0TSwHiPnGBe.5Gw5fC7FG7Ng3lXcH0aPmGZPfmVlYa', 'Carlos',  'Lopez',     'lopez@mediq.local',    3, 1),
('secretaria1',  '$2b$12$LJ3m4ys3Lk0TSwHiPnGBe.5Gw5fC7FG7Ng3lXcH0aPmGZPfmVlYa', 'Laura',   'Martinez',  'martinez@mediq.local', 2, 1);

INSERT INTO professionals (license_number, first_name, last_name, specialty, phone, email, user_id, location_id) VALUES
('MP-12345', 'Maria',  'Sanchez', 'Clinica Medica',  '011-5555-0001', 'sanchez@mediq.local', 2, 1),
('MP-67890', 'Carlos', 'Lopez',   'Cardiologia',     '011-5555-0002', 'lopez@mediq.local',   3, 1);

-- ============================================================
-- SAMPLE PATIENTS
-- ============================================================
INSERT INTO patients (document_type, document_number, first_name, last_name, birth_date, phone) VALUES
('DNI', '30123456', 'Juan',      'Perez',      '1983-05-12', '011-6666-0001'),
('DNI', '28765432', 'Ana',       'Garcia',     '1980-11-23', '011-6666-0002'),
('DNI', '35987654', 'Pedro',     'Rodriguez',  '1990-03-08', '011-6666-0003'),
('DNI', '40111222', 'Lucia',     'Fernandez',  '1995-07-19', '011-6666-0004'),
('DNI', '27333444', 'Roberto',   'Diaz',       '1978-01-30', '011-6666-0005'),
('DNI', '33555666', 'Carolina',  'Morales',    '1987-09-15', '011-6666-0006'),
('DNI', '38777888', 'Martin',    'Gutierrez',  '1992-12-04', '011-6666-0007'),
('DNI', '29999000', 'Silvia',    'Romero',     '1981-06-27', '011-6666-0008');

-- ============================================================
-- SAMPLE APPOINTMENTS (today)
-- ============================================================
INSERT INTO appointments (location_id, appointment_date, ticket_number, priority, patient_id, professional_id, office_id, status, created_by) VALUES
(1, CURRENT_DATE, 'A001', 0, 1, 1, 1, 'COMPLETED',   4),
(1, CURRENT_DATE, 'A002', 0, 2, 1, 1, 'IN_SERVICE',  4),
(1, CURRENT_DATE, 'A003', 0, 3, 1, 1, 'CALLING',     4),
(1, CURRENT_DATE, 'A004', 0, 4, 1, 1, 'WAITING',     4),
(1, CURRENT_DATE, 'A005', 0, 5, 2, 2, 'IN_SERVICE',  4),
(1, CURRENT_DATE, 'A006', 0, 6, 2, 2, 'WAITING',     4),
(1, CURRENT_DATE, 'A007', 1, 7, 2, 2, 'WAITING',     4),
(1, CURRENT_DATE, 'A008', 0, 8, 1, 1, 'WAITING',     4);

-- Update timestamps for realistic data
UPDATE appointments SET called_at = NOW() - INTERVAL '5 minutes' WHERE id = 3;
UPDATE appointments SET attended_at = NOW() - INTERVAL '20 minutes' WHERE id = 2;
UPDATE appointments SET called_at = NOW() - INTERVAL '45 minutes', attended_at = NOW() - INTERVAL '40 minutes', finished_at = NOW() - INTERVAL '10 minutes' WHERE id = 1;
UPDATE appointments SET attended_at = NOW() - INTERVAL '15 minutes' WHERE id = 5;

-- ============================================================
-- SAMPLE HISTORY
-- ============================================================
INSERT INTO appointment_history (appointment_id, previous_status, new_status, user_id, comment, event_source) VALUES
(1, NULL,          'WAITING',    4, 'Appointment created',      'RECEPTIONIST'),
(1, 'WAITING',     'CALLING',    2, 'Called via screen',        'PROFESSIONAL'),
(1, 'CALLING',     'IN_SERVICE', 2, 'Entered office',          'PROFESSIONAL'),
(1, 'IN_SERVICE',  'COMPLETED',  2, 'Service completed',       'PROFESSIONAL'),
(2, NULL,          'WAITING',    4, 'Appointment created',      'RECEPTIONIST'),
(2, 'WAITING',     'CALLING',    2, 'Called via screen',        'PROFESSIONAL'),
(2, 'CALLING',     'IN_SERVICE', 2, 'Entered office',          'PROFESSIONAL'),
(3, NULL,          'WAITING',    4, 'Appointment created',      'RECEPTIONIST'),
(3, 'WAITING',     'CALLING',    2, 'Called via screen',        'PROFESSIONAL'),
(5, NULL,          'WAITING',    4, 'Appointment created',      'RECEPTIONIST'),
(5, 'WAITING',     'CALLING',    3, 'Called via screen',        'PROFESSIONAL'),
(5, 'CALLING',     'IN_SERVICE', 3, 'Entered office',          'PROFESSIONAL');

-- ============================================================
-- SAMPLE RECENT CALLS
-- ============================================================
INSERT INTO recent_calls (appointment_id, retry_count, display_text, audio_text, screen_id, user_id) VALUES
(3, 0, 'A003 - Pedro Rodriguez -> Consultorio 1', 'Turno A003. Pedro Rodriguez. Dirigirse al Consultorio 1 con Maria Sanchez.', 1, 2),
(5, 0, 'A005 - Roberto Diaz -> Consultorio 2',    'Turno A005. Roberto Diaz. Dirigirse al Consultorio 2 con Carlos Lopez.', 1, 3);
