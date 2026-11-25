import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { migrationDatabaseUrl, poolConfig } from '../lib/db';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

/**
 * Apply db/migrations in filename order. Safe to run on every build.
 * Uses the direct Neon URL when DATABASE_URL_UNPOOLED (or POSTGRES_URL_NON_POOLING) is set.
 * Does not insert sample jobs.
 */
async function main() {
  const databaseUrl = migrationDatabaseUrl();
  if (!databaseUrl) {
    const required = process.env.npm_lifecycle_event === 'migrate';
    const message = 'No DATABASE_URL or DATABASE_URL_UNPOOLED. Skipping migrations.';
    if (required) {
      console.error(message);
      process.exit(1);
    }
    console.log(message);
    return;
  }

  const config = poolConfig(databaseUrl);
  const pool = new Pool({
    connectionString: config.connectionString,
    ssl: config.ssl,
    max: 1,
    connectionTimeoutMillis: 20000,
  });

  const run = (text: string, values?: unknown[]) => pool.query(text, values);

  try {
    await run(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const dir = path.join(process.cwd(), 'db', 'migrations');
    const files = fs.readdirSync(dir).filter((file) => file.endsWith('.sql')).sort();

    for (const file of files) {
      const existing = await run('SELECT filename FROM schema_migrations WHERE filename = $1', [file]);
      if (existing.rows.length > 0) {
        console.log(`skip ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      await run(sql);
      await run('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      console.log(`applied ${file}`);
    }

    console.log('Migrations complete. No demo jobs were inserted.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
