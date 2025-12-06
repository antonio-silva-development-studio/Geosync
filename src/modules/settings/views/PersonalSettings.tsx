import { clsx } from 'clsx';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../../../shared/ui/Input';
import { useAppStore } from '../../../store/useAppStore';
import { useAuthStore } from '../../auth/store';

export const PersonalSettings: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  const { userProfile, setUserProfile } = useAuthStore();

  // Profile State
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await window.electronAPI.updateSystemProfile({ name, email });
      setUserProfile({ name, email });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      const currentHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(currentPassword),
      );
      const currentHashHex = Array.from(new Uint8Array(currentHash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const newHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(newPassword));
      const newHashHex = Array.from(new Uint8Array(newHash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      await window.electronAPI.changeMasterPassword(currentHashHex, newHashHex);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error((error as Error).message || 'Failed to change password');
    }
  };

  return (
    <div className="space-y-12 max-w-3xl">
      {/* Profile Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">General</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your personal details and application preferences.
          </p>
        </div>

        <div className="space-y-8">
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="pt-2">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Update Profile
              </button>
            </div>
          </form>

          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={clsx(
                  'flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all',
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                )}
              >
                <div className="h-12 w-full rounded bg-[#f3f4f6] shadow-sm"></div>
                <span
                  className={clsx(
                    'text-sm font-medium',
                    theme === 'light'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white',
                  )}
                >
                  Light
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={clsx(
                  'flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all',
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                )}
              >
                <div className="h-12 w-full rounded bg-[#1f2937] shadow-sm"></div>
                <span
                  className={clsx(
                    'text-sm font-medium',
                    theme === 'dark'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white',
                  )}
                >
                  Dark
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={clsx(
                  'flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all',
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
                )}
              >
                <div className="flex h-12 w-full overflow-hidden rounded shadow-sm">
                  <div className="w-1/2 bg-[#f3f4f6]"></div>
                  <div className="w-1/2 bg-[#1f2937]"></div>
                </div>
                <span
                  className={clsx(
                    'text-sm font-medium',
                    theme === 'system'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white',
                  )}
                >
                  System
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200 dark:border-gray-800" />

      {/* Security Section */}
      <section id="security">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your password and security preferences.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800 max-w-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Change Master Password
          </h3>
          <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="pt-2">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
