import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { canAccessJob } from '@/lib/access';
import { serverErrorResponse } from '@/lib/http';
import { generateCandidateStatusEmail, sendEmail } from '@/lib/email';
import { appBaseUrl } from '@/lib/site';

const APPLICATION_COLUMNS = `
  id, job_id, applicant_name, applicant_email, applicant_phone,
  resume_url, resume_filename, cover_letter, status, created_at, updated_at
`;

async function authorize(request: NextRequest, applicationId: string): Promise<
  | { ok: true; jobId: string }
  | { ok: false; response: NextResponse }
> {
  const row = await queryOne<{ job_id: string }>('SELECT job_id FROM applications WHERE id = $1', [applicationId]);
  if (!row) {
    return { ok: false, response: NextResponse.json({ error: 'Application not found' }, { status: 404 }) };
  }
  if (!(await canAccessJob(request, row.job_id))) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { ok: true, jobId: row.job_id };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const access = await authorize(request, params.id);
    if (!access.ok) return access.response;

    const result = await query(`SELECT ${APPLICATION_COLUMNS} FROM applications WHERE id = $1`, [params.id]);
    return NextResponse.json({ application: result.rows[0] });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to fetch application');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const access = await authorize(request, params.id);
    if (!access.ok) return access.response;

    const body = await request.json();
    const { status } = body;
    const validStatuses = ['new', 'reviewed', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'submitted', 'viewed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const result = await query(
      `UPDATE applications
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING ${APPLICATION_COLUMNS}`,
      [status, params.id]
    );

    if (status === 'shortlisted' || status === 'rejected') {
      const notice = await queryOne<{
        applicant_name: string;
        applicant_email: string;
        status_token: string;
        title: string;
        company_name: string;
      }>(
        `SELECT a.applicant_name, a.applicant_email, a.status_token, j.title, j.company_name
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         WHERE a.id = $1`,
        [params.id]
      );
      if (notice?.status_token) {
        const email = generateCandidateStatusEmail({
          applicantName: notice.applicant_name,
          jobTitle: notice.title,
          companyName: notice.company_name,
          status,
          statusUrl: `${appBaseUrl()}/application-status/${notice.status_token}`,
        });
        const sent = await sendEmail({
          to: notice.applicant_email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });
        if (!sent.success) {
          console.error('Status saved but candidate email was not sent:', sent.error);
        }
      }
    }

    return NextResponse.json({ application: result.rows[0] });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to update application');
  }
}

export const dynamic = 'force-dynamic';
