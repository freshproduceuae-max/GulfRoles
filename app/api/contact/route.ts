import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import {
  clientAddress,
  CONTACT_RATE_LIMIT,
  hashClientAddress,
  validateContactSubmission,
} from '@/lib/contact';
import { contactFormUrl } from '@/lib/site';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = validateContactSubmission(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  if (parsed.honeypot) {
    return NextResponse.json({ success: true, message: 'Message received.' });
  }

  const ipHash = hashClientAddress(clientAddress(request.headers));
  try {
    const recent = await query<{ n: number }>(
      `SELECT COUNT(*)::int AS n
       FROM contact_submissions
       WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL '1 hour'`,
      [ipHash]
    );
    if (Number(recent.rows[0]?.n || 0) >= CONTACT_RATE_LIMIT) {
      return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
    }

    await query(
      `INSERT INTO contact_submissions (name, email, topic, message, ip_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [parsed.value.name, parsed.value.email, parsed.value.topic, parsed.value.message, ipHash]
    );
  } catch (error) {
    console.error('Contact form save failed', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'We could not save your message. Try again shortly.' }, { status: 503 });
  }

  const admin = process.env.ADMIN_EMAIL?.trim();
  if (admin && process.env.RESEND_API_KEY) {
    const text = [
      `Topic: ${parsed.value.topic}`,
      `Name: ${parsed.value.name}`,
      `Email: ${parsed.value.email}`,
      '',
      parsed.value.message,
      '',
      `Reply from your own mail. Do not publish this address. Form: ${contactFormUrl(parsed.value.topic)}`,
    ].join('\n');
    await sendEmail({
      to: admin,
      subject: `JobBrowser contact: ${parsed.value.topic}`,
      text,
      html: `<p>${text.replace(/[&<>]/g, (char) => (char === '&' ? '&amp;' : char === '<' ? '&lt;' : '&gt;')).replace(/\n/g, '<br />')}</p>`,
    });
  }

  return NextResponse.json({ success: true, message: 'Message received.' });
}

export const dynamic = 'force-dynamic';
