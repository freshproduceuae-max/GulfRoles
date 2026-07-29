import { NextRequest, NextResponse } from 'next/server';
import { searchJobs, type SearchFilters } from '@/lib/search';
import { flagJob } from '@/lib/moderation';
import { transaction } from '@/lib/db';

/**
 * GET /api/jobs
 * Search for jobs with full-text search and filtering
 *
 * Query Parameters:
 * - q: search keyword (job title, description, company)
 * - location: filter by location (partial match, case-insensitive)
 * - region: filter by region (UAE, Saudi, India, Australia, USA)
 * - job_type: filter by job type (full-time, part-time, contract, internship)
 * - salary_min: minimum salary in USD
 * - salary_max: maximum salary in USD
 * - sort: sort order (relevance, salary, posted_date) - default: relevance if search query, else posted_date
 * - page: page number (default: 1)
 * - limit: results per page (default: 10, max: 50)
 *
 * Response:
 * {
 *   jobs: Job[],
 *   total: number,
 *   page: number,
 *   pages: number
 * }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const filters: SearchFilters = {};

    // Search query
    const q = searchParams.get('q');
    if (q) {
      filters.q = q;
    }

    // Location filter
    const location = searchParams.get('location');
    if (location) {
      filters.location = location;
    }

    // Region filter
    const region = searchParams.get('region');
    if (region) {
      const validRegions = ['UAE', 'Saudi', 'India', 'Australia', 'USA'];
      if (!validRegions.includes(region)) {
        return NextResponse.json(
          { error: 'Invalid region. Must be one of: UAE, Saudi, India, Australia, USA' },
          { status: 400 }
        );
      }
      filters.region = region;
    }

    // Job type filter
    const job_type = searchParams.get('job_type');
    if (job_type) {
      const validJobTypes = ['full-time', 'part-time', 'contract', 'internship'];
      if (!validJobTypes.includes(job_type)) {
        return NextResponse.json(
          { error: 'Invalid job_type. Must be one of: full-time, part-time, contract, internship' },
          { status: 400 }
        );
      }
      filters.job_type = job_type;
    }

    // Salary range filters
    const salary_min = searchParams.get('salary_min');
    if (salary_min) {
      const parsed = parseInt(salary_min, 10);
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: 'salary_min must be a non-negative integer' },
          { status: 400 }
        );
      }
      filters.salary_min = parsed;
    }

    const salary_max = searchParams.get('salary_max');
    if (salary_max) {
      const parsed = parseInt(salary_max, 10);
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: 'salary_max must be a non-negative integer' },
          { status: 400 }
        );
      }
      filters.salary_max = parsed;
    }

    // Validate salary range
    if (
      filters.salary_min !== undefined &&
      filters.salary_max !== undefined &&
      filters.salary_min > filters.salary_max
    ) {
      return NextResponse.json(
        { error: 'salary_min cannot be greater than salary_max' },
        { status: 400 }
      );
    }

    // Sort option
    const sort = searchParams.get('sort');
    if (sort) {
      const validSorts: Array<'relevance' | 'salary' | 'posted_date'> = [
        'relevance',
        'salary',
        'posted_date',
      ];
      if (!validSorts.includes(sort as any)) {
        return NextResponse.json(
          { error: 'Invalid sort. Must be one of: relevance, salary, posted_date' },
          { status: 400 }
        );
      }
      filters.sort = sort as 'relevance' | 'salary' | 'posted_date';
    }

    // Pagination
    const page = searchParams.get('page');
    if (page) {
      const parsed = parseInt(page, 10);
      if (isNaN(parsed) || parsed < 1) {
        return NextResponse.json(
          { error: 'page must be a positive integer' },
          { status: 400 }
        );
      }
      filters.page = parsed;
    }

    const limit = searchParams.get('limit');
    if (limit) {
      const parsed = parseInt(limit, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 50) {
        return NextResponse.json(
          { error: 'limit must be an integer between 1 and 50' },
          { status: 400 }
        );
      }
      filters.limit = parsed;
    }

    // Execute search
    const result = await searchJobs(filters);

    // Return results
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Search error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to search jobs',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Create a new job posting with moderation flagging
 *
 * Request Body:
 * {
 *   title: string,
 *   description: string,
 *   company_name: string,
 *   location: string,
 *   region: string,
 *   job_type: string,
 *   employer_email: string,
 *   salary_min?: number,
 *   salary_max?: number,
 *   salary_currency?: string,
 *   source_url?: string,
 *   benefits?: object,
 *   ...
 * }
 *
 * Response:
 * {
 *   success: true,
 *   job_id: string,
 *   status: "published" | "flagged",
 *   flag?: { rule: string, reason: string, confidence: number }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['title', 'description', 'company_name', 'location', 'region', 'job_type', 'employer_email'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create job and handle moderation in transaction
    const result = await transaction(async (client) => {
      // Insert job - initially as draft
      const jobResult = await client.query(
        `INSERT INTO jobs (
          title, description, company_name, location, region, job_type,
          employer_email, salary_min, salary_max, salary_currency,
          source_url, benefits, status, posted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING id`,
        [
          body.title,
          body.description,
          body.company_name,
          body.location,
          body.region,
          body.job_type,
          body.employer_email,
          body.salary_min || null,
          body.salary_max || null,
          body.salary_currency || 'USD',
          body.source_url || null,
          body.benefits ? JSON.stringify(body.benefits) : null,
          'draft', // Initial status
        ]
      );

      const jobId = jobResult.rows[0].id;

      // Check for moderation flags
      const flag = await flagJob({
        title: body.title,
        description: body.description,
        company_name: body.company_name,
        employer_verified: body.employer_verified || false,
        employer_email: body.employer_email,
        source_url: body.source_url,
      });

      let finalStatus = 'published';
      let flagData = null;

      if (flag) {
        // Job is flagged - set status to flagged and create flag record
        finalStatus = 'flagged';
        flagData = {
          rule: flag.rule,
          reason: flag.reason,
          confidence: flag.confidence,
        };

        // Create moderation flag record
        await client.query(
          `INSERT INTO moderation_flags (job_id, rule_triggered, confidence, status)
           VALUES ($1, $2, $3, $4)`,
          [jobId, flag.rule, flag.confidence, 'flagged']
        );
      }

      // Update job status
      await client.query(
        `UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2`,
        [finalStatus, jobId]
      );

      return { jobId, status: finalStatus, flag: flagData };
    });

    return NextResponse.json(
      {
        success: true,
        job_id: result.jobId,
        status: result.status,
        ...(result.flag && { flag: result.flag }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Job creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to create job',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Export route config for Vercel
export const dynamic = 'force-dynamic';
