import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User, Shield, AppWindow } from 'lucide-react';
import { clsx } from 'clsx';

type Tab = 'personal' | 'security' | 'application';

export const SettingsView: React.FC = () => {
  const { userProfile, setUserProfile } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  // Personal Data State
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [personalSuccess, setPersonalSuccess] = useState('');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.electronAPI.updateSystemProfile({ name, email });
      setUserProfile({ name, email });
      setPersonalSuccess('Profile updated successfully');
      setTimeout(() => setPersonalSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setSecurityError('Password must be at least 8 characters');
      return;
    }

    try {
      // Hash current password to verify
      const currentHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(currentPassword));
      const currentHashHex = Array.from(new Uint8Array(currentHash)).map(b => b.toString(16).padStart(2, '0')).join('');

      // Hash new password
      const newHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(newPassword));
      const newHashHex = Array.from(new Uint8Array(newHash)).map(b => b.toString(16).padStart(2, '0')).join('');

      await window.electronAPI.changeMasterPassword(currentHashHex, newHashHex);
      setSecuritySuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setSecurityError(error.message || 'Failed to change password');
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={clsx(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === 'personal'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            <User className="h-4 w-4" />
            Personal Data
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={clsx(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === 'security'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            <Shield className="h-4 w-4" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('application')}
            className={clsx(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === 'application'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            )}
          >
            <AppWindow className="h-4 w-4" />
            Application
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {activeTab === 'personal' && 'Personal Data'}
            {activeTab === 'security' && 'Security'}
            {activeTab === 'application' && 'Application Settings'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'personal' && (
            <form onSubmit={handleSavePersonal} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
                {personalSuccess && (
                  <span className="ml-3 text-sm text-green-600">{personalSuccess}</span>
                )}
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Change Password
                </button>
                {securitySuccess && (
                  <span className="ml-3 text-sm text-green-600">{securitySuccess}</span>
                )}
                {securityError && (
                  <span className="ml-3 text-sm text-red-600">{securityError}</span>
                )}
              </div>
            </form>
          )}

          {activeTab === 'application' && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <AppWindow className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <p>Application settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
