import {
  Briefcase,
  Building2,
  Code,
  CreditCard,
  Globe,
  LayoutGrid,
  Palette,
  Shield,
  Tag,
  User,
  Users,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { PlaceholderView } from './components/PlaceholderView';
import { type SettingsSection, SettingsSidebar } from './components/SettingsSidebar';
import { DeveloperTools } from './views/DeveloperTools';
import { OrganizationSettings } from './views/OrganizationSettings';
import { PersonalSettings } from './views/PersonalSettings';
import { TagManager } from './views/TagManager';

export const SettingsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('personal-general');

  const renderContent = () => {
    switch (activeSection) {
      // Personal
      case 'personal-general':
        return <PersonalSettings />;
      case 'personal-workspaces':
        return (
          <PlaceholderView
            title="Workspaces"
            description="Use Tags on projects to organize your work contexts. Right-click on any project to manage its tags."
            icon={Briefcase}
          />
        );
      case 'personal-security':
        // We can scroll to security section if we want, or just render PersonalSettings
        // For now, let's render PersonalSettings as it contains Security
        return <PersonalSettings />;

      // Organization
      case 'org-general':
        return <OrganizationSettings />;
      case 'org-branding':
        return (
          <PlaceholderView
            title="Branding & Sharing"
            description="Customize how your shared environment variables look to external developers. Set logos, colors, and welcome messages."
            icon={Palette}
          />
        );
      case 'org-members':
        return (
          <PlaceholderView
            title="Team Members"
            description="Invite your team, manage permissions, and organize access controls."
            icon={Users}
          />
        );
      case 'org-tags':
        return <TagManager />;
      case 'org-templates':
        return (
          <PlaceholderView
            title="Variable Templates"
            description="Create presets for common stacks (e.g., Next.js + Supabase) to initialize projects faster."
            icon={LayoutGrid}
          />
        );
      case 'org-integrations':
        return (
          <PlaceholderView
            title="Integrations"
            description="Connect with Vercel, Netlify, and other platforms to sync variables directly to production."
            icon={Globe}
          />
        );
      case 'org-developer':
        return <DeveloperTools />;

      // Billing
      case 'billing-subscription':
        return (
          <PlaceholderView
            title="Subscription & Billing"
            description="Manage your plan, payment methods, and view invoice history."
            icon={CreditCard}
          />
        );
      default:
        return <PersonalSettings />;
    }
  };

  const groups = [
    {
      title: 'My Account',
      items: [
        { id: 'personal-general' as const, label: 'General', icon: User },
        {
          id: 'personal-workspaces' as const,
          label: 'Workspaces',
          icon: Briefcase,
          isFuture: true,
        },
        { id: 'personal-security' as const, label: 'Security', icon: Shield },
      ],
    },
    {
      title: 'Organization',
      items: [
        { id: 'org-general' as const, label: 'General', icon: Building2 },
        { id: 'org-branding' as const, label: 'Branding & Sharing', icon: Palette, isFuture: true },
        { id: 'org-members' as const, label: 'Members', icon: Users, isFuture: true },
        { id: 'org-tags' as const, label: 'Tags', icon: Tag },
        { id: 'org-templates' as const, label: 'Templates', icon: LayoutGrid, isFuture: true },
        { id: 'org-integrations' as const, label: 'Integrations', icon: Globe, isFuture: true },
        { id: 'org-developer' as const, label: 'Developer Tools', icon: Code },
      ],
    },
    {
      title: 'Billing',
      items: [{ id: 'billing-subscription' as const, label: 'Subscription', icon: CreditCard }],
    },
  ];

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      <SettingsSidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        groups={groups}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{renderContent()}</div>
      </div>
    </div>
  );
};
