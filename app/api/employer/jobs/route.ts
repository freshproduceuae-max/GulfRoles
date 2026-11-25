import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Sign in with the email link first.' }, { status: 401 });
    }

    const result = await query<{
      id: string;
      title: string;
      location: string;
      status: string;
      posted_at: string;
      applicant_count: number;
    }>(
      `SELECT j.id, j.title, j.location, j.status, j.posted_at,
              COUNT(a.id)::int AS applicant_count
       FROM jobs j
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.company_id = $1 AND j.deleted_at IS NULL AND j.source = 'direct'
       GROUP BY j.id
       ORDER BY j.posted_at DESC`,
      [session.companyId]
    );

    return NextResponse.json({ jobs: result.rows });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load employer jobs');
  }
}

export const dynamic = 'force-dynamic';
