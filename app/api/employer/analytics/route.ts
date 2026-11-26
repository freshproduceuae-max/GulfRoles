import { NextRequest, NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/access';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getEmployerSession(request);
    if (!session) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
    const jobs = await query(
      `SELECT j.id, j.title, j.status, j.source, j.view_count,
              COUNT(a.id)::int AS applies
       FROM jobs j
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.company_id = $1 AND j.deleted_at IS NULL
       GROUP BY j.id
       ORDER BY j.posted_at DESC`,
      [session.companyId]
    );
    const bySourceMap = new Map<string, { source: string; views: number; applies: number }>();
    for (const job of jobs.rows as { source: string; view_count: number; applies: number }[]) {
      const current = bySourceMap.get(job.source) || { source: job.source, views: 0, applies: 0 };
      current.views += Number(job.view_count) || 0;
      current.applies += Number(job.applies) || 0;
      bySourceMap.set(job.source, current);
    }
    return NextResponse.json({
      jobs: (jobs.rows as { view_count: number; applies: number }[]).map((job) => ({
        ...job,
        conversion: job.view_count > 0 ? Number(job.applies) / Number(job.view_count) : 0,
      })),
      sources: Array.from(bySourceMap.values()).map((row) => ({
        ...row,
        conversion: row.views > 0 ? row.applies / row.views : 0,
      })),
    });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load analytics');
  }
}

export const dynamic = 'force-dynamic';
