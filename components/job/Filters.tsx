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

        {/* Salary Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Salary Range
          </label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Min
                </label>
                <input
                  type="number"
                  placeholder="Min salary"
                  value={filters.salary_min || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      salary_min: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Max
                </label>
                <input
                  type="number"
                  placeholder="Max salary"
                  value={filters.salary_max || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      salary_max: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Currency
              </label>
              <select
                value={filters.salary_currency || 'USD'}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    salary_currency: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
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
        className={`sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 ${className || ''}`.trim()}
      >
        {filterContent}
      </div>
    );
  }
);

Filters.displayName = 'Filters';

export default Filters;
