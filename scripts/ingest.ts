import dotenv from 'dotenv';
import path from 'path';
import { closePool, query } from '../lib/db';
import { runIngestion } from '../lib/ingestion/run';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  const slotsArg = process.argv.find((arg) => arg.startsWith('--slots='));
  const slots = slotsArg ? Number(slotsArg.split('=')[1]) : 10;
  const report = await runIngestion({ db: { query }, slots });
  console.log(JSON.stringify(report, null, 2));
  await closePool();
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await closePool();
  process.exit(1);
});
