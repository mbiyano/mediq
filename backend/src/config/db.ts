import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// Build pool config: DATABASE_URL takes priority (Supabase), fallback to individual vars (local)
const useConnectionString = !!env.DATABASE_URL;
const sslEnabled = useConnectionString || env.DB_SSL === 'true';

const poolConfig: pg.PoolConfig = useConnectionString
  ? {
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected database pool error');
});

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info(
      { mode: useConnectionString ? 'DATABASE_URL' : 'individual vars', ssl: sslEnabled },
      'Database connection established',
    );
  } finally {
    client.release();
  }
}
