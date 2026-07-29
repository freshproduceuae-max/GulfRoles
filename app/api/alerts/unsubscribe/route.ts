import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/alerts/unsubscribe?token=<subscription_id>
 * Unsubscribe from alerts using subscription ID as token
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `
        UPDATE job_alerts
        SET unsubscribed_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND unsubscribed_at IS NULL
        RETURNING id, email
      `,
      [token]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Subscription not found or already unsubscribed' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully unsubscribed from job alerts',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to unsubscribe',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
