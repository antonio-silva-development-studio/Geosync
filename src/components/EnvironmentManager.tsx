import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { VariableEditor } from './VariableEditor';

export const EnvironmentManager: React.FC = () => {
  const { currentProject, environments, setEnvironments, currentEnvironment, setCurrentEnvironment, setVariables, masterKey } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [isCreatingEnv, setIsCreatingEnv] = useState(false);

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
      const vars = await window.electronAPI.getVariables(currentProject.id, currentEnvironment.id, masterKey);
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

  return (
    <div className="flex h-full flex-col">
      {/* Environment Tabs */}
      <div className="border-b bg-white px-6 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {environments.map((env) => (
            <button
              key={env.id}
              onClick={() => setCurrentEnvironment(env)}
              className={clsx(
                'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                currentEnvironment?.id === env.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              )}
            >
              {env.name}
            </button>
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
            <VariableEditor />
          </div>
        )}
      </div>
    </div>
  );
};
