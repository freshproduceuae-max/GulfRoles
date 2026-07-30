'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Filters, { FiltersState } from '@/components/job/Filters';
import JobCard from '@/components/job/JobCard';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';

interface FormattedJob {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  job_type?: string;
  posted_at: Date;
  region?: string;
}

interface ApiResponse {
  jobs: FormattedJob[];
  total: number;
  page: number;
  pages: number;
  error?: string;
}

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<FormattedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (searchParams.get('q')) params.append('q', searchParams.get('q')!);
      if (searchParams.get('location')) params.append('location', searchParams.get('location')!);
      if (searchParams.get('region')) params.append('region', searchParams.get('region')!);

      if (filters.location) params.append('location', filters.location);
      if (filters.job_type?.length) params.append('job_type', filters.job_type[0]);
      if (filters.salary_min) params.append('salary_min', filters.salary_min.toString());
      if (filters.salary_max) params.append('salary_max', filters.salary_max.toString());

      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data: ApiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setJobs(data.jobs);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(message);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, filters]);

  useEffect(() => {
    fetchJobs(1);
  }, [filters]);

  const handlePageChange = (page: number) => {
    fetchJobs(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFiltersChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="flex flex-col md:flex-row">
        <div className="hidden md:block w-80">
          <Filters
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
            isMobile={false}
          />
        </div>

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:hidden mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {total > 0 ? `${total} jobs found` : 'No jobs found'}
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          <div className="hidden md:block mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {total > 0 ? `${total} jobs found` : 'No jobs found'}
            </h2>
          </div>

          {isLoading && <Loading count={5} />}

          {error && !isLoading && (
            <EmptyState
              title="Error loading jobs"
              description={error}
              action={{
                label: 'Try again',
                onClick: () => fetchJobs(currentPage),
              }}
            />
          )}

          {!isLoading && !error && jobs.length === 0 && (
            <EmptyState
              title="No jobs found"
              description="Try adjusting your search criteria or filters to find more opportunities."
              action={{
                label: 'Clear filters',
                onClick: () => setFilters({}),
              }}
            />
          )}

          {!isLoading && !error && jobs.length > 0 && (
            <>
              <div className="space-y-4 mb-8">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company_name={job.company_name}
                    location={job.location}
                    salary_min={job.salary_min}
                    salary_max={job.salary_max}
                    salary_currency={job.salary_currency}
                    job_type={job.job_type}
                    posted_at={job.posted_at.toString()}
                    region={job.region}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {showFilters && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilters(false)} />
            <Filters
              onFiltersChange={handleFiltersChange}
              isLoading={isLoading}
              isMobile={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
