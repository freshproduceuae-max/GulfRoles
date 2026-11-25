import { NextRequest, NextResponse } from 'next/server';
import { trackAffiliateClick, generateAffiliateUrl, AffiliateNetwork } from '@/lib/affiliate';

/**
 * POST /api/affiliate/click
 * Track affiliate click and redirect to affiliate URL
 *
 * Query Parameters:
 * - job: string (required) - Job ID to track
 * - network: string (optional, default: 'careerjet') - Affiliate network
 * - title: string (optional) - Job title for search
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('job');
    const network = (searchParams.get('network') || 'careerjet') as AffiliateNetwork;
    const jobTitle = searchParams.get('title') || undefined;

    // Validate job ID
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Extract tracking information from request
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;

    // Track the click asynchronously (don't wait for it)
    trackAffiliateClick(jobId, network, undefined, userAgent, referrer, ipAddress).catch(
      (error) => {
        console.error('Error tracking affiliate click:', error);
      }
    );

    // Generate the affiliate URL
    const affiliateUrl = generateAffiliateUrl(jobId, network, jobTitle);

    if (!affiliateUrl) {
      return NextResponse.json(
        { error: `Affiliate network ${network} is not configured` },
        { status: 503 }
      );
    }

    // Redirect to affiliate URL
    return NextResponse.redirect(affiliateUrl, { status: 302 });
  } catch (error) {
    console.error('Affiliate click handler error:', error);
    return NextResponse.json(
      { error: 'Failed to process affiliate click' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
