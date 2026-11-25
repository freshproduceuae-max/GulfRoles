import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query, queryOne } from '@/lib/db';
import { writeEvent } from '@/lib/employer/jobs';
import { isPipelineStage } from '@/lib/employer/stages';
import { sendEmail } from '@/lib/email';
import { serverErrorResponse } from '@/lib/http';

async function loadApplicant(companyId: string, applicationId: string) {
  return queryOne(
    `SELECT a.*, j.title AS job_title, j.company_name
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.id = $1 AND j.company_id = $2 AND j.deleted_at IS NULL`,
    [applicationId, companyId]
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const application = await loadApplicant(session.companyId, params.id);
    if (!application) return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    const [answers, notes, events, messages] = await Promise.all([
      query(`SELECT prompt, answer_text, knocked_out FROM screening_answers WHERE application_id = $1 ORDER BY created_at`, [params.id]),
      query(`SELECT id, author_email, body, created_at FROM application_notes WHERE application_id = $1 ORDER BY created_at`, [params.id]),
      query(`SELECT kind, detail, actor_email, created_at FROM application_events WHERE application_id = $1 ORDER BY created_at`, [params.id]),
      query(`SELECT subject, body, sent, created_at FROM candidate_messages WHERE application_id = $1 ORDER BY created_at`, [params.id]),
    ]);
    return NextResponse.json({
      application,
      answers: answers.rows,
      notes: notes.rows,
      events: events.rows,
      messages: messages.rows,
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load applicant');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const application = await loadApplicant(session.companyId, params.id);
    if (!application) return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    const body = await request.json();

    if (body.note) {
      const note = String(body.note).trim().slice(0, 4000);
      if (!note) return NextResponse.json({ error: 'Write a note' }, { status: 400 });
      await query(
        `INSERT INTO application_notes (application_id, author_email, body) VALUES ($1, $2, $3)`,
        [params.id, session.email, note]
      );
      await writeEvent(params.id, 'note', 'Note added', session.email);
      return NextResponse.json({ success: true });
    }

    if (body.rating !== undefined) {
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be from 1 to 5' }, { status: 400 });
      }
      await query(`UPDATE applications SET rating = $1, updated_at = NOW() WHERE id = $2`, [rating, params.id]);
      await writeEvent(params.id, 'rating', `Rated ${rating}`, session.email);
    }

    if (body.stage) {
      if (!isPipelineStage(String(body.stage))) return NextResponse.json({ error: 'Choose a stage' }, { status: 400 });
      await query(`UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2`, [body.stage, params.id]);
      await writeEvent(params.id, 'stage', `Moved to ${body.stage}`, session.email);
    }

    if (body.message_subject || body.message_body) {
      const subject = String(body.message_subject || 'Message from the employer').slice(0, 255);
      const text = String(body.message_body || '').trim().slice(0, 8000);
      if (!text) return NextResponse.json({ error: 'Write a message' }, { status: 400 });
      const email = String((application as { applicant_email: string }).applicant_email);
      const sent = await sendEmail({ to: email, subject, text, html: `<p>${text.replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'))}</p>` });
      await query(
        `INSERT INTO candidate_messages (application_id, to_email, subject, body, sent) VALUES ($1, $2, $3, $4, $5)`,
        [params.id, email, subject, text, sent.success]
      );
      await writeEvent(params.id, 'message', sent.success ? `Email sent: ${subject}` : `Message saved. Email is not configured: ${subject}`, session.email);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to update applicant');
  }
}

export const dynamic = 'force-dynamic';
