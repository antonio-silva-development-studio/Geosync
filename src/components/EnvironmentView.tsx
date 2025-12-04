import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { VariableEditor } from './VariableEditor';
import { ContextMenu } from './ContextMenu';

export const EnvironmentView: React.FC = () => {
  const { currentProject, environments, setEnvironments, currentEnvironment, setCurrentEnvironment, setVariables, masterKey } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [isCreatingEnv, setIsCreatingEnv] = useState(false);
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    if (currentProject) {
      loadEnvironments();
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentProject && currentEnvironment && masterKey) {
      loadVariables();
    }
  }, [currentProject, currentEnvironment, masterKey]);

  const loadEnvironments = async () => {
    if (!currentProject) return;
    const envs = await window.electronAPI.getEnvironments(currentProject.id);
    setEnvironments(envs);
    if (envs.length > 0 && !currentEnvironment) {
      setCurrentEnvironment(envs[0]);
    }
  };

  const loadVariables = async () => {
    if (!currentProject || !currentEnvironment || !masterKey) return;
    setLoading(true);
    try {
      const vars = await window.electronAPI.getVariables({
        projectId: currentProject.id,
        environmentId: currentEnvironment.id,
        masterKey,
      });
      setVariables(vars);
    } catch (error) {
      console.error('Failed to load variables', error);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Failed to create environment', error);
    }
  };

  const handleRenameEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnvId || !editName.trim()) return;

    // Mock rename for now as electronAPI might not have updateEnvironment yet
    // Assuming we can update local state and maybe backend if supported
    // If backend support is missing, this will just update UI until reload
    // TODO: Add updateEnvironment to electronAPI

    const updatedEnvs = environments.map(env =>
      env.id === editingEnvId ? { ...env, name: editName } : env
    );
    setEnvironments(updatedEnvs);

    if (currentEnvironment?.id === editingEnvId) {
      setCurrentEnvironment({ ...currentEnvironment, name: editName });
    }

    setEditingEnvId(null);
  };

  const handleDeleteEnv = async (envId: string) => {
    if (!confirm('Are you sure you want to delete this environment?')) return;

    // Mock delete for now
    // TODO: Add deleteEnvironment to electronAPI

    const updatedEnvs = environments.filter(env => env.id !== envId);
    setEnvironments(updatedEnvs);

    if (currentEnvironment?.id === envId) {
      setCurrentEnvironment(updatedEnvs.length > 0 ? updatedEnvs[0] : null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentProject?.name}</h1>

        {/* Environment Tabs */}
        <div className="mt-6 flex items-center gap-2">
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
                  }
                },
                {
                  label: 'Delete',
                  icon: <Trash2 className="h-4 w-4" />,
                  danger: true,
                  onClick: () => handleDeleteEnv(env.id)
                }
              ]}
            >
              {editingEnvId === env.id ? (
                <form onSubmit={handleRenameEnv} className="inline-block">
                  <input
                    autoFocus
                    type="text"
                    className="w-24 rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => setEditingEnvId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditingEnvId(null);
                    }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setCurrentEnvironment(env)}
                  onDoubleClick={() => {
                    setEditingEnvId(env.id);
                    setEditName(env.name);
                  }}
                  className={clsx(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    currentEnvironment?.id === env.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
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
                autoFocus
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
