import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

export const dynamic = 'force-dynamic';

/**
 * Marks a published job as a featured listing.
 * Payment is not collected here. This is the hook a later checkout can call
 * after Stripe or Razorpay succeeds. Until then, only an admin can set it.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const role = token?.role;
    if (role !== 'admin' && role !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const jobId = String(body.job_id || '');
    const featured = Boolean(body.featured);
    const days = Math.min(Math.max(Number(body.days) || 30, 1), 90);
    if (!jobId) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const result = await query(
      `UPDATE jobs
       SET is_featured = $2,
           listing_tier = $3,
           featured_until = CASE WHEN $2::boolean THEN NOW() + ($4::text || ' days')::interval ELSE NULL END,
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, is_featured, listing_tier, featured_until`,
      [jobId, featured, featured ? 'featured' : 'free', String(days)]
    );

    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job: result.rows[0] });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to update featured listing');
  }
}
