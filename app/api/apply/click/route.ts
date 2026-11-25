import { NextRequest, NextResponse } from 'next/server';
import { trackAffiliateClick } from '@/lib/affiliate';
import { getJobById } from '@/lib/search';
import { isHttpUrl, parseSource } from '@/lib/job-source';

function partnerDestination(jobTitle: string, partner: string): string | null {
  if (partner === 'careerjet' && process.env.CAREERJET_AFFILIATE_URL) {
    const url = new URL(process.env.CAREERJET_AFFILIATE_URL);
    url.searchParams.set('q', jobTitle);
    url.searchParams.set('utm_medium', 'apply');
    return url.toString();
  }
  if (partner === 'jooble' && process.env.JOOBLE_AFFILIATE_URL) {
    const url = new URL(process.env.JOOBLE_AFFILIATE_URL);
    url.searchParams.set('q', jobTitle);
    url.searchParams.set('utm_medium', 'apply');
    return url.toString();
  }
  return null;
}

/**
 * GET /api/apply/click?job=<id>
 * Records a CPC-ready click then redirects to the job's licensed apply URL.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const jobId = request.nextUrl.searchParams.get('job');
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  let job;
  try {
    job = await getJobById(jobId);
  } catch {
    return NextResponse.json({ error: 'Job lookup failed' }, { status: 503 });
  }

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const { kind, vendor, tag } = parseSource(job.source);
  const userAgent = request.headers.get('user-agent') || undefined;
  const referrer = request.headers.get('referer') || undefined;
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;

  void trackAffiliateClick(job.id, tag, undefined, userAgent, referrer, ipAddress);

  const candidate =
    job.apply_url ||
    job.source_url ||
    (kind === 'partner' ? partnerDestination(job.title, vendor) : null);

  if (candidate && isHttpUrl(candidate)) {
    return NextResponse.redirect(candidate, { status: 302 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_BASE_URL || request.nextUrl.origin;
  return NextResponse.redirect(new URL(`/jobs/${job.id}?apply=on-site`, origin), { status: 302 });
}

export const dynamic = 'force-dynamic';
