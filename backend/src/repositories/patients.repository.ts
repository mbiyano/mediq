import { pool } from '../config/db.js';
import { Patient } from '../types/index.js';

export async function findAll(search?: string): Promise<Patient[]> {
  if (search) {
    const term = `%${search}%`;
    const { rows } = await pool.query<Patient>(
      `SELECT * FROM patients
       WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR document_number ILIKE $1)
       AND active = TRUE
       ORDER BY last_name, first_name
       LIMIT 50`,
      [term],
    );
    return rows;
  }
  const { rows } = await pool.query<Patient>(
    'SELECT * FROM patients WHERE active = TRUE ORDER BY last_name, first_name LIMIT 200',
  );
  return rows;
}

export async function findById(id: number): Promise<Patient | null> {
  const { rows } = await pool.query<Patient>('SELECT * FROM patients WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function findByDocument(type: string, number_: string): Promise<Patient | null> {
  const { rows } = await pool.query<Patient>(
    'SELECT * FROM patients WHERE document_type = $1 AND document_number = $2',
    [type, number_],
  );
  return rows[0] ?? null;
}

export async function create(data: {
  document_type: string; document_number: string; first_name: string; last_name: string;
  birth_date?: string | null; phone?: string | null; email?: string | null; notes?: string | null;
}): Promise<Patient> {
  const { rows } = await pool.query<Patient>(
    `INSERT INTO patients (document_type, document_number, first_name, last_name, birth_date, phone, email, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.document_type, data.document_number, data.first_name, data.last_name,
     data.birth_date ?? null, data.phone ?? null, data.email ?? null, data.notes ?? null],
  );
  return rows[0];
}

export async function update(id: number, data: Partial<{
  document_type: string; document_number: string; first_name: string; last_name: string;
  birth_date: string | null; phone: string | null; email: string | null;
  notes: string | null; active: boolean;
}>): Promise<Patient | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (data.document_type !== undefined) { fields.push(`document_type = $${idx++}`); values.push(data.document_type); }
  if (data.document_number !== undefined) { fields.push(`document_number = $${idx++}`); values.push(data.document_number); }
  if (data.first_name !== undefined) { fields.push(`first_name = $${idx++}`); values.push(data.first_name); }
  if (data.last_name !== undefined) { fields.push(`last_name = $${idx++}`); values.push(data.last_name); }
  if (data.birth_date !== undefined) { fields.push(`birth_date = $${idx++}`); values.push(data.birth_date); }
  if (data.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(data.phone); }
  if (data.email !== undefined) { fields.push(`email = $${idx++}`); values.push(data.email); }
  if (data.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(data.notes); }
  if (data.active !== undefined) { fields.push(`active = $${idx++}`); values.push(data.active); }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query<Patient>(
    `UPDATE patients SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}
