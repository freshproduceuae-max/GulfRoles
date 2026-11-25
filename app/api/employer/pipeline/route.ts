import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query } from '@/lib/db';
import { ownedDirectJob, writeEvent } from '@/lib/employer/jobs';
import { isPipelineStage } from '@/lib/employer/stages';
import { sendEmail } from '@/lib/email';
import { serverErrorResponse } from '@/lib/http';

const COLUMNS = `
  a.id, a.applicant_name, a.applicant_email, a.applicant_phone, a.cover_letter,
  a.status, a.rating, a.applicant_location, a.experience_years, a.skills,
  a.knockout, a.resume_filename, a.resume_url, a.created_at
`;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const params = request.nextUrl.searchParams;
    const jobId = params.get('job_id') || '';
    const job = await ownedDirectJob(session.companyId, jobId);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const where = ['a.job_id = $1'];
    const values: unknown[] = [job.id];
    const stage = params.get('stage');
    if (stage && isPipelineStage(stage)) {
      values.push(stage);
      where.push(`a.status = $${values.length}`);
    }
    const rating = params.get('rating');
    if (rating) {
      values.push(Number(rating));
      where.push(`a.rating >= $${values.length}`);
    }
    const location = params.get('location');
    if (location) {
      values.push(`%${location}%`);
      where.push(`a.applicant_location ILIKE $${values.length}`);
    }
    const experience = params.get('experience');
    if (experience) {
      values.push(Number(experience));
      where.push(`a.experience_years >= $${values.length}`);
    }
    const keyword = params.get('q');
    if (keyword) {
      values.push(`%${keyword}%`);
      where.push(`(COALESCE(a.resume_text, '') ILIKE $${values.length} OR COALESCE(a.skills, '') ILIKE $${values.length} OR COALESCE(a.cover_letter, '') ILIKE $${values.length})`);
    }
    const since = params.get('since');
    if (since === '1' || since === '7' || since === '30') {
      values.push(Number(since));
      where.push(`a.created_at >= NOW() - ($${values.length} * INTERVAL '1 day')`);
    }
    const sort = params.get('sort') === 'rating' ? 'a.rating DESC NULLS LAST, a.created_at DESC' : params.get('sort') === 'oldest' ? 'a.created_at ASC' : 'a.created_at DESC';
    const result = await query(
      `SELECT ${COLUMNS} FROM applications a WHERE ${where.join(' AND ')} ORDER BY ${sort}`,
      values
    );

    if (params.get('format') === 'csv') {
      const header = ['name', 'email', 'phone', 'stage', 'rating', 'location', 'experience_years', 'skills', 'knockout', 'applied', 'cover_note'];
      const lines = result.rows.map((row) =>
        [
          row.applicant_name,
          row.applicant_email,
          row.applicant_phone,
          row.status,
          row.rating,
          row.applicant_location,
          row.experience_years,
          row.skills,
          row.knockout,
          row.created_at,
          row.cover_letter,
        ].map(csvCell).join(',')
      );
      return new NextResponse([header.join(','), ...lines].join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="applicants.csv"',
        },
      });
    }

    return NextResponse.json({ job, applications: result.rows });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load applicants');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const body = await request.json();
    const job = await ownedDirectJob(session.companyId, String(body.job_id || ''));
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    const ids = Array.isArray(body.application_ids) ? body.application_ids.map(String) : [];
    if (ids.length === 0) return NextResponse.json({ error: 'Choose at least one applicant' }, { status: 400 });

    const owned = await query<{ id: string; applicant_email: string; applicant_name: string }>(
      `SELECT id, applicant_email, applicant_name FROM applications WHERE job_id = $1 AND id = ANY($2::uuid[])`,
      [job.id, ids]
    );
    if (owned.rows.length === 0) return NextResponse.json({ error: 'No matching applicants' }, { status: 404 });
    const matched = owned.rows.map((row) => row.id);

    if (body.action === 'stage') {
      if (!isPipelineStage(String(body.stage || ''))) {
        return NextResponse.json({ error: 'Choose a stage' }, { status: 400 });
      }
      await query(`UPDATE applications SET status = $1, updated_at = NOW() WHERE id = ANY($2::uuid[])`, [body.stage, matched]);
      for (const row of owned.rows) {
        await writeEvent(row.id, 'stage', `Moved to ${body.stage}`, session.email);
      }
      return NextResponse.json({ success: true, updated: matched.length });
    }

    if (body.action === 'reject') {
      const template = body.template_id
        ? await query<{ subject: string; body: string }>(
            `SELECT subject, body FROM message_templates WHERE id = $1 AND company_id = $2`,
            [body.template_id, session.companyId]
          )
        : { rows: [] as { subject: string; body: string }[] };
      const subject = template.rows[0]?.subject || `Update on your application for ${job.title}`;
      const messageBody = template.rows[0]?.body || `Thank you for applying for ${job.title}. We will not be moving forward.`;
      await query(`UPDATE applications SET status = 'rejected', updated_at = NOW() WHERE id = ANY($1::uuid[])`, [matched]);
      for (const row of owned.rows) {
        const personal = messageBody.split('{{name}}').join(row.applicant_name).split('{{job}}').join(job.title);
        const sent = await sendEmail({ to: row.applicant_email, subject, text: personal, html: `<p>${escapeHtml(personal)}</p>` });
        await query(
          `INSERT INTO candidate_messages (application_id, template_id, to_email, subject, body, sent)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [row.id, body.template_id || null, row.applicant_email, subject, personal, sent.success]
        );
        await writeEvent(row.id, 'rejected', sent.success ? 'Rejection email sent' : 'Rejection saved. Email is not configured.', session.email);
      }
      return NextResponse.json({ success: true, updated: matched.length });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to update applicants');
  }
}

function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] || char));
}

export const dynamic = 'force-dynamic';
