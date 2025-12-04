import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { FileText, Layers, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { EnvironmentView as EnvironmentManager } from './EnvironmentView';
import { CollectionManager } from './CollectionManager';
import { DocumentsView } from './DocumentsView';

type Tab = 'documents' | 'environments' | 'collections';

export const ProjectView: React.FC = () => {
  const { currentProject } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('environments');

  if (!currentProject) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentProject.name}</h1>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('environments')}
            className={clsx(
              'flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors',
              activeTab === 'environments'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <Layers className="h-4 w-4" />
            Environments
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={clsx(
              'flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors',
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <FileText className="h-4 w-4" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={clsx(
              'flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors',
              activeTab === 'collections'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            <Database className="h-4 w-4" />
            Collections
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {activeTab === 'documents' && <DocumentsView />}
        {activeTab === 'environments' && <EnvironmentManager />}
        {activeTab === 'collections' && <CollectionManager />}
      </div>
    </div>
  );
};
