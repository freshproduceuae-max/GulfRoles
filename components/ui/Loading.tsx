import React from 'react';

export interface LoadingProps {
  count?: number;
  className?: string;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ count = 3, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`space-y-4 ${className || ''}`.trim()}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse"
          >
            {/* Header skeleton */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>

            {/* Meta information skeleton */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex gap-4 flex-wrap">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
              </div>
            </div>

            {/* Badges skeleton */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
            </div>

            {/* Button skeleton */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

Loading.displayName = 'Loading';

export default Loading;
