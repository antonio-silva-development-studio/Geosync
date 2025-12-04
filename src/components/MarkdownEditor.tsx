import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { clsx } from 'clsx';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  return (
    <div className={clsx("flex flex-col border rounded-md overflow-hidden dark:border-gray-700", className)}>
      <div className="flex items-center border-b bg-gray-50 px-4 dark:bg-gray-800 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('write')}
          className={clsx(
            "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === 'write'
              ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Write
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={clsx(
            "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === 'preview'
              ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          )}
        >
          Preview
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900">
        {activeTab === 'write' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-full w-full resize-none p-4 font-mono text-sm focus:outline-none dark:bg-gray-900 dark:text-white"
            placeholder="Write your documentation here..."
          />
        ) : (
          <div className="prose prose-sm h-full max-w-none overflow-auto p-4 dark:prose-invert">
            <Markdown>{value || '*Nothing to preview*'}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};
