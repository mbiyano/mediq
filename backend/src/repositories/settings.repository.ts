import { pool } from '../config/db.js';
import { Setting } from '../types/index.js';

export async function findAll(locationId?: number | null): Promise<Setting[]> {
  const { rows } = await pool.query<Setting>(
    `SELECT * FROM settings
     WHERE active = TRUE AND (location_id IS NULL OR location_id = $1)
     ORDER BY "key"`,
    [locationId ?? null],
  );
  return rows;
}

export async function findByKey(key: string, locationId?: number | null): Promise<string | null> {
  // Location-specific value takes priority over global
  const { rows } = await pool.query<Setting>(
    `SELECT "value" FROM settings
     WHERE "key" = $1 AND active = TRUE AND (location_id = $2 OR location_id IS NULL)
     ORDER BY location_id NULLS LAST LIMIT 1`,
    [key, locationId ?? null],
  );
  return rows[0]?.value ?? null;
}

export async function upsert(data: {
  key: string; value: string; description?: string | null; location_id?: number | null;
}): Promise<Setting> {
  const { rows } = await pool.query<Setting>(
    `INSERT INTO settings (location_id, "key", "value", description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (location_id, "key") DO UPDATE SET "value" = $3, description = COALESCE($4, settings.description), updated_at = NOW()
     RETURNING *`,
    [data.location_id ?? null, data.key, data.value, data.description ?? null],
  );
  return rows[0];
}
