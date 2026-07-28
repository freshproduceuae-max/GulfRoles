import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    const variantStyles: Record<string, string> = {
      default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      success: 'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-300',
      warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      error: 'bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300',
    };

    const sizeStyles: Record<string, string> = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center
          font-medium
          rounded-full
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className || ''}
        `.trim()}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
