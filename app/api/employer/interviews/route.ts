import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query, queryOne } from '@/lib/db';
import { companyRole, canRecruit } from '@/lib/employer/roles';
import { sendEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/site';
import { serverErrorResponse } from '@/lib/http';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const role = await companyRole(session.companyId, session.email);
    if (!canRecruit(role)) return NextResponse.json({ error: 'Your role cannot schedule interviews.' }, { status: 403 });
    const body = await request.json();
    const slots = Array.isArray(body.slots) ? body.slots : [];
    if (slots.length === 0) return NextResponse.json({ error: 'Propose at least one time.' }, { status: 400 });
    const application = await queryOne<{ id: string; applicant_email: string; applicant_name: string; title: string }>(
      `SELECT a.id, a.applicant_email, a.applicant_name, j.title
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.id = $1 AND j.company_id = $2 AND j.deleted_at IS NULL`,
      [body.application_id, session.companyId]
    );
    if (!application) return NextResponse.json({ error: 'Applicant not found' }, { status: 404 });
    const created = await query<{ id: string; token: string }>(
      `INSERT INTO interview_requests (application_id, company_id) VALUES ($1, $2) RETURNING id, token`,
      [application.id, session.companyId]
    );
    const requestId = created.rows[0].id;
    const token = created.rows[0].token;
    for (const slot of slots) {
      const starts = new Date(slot.starts_at);
      const ends = new Date(slot.ends_at);
      if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime()) || ends <= starts) {
        return NextResponse.json({ error: 'Each slot needs a start and a later end.' }, { status: 400 });
      }
      await query(
        `INSERT INTO interview_slots (request_id, starts_at, ends_at) VALUES ($1, $2, $3)`,
        [requestId, starts.toISOString(), ends.toISOString()]
      );
    }
    const link = `${appBaseUrl()}/interviews/${token}`;
    const mail = await sendEmail({
      to: application.applicant_email,
      subject: `Interview times for ${application.title}`,
      text: `Hello ${application.applicant_name}, pick a time for ${application.title}: ${link}`,
      html: `<p>Hello ${application.applicant_name}, pick a time for ${application.title}.</p><p><a href="${link}">Choose a time</a></p>`,
    });
    return NextResponse.json({
      success: true,
      emailed: mail.success,
      ...(process.env.NODE_ENV === 'production' ? {} : { dev_interview_link: link }),
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to propose times');
  }
}

export const dynamic = 'force-dynamic';
