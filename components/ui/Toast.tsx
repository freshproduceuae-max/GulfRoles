import React, { useEffect, useState } from 'react';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextType {
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
}

/**
 * Individual toast notification component
 */
const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      type = 'info',
      title,
      message,
      duration = 5000,
      onClose,
      action,
    },
    ref
  ) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
      if (duration === 0) return;

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        onClose?.();
      }, 300);
    };

    const typeStyles: Record<string, string> = {
      success:
        'bg-secondary-50 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-700',
      error:
        'bg-error-50 dark:bg-error-900 border-error-200 dark:border-error-700',
      info: 'bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700',
      warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700',
    };

    const iconStyles: Record<string, string> = {
      success:
        'text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800',
      error: 'text-error-500 dark:text-error-400 bg-error-100 dark:bg-error-800',
      info: 'text-primary-500 dark:text-primary-400 bg-primary-100 dark:bg-primary-800',
      warning: 'text-yellow-500 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-800',
    };

    const textStyles: Record<string, string> = {
      success:
        'text-secondary-900 dark:text-secondary-100 text-secondary-800 dark:text-secondary-200',
      error: 'text-error-900 dark:text-error-100 text-error-800 dark:text-error-200',
      info: 'text-primary-900 dark:text-primary-100 text-primary-800 dark:text-primary-200',
      warning:
        'text-yellow-900 dark:text-yellow-100 text-yellow-800 dark:text-yellow-200',
    };

    const renderIcon = () => {
      const size = 'w-5 h-5';

      switch (type) {
        case 'success':
          return (
            <svg
              className={size}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          );

        case 'error':
          return (
            <svg
              className={size}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          );

        case 'warning':
          return (
            <svg
              className={size}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          );

        case 'info':
        default:
          return (
            <svg
              className={size}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          );
      }
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={`
          transform transition-all duration-300 ease-in-out
          ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        `}
      >
        <div
          className={`
            flex items-start gap-3
            px-4 py-3 sm:px-4 sm:py-3
            rounded-lg border
            backdrop-blur-sm
            shadow-lg
            ${typeStyles[type]}
          `.trim()}
        >
          {/* Icon */}
          <div
            className={`
              flex-shrink-0
              p-2
              rounded-md
              ${iconStyles[type]}
            `.trim()}
          >
            {renderIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3
                className={`
                  text-sm sm:text-base font-semibold
                  ${textStyles[type].split(' ')[0]}
                `.trim()}
              >
                {title}
              </h3>
            )}
            <p
              className={`
                text-sm
                ${textStyles[type].split(' ')[1]}
                ${title ? 'mt-1' : ''}
              `.trim()}
            >
              {message}
            </p>

            {/* Action Button */}
            {action && (
              <button
                onClick={action.onClick}
                className={`
                  mt-2
                  text-sm font-medium
                  ${textStyles[type].split(' ')[0]}
                  hover:opacity-75
                  transition-opacity duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  focus:ring-${type === 'success' ? 'secondary' : type === 'error' ? 'error' : type === 'warning' ? 'yellow' : 'primary'}-500
                `.trim()}
              >
                {action.label}
              </button>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0
              p-1 rounded-md
              text-gray-500 dark:text-gray-400
              hover:text-gray-700 dark:hover:text-gray-300
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              focus:ring-primary-500
            `.trim()}
            aria-label="Close notification"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

export default Toast;
