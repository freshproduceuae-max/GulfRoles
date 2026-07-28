'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface FiltersState {
  location?: string;
  radius?: number;
  job_type?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  experience_level?: string[];
  date_posted?: string;
  company?: string;
}

export interface FiltersProps {
  onFiltersChange?: (filters: FiltersState) => void;
  isLoading?: boolean;
  className?: string;
  isMobile?: boolean;
}

const Filters = React.forwardRef<HTMLDivElement, FiltersProps>(
  ({ onFiltersChange, isLoading = false, className, isMobile = false }, ref) => {
    const [filters, setFilters] = useState<FiltersState>({
      job_type: [],
      experience_level: [],
      salary_currency: 'USD',
    });

    const handleJobTypeChange = (type: string) => {
      setFilters((prev) => ({
        ...prev,
        job_type: prev.job_type?.includes(type)
          ? prev.job_type.filter((t) => t !== type)
          : [...(prev.job_type || []), type],
      }));
    };

    const handleApplyFilters = () => {
      onFiltersChange?.(filters);
    };

    const handleClearFilters = () => {
      const clearedFilters: FiltersState = {
        job_type: [],
        experience_level: [],
        salary_currency: 'USD',
      };
      setFilters(clearedFilters);
      onFiltersChange?.(clearedFilters);
    };

    const filterContent = (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Location
          </label>
          <Input
            type="text"
            placeholder="Enter city or region"
            value={filters.location || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Job Type
          </label>
          <div className="space-y-2">
            {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.job_type?.includes(type) || false}
                  onChange={() => handleJobTypeChange(type)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            className="w-full"
            onClick={handleApplyFilters}
            loading={isLoading}
          >
            Apply Filters
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            Clear Filters
          </Button>
        </div>
      </div>
    );

    if (isMobile) {
      return (
        <div
          ref={ref}
          className={`fixed inset-0 z-40 bg-white dark:bg-gray-900 overflow-y-auto`}
        >
          <div className="p-4">{filterContent}</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6`}
      >
        {filterContent}
      </div>
    );
  }
);

Filters.displayName = 'Filters';

export default Filters;
