import { pool } from '../config/db.js';
import { RecentCall } from '../types/index.js';

export async function create(data: {
  appointment_id: number; retry_count: number; display_text: string | null;
  audio_text: string | null; screen_id?: number | null; user_id?: number | null;
}): Promise<RecentCall> {
  const { rows } = await pool.query<RecentCall>(
    `INSERT INTO recent_calls (appointment_id, retry_count, display_text, audio_text, screen_id, user_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.appointment_id, data.retry_count, data.display_text, data.audio_text, data.screen_id ?? null, data.user_id ?? null],
  );
  return rows[0];
}

export async function findRecent(locationId: number, limit: number = 5): Promise<(RecentCall & {
  ticket_number: string; patient_first_name: string | null; patient_last_name: string | null;
  office_name: string | null; office_code: string | null;
  professional_first_name: string | null; professional_last_name: string | null;
})[]> {
  const { rows } = await pool.query(
    `SELECT rc.*, a.ticket_number,
            p.first_name AS patient_first_name, p.last_name AS patient_last_name,
            o.name AS office_name, o.code AS office_code,
            pr.first_name AS professional_first_name, pr.last_name AS professional_last_name
     FROM recent_calls rc
     JOIN appointments a ON rc.appointment_id = a.id
     LEFT JOIN patients p ON a.patient_id = p.id
     LEFT JOIN offices o ON a.office_id = o.id
     LEFT JOIN professionals pr ON a.professional_id = pr.id
     WHERE a.location_id = $1
       AND rc.called_at >= CURRENT_DATE
     ORDER BY rc.called_at DESC
     LIMIT $2`,
    [locationId, limit],
  );
  return rows;
}

export async function getRetryCount(appointmentId: number): Promise<number> {
  const { rows } = await pool.query(
    'SELECT COUNT(*) as count FROM recent_calls WHERE appointment_id = $1',
    [appointmentId],
  );
  return parseInt(rows[0].count, 10);
}
