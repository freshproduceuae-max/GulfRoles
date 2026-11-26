import assert from 'node:assert/strict';
import test from 'node:test';
import { emailFrom, sendEmail, sendJobDigest } from '../lib/email';
import { validateContactSubmission } from '../lib/contact';

test('Resend sends html and text, and stays quiet without a key', async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const previousFrom = process.env.EMAIL_FROM;
  const original = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ id: 'msg_1' }), { status: 200 });
  }) as typeof fetch;
  try {
    delete process.env.RESEND_API_KEY;
    const quiet = await sendEmail({ to: 'a@example.com', subject: 'Quiet', html: '<p>x</p>', text: 'x' });
    assert.equal(quiet.success, false);
    assert.equal(calls.length, 0);
    const digest = await sendJobDigest('a@example.com', [], 'Digest', 'token');
    assert.equal(digest.success, false);
    assert.equal(calls.length, 0);

    process.env.RESEND_API_KEY = 're_test_key';
    process.env.EMAIL_FROM = 'JobBrowser <noreply@jobbrowser.app>';
    const sent = await sendEmail({
      to: 'seeker@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
    });
    assert.equal(sent.success, true);
    assert.equal(sent.messageId, 'msg_1');
    assert.equal(calls[0]?.url, 'https://api.resend.com/emails');
    const headers = calls[0]?.init?.headers as Record<string, string>;
    assert.equal(headers.Authorization, 'Bearer re_test_key');
    const body = JSON.parse(String(calls[0]?.init?.body));
    assert.equal(body.from, 'JobBrowser <noreply@jobbrowser.app>');
    assert.deepEqual(body.to, ['seeker@example.com']);
    assert.equal(body.html, '<p>Hi</p>');
    assert.equal(body.text, 'Hi');
    assert.equal('reply_to' in body, false);
    assert.equal(emailFrom(), 'JobBrowser <noreply@jobbrowser.app>');
  } finally {
    globalThis.fetch = original;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
    if (previousFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = previousFrom;
  }
});

test('contact form validation accepts a topic and drops a honeypot', () => {
  const ok = validateContactSubmission({
    name: 'Ada',
    email: 'ada@example.com',
    topic: 'legal-privacy',
    message: 'Please delete my application.',
    website: '',
  });
  assert.equal(ok.ok, true);
  if (ok.ok && !ok.honeypot) assert.equal(ok.value.topic, 'legal-privacy');

  const missing = validateContactSubmission({ name: 'Ada', email: 'not-an-email', topic: 'employer', message: 'short' });
  assert.equal(missing.ok, false);

  const bot = validateContactSubmission({
    name: 'Bot',
    email: 'bot@example.com',
    topic: 'partnership',
    message: 'Buy links please now',
    website: 'https://spam.example',
  });
  assert.equal(bot.ok, true);
  if (bot.ok) assert.equal(bot.honeypot, true);
});
