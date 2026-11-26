import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { buildInterviewIcs } from '@/lib/calendar/ics';
import { sendEmail } from '@/lib/email';
import { serverErrorResponse } from '@/lib/http';

export async function GET(
  _request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const params = await paramsPromise;
    const requestRow = await queryOne<{ id: string; status: string; title: string; company_name: string }>(
      `SELECT r.id, r.status, j.title, c.name AS company_name
       FROM interview_requests r
       JOIN applications a ON a.id = r.application_id
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = r.company_id
       WHERE r.token = $1`,
      [params.token]
    );
    if (!requestRow) return NextResponse.json({ error: 'Interview request not found' }, { status: 404 });
    const slots = await query(
      `SELECT id, starts_at, ends_at, status FROM interview_slots WHERE request_id = $1 ORDER BY starts_at`,
      [requestRow.id]
    );
    return NextResponse.json({ request: requestRow, slots: slots.rows });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load times');
  }
}

export async function POST(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  try {
    const params = await paramsPromise;
    const body = await request.json();
    const requestRow = await queryOne<{
      id: string;
      status: string;
      applicant_email: string;
      applicant_name: string;
      employer_email: string | null;
      title: string;
      company_name: string;
    }>(
      `SELECT r.id, r.status, a.applicant_email, a.applicant_name, j.employer_email, j.title, c.name AS company_name
       FROM interview_requests r
       JOIN applications a ON a.id = r.application_id
       JOIN jobs j ON j.id = a.job_id
       JOIN companies c ON c.id = r.company_id
       WHERE r.token = $1`,
      [params.token]
    );
    if (!requestRow || requestRow.status !== 'proposed') {
      return NextResponse.json({ error: 'These times are no longer open.' }, { status: 409 });
    }
    const slot = await queryOne<{ id: string; starts_at: string; ends_at: string }>(
      `SELECT id, starts_at, ends_at FROM interview_slots WHERE id = $1 AND request_id = $2 AND status = 'open'`,
      [body.slot_id, requestRow.id]
    );
    if (!slot) return NextResponse.json({ error: 'Choose one of the open times.' }, { status: 400 });
    await query(`UPDATE interview_slots SET status = 'declined' WHERE request_id = $1 AND id <> $2`, [requestRow.id, slot.id]);
    await query(`UPDATE interview_slots SET status = 'booked' WHERE id = $1`, [slot.id]);
    await query(`UPDATE interview_requests SET status = 'booked' WHERE id = $1`, [requestRow.id]);
    const ics = buildInterviewIcs({
      uid: `${slot.id}@jobbrowser.app`,
      title: `Interview: ${requestRow.title} at ${requestRow.company_name}`,
      description: 'Booked on JobBrowser',
      startsAt: new Date(slot.starts_at),
      endsAt: new Date(slot.ends_at),
    });
    const attachment = { filename: 'interview.ics', type: 'text/calendar', content: Buffer.from(ics).toString('base64') };
    const note = `Your interview for ${requestRow.title} is booked. The calendar file is attached.`;
    await sendEmail({
      to: requestRow.applicant_email,
      subject: `Interview booked: ${requestRow.title}`,
      text: note,
      html: `<p>${note}</p>`,
      attachments: [attachment],
    });
    if (requestRow.employer_email) {
      await sendEmail({
        to: requestRow.employer_email,
        subject: `${requestRow.applicant_name} booked an interview`,
        text: note,
        html: `<p>${requestRow.applicant_name} booked a time for ${requestRow.title}.</p>`,
        attachments: [attachment],
      });
    }
    return NextResponse.json({ success: true, ics });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to book the time');
  }
}

export const dynamic = 'force-dynamic';
