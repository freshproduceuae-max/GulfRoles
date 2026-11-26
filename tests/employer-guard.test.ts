import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublicEmployerPath } from '../lib/employer/paths';
import { shouldRunMigrations } from '../lib/migrations/policy';

test('employer sign-in paths stay open and every other employer path is private', () => {
  assert.equal(isPublicEmployerPath('/employer/login'), true);
  assert.equal(isPublicEmployerPath('/employer/register'), true);
  assert.equal(isPublicEmployerPath('/employer/verify/abc'), true);
  for (const path of [
    '/employer/company',
    '/employer/templates',
    '/employer/sources',
    '/employer/jobs',
    '/employer/post-job',
    '/employer/inbox/job-1',
    '/employer/applicants/app-1',
    '/employer/jobs/job-1/edit',
  ]) {
    assert.equal(isPublicEmployerPath(path), false, path);
  }
});

test('migrations run for production or an explicit flag, not for previews', () => {
  assert.equal(shouldRunMigrations({ VERCEL_ENV: 'production' }), true);
  assert.equal(shouldRunMigrations({ DEPLOY_ENV: 'production' }), true);
  assert.equal(shouldRunMigrations({ RUN_MIGRATIONS: 'true', VERCEL_ENV: 'preview' }), true);
  assert.equal(shouldRunMigrations({ VERCEL_ENV: 'preview' }), false);
  assert.equal(shouldRunMigrations({ VERCEL_ENV: 'development' }), false);
  assert.equal(shouldRunMigrations({}), false);
});
