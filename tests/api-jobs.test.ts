import assert from 'node:assert/strict';
import test from 'node:test';
import { NextRequest } from 'next/server';
import { GET } from '../app/api/jobs/route';

test('job search rejects an unknown region before touching the database', async () => {
  const response = await GET(new NextRequest('http://localhost/api/jobs?region=mars'));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.error, /Invalid region/);
});

test('job search reports that the database is not connected', async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const response = await GET(new NextRequest('http://localhost/api/jobs?q=nurse'));
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.error, 'database_unavailable');
  assert.equal(JSON.stringify(body).includes('postgres://'), false);
  if (previous) process.env.DATABASE_URL = previous;
});
