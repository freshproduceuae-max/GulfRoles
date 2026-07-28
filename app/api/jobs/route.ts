import { NextRequest, NextResponse } from 'next/server';
import { searchJobs, type SearchFilters } from '@/lib/search';

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

// Export route config for Vercel
export const dynamic = 'force-dynamic';
