import { clsx } from 'clsx';
import { Database, FileText, Layers } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import type { Project } from '../../../types';
import { EnvironmentView as EnvironmentManager } from '../../environments/EnvironmentView';
import { CollectionManager } from '../CollectionManager';
import { DocumentsView } from '../DocumentsView';

interface ProjectDetailViewProps {
  project: Project;
}

type Tab = 'documents' | 'environments' | 'collections';

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<Tab>('environments');

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('environments')}
            className={clsx(
              'flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors rounded-none hover:bg-transparent h-auto',
              activeTab === 'environments'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            )}
          >
            <Layers className="h-4 w-4" />
            Environments
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('documents')}
            className={clsx(
              'flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors rounded-none hover:bg-transparent h-auto',
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            )}
          >
            <FileText className="h-4 w-4" />
            Documents
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('collections')}
            className={clsx(
              'flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors rounded-none hover:bg-transparent h-auto',
              activeTab === 'collections'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
            )}
          >
            <Database className="h-4 w-4" />
            Collections
          </Button>
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
