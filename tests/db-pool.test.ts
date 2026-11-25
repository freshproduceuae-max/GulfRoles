import assert from 'node:assert/strict';
import test from 'node:test';
import { migrationDatabaseUrl, poolConfig } from '../lib/db';

test('hosted Postgres uses SSL and does not keep sslmode in the URL', () => {
  const config = poolConfig(
    'postgresql://user:secret@ep-example-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
  );
  assert.equal(config.ssl?.rejectUnauthorized, false);
  assert.equal(config.connectionString.includes('sslmode'), false);
  assert.match(config.connectionString, /ep-example-pooler/);
});

test('localhost stays without SSL', () => {
  const config = poolConfig('postgresql://jobbrowser:jobbrowser@127.0.0.1:5432/jobbrowser');
  assert.equal(config.ssl, undefined);
});

test('migrations prefer the direct Neon URL', () => {
  const previousUnpooled = process.env.DATABASE_URL_UNPOOLED;
  const previousPooled = process.env.DATABASE_URL;
  process.env.DATABASE_URL = 'postgresql://pooled';
  process.env.DATABASE_URL_UNPOOLED = 'postgresql://direct';
  assert.equal(migrationDatabaseUrl(), 'postgresql://direct');
  if (previousUnpooled === undefined) delete process.env.DATABASE_URL_UNPOOLED;
  else process.env.DATABASE_URL_UNPOOLED = previousUnpooled;
  if (previousPooled === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousPooled;
});
