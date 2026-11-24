import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { runDigest } from '@/lib/alerts/run-digest';
import { serverErrorResponse } from '@/lib/http';

export const dynamic = 'force-dynamic';

/**
 * Manual digest trigger. Weekly sending is also on /api/cron/send-alerts.
 * A digest goes out only when the subscriber's last email was at least 7 days ago.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';
    const email = request.nextUrl.searchParams.get('email');
    const result = await runDigest({ dryRun, email });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to send digests');
  }
}
