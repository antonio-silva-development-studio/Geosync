import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useProjectsStore } from '../../modules/projects/store';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { useAppStore } from '../../store/useAppStore';
import type { Organization } from '../../types';

export const OrganizationSwitcher: React.FC = () => {
  const { organizations, currentOrganization, setCurrentOrganization, setOrganizations } =
    useAppStore();
  const { setCurrentProject } = useProjectsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgs = await window.electronAPI.getOrganizations();
        setOrganizations(orgs || []);

        // Select first org if none selected and orgs exist
        if (!currentOrganization && orgs && orgs.length > 0) {
          setCurrentOrganization(orgs[0]);
        }
      } catch (error) {
        console.error('Failed to load organizations:', error);
        setOrganizations([]);
      }
    };
    loadOrganizations();
  }, [currentOrganization, setOrganizations, setCurrentOrganization]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    try {
      const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newOrg = await window.electronAPI.createOrganization({
        name: newOrgName,
        slug,
      });

      const updatedOrgs = [...(organizations || []), newOrg];
      setOrganizations(updatedOrgs);
      setCurrentOrganization(newOrg);
      setCurrentProject(null); // Reset project on new org creation
      setNewOrgName('');
      setIsCreating(false);
      setIsOpen(false);
      toast.success('Organization created successfully');
    } catch (error) {
      console.error('Failed to create organization', error);
      toast.error(`Failed to create organization: ${(error as Error).message}`);
    }
  };

  const handleSelectOrganization = async (org: Organization) => {
    setCurrentOrganization(org);
    setCurrentProject(null); // Reset project on org switch
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 h-auto"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">
              {currentOrganization?.name || 'Select Organization'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Enterprise</div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10 cursor-default bg-transparent"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="p-2">
              <div className="mb-2 px-2 text-xs font-semibold text-gray-500">Organizations</div>
              <div className="space-y-1">
                {(organizations || []).map((org) => (
                  <Button
                    variant="ghost"
                    key={org.id}
                    onClick={() => handleSelectOrganization(org)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white h-auto font-normal"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                        <Building2 className="h-3 w-3" />
                      </div>
                      {org.name}
                    </div>
                    {currentOrganization?.id === org.id && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </Button>
                ))}
              </div>

              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

              {isCreating ? (
                <form onSubmit={handleCreateOrganization} className="px-2 py-1">
                  <Input
                    type="text"
                    placeholder="Organization Name"
                    className="w-full"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateOrganization(e);
                      }
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewOrgName('');
                      }
                    }}
                    autoFocus
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCreating(false)}
                      className="text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white h-auto py-1 px-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500 h-auto"
                    >
                      Create
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white h-auto justify-start font-normal"
                >
                  <Plus className="h-4 w-4" />
                  Add Organization
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
