import { NextRequest, NextResponse } from 'next/server';
import { reviewFlaggedJob } from '@/lib/moderation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/moderation/review
 * Review a flagged job (approve or reject)
 *
 * Request Body:
 * {
 *   flag_id: string,
 *   decision: "approve" | "reject",
 *   admin_notes?: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   flag_id: string,
 *   decision: string
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.flag_id || !body.decision) {
      return NextResponse.json(
        { error: 'Missing required fields: flag_id, decision' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(body.decision)) {
      return NextResponse.json(
        { error: 'Invalid decision. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Review the flagged job
    const userEmail = session.user?.email || 'unknown@admin.app';
    await reviewFlaggedJob(
      body.flag_id,
      body.decision,
      body.admin_notes || undefined,
      userEmail
    );

    return NextResponse.json({
      success: true,
      flag_id: body.flag_id,
      decision: body.decision,
    });
  } catch (error) {
    console.error('Moderation review error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to review flagged job',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
