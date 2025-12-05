import { clsx } from 'clsx';
import {
  AppWindow,
  BarChart3,
  Code,
  CreditCard,
  FileText,
  Laptop,
  LayoutGrid,
  Shield,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../../shared/ui/Input';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../auth/store';

type Section =
  | 'your-business'
  | 'team-security'
  | 'compliance'
  | 'billing'
  | 'integrations'
  | 'application';
type Tab = 'account' | 'public-details' | 'business' | 'payout' | 'tax' | 'branding';

const SidebarItem = ({
  icon: Icon,
  label,
  id,
  isActive,
  setActiveSection,
}: {
  icon?: React.ElementType;
  label: string;
  id: Section;
  isActive: boolean;
  setActiveSection: (section: Section) => void;
}) => (
  <button
    type="button"
    onClick={() => setActiveSection(id)}
    className={clsx(
      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50',
    )}
  >
    {Icon && <Icon className="h-4 w-4" />}
    {label}
  </button>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">
    {title}
  </div>
);

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  const { userProfile, setUserProfile } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>('your-business');
  const [activeTab, setActiveTab] = useState<Tab>('public-details');

  // Personal Data State (Mapped to Account/Public Details)
  const [name, setName] = useState(userProfile?.name || '');

  const [email, setEmail] = useState(userProfile?.email || '');

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSavePersonal = async (e: React.FormEvent) => {
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
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 px-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
        </div>

        <nav className="space-y-1 px-2">
          <SectionHeader title="Product" />
          <SidebarItem
            icon={Laptop}
            label="Application"
            id="application"
            isActive={activeSection === 'application'}
            setActiveSection={setActiveSection}
          />
          <SidebarItem
            icon={CreditCard}
            label="Payments"
            id="billing"
            isActive={activeSection === 'billing'}
            setActiveSection={setActiveSection}
          />
          <SidebarItem
            icon={BarChart3}
            label="Monitor"
            id="compliance"
            isActive={activeSection === 'compliance'}
            setActiveSection={setActiveSection}
          />

          <div className="mt-6">
            <SectionHeader title="Business" />
            <SidebarItem
              icon={AppWindow}
              label="Your business"
              id="your-business"
              isActive={activeSection === 'your-business'}
              setActiveSection={setActiveSection}
            />
            <SidebarItem
              icon={Shield}
              label="Team and security"
              id="team-security"
              isActive={activeSection === 'team-security'}
              setActiveSection={setActiveSection}
            />
            <SidebarItem
              icon={FileText}
              label="Reporting"
              id="compliance"
              isActive={false}
              setActiveSection={setActiveSection}
            />
          </div>

          <div className="mt-6">
            <SectionHeader title="Integrations" />
            <SidebarItem
              icon={LayoutGrid}
              label="Connected apps"
              id="integrations"
              isActive={activeSection === 'integrations'}
              setActiveSection={setActiveSection}
            />
            <SidebarItem
              icon={Code}
              label="Developers"
              id="integrations"
              isActive={false}
              setActiveSection={setActiveSection}
            />
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">
          {activeSection === 'your-business' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your business</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your business, fully customizable. To get started visit our docs or watch
                  this video.
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-8 border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-8">
                  {['Account', 'Public details', 'Business', 'External payout', 'Tax details'].map(
                    (tab) => {
                      const tabId = tab.toLowerCase().replace(' ', '-') as Tab;
                      return (
                        <button
                          type="button"
                          key={tab}
                          onClick={() => setActiveTab(tabId)}
                          className={clsx(
                            'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                            activeTab === tabId
                              ? 'border-red-500 text-gray-900 dark:border-red-500 dark:text-white'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300',
                          )}
                        >
                          {tab}
                        </button>
                      );
                    },
                  )}
                </nav>
              </div>

              {activeTab === 'public-details' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Public business information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This information helps customers recognize your business and understand your
                      products.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSavePersonal}
                    className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2"
                  >
                    <div className="col-span-1">
                      <Input
                        label="Public business name"
                        value={name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setName(e.target.value)
                        }
                        placeholder="Write official business name"
                        helperText="Your public business name may be used on invoices and receipts. Please make sure it's correct."
                      />
                    </div>

                    <div className="col-span-1">
                      <Input
                        label="Support email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEmail(e.target.value)
                        }
                        placeholder="Write email address"
                        helperText="This is important, so choose a different than your personal email."
                      />
                    </div>

                    <div className="col-span-1">
                      <label
                        htmlFor="support-address"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Support address
                      </label>
                      <div className="mt-2">
                        <select
                          id="support-address"
                          className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-0 dark:focus:ring-2 dark:focus:ring-blue-500"
                        >
                          <option>United states / California / Los Angeles</option>
                        </select>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Optional</p>
                    </div>

                    <div className="col-span-1">
                      <Input label="Support phone" placeholder="Write address line" />
                    </div>

                    <div className="col-span-1">
                      <Input label="Business website" placeholder="Copy - paste business url" />
                    </div>

                    <div className="col-span-1">
                      <Input
                        label="Privacy policy"
                        placeholder="Copy - paste privacy policy link"
                      />
                    </div>

                    <div className="col-span-2 flex justify-end pt-4">
                      <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="max-w-md space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Account Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage your personal account details.
                    </p>
                  </div>
                  <form onSubmit={handleSavePersonal} className="space-y-4">
                    <Input
                      label="Full Name"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Update Profile
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          {activeSection === 'team-security' && (
            <div className="max-w-md space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Team and security
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your security preferences and team access.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Change Master Password
                </h3>
                <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCurrentPassword(e.target.value)
                    }
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewPassword(e.target.value)
                    }
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
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
            </div>
          )}

          {activeSection === 'application' && (
            <div className="max-w-2xl space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Application</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your application preferences and appearance.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Appearance</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Customize how GeoSync looks on your device.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-4">
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
                    <div className="h-20 w-full rounded bg-[#f3f4f6] shadow-sm"></div>
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
                    <div className="h-20 w-full rounded bg-[#1f2937] shadow-sm"></div>
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
                    <div className="flex h-20 w-full overflow-hidden rounded shadow-sm">
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
          )}
        </div>
      </div>
    </div>
  );
};
