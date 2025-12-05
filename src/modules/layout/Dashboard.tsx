import { Folder } from 'lucide-react';
import type React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserMenu } from '../auth/UserMenu';
import { OrganizationSwitcher } from '../organizations/OrganizationSwitcher';
import { ProjectList } from '../projects/ProjectList';
import { ProjectView } from '../projects/ProjectView';
import { SettingsView } from '../settings/SettingsView';

export const Dashboard: React.FC = () => {
  const { currentProject, activeView } = useAppStore();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r bg-white dark:border-gray-700 dark:bg-gray-800 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <OrganizationSwitcher />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ProjectList />
        </div>

        <div className="border-t p-4 dark:border-gray-700">
          <UserMenu />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeView === 'settings' ? (
          <SettingsView />
        ) : currentProject ? (
          <ProjectView />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Folder className="mx-auto h-12 w-12 opacity-50" />
              <h3 className="mt-2 text-lg font-medium">No Project Selected</h3>
              <p className="mt-1">Select a project from the sidebar or create a new one.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
