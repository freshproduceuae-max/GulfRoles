import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { canAccessJob } from '@/lib/access';
import { serverErrorResponse } from '@/lib/http';

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
    const validStatuses = ['submitted', 'viewed', 'shortlisted', 'rejected', 'hired'];
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

    return NextResponse.json({ application: result.rows[0] });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to update application');
  }
}

export const dynamic = 'force-dynamic';
