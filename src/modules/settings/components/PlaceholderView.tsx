import { Construction } from 'lucide-react';
import type React from 'react';

interface PlaceholderViewProps {
  title: string;
  description: string;
  icon?: React.ElementType;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  description,
  icon: Icon = Construction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
        <Icon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="max-w-md text-gray-500 dark:text-gray-400 mb-8">{description}</p>
      <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30">
        Coming Soon
      </div>
    </div>
  );
};
