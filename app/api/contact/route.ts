import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { contactEmail } from '@/lib/site';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = (body.name || '').trim().slice(0, 200);
  const email = (body.email || '').trim().slice(0, 320);
  const message = (body.message || '').trim().slice(0, 5000);
  if (!name || !email || !email.includes('@') || message.length < 10) {
    return NextResponse.json({ error: 'Name, a valid email, and a message are required.' }, { status: 400 });
  }

  const to = contactEmail();
  if (!process.env.SENDGRID_API_KEY) {
    return NextResponse.json(
      {
        error: 'email_not_configured',
        message: `Email is not configured yet. Write to ${to} directly.`,
        contact: to,
      },
      { status: 503 }
    );
  }

  const sent = await sendEmail({
    to,
    subject: `JobBrowser contact from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p>From: ${name} (${email})</p><p>${message.replace(/</g, '&lt;')}</p>`,
  });

  if (!sent.success) {
    return NextResponse.json({ error: 'Could not send the message', contact: to }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: 'Message sent.' });
}

export const dynamic = 'force-dynamic';
