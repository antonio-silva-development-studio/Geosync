import { clsx } from 'clsx';
import { Building2, User, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { OrganizationSettings } from './views/OrganizationSettings';
import { PersonalSettings } from './views/PersonalSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'personal' | 'organization';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-gray-900">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={clsx(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === 'personal'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                )}
              >
                <User className="h-4 w-4" />
                My Account
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('organization')}
                className={clsx(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  activeTab === 'organization'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                )}
              >
                <Building2 className="h-4 w-4" />
                Organization
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {activeTab === 'personal' && 'My Account'}
                {activeTab === 'organization' && 'Organization Settings'}
              </h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'personal' && <PersonalSettings />}
              {activeTab === 'organization' && <OrganizationSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
