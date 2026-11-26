import assert from 'node:assert/strict';
import test from 'node:test';
import { closePool, queryCount, resetQueryCount } from '../lib/db';
import { searchJobs } from '../lib/search';

/**
 * CI has no database. This runs only when TEST_DATABASE_URL points at a
 * disposable database. It must not fall back to localhost or to DATABASE_URL,
 * which on the deploy workflow is the production Neon database.
 */
const testDatabaseUrl = process.env.TEST_DATABASE_URL;

test(
  'a job listing is one query and the card text is short',
  { skip: testDatabaseUrl ? false : 'TEST_DATABASE_URL is not set' },
  async () => {
    const previous = process.env.DATABASE_URL;
    process.env.DATABASE_URL = testDatabaseUrl;
    resetQueryCount();
    try {
      const result = await searchJobs({ limit: 20 });
      assert.equal(queryCount(), 1);
      assert.equal(result.page, 1);
      assert.ok(result.total >= result.jobs.length);
      assert.ok(result.jobs.length <= 20);
      for (const job of result.jobs) {
        assert.ok(job.description.length <= 280);
      }
    } finally {
      await closePool();
      if (previous) process.env.DATABASE_URL = previous;
      else delete process.env.DATABASE_URL;
    }
  }
);
