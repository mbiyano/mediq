import * as appointmentsRepo from '../repositories/appointments.repository.js';
import * as historyRepo from '../repositories/history.repository.js';
import * as callsRepo from '../repositories/calls.repository.js';
import * as settingsRepo from '../repositories/settings.repository.js';
import * as patientsRepo from '../repositories/patients.repository.js';
import { VALID_TRANSITIONS, AppointmentStatus, AppointmentDetails, AuthUser } from '../types/index.js';
import { AppError } from '../middlewares/errorHandler.js';

export async function listAppointments(filters: {
  location_id?: number; date?: string; professional_id?: number;
  office_id?: number; status?: string;
}): Promise<AppointmentDetails[]> {
  return appointmentsRepo.findByFilters(filters);
}

export async function getAppointment(id: number): Promise<AppointmentDetails> {
  const appointment = await appointmentsRepo.findById(id);
  if (!appointment) throw new AppError(404, 'Appointment not found');
  return appointment;
}

export async function createAppointment(data: {
  location_id: number;
  patient_id?: number | null;
  professional_id?: number | null;
  office_id?: number | null;
  priority?: number;
  notes?: string | null;
  patient_first_name?: string;
  patient_last_name?: string;
  patient_document?: string;
}, user: AuthUser): Promise<AppointmentDetails> {
  let patientId = data.patient_id ?? null;

  // Quick patient creation if inline data provided
  if (!patientId && data.patient_first_name && data.patient_last_name) {
    const doc = data.patient_document ?? `TEMP-${Date.now()}`;
    let existing = await patientsRepo.findByDocument('DNI', doc);
    if (!existing) {
      existing = await patientsRepo.create({
        document_type: 'DNI',
        document_number: doc,
        first_name: data.patient_first_name,
        last_name: data.patient_last_name,
      });
    }
    patientId = existing.id;
  }

  const ticketNumber = await appointmentsRepo.getNextNumber(data.location_id);

  const appointment = await appointmentsRepo.create({
    location_id: data.location_id,
    ticket_number: ticketNumber,
    priority: data.priority ?? 0,
    patient_id: patientId,
    professional_id: data.professional_id,
    office_id: data.office_id,
    notes: data.notes,
    created_by: user.userId,
  });

  await historyRepo.create({
    appointment_id: appointment.id,
    previous_status: null,
    new_status: 'WAITING',
    user_id: user.userId,
    comment: 'Appointment created',
    event_source: user.role,
  });

  return appointment;
}

export async function changeStatus(
  appointmentId: number,
  newStatus: AppointmentStatus,
  user: AuthUser,
  comment?: string | null,
  transfer?: { target_professional_id?: number; target_office_id?: number },
): Promise<{ appointment: AppointmentDetails; audioText: string | null }> {
  const appointment = await appointmentsRepo.findById(appointmentId);
  if (!appointment) throw new AppError(404, 'Appointment not found');

  const currentStatus = appointment.status;

  // Validate transition
  const transitions = VALID_TRANSITIONS[currentStatus];
  const validTransition = transitions.find(
    (t) => t.to === newStatus && t.roles.includes(user.role),
  );

  if (!validTransition) {
    throw new AppError(400,
      `Invalid transition: ${currentStatus} -> ${newStatus} for role ${user.role}`,
    );
  }

  // Handle transfer
  if (newStatus === 'TRANSFERRED' && transfer) {
    if (transfer.target_professional_id || transfer.target_office_id) {
      await appointmentsRepo.updateProfessionalOffice(
        appointmentId,
        transfer.target_professional_id ?? appointment.professional_id!,
        transfer.target_office_id ?? appointment.office_id!,
        user.userId,
      );
    }
  }

  const updated = await appointmentsRepo.updateStatus(appointmentId, newStatus, user.userId);
  if (!updated) throw new AppError(500, 'Error updating appointment');

  // Build audio text for CALLING status
  let audioText: string | null = null;
  const isCall = newStatus === 'CALLING';

  if (isCall) {
    audioText = await buildAudioText(updated);

    // Record call
    const retryCount = await callsRepo.getRetryCount(appointmentId);
    const isRetry = currentStatus === 'CALLING';

    await callsRepo.create({
      appointment_id: appointmentId,
      retry_count: isRetry ? retryCount : 0,
      display_text: buildDisplayText(updated),
      audio_text: audioText,
      user_id: user.userId,
    });
  }

  // Record history
  await historyRepo.create({
    appointment_id: appointmentId,
    previous_status: currentStatus,
    new_status: newStatus,
    user_id: user.userId,
    comment: comment ?? getDefaultComment(newStatus),
    event_source: user.role,
    audio_played: isCall,
    audio_text: audioText,
  });

  return { appointment: updated, audioText };
}

export async function getStats(locationId: number, date?: string): Promise<Record<string, number>> {
  return appointmentsRepo.getStats(locationId, date);
}

export async function getHistory(appointmentId: number) {
  return historyRepo.findByAppointment(appointmentId);
}

// --- Helpers ---

async function buildAudioText(appointment: AppointmentDetails): Promise<string> {
  const template = await settingsRepo.findByKey('AUDIO_TEMPLATE', appointment.location_id)
    ?? 'Turno {number}. {patient_name}. Dirigirse a {office} con {professional}.';

  const privacyMode = await settingsRepo.findByKey('SCREEN_PRIVACY_MODE', appointment.location_id) ?? 'ABBREVIATED_NAME';

  let patientName = '';
  if (privacyMode === 'FULL_NAME') {
    patientName = [appointment.patient_first_name, appointment.patient_last_name].filter(Boolean).join(' ');
  } else if (privacyMode === 'ABBREVIATED_NAME') {
    patientName = appointment.patient_first_name
      ? `${appointment.patient_first_name} ${appointment.patient_last_name?.charAt(0) ?? ''}.`
      : '';
  }
  // NUMBER_ONLY: leave empty

  return template
    .replace('{number}', appointment.ticket_number)
    .replace('{patient_name}', patientName)
    .replace('{office}', appointment.office_name ?? '')
    .replace('{professional}', formatProfessionalName(appointment));
}

function buildDisplayText(appointment: AppointmentDetails): string {
  const parts = [appointment.ticket_number];
  if (appointment.patient_first_name) {
    parts.push(`${appointment.patient_first_name} ${appointment.patient_last_name ?? ''}`);
  }
  if (appointment.office_name) {
    parts.push(`-> ${appointment.office_name}`);
  }
  return parts.join(' - ');
}

function formatProfessionalName(appointment: AppointmentDetails): string {
  if (!appointment.professional_first_name) return '';
  const lastName = appointment.professional_last_name ?? '';
  return `${appointment.professional_first_name} ${lastName}`;
}

function getDefaultComment(status: AppointmentStatus): string {
  const comments: Record<AppointmentStatus, string> = {
    PENDING: 'Appointment pending',
    WAITING: 'Patient waiting',
    CALLING: 'Called via screen',
    IN_SERVICE: 'Entered office',
    COMPLETED: 'Service completed',
    ABSENT: 'Patient absent',
    CANCELLED: 'Appointment cancelled',
    RESCHEDULED: 'Appointment rescheduled',
    TRANSFERRED: 'Appointment transferred',
  };
  return comments[status];
}
