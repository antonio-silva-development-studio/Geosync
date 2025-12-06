import { clsx } from 'clsx';
import {
  AlertCircle,
  Copy,
  EyeOff,
  Lock,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../../shared/ui/Input';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../auth/store';
import { useProjectsStore } from '../projects/store';
import { SecretsModal } from './SecretsModal';

export const VariableEditor: React.FC = () => {
  const { currentEnvironment, environments, variables, setVariables } = useAppStore();
  const { currentProject } = useProjectsStore();
  const { masterKey } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const toggleSecret = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleShowSecret = async (id: string) => {
    if (showSecrets[id]) {
      toggleSecret(id);
      return;
    }

    // Authenticate before reveal
    let authenticated = false;
    const bioAvailable = await window.electronAPI.isBiometricAvailable();

    if (bioAvailable) {
      authenticated = await window.electronAPI.authenticateBiometric();
    }

    if (!authenticated) {
      // Fallback to password
      const password = prompt('Enter Master Password to view:');
      if (password) {
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        const result = await window.electronAPI.verifyMasterPassword(hashHex);
        authenticated = result.valid;
      }
    }

    if (authenticated) {
      toggleSecret(id);
    } else {
      toast.error('Authentication failed');
    }
  };

  const handleSaveSecrets = async (
    newVariables: { key: string; value: string; isSecret: boolean }[],
    environmentId: string,
  ) => {
    if (!currentProject || !masterKey) return;

    try {
      // Process all variables sequentially
      for (const variable of newVariables) {
        // 1. Create definition
        const def = await window.electronAPI.saveVariableDefinition({
          projectId: currentProject.id,
          key: variable.key,
          description: '', // Optional description not in modal yet
          defaultValue: '', // Default value not in modal yet
          isSecret: variable.isSecret,
          masterKey,
        });

        // 2. Save value for specific environment
        if (variable.value) {
          await window.electronAPI.saveVariableValue({
            environmentId: environmentId,
            definitionId: def.id,
            value: variable.value,
            masterKey,
          });
        }
      }

      // Refresh variables if we are viewing the environment we just added to
      if (currentEnvironment && currentEnvironment.id === environmentId) {
        const vars = await window.electronAPI.getVariables(
          currentProject.id,
          currentEnvironment.id,
          masterKey,
        );
        setVariables(vars);
      }
      toast.success('Variables saved successfully');
    } catch (error) {
      console.error('Failed to save variables', error);
      toast.error('Failed to save variables');
      throw error; // Propagate to modal to handle error state if needed
    }
  };

  const handleSaveValue = async (definitionId: string) => {
    if (!currentEnvironment || !masterKey) return;

    try {
      await window.electronAPI.saveVariableValue({
        environmentId: currentEnvironment.id,
        definitionId,
        value: editValue,
        masterKey,
      });

      // Refresh variables
      if (currentProject?.id && currentEnvironment?.id) {
        const vars = await window.electronAPI.getVariables(
          currentProject.id,
          currentEnvironment.id,
          masterKey,
        );
        setVariables(vars);
      }
      setEditingId(null);
      toast.success('Value updated successfully');
    } catch (error) {
      console.error('Failed to save value', error);
      toast.error('Failed to save value');
    }
  };

  const startEditing = (id: string, currentValue: string | null) => {
    setEditingId(id);
    setEditValue(currentValue || '');
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionId && !(event.target as Element).closest('.action-menu')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Variables</h3>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Variable
        </button>
      </div>

      {currentEnvironment && (
        <SecretsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSecrets}
          environments={environments}
          currentEnvironmentId={currentEnvironment.id}
        />
      )}

      <div className="overflow-visible rounded-lg border dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Key
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              >
                Value ({currentEnvironment?.name})
              </th>
              <th
                scope="col"
                className="w-10 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
              ></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {variables
              .filter((v) => v.value !== null)
              .map((variable) => (
                <tr key={variable.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {variable.key}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {variable.description}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === variable.id ? (
                      <div className="flex items-center rounded-md border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveValue(variable.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveValue(variable.id)}
                          className="px-2 text-green-600 hover:text-green-700"
                          title="Save"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div
                          className={clsx(
                            'font-mono text-sm',
                            variable.isOverridden
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-500 dark:text-gray-400',
                          )}
                        >
                          {showSecrets[variable.id] ? variable.value : '••••••••••••••••'}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              // Copy logic with auth
                              if (showSecrets[variable.id]) {
                                handleCopy(variable.value || '');
                                return;
                              }

                              // Authenticate before copy
                              let authenticated = false;
                              const bioAvailable = await window.electronAPI.isBiometricAvailable();

                              if (bioAvailable) {
                                authenticated = await window.electronAPI.authenticateBiometric();
                              }

                              if (!authenticated) {
                                // Fallback to password
                                const password = prompt('Enter Master Password to copy:');
                                if (password) {
                                  const hash = await crypto.subtle.digest(
                                    'SHA-256',
                                    new TextEncoder().encode(password),
                                  );
                                  const hashArray = Array.from(new Uint8Array(hash));
                                  const hashHex = hashArray
                                    .map((b) => b.toString(16).padStart(2, '0'))
                                    .join('');
                                  const result =
                                    await window.electronAPI.verifyMasterPassword(hashHex);
                                  authenticated = result.valid;
                                }
                              }

                              if (authenticated) {
                                handleCopy(variable.value || '');
                              } else {
                                toast.error('Authentication failed');
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Copy Value"
                          >
                            <Copy className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShowSecret(variable.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title={showSecrets[variable.id] ? 'Hide' : 'Show'}
                          >
                            {showSecrets[variable.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Lock className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        {variable.isOverridden && (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/30">
                            Overridden
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="relative action-menu">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenActionId(openActionId === variable.id ? null : variable.id)
                        }
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openActionId === variable.id && (
                        <div className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                startEditing(variable.id, variable.value || '');
                                setOpenActionId(null);
                              }}
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Value
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  !confirm(
                                    'Are you sure you want to remove this variable from this environment?',
                                  )
                                )
                                  return;

                                try {
                                  await window.electronAPI.deleteVariableValue(
                                    currentEnvironment?.id || '',
                                    variable.id,
                                  );
                                  // Refresh variables
                                  if (currentProject?.id && currentEnvironment?.id && masterKey) {
                                    const vars = await window.electronAPI.getVariables(
                                      currentProject.id,
                                      currentEnvironment.id,
                                      masterKey,
                                    );
                                    setVariables(vars);
                                  }
                                  toast.success('Variable deleted successfully');
                                } catch (error) {
                                  console.error('Failed to remove variable', error);
                                  toast.error('Failed to remove variable');
                                }
                                setOpenActionId(null);
                              }}
                              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            {variables.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <AlertCircle className="mx-auto h-8 w-8 opacity-50" />
                  <p className="mt-2">No variables defined yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
