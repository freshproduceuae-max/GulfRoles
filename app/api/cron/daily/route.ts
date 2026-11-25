import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedCron } from '@/lib/cron-auth';
import { expireStaleJobs, runIngestion } from '@/lib/ingestion/run';
import { ingestLicensedSources } from '@/lib/sources/ingest';
import { query } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';

export const dynamic = 'force-dynamic';

async function handle(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const slotsParam = Number(request.nextUrl.searchParams.get('slots') || '1');
  const slots = Number.isFinite(slotsParam) ? Math.min(Math.max(slotsParam, 1), 3) : 1;

  try {
    const ingest = await runIngestion({ db: { query }, slots });
    const licensed = await ingestLicensedSources({ db: { query } });
    const expired = await expireStaleJobs({ query });
    return NextResponse.json({ ok: true, ingest, licensed, expired });
  } catch (error) {
    return serverErrorResponse(error, 'Daily job failed');
  }
}

export const GET = handle;
export const POST = handle;
