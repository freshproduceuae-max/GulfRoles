import { NextRequest, NextResponse } from 'next/server';
import {
  trackAffiliateClick,
  generateAffiliateUrl,
  isAffiliateSource,
} from '@/lib/affiliate';
import { queryOne } from '@/lib/db';
import { serverErrorResponse } from '@/lib/http';
import { isBlockedIngestUrl } from '@/lib/sources/policy';

/**
 * GET /api/affiliate/click?job=<id>
 * Records the click and sends the seeker to the partner listing.
 * Direct employer jobs stay on JobBrowser.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const jobId = request.nextUrl.searchParams.get('job');
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const job = await queryOne<{
      id: string;
      title: string;
      source: string;
      source_url: string | null;
      apply_url: string | null;
    }>('SELECT id, title, source, source_url, apply_url FROM jobs WHERE id = $1 AND deleted_at IS NULL', [jobId]);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.source === 'direct' || job.source === 'employer') {
      return NextResponse.redirect(new URL(`/jobs/${job.id}`, request.url));
    }

    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;

    await trackAffiliateClick(jobId, job.source, undefined, userAgent, referrer, ipAddress).catch((error) => {
      console.error('Error tracking affiliate click:', error);
    });

    const affiliateUrl =
      job.apply_url ||
      job.source_url ||
      (isAffiliateSource(job.source) ? generateAffiliateUrl(jobId, job.source, job.title) : '');
    if (!affiliateUrl || isBlockedIngestUrl(affiliateUrl)) {
      return NextResponse.json(
        { error: 'This listing does not have an allowed apply link' },
        { status: 503 }
      );
    }

    return NextResponse.redirect(affiliateUrl, { status: 302 });
  } catch (error) {
    return serverErrorResponse(error, 'Failed to process affiliate click');
  }
}

export const dynamic = 'force-dynamic';
