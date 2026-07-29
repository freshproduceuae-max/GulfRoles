import { NextRequest, NextResponse } from 'next/server';
import { getFlaggedJobDetails } from '@/lib/moderation';
import { getServerSession } from 'next-auth/next';

/**
 * GET /api/moderation/job/[jobId]
 * Fetch details for a specific flagged job
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jobDetails = await getFlaggedJobDetails(params.jobId);

    if (!jobDetails) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: jobDetails.id,
      title: jobDetails.title,
      description: jobDetails.description,
      company_name: jobDetails.company_name,
      location: jobDetails.location,
      region: jobDetails.region,
      employer_email: jobDetails.employer_email,
      employer_verified: jobDetails.employer_verified,
      job_type: jobDetails.job_type,
      salary_min: jobDetails.salary_min,
      salary_max: jobDetails.salary_max,
      posted_at: jobDetails.posted_at.toISOString(),
      flag_id: jobDetails.flag_id,
      rule_triggered: jobDetails.rule_triggered,
      confidence: jobDetails.confidence,
      admin_notes: jobDetails.admin_notes,
    });
  } catch (error) {
    console.error('Job details error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch job details',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
