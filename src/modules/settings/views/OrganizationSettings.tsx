import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { useAuthStore } from '../../auth/store';

export const OrganizationSettings: React.FC = () => {
  const { userProfile } = useAuthStore();

  // Using userProfile for now as a placeholder for Org details
  // In a real app, this would come from an Organization store/context
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // await window.electronAPI.updateOrganization({ name, email });
      toast.success('Organization details updated');
    } catch (error) {
      console.error('Failed to update organization', error);
      toast.error('Failed to update organization');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Details</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your business information visible to the public and team members.
        </p>
      </div>

      <form onSubmit={handleSaveOrg} className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2">
        <div className="col-span-1">
          <Input
            label="Public business name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Write official business name"
            helperText="Your public business name may be used on invoices and receipts."
          />
        </div>

        <div className="col-span-1">
          <Input
            label="Support email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Write email address"
            helperText="This is important, so choose a different than your personal email."
          />
        </div>

        <div className="col-span-1">
          <Select
            label="Support address"
            id="support-address"
            options={[{ value: 'us-ca-la', label: 'United states / California / Los Angeles' }]}
            helperText="Optional"
          />
        </div>

        <div className="col-span-1">
          <Input label="Support phone" placeholder="Write address line" />
        </div>

        <div className="col-span-1">
          <Input label="Business website" placeholder="Copy - paste business url" />
        </div>

        <div className="col-span-1">
          <Input label="Privacy policy" placeholder="Copy - paste privacy policy link" />
        </div>

        <div className="col-span-2 flex justify-end pt-4">
          <Button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
