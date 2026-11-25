import { Pool, PoolClient, QueryResult, QueryConfig, QueryResultRow } from 'pg';

// Initialize connection pool
let pool: Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

/**
 * Hosted Postgres (Neon, Vercel Postgres, Supabase) requires SSL.
 * Localhost stays unencrypted. `sslmode` is stripped from the URL because
 * node-postgres otherwise verifies certificates and rejects Neon.
 */
export function poolConfig(databaseUrl: string): {
  connectionString: string;
  ssl?: { rejectUnauthorized: false };
} {
  try {
    const url = new URL(databaseUrl);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    url.searchParams.delete('sslmode');
    return {
      connectionString: url.toString(),
      ssl: local ? undefined : { rejectUnauthorized: false },
    };
  } catch {
    const local = /localhost|127\.0\.0\.1/.test(databaseUrl);
    return {
      connectionString: databaseUrl,
      ssl: local ? undefined : { rejectUnauthorized: false },
    };
  }
}

/**
 * Get or create the PostgreSQL connection pool
 */
/**
 * Runtime uses the pooled Neon URL (DATABASE_URL).
 * Migrations use the direct URL so DDL is not sent through PgBouncer.
 */
export function migrationDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL
  );
}

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const config = poolConfig(databaseUrl);
    const serverless = Boolean(process.env.VERCEL);
    pool = new Pool({
      connectionString: config.connectionString,
      ssl: config.ssl,
      max: serverless ? 1 : 10,
      idleTimeoutMillis: serverless ? 5000 : 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Get a client from the pool for manual transaction management
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Execute a query against the database
 *
 * @param config - Query configuration (text and values)
 * @returns Query result with rows
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  config: QueryConfig | string,
  values?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();

  if (typeof config === 'string') {
    return pool.query<T>(config, values);
  }

  return pool.query<T>(config);
}

/**
 * Execute a query that returns a single row
 *
 * @param text - SQL query text
 * @param values - Query parameters
 * @returns Single row or null
 */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values?: any[]
): Promise<T | null> {
  const result = await query<T>(text, values);
  return result.rows[0] || null;
}

/**
 * Execute multiple queries within a transaction
 *
 * @param callback - Async function that executes queries using provided client
 * @returns Result from callback
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Health check: Test database connection
 *
 * @returns Object with status and database connection status
 */
export async function health(): Promise<{
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  timestamp?: string;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return {
      status: 'error',
      database: 'disconnected',
      error: 'DATABASE_URL is not set',
    };
  }

  try {
    const result = await query('SELECT NOW()');

    if (result.rows.length > 0) {
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        status: 'error',
        database: 'disconnected',
        error: 'No response from database',
      };
    }
  } catch (error) {
    return {
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Close all connections in the pool
 * (Call this during application shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Type exports for convenience
export type { Pool, PoolClient, QueryResult, QueryConfig };
