import { clsx } from 'clsx';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ContextMenu } from '../../shared/ui/ContextMenu';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../auth/store';
import { useProjectsStore } from '../projects/store';
import { VariableEditor } from '../variables/VariableEditor';

export const EnvironmentView: React.FC = () => {
  const { environments, setEnvironments, currentEnvironment, setCurrentEnvironment, setVariables } =
    useAppStore();
  const { currentProject } = useProjectsStore();
  const { masterKey } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [isCreatingEnv, setIsCreatingEnv] = useState(false);
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const loadEnvironments = useCallback(async () => {
    if (!currentProject) return;
    const envs = await window.electronAPI.getEnvironments(currentProject.id);
    setEnvironments(envs);
    if (envs.length > 0 && !currentEnvironment) {
      setCurrentEnvironment(envs[0]);
    }
  }, [currentProject, setEnvironments, currentEnvironment, setCurrentEnvironment]);

  const loadVariables = useCallback(async () => {
    if (!currentProject || !currentEnvironment || !masterKey) return;
    setLoading(true);
    try {
      const vars = await window.electronAPI.getVariables(
        currentProject.id,
        currentEnvironment.id,
        masterKey,
      );
      setVariables(vars);
    } catch (error) {
      console.error('Failed to load variables', error);
    } finally {
      setLoading(false);
    }
  }, [currentProject, currentEnvironment, masterKey, setVariables]);

  useEffect(() => {
    if (currentProject) {
      loadEnvironments();
    }
  }, [currentProject, loadEnvironments]);

  useEffect(() => {
    if (currentProject && currentEnvironment && masterKey) {
      loadVariables();
    }
  }, [currentProject, currentEnvironment, masterKey, loadVariables]);

  const handleCreateEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !newEnvName) return;

    try {
      const newEnv = await window.electronAPI.createEnvironment({
        projectId: currentProject.id,
        name: newEnvName,
        slug: newEnvName.toLowerCase().replace(/\s+/g, '-'),
      });
      setEnvironments([...environments, newEnv]);
      setCurrentEnvironment(newEnv);
      setNewEnvName('');
      setIsCreatingEnv(false);
      toast.success('Environment created successfully');
    } catch (error) {
      console.error('Failed to create environment', error);
      toast.error('Failed to create environment');
    }
  };

  const handleRenameEnv = async (envId: string, newName: string) => {
    if (!newName.trim()) return;

    try {
      await window.electronAPI.updateEnvironment(envId, { name: newName });

      const updatedEnvs = environments.map((env) =>
        env.id === envId ? { ...env, name: newName } : env,
      );
      setEnvironments(updatedEnvs);

      if (currentEnvironment?.id === envId) {
        setCurrentEnvironment({ ...currentEnvironment, name: newName });
      }
      toast.success('Environment renamed successfully');
    } catch (error) {
      console.error('Failed to update environment', error);
      toast.error('Failed to update environment');
    } finally {
      setEditingEnvId(null);
    }
  };

  const handleDeleteEnv = async (envId: string) => {
    if (!confirm('Are you sure you want to delete this environment?')) return;

    try {
      await window.electronAPI.deleteEnvironment(envId);

      const updatedEnvs = environments.filter((env) => env.id !== envId);
      setEnvironments(updatedEnvs);

      if (currentEnvironment?.id === envId) {
        setCurrentEnvironment(updatedEnvs.length > 0 ? updatedEnvs[0] : null);
      }
      toast.success('Environment deleted successfully');
    } catch (error) {
      console.error('Failed to delete environment', error);
      toast.error('Failed to delete environment');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        {/* Environment Tabs */}
        <div className="flex items-center gap-2">
          {environments.map((env) => (
            <ContextMenu
              key={env.id}
              items={[
                {
                  label: 'Rename',
                  icon: <Edit2 className="h-4 w-4" />,
                  onClick: () => {
                    setEditingEnvId(env.id);
                    setEditName(env.name);
                  },
                },
                {
                  label: 'Delete',
                  icon: <Trash2 className="h-4 w-4" />,
                  danger: true,
                  onClick: () => handleDeleteEnv(env.id),
                },
              ]}
            >
              {editingEnvId === env.id ? (
                <input
                  type="text"
                  className="w-24 rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRenameEnv(env.id, editName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameEnv(env.id, editName);
                    if (e.key === 'Escape') setEditingEnvId(null);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentEnvironment(env)}
                  onDoubleClick={() => {
                    setEditingEnvId(env.id);
                    setEditName(env.name);
                  }}
                  className={clsx(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    currentEnvironment?.id === env.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700',
                  )}
                >
                  {env.name}
                </button>
              )}
            </ContextMenu>
          ))}

          {isCreatingEnv ? (
            <form onSubmit={handleCreateEnv} className="flex items-center gap-2">
              <input
                type="text"
                className="w-32 rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Env Name"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                onBlur={() => !newEnvName && setIsCreatingEnv(false)}
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreatingEnv(true)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="text-center text-gray-500">Loading variables...</div>
        ) : (
          <div className="space-y-4">
            {/* We will implement Variable Table/Editor here */}
            <VariableEditor />
          </div>
        )}
      </div>
    </div>
  );
};
