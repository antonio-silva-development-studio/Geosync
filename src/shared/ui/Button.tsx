import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm',
      secondary:
        'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700',
      danger:
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 shadow-sm',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
      outline:
        'border border-gray-200 bg-transparent hover:bg-gray-100 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800',
      link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-500',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={twMerge(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
