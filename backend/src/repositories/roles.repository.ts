import { pool } from '../config/db.js';
import { Role } from '../types/index.js';

export async function findAll(): Promise<Role[]> {
  const { rows } = await pool.query<Role>('SELECT * FROM roles WHERE active = TRUE ORDER BY id');
  return rows;
}

export async function findById(id: number): Promise<Role | null> {
  const { rows } = await pool.query<Role>('SELECT * FROM roles WHERE id = $1', [id]);
  return rows[0] ?? null;
}
