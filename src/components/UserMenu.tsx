import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { LogOut, Settings, ChevronUp } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const UserMenu: React.FC = () => {
  const { userProfile, logout } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {userProfile?.name || 'User'}
              </span>
              <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                {userProfile?.email || 'user@example.com'}
              </span>
            </div>
          </div>
          <ChevronUp className="h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <div className="p-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
                <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
