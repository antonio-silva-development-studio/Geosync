import { Briefcase, Plus } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Select } from '../../shared/ui/Select';
import { Input } from '../../shared/ui/Input';

interface Workspace {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const WorkspaceSwitcher: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const handleSwitchWorkspace = async (workspaceId: string) => {
    try {
      await window.electronAPI.setActiveWorkspace(workspaceId);
      await loadWorkspaces();
      toast.success('Workspace switched');
      // Trigger a custom event to reload organizations without full page reload
      window.dispatchEvent(new CustomEvent('workspace-changed'));
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      toast.error('Failed to switch workspace');
    }
  };

  const loadWorkspaces = async () => {
    try {
      const data = await window.electronAPI.getWorkspaces();
      // Double check - ensure it's always an array
      if (!data || !Array.isArray(data)) {
        console.warn('getWorkspaces returned non-array:', data);
        setWorkspaces([]);
        setActiveWorkspace(null);
        return;
      }
      const workspacesArray = data;
      setWorkspaces(workspacesArray);
      const active = workspacesArray.find((w: Workspace) => w.isActive) || workspacesArray[0] || null;
      setActiveWorkspace(active);
      
      // If no workspaces exist, create a default one
      // The handler will check for duplicates, so it's safe to call
      if (workspacesArray.length === 0) {
        try {
          await window.electronAPI.createWorkspace({
            name: 'Default',
            isActive: true,
          });
          // Reload to get the updated list
          const updatedData = await window.electronAPI.getWorkspaces();
          const updatedArray = Array.isArray(updatedData) ? updatedData : [];
          setWorkspaces(updatedArray);
          setActiveWorkspace(updatedArray.find((w: Workspace) => w.isActive) || updatedArray[0] || null);
        } catch (createError) {
          console.error('Failed to create default workspace:', createError);
          // If workspace creation fails (e.g., migration not run), just continue without workspace
          // The app should still work in legacy mode
        }
      } else if (!active && workspacesArray.length > 0) {
        // If there are workspaces but none is active, activate the first one
        try {
          await window.electronAPI.setActiveWorkspace(workspacesArray[0].id);
          const updatedData = await window.electronAPI.getWorkspaces();
          const updatedArray = Array.isArray(updatedData) ? updatedData : [];
          setWorkspaces(updatedArray);
          setActiveWorkspace(updatedArray.find((w: Workspace) => w.isActive) || updatedArray[0] || null);
        } catch (switchError) {
          console.error('Failed to switch workspace:', switchError);
          // Continue anyway
        }
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      // If workspace feature is not available (migration not run), continue without it
      // Set empty array to prevent further errors
      setWorkspaces([]);
      setActiveWorkspace(null);
    }
  };

  useEffect(() => {
    loadWorkspaces().finally(() => setIsLoading(false));
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      const newWorkspace = await window.electronAPI.createWorkspace({
        name: newWorkspaceName.trim(),
        isActive: false,
      });
      setNewWorkspaceName('');
      setIsCreating(false);
      await loadWorkspaces();
      // Auto-activate if it's the first workspace
      if (workspaces.length === 0) {
        await handleSwitchWorkspace(newWorkspace.id);
      }
      toast.success('Workspace created successfully');
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  // Don't render if still loading (prevents errors during initial load)
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Workspace
          </span>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Workspace
        </span>
      </div>

      {!isCreating ? (
        <div className="flex items-center gap-2">
          <Select
            value={activeWorkspace?.id || ''}
            onChange={(e) => {
              if (e.target.value) {
                handleSwitchWorkspace(e.target.value);
              }
            }}
            className="flex-1"
            options={(workspaces || []).map((workspace) => ({
              value: workspace.id,
              label: workspace.name,
            }))}
          />
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="New Workspace"
          >
            <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="Workspace name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateWorkspace();
              } else if (e.key === 'Escape') {
                setIsCreating(false);
                setNewWorkspaceName('');
              }
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreateWorkspace}
              className="flex-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-500"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewWorkspaceName('');
              }}
              className="rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

