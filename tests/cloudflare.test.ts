import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { cronRequestPath } from '../lib/cron/routes';
import { createR2ResumeStorage } from '../lib/storage/resume-store';
import { usesRequestScopedDb } from '../lib/db';

test('workers crons call the same routes as Vercel', () => {
  assert.equal(cronRequestPath('0 5 * * *'), '/api/cron/daily');
  assert.equal(cronRequestPath('0 16 * * *'), '/api/cron/send-alerts');
  assert.equal(cronRequestPath('0 0 * * *'), undefined);
  const config = fs.readFileSync('wrangler.jsonc', 'utf8');
  assert.match(config, /nodejs_compat/);
  assert.match(config, /2026-11-01/);
  assert.match(config, /"RESUME_STORE": "neon"/);
  assert.match(config, /"EMAIL_FROM": "JobBrowser <noreply@jobbrowser.app>"/);
  assert.match(config, /"NEXTAUTH_URL": "https:\/\/jobbrowser\.jobbrowser\.workers\.dev"/);
  assert.match(config, /"NEXT_PUBLIC_APP_BASE_URL": "https:\/\/jobbrowser\.jobbrowser\.workers\.dev"/);
  assert.doesNotMatch(config, /ADMIN_EMAIL/);
  assert.doesNotMatch(config, /RESEND_API_KEY/);
  assert.doesNotMatch(config, /r2_buckets/);
  assert.match(config, /0 5 \* \* \*/);
});

test('Cloudflare uses one database connection per request', () => {
  assert.equal(usesRequestScopedDb({}), false);
  assert.equal(usesRequestScopedDb({ CF_WORKER: '1' }), true);
});

test('R2 storage keeps the CV key private and out of Postgres bytes', async () => {
  const objects = new Map<string, Buffer>();
  const updates: unknown[][] = [];
  const storage = createR2ResumeStorage(
    {
      async put(key, value) {
        objects.set(key, Buffer.from(value));
      },
      async get(key) {
        const value = objects.get(key);
        if (!value) return null;
        const copy = Uint8Array.from(value);
        return { arrayBuffer: async () => copy.buffer };
      },
      async delete(key) {
        objects.delete(key);
      },
    },
    {
      async query(_text, values) {
        updates.push(values || []);
        return { rows: [] };
      },
      async queryOne() {
        return { resume_filename: 'cv.pdf', resume_content_type: 'application/pdf' };
      },
    }
  );
  const pdf = Buffer.from('%PDF-1.4');
  const saved = await storage.put({
    applicationId: 'app-1',
    bytes: pdf,
    filename: 'cv.pdf',
    contentType: 'application/pdf',
  });
  assert.equal(saved.store, 'r2');
  assert.equal(saved.key, 'resumes/app-1/cv.pdf');
  assert.equal(updates[0]?.[3], 'resumes/app-1/cv.pdf');
  const loaded = await storage.get(saved);
  assert.equal(loaded?.bytes.toString(), pdf.toString());
});
