import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const FORBIDDEN = [
  /mailto:/i,
  /NEXT_PUBLIC_CONTACT_EMAIL/,
  /contact@jobbrowser\.app/i,
  /admin@jobbrowser\.app/i,
  /support@jobbrowser\.app/i,
  /hello@jobbrowser\.app/i,
  /SENDGRID/i,
];

function filesUnder(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesUnder(rel);
    return /\.(tsx|ts)$/.test(entry.name) ? [rel] : [];
  });
}

test('public pages do not render the owner or admin address', () => {
  const files = [
    ...filesUnder('app/(seeker)'),
    ...filesUnder('components/content'),
    ...filesUnder('components/shared'),
    'app/admin/login/login-form.tsx',
    'app/admin/layout.tsx',
    'lib/site.ts',
    'lib/email.ts',
  ];
  for (const file of files) {
    const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    const patterns = file === 'lib/email.ts'
      ? [/mailto:/i, /reply_to/i, /SENDGRID/i, /contact@jobbrowser\.app/i, /admin@jobbrowser\.app/i]
      : FORBIDDEN;
    for (const pattern of patterns) {
      assert.equal(pattern.test(source), false, `${file} matches ${pattern.source}`);
    }
  }
  const sender = fs.readFileSync(path.join(process.cwd(), 'lib/email.ts'), 'utf8');
  assert.match(sender, /api\.resend\.com\/emails/);
  assert.match(sender, /noreply@jobbrowser\.app/);
});
