import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { searchJobs, type SearchFilters } from '@/lib/search';
import { sendJobDigest } from '@/lib/email';

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
 * POST /api/alerts/send-digest
 * Manually trigger sending weekly job digests
 * In production, this should be called by a scheduled job (e.g., Vercel Cron)
 *
 * Optional query params:
 * - email: send digest only to specific email
 * - dryRun: if true, don't actually send emails, just return what would be sent
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for optional auth token to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow requests from Vercel's cron or with valid CRON_SECRET
    const isVercelCron = request.headers.get('user-agent')?.includes('verce.sh');
    if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const emailFilter = searchParams.get('email');
    const dryRun = searchParams.get('dryRun') === 'true';

    // Fetch subscriptions that need digest (7 days since last send or never sent)
    let whereClause = `
      WHERE unsubscribed_at IS NULL
      AND (last_sent_at IS NULL OR last_sent_at < NOW() - INTERVAL '7 days')
    `;
    const params: unknown[] = [];

    if (emailFilter) {
      whereClause += ` AND email = $${params.length + 1}`;
      params.push(emailFilter);
    }

    const alerts = await query<JobAlert>(
      `
        SELECT id, email, frequency, preferences, subscribed_at, last_sent_at, unsubscribed_at, created_at, updated_at
        FROM job_alerts
        ${whereClause}
        ORDER BY subscribed_at DESC
        LIMIT 100
      `,
      params
    );

    if (alerts.rows.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No subscriptions to process',
          sent: 0,
        },
        { status: 200 }
      );
    }

    const results: Array<{
      email: string;
      success: boolean;
      jobsCount: number;
      error?: string;
    }> = [];

    // Process each subscription
    for (const alert of alerts.rows) {
      try {
        // Build search filters from preferences
        const preferences = alert.preferences as Record<string, unknown>;
        const filters: SearchFilters = {
          page: 1,
          limit: 10,
        };

        // Add search keywords if present
        if (Array.isArray(preferences.keywords) && preferences.keywords.length > 0) {
          filters.q = preferences.keywords.join(' ');
        }

        // Add location filter if present
        if (Array.isArray(preferences.locations) && preferences.locations.length > 0) {
          filters.location = preferences.locations[0];
        }

        // Add salary filter if present
        if (typeof preferences.salary_min === 'number') {
          filters.salary_min = preferences.salary_min;
        }

        // Search for matching jobs
        const searchResult = await searchJobs(filters);

        if (searchResult.jobs.length === 0) {
          // No jobs found, still mark as sent to avoid spam
          if (!dryRun) {
            await query(
              `
                UPDATE job_alerts
                SET last_sent_at = NOW(), updated_at = NOW()
                WHERE id = $1
              `,
              [alert.id]
            );
          }

          results.push({
            email: alert.email,
            success: true,
            jobsCount: 0,
          });
          continue;
        }

        // Generate unsubscribe token (using alert ID)
        const unsubscribeToken = alert.id;

        // Send digest email
        if (!dryRun) {
          const emailResult = await sendJobDigest(
            alert.email,
            searchResult.jobs,
            'JobBrowser Weekly Digest - New Opportunities',
            unsubscribeToken
          );

          if (!emailResult.success) {
            results.push({
              email: alert.email,
              success: false,
              jobsCount: searchResult.jobs.length,
              error: emailResult.error,
            });
            continue;
          }

          // Update last_sent_at
          await query(
            `
              UPDATE job_alerts
              SET last_sent_at = NOW(), updated_at = NOW()
              WHERE id = $1
            `,
            [alert.id]
          );
        }

        results.push({
          email: alert.email,
          success: true,
          jobsCount: searchResult.jobs.length,
        });
      } catch (error) {
        console.error(`Error processing alert for ${alert.email}:`, error);
        results.push({
          email: alert.email,
          success: false,
          jobsCount: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Summary
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${alerts.rows.length} subscriptions`,
        dryRun,
        sent: successCount,
        failed: failureCount,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send digest error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to send digests',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
