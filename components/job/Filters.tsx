'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export interface FiltersState {
  location?: string;
  region?: string;
  category?: string;
  job_type?: string[];
  salary_min?: number;
  posted_within?: string;
  remote?: boolean;
}

export interface FiltersProps {
  onFiltersChange?: (filters: FiltersState) => void;
  isLoading?: boolean;
  className?: string;
  isMobile?: boolean;
  initial?: FiltersState;
}

const COUNTRIES = [
  { value: '', label: 'Any country' },
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'Saudi', label: 'Saudi Arabia' },
  { value: 'India', label: 'India' },
  { value: 'Australia', label: 'Australia' },
  { value: 'USA', label: 'United States' },
];

const CATEGORIES = [
  { value: '', label: 'Any category' },
  { value: 'software', label: 'Software' },
  { value: 'nurse', label: 'Healthcare' },
  { value: 'sales', label: 'Sales' },
  { value: 'teacher', label: 'Education' },
  { value: 'engineer', label: 'Engineering' },
  { value: 'account', label: 'Finance' },
  { value: 'hospitality', label: 'Hospitality' },
];

const selectClass =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white';

const Filters = React.forwardRef<HTMLDivElement, FiltersProps>(
  ({ onFiltersChange, isLoading = false, className, isMobile = false, initial }, ref) => {
    const [filters, setFilters] = useState<FiltersState>({
      job_type: [],
      ...initial,
    });

    const filterContent = (
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onFiltersChange?.(filters);
        }}
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Filters</h2>

        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Country
          <select
            aria-label="Country"
            className={`${selectClass} mt-1`}
            value={filters.region || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, region: event.target.value }))}
          >
            {COUNTRIES.map((country) => (
              <option key={country.value || 'any'} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          City
          <input
            aria-label="City"
            className={`${selectClass} mt-1`}
            placeholder="Dubai, Riyadh, Mumbai"
            value={filters.location || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
          />
        </label>

        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Category
          <select
            aria-label="Category"
            className={`${selectClass} mt-1`}
            value={filters.category || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
          >
            {CATEGORIES.map((category) => (
              <option key={category.value || 'any'} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-gray-900 dark:text-white mb-2">Job type</legend>
          <div className="space-y-2">
            {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.job_type?.includes(type) || false}
                  onChange={() =>
                    setFilters((prev) => ({
                      ...prev,
                      job_type: prev.job_type?.includes(type)
                        ? prev.job_type.filter((item) => item !== type)
                        : [...(prev.job_type || []), type],
                    }))
                  }
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Minimum salary (USD)
          <input
            aria-label="Minimum salary"
            type="number"
            min={0}
            className={`${selectClass} mt-1`}
            value={filters.salary_min ?? ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                salary_min: event.target.value ? Number(event.target.value) : undefined,
              }))
            }
          />
        </label>

        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          Date posted
          <select
            aria-label="Date posted"
            className={`${selectClass} mt-1`}
            value={filters.posted_within || ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, posted_within: event.target.value }))}
          >
            <option value="">Any time</option>
            <option value="1">Past 24 hours</option>
            <option value="7">Past week</option>
            <option value="30">Past month</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
          <input
            type="checkbox"
            checked={Boolean(filters.remote)}
            onChange={(event) => setFilters((prev) => ({ ...prev, remote: event.target.checked }))}
          />
          Remote only
        </label>

        <Button variant="primary" className="w-full" type="submit" loading={isLoading}>
          Apply filters
        </Button>
      </form>
    );

    if (isMobile) {
      return (
        <div ref={ref} className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white dark:bg-gray-900 overflow-y-auto shadow-xl">
          <div className="p-4">{filterContent}</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 ${className || ''}`}
      >
        {filterContent}
      </div>
    );
  }
);

Filters.displayName = 'Filters';

export default Filters;
