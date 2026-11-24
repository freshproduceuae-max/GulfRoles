import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { runDigest } from '@/lib/alerts/run-digest';
import { serverErrorResponse } from '@/lib/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handle(request: NextRequest): Promise<NextResponse> {
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

export const GET = handle;
export const POST = handle;
