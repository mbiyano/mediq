import { pool } from '../config/db.js';
import { Screen } from '../types/index.js';

export async function findAll(locationId?: number): Promise<Screen[]> {
  if (locationId) {
    const { rows } = await pool.query<Screen>(
      'SELECT * FROM screens WHERE location_id = $1 ORDER BY name',
      [locationId],
    );
    return rows;
  }
  const { rows } = await pool.query<Screen>('SELECT * FROM screens ORDER BY location_id, name');
  return rows;
}

export async function findById(id: number): Promise<Screen | null> {
  const { rows } = await pool.query<Screen>('SELECT * FROM screens WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function create(data: {
  location_id: number; name: string; type?: string;
  floor_location?: string | null; resolution?: string | null;
}): Promise<Screen> {
  const { rows } = await pool.query<Screen>(
    `INSERT INTO screens (location_id, name, type, floor_location, resolution)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.location_id, data.name, data.type ?? 'TV_LED', data.floor_location ?? null, data.resolution ?? null],
  );
  return rows[0];
}
