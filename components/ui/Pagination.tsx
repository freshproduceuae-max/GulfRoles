import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ currentPage, totalPages, onPageChange, className }, ref) => {
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;
      const halfVisible = Math.floor(maxVisible / 2);

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= halfVisible) {
          for (let i = 1; i <= maxVisible; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - halfVisible) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    const pages = getPageNumbers();

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center gap-2 ${className || ''}`.trim()}
      >
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {pages.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 py-2 text-gray-500 dark:text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentPage === page
                      ? 'bg-primary-500 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export default Pagination;
