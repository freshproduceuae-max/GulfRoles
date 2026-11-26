import { NextRequest, NextResponse } from 'next/server';
import { searchJobs, type SearchFilters } from '@/lib/search';
import { flagJob } from '@/lib/moderation';
import { transaction } from '@/lib/db';
import { regionFromParam } from '@/lib/regions';
import { serverErrorResponse } from '@/lib/http';
import { getEmployerSession } from '@/lib/access';
import { canRecruit, companyRole } from '@/lib/employer/roles';
import { toUsd } from '@/lib/ingestion/normalize';

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
      const resolved = regionFromParam(region);
      if (!resolved) {
        return NextResponse.json(
          { error: 'Invalid region. Use ae, sa, in, au, us or UAE, Saudi, India, Australia, USA' },
          { status: 400 }
        );
      }
      filters.region = resolved.db;
    }

    if (searchParams.get('featured') === 'true') {
      filters.featured = true;
    }

    const category = searchParams.get('category');
    if (category) {
      filters.category = category.slice(0, 40);
    }

    const postedWithin = searchParams.get('posted_within');
    if (postedWithin) {
      const days = Number(postedWithin);
      if (days !== 1 && days !== 7 && days !== 30) {
        return NextResponse.json({ error: 'posted_within must be 1, 7, or 30' }, { status: 400 });
      }
      filters.posted_within = days;
    }

    if (searchParams.get('remote') === 'true') {
      filters.remote = true;
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
    return serverErrorResponse(error, 'Failed to search jobs');
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
    const session = await getEmployerSession(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Sign in with the email link before posting a job.' },
        { status: 401 }
      );
    }
    const role = await companyRole(session.companyId, session.email);
    if (!canRecruit(role)) {
      return NextResponse.json({ error: 'Your role can view jobs but cannot post them.' }, { status: 403 });
    }

    const body = await request.json();

    const required = ['title', 'description', 'company_name', 'location', 'region', 'job_type'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const region = regionFromParam(String(body.region));
    if (!region) {
      return NextResponse.json(
        { error: 'Invalid region. Use UAE, Saudi, India, Australia, or USA' },
        { status: 400 }
      );
    }

    const salaryMin = body.salary_min ? Number(body.salary_min) : null;
    const salaryMax = body.salary_max ? Number(body.salary_max) : null;
    const salaryCurrency = body.salary_currency || region.currency;

    // Create job and handle moderation in transaction
    const result = await transaction(async (client) => {
      const jobResult = await client.query(
        `INSERT INTO jobs (
          title, description, company_id, company_name, location, region, job_type,
          employer_email, employer_verified, salary_min, salary_max, salary_currency,
          salary_normalized_usd, source, source_url, benefits, status, posted_at, expires_at,
          google_jobs_allowed, cpc_tracked, redistributable
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12,
          $13, 'direct', $14, $15, 'draft', NOW(), NOW() + INTERVAL '30 days',
          true, false, true
        )
        RETURNING id`,
        [
          body.title,
          body.description,
          session.companyId,
          body.company_name,
          body.location,
          region.db,
          body.job_type,
          session.email,
          session.verified,
          salaryMin,
          salaryMax,
          salaryCurrency,
          toUsd(salaryMin, salaryMax, salaryCurrency, null),
          body.source_url || null,
          body.benefits ? JSON.stringify(body.benefits) : null,
        ]
      );

      const jobId = jobResult.rows[0].id;

      // Check for moderation flags
      const flag = await flagJob({
        title: body.title,
        description: body.description,
        company_name: body.company_name,
        employer_verified: session.verified,
        employer_email: session.email,
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
    return serverErrorResponse(error, 'Failed to create job');
  }
}

// Export route config for Vercel
export const dynamic = 'force-dynamic';
