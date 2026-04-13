import { pool } from '../config/db.js';
import { Appointment, AppointmentDetails, AppointmentStatus } from '../types/index.js';

const APPOINTMENT_DETAIL_QUERY = `
  SELECT a.*,
         p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.document_number AS patient_document,
         pr.first_name AS professional_first_name, pr.last_name AS professional_last_name, pr.specialty AS professional_specialty,
         o.name AS office_name, o.code AS office_code,
         l.name AS location_name
  FROM appointments a
  LEFT JOIN patients p ON a.patient_id = p.id
  LEFT JOIN professionals pr ON a.professional_id = pr.id
  LEFT JOIN offices o ON a.office_id = o.id
  LEFT JOIN locations l ON a.location_id = l.id
`;

export async function findByFilters(filters: {
  location_id?: number; date?: string; professional_id?: number;
  office_id?: number; status?: string;
}): Promise<AppointmentDetails[]> {
  const conditions: string[] = ['a.active = TRUE'];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.location_id) { conditions.push(`a.location_id = $${idx++}`); values.push(filters.location_id); }
  if (filters.date) { conditions.push(`a.appointment_date = $${idx++}`); values.push(filters.date); }
  else { conditions.push(`a.appointment_date = CURRENT_DATE`); }
  if (filters.professional_id) { conditions.push(`a.professional_id = $${idx++}`); values.push(filters.professional_id); }
  if (filters.office_id) { conditions.push(`a.office_id = $${idx++}`); values.push(filters.office_id); }
  if (filters.status) { conditions.push(`a.status = $${idx++}`); values.push(filters.status); }

  const { rows } = await pool.query<AppointmentDetails>(
    `${APPOINTMENT_DETAIL_QUERY} WHERE ${conditions.join(' AND ')} ORDER BY a.priority DESC, a.created_at ASC`,
    values,
  );
  return rows;
}

export async function findById(id: number): Promise<AppointmentDetails | null> {
  const { rows } = await pool.query<AppointmentDetails>(
    `${APPOINTMENT_DETAIL_QUERY} WHERE a.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getNextNumber(locationId: number): Promise<string> {
  // Get prefix from config or default
  const configResult = await pool.query(
    `SELECT "value" FROM settings
     WHERE "key" = 'TICKET_PREFIX' AND (location_id = $1 OR location_id IS NULL)
     ORDER BY location_id NULLS LAST LIMIT 1`,
    [locationId],
  );
  const prefix = configResult.rows[0]?.value ?? 'A';

  // Get count of today's appointments for this location
  const countResult = await pool.query(
    `SELECT COUNT(*) as count FROM appointments WHERE location_id = $1 AND appointment_date = CURRENT_DATE`,
    [locationId],
  );
  const num = parseInt(countResult.rows[0].count, 10) + 1;
  return `${prefix}${String(num).padStart(3, '0')}`;
}

export async function create(data: {
  location_id: number; ticket_number: string; priority: number;
  patient_id?: number | null; professional_id?: number | null;
  office_id?: number | null; notes?: string | null;
  created_by?: number | null;
}): Promise<AppointmentDetails> {
  const { rows } = await pool.query<Appointment>(
    `INSERT INTO appointments (location_id, ticket_number, priority, patient_id, professional_id, office_id,
                               status, notes, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'WAITING', $7, $8, $8) RETURNING *`,
    [data.location_id, data.ticket_number, data.priority, data.patient_id ?? null,
     data.professional_id ?? null, data.office_id ?? null,
     data.notes ?? null, data.created_by ?? null],
  );
  return (await findById(rows[0].id))!;
}

export async function updateStatus(id: number, status: AppointmentStatus, userId: number): Promise<AppointmentDetails | null> {
  const timestampField = getTimestampField(status);
  const extraSet = timestampField ? `, ${timestampField} = NOW()` : '';

  await pool.query(
    `UPDATE appointments SET status = $1, updated_by = $2${extraSet}
     WHERE id = $3`,
    [status, userId, id],
  );
  return findById(id);
}

export async function updateProfessionalOffice(
  id: number, professionalId: number, officeId: number, userId: number,
): Promise<AppointmentDetails | null> {
  await pool.query(
    `UPDATE appointments SET professional_id = $1, office_id = $2, updated_by = $3
     WHERE id = $4`,
    [professionalId, officeId, userId, id],
  );
  return findById(id);
}

// Stats for dashboard
export async function getStats(locationId: number, date?: string): Promise<Record<string, number>> {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*) as count
     FROM appointments WHERE location_id = $1 AND appointment_date = ${date ? '$2' : 'CURRENT_DATE'} AND active = TRUE
     GROUP BY status`,
    date ? [locationId, date] : [locationId],
  );
  const stats: Record<string, number> = {
    WAITING: 0, CALLING: 0, IN_SERVICE: 0, COMPLETED: 0, ABSENT: 0, CANCELLED: 0, TOTAL: 0,
  };
  for (const row of rows) {
    stats[row.status] = parseInt(row.count, 10);
    stats.TOTAL += parseInt(row.count, 10);
  }
  return stats;
}

function getTimestampField(status: AppointmentStatus): string | null {
  switch (status) {
    case 'CALLING': return 'called_at';
    case 'IN_SERVICE': return 'attended_at';
    case 'COMPLETED': return 'finished_at';
    case 'ABSENT': return 'absent_at';
    default: return null;
  }
}
