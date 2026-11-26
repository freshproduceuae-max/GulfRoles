import { NextRequest, NextResponse } from 'next/server';
import { getJobById, isPublicListing } from '@/lib/jobs';
import { canAccessJob } from '@/lib/access';
import { serverErrorResponse } from '@/lib/http';

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const params = await paramsPromise;
    const job = await getJobById(params.id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const owner = await canAccessJob(request, job.id);
    if (!isPublicListing(job) && !owner) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to load job');
  }
}

export const dynamic = 'force-dynamic';
