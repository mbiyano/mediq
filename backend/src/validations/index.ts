import { z } from 'zod';

// Auth
export const loginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

// Locations
export const createLocationSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(150),
  address: z.string().max(300).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

// Users
export const createUserSchema = z.object({
  username: z.string().min(3).max(80),
  password: z.string().min(6).max(128),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  role_id: z.number().int().positive(),
  location_id: z.number().int().positive().nullable().optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6).max(128).optional(),
  active: z.boolean().optional(),
});

// Professionals
export const createProfessionalSchema = z.object({
  license_number: z.string().max(50).nullable().optional(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  specialty: z.string().max(150).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional(),
  user_id: z.number().int().positive().nullable().optional(),
  location_id: z.number().int().positive().nullable().optional(),
});

export const updateProfessionalSchema = createProfessionalSchema.partial().extend({
  active: z.boolean().optional(),
});

// Offices
export const createOfficeSchema = z.object({
  location_id: z.number().int().positive(),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(150),
  area_type: z.string().max(80).nullable().optional(),
  floor_location: z.string().max(200).nullable().optional(),
});

export const updateOfficeSchema = createOfficeSchema.partial().extend({
  active: z.boolean().optional(),
});

// Patients
export const createPatientSchema = z.object({
  document_type: z.string().min(1).max(20).default('DNI'),
  document_number: z.string().min(1).max(30),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  birth_date: z.string().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().email().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updatePatientSchema = createPatientSchema.partial().extend({
  active: z.boolean().optional(),
});

// Appointments
export const createAppointmentSchema = z.object({
  location_id: z.number().int().positive(),
  patient_id: z.number().int().positive().nullable().optional(),
  professional_id: z.number().int().positive().nullable().optional(),
  office_id: z.number().int().positive().nullable().optional(),
  priority: z.number().int().min(0).max(10).default(0),
  notes: z.string().nullable().optional(),
  patient_first_name: z.string().max(100).optional(),
  patient_last_name: z.string().max(100).optional(),
  patient_document: z.string().max(30).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    'PENDING', 'WAITING', 'CALLING', 'IN_SERVICE',
    'COMPLETED', 'ABSENT', 'CANCELLED', 'RESCHEDULED', 'TRANSFERRED',
  ]),
  comment: z.string().nullable().optional(),
  target_professional_id: z.number().int().positive().optional(),
  target_office_id: z.number().int().positive().optional(),
});

// Appointment filters
export const appointmentFiltersSchema = z.object({
  location_id: z.coerce.number().int().positive().optional(),
  date: z.string().optional(),
  professional_id: z.coerce.number().int().positive().optional(),
  office_id: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
});

// Settings
export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  description: z.string().max(300).nullable().optional(),
  location_id: z.number().int().positive().nullable().optional(),
});

// Screens
export const createScreenSchema = z.object({
  location_id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  type: z.string().max(50).default('TV_LED'),
  floor_location: z.string().max(200).nullable().optional(),
  resolution: z.string().max(20).nullable().optional(),
});
