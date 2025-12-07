import { ChevronUp, LogOut, Settings } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from './store';

export const UserMenu: React.FC = () => {
  const { setActiveView } = useAppStore();
  const { userProfile, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 h-auto"
      >
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden items-start">
            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {userProfile?.name || 'User'}
            </span>
            <span className="truncate text-xs text-gray-500 dark:text-gray-400 font-normal">
              {userProfile?.email || 'user@example.com'}
            </span>
          </div>
        </div>
        <ChevronUp className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 cursor-default bg-transparent"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <div className="p-1">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  setActiveView('settings');
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 justify-start h-auto font-normal"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
              <Button
                variant="ghost"
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 justify-start h-auto font-normal"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
