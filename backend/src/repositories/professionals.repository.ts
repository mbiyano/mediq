import { pool } from '../config/db.js';
import { Professional } from '../types/index.js';

export async function findAll(locationId?: number): Promise<Professional[]> {
  if (locationId) {
    const { rows } = await pool.query<Professional>(
      'SELECT * FROM professionals WHERE location_id = $1 ORDER BY last_name, first_name',
      [locationId],
    );
    return rows;
  }
  const { rows } = await pool.query<Professional>('SELECT * FROM professionals ORDER BY last_name, first_name');
  return rows;
}

export async function findById(id: number): Promise<Professional | null> {
  const { rows } = await pool.query<Professional>('SELECT * FROM professionals WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function findByUserId(userId: number): Promise<Professional | null> {
  const { rows } = await pool.query<Professional>(
    'SELECT * FROM professionals WHERE user_id = $1 AND active = TRUE',
    [userId],
  );
  return rows[0] ?? null;
}

export async function create(data: {
  license_number?: string | null; first_name: string; last_name: string; specialty?: string | null;
  phone?: string | null; email?: string | null; user_id?: number | null; location_id?: number | null;
}): Promise<Professional> {
  const { rows } = await pool.query<Professional>(
    `INSERT INTO professionals (license_number, first_name, last_name, specialty, phone, email, user_id, location_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.license_number ?? null, data.first_name, data.last_name, data.specialty ?? null,
     data.phone ?? null, data.email ?? null, data.user_id ?? null, data.location_id ?? null],
  );
  return rows[0];
}

export async function update(id: number, data: Partial<{
  license_number: string | null; first_name: string; last_name: string; specialty: string | null;
  phone: string | null; email: string | null; user_id: number | null; location_id: number | null; active: boolean;
}>): Promise<Professional | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.license_number !== undefined) { fields.push(`license_number = $${idx++}`); values.push(data.license_number); }
  if (data.first_name !== undefined) { fields.push(`first_name = $${idx++}`); values.push(data.first_name); }
  if (data.last_name !== undefined) { fields.push(`last_name = $${idx++}`); values.push(data.last_name); }
  if (data.specialty !== undefined) { fields.push(`specialty = $${idx++}`); values.push(data.specialty); }
  if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
  if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
  if (data.user_id !== undefined) { fields.push(`user_id = $${idx++}`); values.push(data.user_id); }
  if (data.location_id !== undefined) { fields.push(`location_id = $${idx++}`); values.push(data.location_id); }
  if (data.active !== undefined) { fields.push(`active = $${idx++}`); values.push(data.active); }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query<Professional>(
    `UPDATE professionals SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}
