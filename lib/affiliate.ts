import { query } from './db';

/**
 * Affiliate network configuration
 */
export const AFFILIATE_CONFIG = {
  careerjet: {
    name: 'Careerjet',
    get baseUrl() {
      return process.env.CAREERJET_AFFILIATE_URL || 'https://www.careerjet.com/search';
    },
    get enabled() {
      return Boolean(
        process.env.CAREERJET_AFFILIATE_URL ||
          process.env.CAREERJET_AFFILIATE_ID ||
          process.env.CAREERJET_API_KEY
      );
    },
  },
  jooble: {
    name: 'Jooble',
    get baseUrl() {
      return process.env.JOOBLE_AFFILIATE_URL || 'https://jooble.org/search';
    },
    get enabled() {
      return Boolean(process.env.JOOBLE_AFFILIATE_URL || process.env.JOOBLE_API_KEY);
    },
  },
  adzuna: {
    name: 'Adzuna',
    get baseUrl() {
      return process.env.ADZUNA_AFFILIATE_URL || 'https://www.adzuna.com/search';
    },
    get enabled() {
      return Boolean(
        process.env.ADZUNA_AFFILIATE_URL || process.env.ADZUNA_APP_ID || process.env.ADZUNA_APP_KEY
      );
    },
  },
};

export function isAffiliateSource(source: string | null | undefined): source is AffiliateNetwork {
  return source === 'careerjet' || source === 'jooble' || source === 'adzuna';
}

export type AffiliateNetwork = keyof typeof AFFILIATE_CONFIG;

/**
 * UTM parameters for tracking
 */
interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term?: string;
}

/**
 * Generate affiliate URL with UTM parameters
 * @param jobId - The job ID to track
 * @param affiliate - The affiliate network (careerjet or jooble)
 * @param jobTitle - Optional job title for search
 * @returns Complete affiliate URL with UTM parameters
 */
export function generateAffiliateUrl(
  jobId: string,
  affiliate: AffiliateNetwork = 'careerjet',
  jobTitle?: string
): string {
  const config = AFFILIATE_CONFIG[affiliate];
  if (!config.enabled) {
    console.warn(`Affiliate network ${affiliate} is not configured`);
    return '';
  }

  const utmParams: UTMParams = {
    utm_source: 'jobbrowser',
    utm_medium: 'apply',
    utm_campaign: 'm1',
    utm_content: jobId,
  };

  // Build URL with query parameters
  const url = new URL(config.baseUrl);

  // Add job search term if provided
  if (jobTitle) {
    url.searchParams.append('q', jobTitle);
  }

  const affid = process.env.CAREERJET_AFFILIATE_ID || process.env.CAREERJET_API_KEY;
  if (affiliate === 'careerjet' && affid && !url.searchParams.has('affid') && !url.searchParams.has('a')) {
    url.searchParams.append('affid', affid);
  }

  // Add UTM parameters
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
}

/**
 * Track affiliate click in database
 * @param jobId - The job ID that was clicked
 * @param affiliate - The affiliate network used
 * @param userId - Optional user ID for tracking
 * @param userAgent - Optional user agent string
 * @param referrer - Optional referrer URL
 * @param ipAddress - Optional IP address
 */
export async function trackAffiliateClick(
  jobId: string,
  affiliate: AffiliateNetwork = 'careerjet',
  userId?: string,
  userAgent?: string,
  referrer?: string,
  ipAddress?: string
): Promise<void> {
  try {
    await query(
      `INSERT INTO affiliate_clicks (
        job_id,
        affiliate,
        user_id,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        referrer_url,
        user_agent,
        ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        jobId,
        affiliate,
        userId || null,
        'jobbrowser',
        'apply',
        'm1',
        jobId,
        referrer || null,
        userAgent || null,
        ipAddress || null,
      ]
    );
  } catch (error) {
    console.error(`Failed to track affiliate click for job ${jobId}:`, error);
    // Don't throw - tracking failure shouldn't block the redirect
  }
}

/**
 * Get click statistics for a job
 * @param jobId - The job ID to get stats for
 * @returns Object with click counts by affiliate network
 */
export async function getJobAffiliateStats(jobId: string) {
  try {
    const result = await query(
      `SELECT
        affiliate,
        COUNT(*) as click_count,
        COUNT(DISTINCT user_id) as unique_users,
        MAX(created_at) as last_click
      FROM affiliate_clicks
      WHERE job_id = $1
      GROUP BY affiliate`,
      [jobId]
    );

    return result.rows;
  } catch (error) {
    console.error(`Failed to get affiliate stats for job ${jobId}:`, error);
    return [];
  }
}

/**
 * Get earnings estimate based on clicks
 * Note: This is a mock implementation - replace with actual affiliate API calls
 * @param affiliate - The affiliate network
 * @param clicks - Number of clicks
 * @returns Estimated earnings in USD
 */
export function getAffiliateEarnings(affiliate: AffiliateNetwork, clicks: number): number {
  // Mock earnings calculation
  // In production, this would call the actual affiliate API
  const earningsPerClick: Record<AffiliateNetwork, number> = {
    careerjet: 0.5,
    jooble: 0.75,
    adzuna: 0.4,
  };

  return (earningsPerClick[affiliate] || 0) * clicks;
}

/**
 * Get aggregate earnings across all affiliates
 * @param since - Optional date to get earnings since (defaults to all time)
 * @returns Total estimated earnings in USD
 */
export async function getTotalAffiliateEarnings(since?: Date): Promise<number> {
  try {
    const result = await query(
      `SELECT
        affiliate,
        COUNT(*) as click_count
      FROM affiliate_clicks
      ${since ? 'WHERE created_at >= $1' : ''}
      GROUP BY affiliate`,
      since ? [since] : []
    );

    let totalEarnings = 0;
    result.rows.forEach((row: any) => {
      totalEarnings += getAffiliateEarnings(
        row.affiliate as AffiliateNetwork,
        row.click_count
      );
    });

    return totalEarnings;
  } catch (error) {
    console.error('Failed to get total affiliate earnings:', error);
    return 0;
  }
}

/**
 * Get detailed report of affiliate performance
 * @param limit - Number of days to look back (default: 30)
 * @returns Performance metrics by affiliate and date
 */
export async function getAffiliatePerformanceReport(limit: number = 30) {
  try {
    const limitDays = Math.min(Math.max(limit, 1), 365);
    const cutoffDate = new Date(Date.now() - limitDays * 24 * 60 * 60 * 1000);

    const result = await query(
      `SELECT
        DATE(created_at) as date,
        affiliate,
        COUNT(*) as total_clicks,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT job_id) as jobs_clicked
      FROM affiliate_clicks
      WHERE created_at >= $1
      GROUP BY DATE(created_at), affiliate
      ORDER BY date DESC, affiliate`,
      [cutoffDate]
    );

    return result.rows;
  } catch (error) {
    console.error('Failed to get affiliate performance report:', error);
    return [];
  }
}
