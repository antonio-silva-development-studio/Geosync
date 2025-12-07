import { clsx } from 'clsx';
import type React from 'react';
import { Button } from '../../../shared/ui/Button';
export type SettingsSection =
  // Personal
  | 'personal-general'
  | 'personal-workspaces'
  | 'personal-security'
  // Organization
  | 'org-general'
  | 'org-branding'
  | 'org-members'
  | 'org-tags'
  | 'org-templates'
  | 'org-integrations'
  | 'org-developer'
  // Billing
  | 'billing-subscription';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  id: SettingsSection;
  isActive: boolean;
  onClick: (id: SettingsSection) => void;
  isFuture?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  id,
  isActive,
  onClick,
  isFuture,
}) => (
  <Button
    variant="ghost"
    onClick={() => onClick(id)}
    className={clsx(
      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors justify-start h-auto',
      isActive
        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50',
    )}
  >
    <Icon className="h-4 w-4" />
    <span className="flex-1 text-left">{label}</span>
    {isFuture && (
      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        Soon
      </span>
    )}
  </Button>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="px-3 py-2 mt-6 first:mt-0 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500">
    {title}
  </div>
);

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onNavigate: (section: SettingsSection) => void;
  groups: {
    title: string;
    items: {
      id: SettingsSection;
      label: string;
      icon: React.ElementType;
      isFuture?: boolean;
    }[];
  }[];
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeSection,
  onNavigate,
  groups,
}) => {
  return (
    <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 px-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
      </div>

      <nav className="space-y-1 px-2">
        {groups.map((group) => (
          <div key={group.title}>
            <SectionHeader title={group.title} />
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeSection === item.id}
                onClick={onNavigate}
                isFuture={item.isFuture}
              />
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};
