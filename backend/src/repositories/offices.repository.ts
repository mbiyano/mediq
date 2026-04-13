import { pool } from '../config/db.js';
import { Office } from '../types/index.js';

export async function findAll(locationId?: number): Promise<Office[]> {
  if (locationId) {
    const { rows } = await pool.query<Office>(
      'SELECT * FROM offices WHERE location_id = $1 ORDER BY code',
      [locationId],
    );
    return rows;
  }
  const { rows } = await pool.query<Office>('SELECT * FROM offices ORDER BY location_id, code');
  return rows;
}

export async function findById(id: number): Promise<Office | null> {
  const { rows } = await pool.query<Office>('SELECT * FROM offices WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function create(data: {
  location_id: number; code: string; name: string;
  area_type?: string | null; floor_location?: string | null;
}): Promise<Office> {
  const { rows } = await pool.query<Office>(
    `INSERT INTO offices (location_id, code, name, area_type, floor_location)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.location_id, data.code, data.name, data.area_type ?? null, data.floor_location ?? null],
  );
  return rows[0];
}

export async function update(id: number, data: Partial<{
  location_id: number; code: string; name: string;
  area_type: string | null; floor_location: string | null; active: boolean;
}>): Promise<Office | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.location_id !== undefined) { fields.push(`location_id = $${idx++}`); values.push(data.location_id); }
  if (data.code !== undefined) { fields.push(`code = $${idx++}`); values.push(data.code); }
  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.area_type !== undefined) { fields.push(`area_type = $${idx++}`); values.push(data.area_type); }
  if (data.floor_location !== undefined) { fields.push(`floor_location = $${idx++}`); values.push(data.floor_location); }
  if (data.active !== undefined) { fields.push(`active = $${idx++}`); values.push(data.active); }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query<Office>(
    `UPDATE offices SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}
