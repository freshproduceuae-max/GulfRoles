import assert from 'node:assert/strict';
import test from 'node:test';
import { queryCount, resetQueryCount } from '../lib/db';
import { searchJobs } from '../lib/search';

const localUrl = 'postgresql://jobbrowser:jobbrowser@127.0.0.1:5432/jobbrowser';

test('a job listing is one query and the card text is short', async () => {
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = process.env.DATABASE_URL || localUrl;
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
    if (previous) process.env.DATABASE_URL = previous;
    else delete process.env.DATABASE_URL;
  }
});
