import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query, queryOne } from '@/lib/db';

/**
 * Zod schema for alert subscription
 */
const SubscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  frequency: z.enum(['weekly']).default('weekly'),
  preferences: z
    .object({
      keywords: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
      salary_min: z.number().int().nonnegative().optional(),
    })
    .default({}),
});


interface JobAlert {
  id: string;
  email: string;
  frequency: string;
  preferences: Record<string, unknown>;
  subscribed_at: string;
  last_sent_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * POST /api/alerts
 * Subscribe to job alerts
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input
    const validated = SubscriptionSchema.parse(body);

    // Check if already subscribed
    const existing = await queryOne<JobAlert>(
      'SELECT id FROM job_alerts WHERE email = $1 AND unsubscribed_at IS NULL',
      [validated.email]
    );

    if (existing) {
      return NextResponse.json(
        {
          error: 'Email already subscribed to alerts',
          subscription_id: existing.id,
        },
        { status: 400 }
      );
    }

    // Insert new subscription
    const result = await queryOne<JobAlert>(
      `
        INSERT INTO job_alerts (email, frequency, preferences, subscribed_at, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW(), NOW())
        RETURNING id, email, frequency, preferences, subscribed_at, last_sent_at, unsubscribed_at, created_at, updated_at
      `,
      [validated.email, validated.frequency, JSON.stringify(validated.preferences)]
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        subscription_id: result.id,
        email: result.email,
        frequency: result.frequency,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Subscribe error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to subscribe to alerts',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/alerts
 * Retrieve subscriptions by email
 * Query params: email (required)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Validate email
    try {
      z.string().email().parse(email);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const alert = await queryOne<JobAlert>(
      `
        SELECT id, email, frequency, preferences, subscribed_at, last_sent_at, unsubscribed_at, created_at, updated_at
        FROM job_alerts
        WHERE email = $1 AND unsubscribed_at IS NULL
        LIMIT 1
      `,
      [email]
    );

    if (!alert) {
      return NextResponse.json(
        {
          subscribed: false,
          email,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        subscribed: true,
        id: alert.id,
        email: alert.email,
        frequency: alert.frequency,
        preferences: alert.preferences,
        subscribed_at: alert.subscribed_at,
        last_sent_at: alert.last_sent_at,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch alert error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch subscription',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/alerts
 * Unsubscribe from alerts by email
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email
    try {
      z.string().email().parse(email);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const result = await query(
      `
        UPDATE job_alerts
        SET unsubscribed_at = NOW(), updated_at = NOW()
        WHERE email = $1 AND unsubscribed_at IS NULL
        RETURNING id
      `,
      [email]
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
        message: 'Unsubscribed from job alerts',
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
