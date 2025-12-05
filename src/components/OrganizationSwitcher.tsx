import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ChevronDown, Plus, Building2, Check } from 'lucide-react';


export const OrganizationSwitcher: React.FC = () => {
  const { organizations, currentOrganization, setCurrentOrganization, setOrganizations, setProjects } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    const orgs = await window.electronAPI.getOrganizations();
    setOrganizations(orgs);

    // Select first org if none selected and orgs exist
    if (!currentOrganization && orgs.length > 0) {
      setCurrentOrganization(orgs[0]);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    try {
      const slug = newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newOrg = await window.electronAPI.createOrganization({
        name: newOrgName,
        slug,
      });

      const updatedOrgs = [...organizations, newOrg];
      setOrganizations(updatedOrgs);
      setCurrentOrganization(newOrg);
      setNewOrgName('');
      setIsCreating(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create organization', error);
      alert('Failed to create organization: ' + (error as Error).message);
    }
  };

  const handleSelectOrganization = async (org: any) => {
    setCurrentOrganization(org);
    setIsOpen(false);

    // Refresh projects for the selected organization
    const projects = await window.electronAPI.getProjects(org.id);
    setProjects(projects);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg bg-gray-800 p-2 text-left text-sm font-medium text-white hover:bg-gray-700 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">{currentOrganization?.name || 'Select Organization'}</div>
            <div className="text-xs text-gray-400">Enterprise</div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
            <div className="p-2">
              <div className="mb-2 px-2 text-xs font-semibold text-gray-500">Organizations</div>
              <div className="space-y-1">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrganization(org)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-800">
                        <Building2 className="h-3 w-3" />
                      </div>
                      {org.name}
                    </div>
                    {currentOrganization?.id === org.id && (
                      <Check className="h-4 w-4 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="my-2 border-t border-gray-700" />

              {isCreating ? (
                <form onSubmit={handleCreateOrganization} className="px-2 py-1">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Organization Name"
                    className="w-full rounded-md border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
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
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500"
                    >
                      Create
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Organization
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
