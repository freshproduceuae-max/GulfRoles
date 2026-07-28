import React, { useRef, useEffect, useState } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  onChange?: (value: string | number) => void;
  value?: string | number;
}

/**
 * Custom select/dropdown component with accessibility support
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      helperText,
      placeholder,
      onChange,
      value,
      id,
      disabled,
      className,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
      options.find((opt) => opt.value === value) || null
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          setIsOpen(!isOpen);
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setIsOpen(false);
          }
          break;
        default:
          break;
      }
    };

    const handleOptionSelect = (option: SelectOption) => {
      if (option.disabled) return;

      setSelectedOption(option);
      onChange?.(option.value);
      setIsOpen(false);
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        {/* Custom Select Container */}
        <div ref={containerRef} className="relative">
          {/* Hidden native select for form submission */}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={selectedOption?.value ?? ''}
            onChange={(e) => {
              const option = options.find((opt) => opt.value === e.target.value);
              if (option) {
                handleOptionSelect(option);
              }
            }}
            className="sr-only"
            aria-hidden="true"
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Select Button */}
          <button
            ref={buttonRef}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`
              w-full px-4 py-2 text-left
              border border-gray-300 dark:border-gray-600 rounded-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50
              transition-colors duration-200
              flex items-center justify-between gap-2
              ${error ? 'border-error-500 focus:ring-error-500' : ''}
              ${className || ''}
            `.trim()}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          >
            <span className={selectedOption ? '' : 'text-gray-500 dark:text-gray-400'}>
              {selectedOption?.label || placeholder || 'Select an option'}
            </span>
            <svg
              className={`
                w-5 h-5 transition-transform duration-200
                ${isOpen ? 'rotate-180' : ''}
              `.trim()}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Dropdown List */}
          {isOpen && (
            <ul
              ref={listRef}
              role="listbox"
              className={`
                absolute top-full left-0 right-0 mt-1
                z-50
                bg-white dark:bg-gray-800
                border border-gray-300 dark:border-gray-600 rounded-lg
                shadow-lg
                max-h-64 overflow-y-auto
                py-1
              `.trim()}
            >
              {options.length === 0 ? (
                <li className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                  No options available
                </li>
              ) : (
                options.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      disabled={option.disabled}
                      role="option"
                      aria-selected={selectedOption?.value === option.value}
                      className={`
                        w-full px-4 py-2 text-left text-sm
                        transition-colors duration-150
                        ${
                          selectedOption?.value === option.value
                            ? 'bg-primary-500 text-white'
                            : option.disabled
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `.trim()}
                    >
                      {option.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-error-500">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={`${selectId}-helper`}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
