import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-lg
          shadow-sm hover:shadow-md
          p-6
          transition-shadow duration-200
          ${className || ''}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
