import { cn } from '../../../../lib/utils';

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export const MethodBadge = ({ method, className }: MethodBadgeProps) => {
  const upperMethod = method.toUpperCase();

  const colors: Record<string, string> = {
    GET: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    POST: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    PUT: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    DELETE: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    PATCH:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    HEAD: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800',
    OPTIONS: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  };

  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider w-16 text-center shrink-0',
        colors[upperMethod] || colors.GET,
        className,
      )}
    >
      {upperMethod}
    </span>
  );
};
