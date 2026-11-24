import assert from 'node:assert/strict';
import test from 'node:test';
import { isAuthorizedCron } from '../lib/cron-auth';

test('cron routes fail closed without the secret', () => {
  const previous = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  const request = new Request('http://localhost/api/cron/daily', {
    headers: { authorization: 'Bearer anything' },
  });
  assert.equal(isAuthorizedCron(request), false);
  if (previous) process.env.CRON_SECRET = previous;
});

test('cron routes accept the bearer secret', () => {
  const previous = process.env.CRON_SECRET;
  process.env.CRON_SECRET = 'test-secret';
  const ok = new Request('http://localhost/api/cron/daily', {
    headers: { authorization: 'Bearer test-secret' },
  });
  const spoofed = new Request('http://localhost/api/cron/daily', {
    headers: { 'user-agent': 'vercel-cron/1.0' },
  });
  assert.equal(isAuthorizedCron(ok), true);
  assert.equal(isAuthorizedCron(spoofed), false);
  if (previous) process.env.CRON_SECRET = previous;
  else delete process.env.CRON_SECRET;
});
