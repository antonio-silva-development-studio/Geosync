import { clsx } from 'clsx';
import type React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  className,
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6',
          'dark:bg-gray-950 dark:text-white dark:ring-1 dark:ring-gray-700 dark:focus:ring-2 dark:focus:ring-blue-500',
          error && 'ring-red-300 focus:ring-red-500 dark:ring-red-900/50',
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
