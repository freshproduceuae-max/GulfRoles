import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { closePool, query } from '../lib/db';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Put the Neon or Postgres URL in .env.local or the environment.');
    process.exit(1);
  }

  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const dir = path.join(process.cwd(), 'db', 'migrations');
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const existing = await query('SELECT filename FROM schema_migrations WHERE filename = $1', [file]);
    if (existing.rows.length > 0) {
      console.log(`skip ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await query(sql);
    await query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    console.log(`applied ${file}`);
  }

  await closePool();
  console.log('Migrations complete.');
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await closePool();
  process.exit(1);
});
