import { pool } from '../config/db.js';
import { HistoryEntry } from '../types/index.js';

export async function create(data: {
  appointment_id: number; previous_status: string | null; new_status: string;
  user_id: number | null; comment?: string | null;
  event_source?: string; audio_played?: boolean; audio_text?: string | null;
}): Promise<HistoryEntry> {
  const { rows } = await pool.query<HistoryEntry>(
    `INSERT INTO appointment_history (appointment_id, previous_status, new_status, user_id, comment, event_source, audio_played, audio_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.appointment_id, data.previous_status, data.new_status, data.user_id,
     data.comment ?? null, data.event_source ?? 'SYSTEM',
     data.audio_played ?? false, data.audio_text ?? null],
  );
  return rows[0];
}

export async function findByAppointment(appointmentId: number): Promise<HistoryEntry[]> {
  const { rows } = await pool.query<HistoryEntry>(
    'SELECT * FROM appointment_history WHERE appointment_id = $1 ORDER BY event_at ASC',
    [appointmentId],
  );
  return rows;
}

export async function findByDateRange(locationId: number, from: string, to: string): Promise<(HistoryEntry & { ticket_number: string })[]> {
  const { rows } = await pool.query(
    `SELECT h.*, a.ticket_number
     FROM appointment_history h
     JOIN appointments a ON h.appointment_id = a.id
     WHERE a.location_id = $1 AND h.event_at >= $2 AND h.event_at <= $3
     ORDER BY h.event_at DESC`,
    [locationId, from, to],
  );
  return rows;
}
