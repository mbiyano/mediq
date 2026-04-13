import { pool } from '../config/db.js';
import { User, PublicUser } from '../types/index.js';

export async function findByUsername(username: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    'SELECT * FROM users WHERE username = $1 AND active = TRUE',
    [username],
  );
  return rows[0] ?? null;
}

export async function findById(id: number): Promise<PublicUser | null> {
  const { rows } = await pool.query<PublicUser>(
    `SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
            u.role_id, r.code AS role_code, u.location_id, u.active, u.last_access
     FROM users u JOIN roles r ON u.role_id = r.id
     WHERE u.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findAll(): Promise<PublicUser[]> {
  const { rows } = await pool.query<PublicUser>(
    `SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
            u.role_id, r.code AS role_code, u.location_id, u.active, u.last_access
     FROM users u JOIN roles r ON u.role_id = r.id
     ORDER BY u.last_name, u.first_name`,
  );
  return rows;
}

export async function create(data: {
  username: string; password_hash: string; first_name: string; last_name: string;
  email?: string | null; phone?: string | null; role_id: number; location_id?: number | null;
}): Promise<PublicUser> {
  const { rows } = await pool.query(
    `INSERT INTO users (username, password_hash, first_name, last_name, email, phone, role_id, location_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [data.username, data.password_hash, data.first_name, data.last_name, data.email ?? null, data.phone ?? null, data.role_id, data.location_id ?? null],
  );
  return (await findById(rows[0].id))!;
}

export async function update(id: number, data: Partial<{
  username: string; password_hash: string; first_name: string; last_name: string;
  email: string | null; phone: string | null; role_id: number; location_id: number | null; active: boolean;
}>): Promise<PublicUser | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.username !== undefined) { fields.push(`username = $${idx++}`); values.push(data.username); }
  if (data.password_hash !== undefined) { fields.push(`password_hash = $${idx++}`); values.push(data.password_hash); }
  if (data.first_name !== undefined) { fields.push(`first_name = $${idx++}`); values.push(data.first_name); }
  if (data.last_name !== undefined) { fields.push(`last_name = $${idx++}`); values.push(data.last_name); }
  if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
  if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
  if (data.role_id !== undefined) { fields.push(`role_id = $${idx++}`); values.push(data.role_id); }
  if (data.location_id !== undefined) { fields.push(`location_id = $${idx++}`); values.push(data.location_id); }
  if (data.active !== undefined) { fields.push(`active = $${idx++}`); values.push(data.active); }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`,
    values,
  );
  return findById(id);
}

export async function updateLastAccess(id: number): Promise<void> {
  await pool.query('UPDATE users SET last_access = NOW() WHERE id = $1', [id]);
}
