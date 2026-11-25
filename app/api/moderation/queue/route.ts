import { NextRequest, NextResponse } from 'next/server';
import { getFlaggedJobs } from '@/lib/moderation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/moderation/queue
 * Fetch flagged jobs for the moderation queue
 *
 * Query Parameters:
 * - page: page number (default: 1)
 * - limit: results per page (default: 20, max: 100)
 *
 * Response:
 * {
 *   jobs: Array<{
 *     id: string,
 *     title: string,
 *     company_name: string,
 *     employer_email: string | null,
 *     rule_triggered: string,
 *     confidence: number,
 *     reason: string,
 *     flag_id: string,
 *     posted_at: string (ISO),
 *     created_at: string (ISO)
 *   }>,
 *   total: number,
 *   page: number,
 *   pages: number
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    // Fetch flagged jobs
    const result = await getFlaggedJobs(limit, offset);

    const pages = Math.ceil(result.total / limit);

    return NextResponse.json({
      jobs: result.jobs.map(job => ({
        id: job.id,
        title: job.title,
        company_name: job.company_name,
        employer_email: job.employer_email,
        rule_triggered: job.rule_triggered,
        confidence: job.confidence,
        reason: job.reason,
        flag_id: job.flag_id,
        posted_at: job.posted_at.toISOString(),
        created_at: job.created_at.toISOString(),
      })),
      total: result.total,
      page,
      pages,
    });
  } catch (error) {
    console.error('Moderation queue error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch moderation queue',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
