import { AlertCircle, Eye, EyeOff, Plus, Trash2, Upload, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { Environment } from '../../types';

interface SecretsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    variables: { key: string; value: string; isSecret: boolean }[],
    environmentId: string,
  ) => Promise<void>;
  environments: Environment[];
  currentEnvironmentId: string;
}

interface VariableRow {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

export const SecretsModal: React.FC<SecretsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  environments,
  currentEnvironmentId,
}) => {
  const [rows, setRows] = useState<VariableRow[]>([
    { id: crypto.randomUUID(), key: '', value: '', isSecret: false },
  ]);
  const [selectedEnvId, setSelectedEnvId] = useState(currentEnvironmentId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setRows([{ id: crypto.randomUUID(), key: '', value: '', isSecret: false }]);
      setSelectedEnvId(currentEnvironmentId);
    }
  }, [isOpen, currentEnvironmentId]);

  const addRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), key: '', value: '', isSecret: false }]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) {
      setRows([{ id: crypto.randomUUID(), key: '', value: '', isSecret: false }]);
    } else {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof VariableRow, value: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const parseEnvContent = (content: string) => {
    const lines = content.split('\n');
    const newRows: VariableRow[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        newRows.push({
          id: crypto.randomUUID(),
          key,
          value,
          isSecret: false, // Default to not secret on import, user can toggle
        });
      }
    }

    return newRows;
  };

  const handlePaste = (e: React.ClipboardEvent, id: string) => {
    const text = e.clipboardData.getData('text');
    if (text.includes('\n') || text.includes('=')) {
      e.preventDefault();
      const parsedRows = parseEnvContent(text);
      if (parsedRows.length > 0) {
        // If the current row is empty, replace it. Otherwise append.
        const currentRow = rows.find((r) => r.id === id);
        const isCurrentEmpty = currentRow && !currentRow.key && !currentRow.value;

        if (isCurrentEmpty) {
          setRows([...rows.filter((r) => r.id !== id), ...parsedRows]);
        } else {
          setRows([...rows, ...parsedRows]);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsedRows = parseEnvContent(content);
        // Filter out empty rows if we are replacing everything or appending
        // For now, let's append to existing if they have content, or replace if it's just the initial empty row
        const hasContent = rows.some((r) => r.key || r.value);
        if (!hasContent) {
          setRows(parsedRows);
        } else {
          setRows([...rows, ...parsedRows]);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter((row) => row.key.trim());
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSave(validRows, selectedEnvId);
      onClose();
    } catch (error) {
      console.error('Failed to save variables', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Environment Variables
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="secrets-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Environment Selector */}
            <div className="space-y-2">
              <label
                htmlFor="env-selector"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Environment
              </label>
              <select
                id="env-selector"
                value={selectedEnvId}
                onChange={(e) => setSelectedEnvId(e.target.value)}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                {environments.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Variables List */}
            <div className="space-y-4">
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="group relative rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Key
                        <input
                          type="text"
                          placeholder="KEY"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          value={row.key}
                          onChange={(e) => updateRow(row.id, 'key', e.target.value)}
                          onPaste={(e) => handlePaste(e, row.id)}
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor={`value-${row.id}`}
                        className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
                      >
                        Value
                      </label>
                      <div className="relative">
                        <input
                          id={`value-${row.id}`}
                          type={showValues[row.id] ? 'text' : 'password'}
                          placeholder="Value"
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm font-mono placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          value={row.value}
                          onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowValues((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showValues[row.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-gray-400 shadow-sm ring-1 ring-gray-200 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800 dark:ring-gray-700 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Plus className="h-4 w-4" />
                Add Another
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept=".env,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="env-file-upload"
                />
                <label
                  htmlFor="env-file-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Upload className="h-4 w-4" />
                  Import .env
                </label>
              </div>
            </div>

            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Tip</h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      You can paste the contents of a .env file directly into any key input to
                      automatically parse and add multiple variables at once.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="secrets-form"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving...'
              : `Save ${rows.filter((r) => r.key.trim()).length} Variables`}
          </button>
        </div>
      </div>
    </div>
  );
};
