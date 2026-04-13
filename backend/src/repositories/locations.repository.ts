import { pool } from '../config/db.js';
import { Location } from '../types/index.js';

export async function findAll(): Promise<Location[]> {
  const { rows } = await pool.query<Location>('SELECT * FROM locations ORDER BY name');
  return rows;
}

export async function findById(id: number): Promise<Location | null> {
  const { rows } = await pool.query<Location>('SELECT * FROM locations WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function create(data: { code: string; name: string; address?: string | null; phone?: string | null }): Promise<Location> {
  const { rows } = await pool.query<Location>(
    `INSERT INTO locations (code, name, address, phone)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.code, data.name, data.address ?? null, data.phone ?? null],
  );
  return rows[0];
}

export async function update(id: number, data: Partial<{ code: string; name: string; address: string | null; phone: string | null; active: boolean }>): Promise<Location | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.code !== undefined) { fields.push(`code = $${idx++}`); values.push(data.code); }
  if (data.name !== undefined) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.address !== undefined) { fields.push(`address = $${idx++}`); values.push(data.address); }
  if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
  if (data.active !== undefined) { fields.push(`active = $${idx++}`); values.push(data.active); }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query<Location>(
    `UPDATE locations SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}
