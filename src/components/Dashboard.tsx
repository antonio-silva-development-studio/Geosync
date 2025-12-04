import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Database, LogOut, Folder } from 'lucide-react';
import { ProjectView } from './ProjectView';
import { ProjectList } from './ProjectList';

export const Dashboard: React.FC = () => {
  const { setProjects, currentProject, logout } = useAppStore();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await window.electronAPI.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex h-16 items-center justify-between px-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
            <Database className="h-5 w-5 text-blue-600" />
            GeoSync
          </div>
        </div>

        <div className="p-4">
          <ProjectList />
        </div>

        <div className="absolute bottom-0 w-64 border-t p-4 dark:border-gray-700">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentProject ? (
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
