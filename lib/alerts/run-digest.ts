import { query } from '../db';
import { searchJobs, type SearchFilters } from '../search';
import { sendJobDigest } from '../email';

interface JobAlert {
  id: string;
  email: string;
  preferences: Record<string, unknown>;
}

export interface DigestResult {
  dryRun: boolean;
  sent: number;
  failed: number;
  message: string;
  results: Array<{ email: string; success: boolean; jobsCount: number; error?: string }>;
}

export async function runDigest(options: { email?: string | null; dryRun?: boolean } = {}): Promise<DigestResult> {
  const params: unknown[] = [];
  let whereClause = `
    WHERE unsubscribed_at IS NULL
    AND (last_sent_at IS NULL OR last_sent_at < NOW() - INTERVAL '7 days')
  `;

  if (options.email) {
    params.push(options.email);
    whereClause += ` AND email = $${params.length}`;
  }

  const alerts = await query<JobAlert>(
    `SELECT id, email, preferences
     FROM job_alerts
     ${whereClause}
     ORDER BY subscribed_at DESC
     LIMIT 100`,
    params
  );

  if (alerts.rows.length === 0) {
    return { dryRun: Boolean(options.dryRun), sent: 0, failed: 0, message: 'No subscriptions to process', results: [] };
  }

  const results: DigestResult['results'] = [];

  for (const alert of alerts.rows) {
    try {
      const preferences = alert.preferences || {};
      const filters: SearchFilters = { page: 1, limit: 10 };
      if (Array.isArray(preferences.keywords) && preferences.keywords.length > 0) {
        filters.q = preferences.keywords.join(' ');
      }
      if (Array.isArray(preferences.locations) && preferences.locations.length > 0) {
        filters.location = String(preferences.locations[0]);
      }
      if (typeof preferences.salary_min === 'number') {
        filters.salary_min = preferences.salary_min;
      }

      const searchResult = await searchJobs(filters);
      if (!options.dryRun) {
        if (searchResult.jobs.length > 0) {
          const emailResult = await sendJobDigest(
            alert.email,
            searchResult.jobs,
            'Your Weekly Job Digest',
            alert.id
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
        }
        await query(`UPDATE job_alerts SET last_sent_at = NOW(), updated_at = NOW() WHERE id = $1`, [alert.id]);
      }

      results.push({ email: alert.email, success: true, jobsCount: searchResult.jobs.length });
    } catch (error) {
      results.push({
        email: alert.email,
        success: false,
        jobsCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    dryRun: Boolean(options.dryRun),
    sent: results.filter((item) => item.success).length,
    failed: results.filter((item) => !item.success).length,
    message: `Processed ${alerts.rows.length} subscriptions`,
    results,
  };
}
