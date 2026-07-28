import React from 'react';
import Button from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`.trim()}
      >
        {icon && <div className="mb-4 text-gray-400 dark:text-gray-600">{icon}</div>}

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            {description}
          </p>
        )}

        {action && (
          <Button variant="primary" size="md" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export default EmptyState;
