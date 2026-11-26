import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

/** Questions a candidate must answer. Knockout thresholds stay on the server. */
export async function GET(
  _request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const params = await paramsPromise;
    const result = await query(
      `SELECT q.id, q.prompt, q.answer_type, q.required
       FROM screening_questions q
       JOIN jobs j ON j.id = q.job_id
       WHERE q.job_id = $1 AND j.status = 'published' AND j.deleted_at IS NULL AND j.source = 'direct'
       ORDER BY q.position, q.created_at`,
      [params.id]
    );
    return NextResponse.json({ questions: result.rows });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load questions');
  }
}

export const dynamic = 'force-dynamic';
