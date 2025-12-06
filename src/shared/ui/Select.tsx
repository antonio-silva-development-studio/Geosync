import { clsx } from 'clsx';
import type React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  className,
  id,
  options,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={clsx(
            'block w-full appearance-none rounded-md border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6',
            'dark:bg-gray-950 dark:text-white dark:ring-1 dark:ring-gray-700 dark:focus:ring-2 dark:focus:ring-blue-500',
            error && 'ring-red-300 focus:ring-red-500 dark:ring-red-900/50',
            'pr-10', // Space for the chevron icon
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {helperText && !error && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
