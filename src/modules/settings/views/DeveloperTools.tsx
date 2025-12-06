import { Check, Copy, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import type { AccessToken } from '../../../types';

export function DeveloperTools() {
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadTokens = useCallback(async () => {
    try {
      const data = await window.electronAPI.getAccessTokens();
      setTokens(data);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      toast.error('Failed to load access tokens');
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const [expirationDays, setExpirationDays] = useState<number | null>(30); // Default 30 days

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) return;

    try {
      const result = await window.electronAPI.createAccessToken(newTokenName, expirationDays);
      setGeneratedToken(result.token);
      setNewTokenName('');
      setExpirationDays(30); // Reset to default
      setIsCreating(false);
      loadTokens();
      toast.success('Access token created successfully');
    } catch (error) {
      console.error('Failed to create token:', error);
      toast.error('Failed to create access token');
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to revoke this token? Any applications using it will lose access.',
      )
    ) {
      return;
    }

    try {
      await window.electronAPI.deleteAccessToken(id);
      setTokens(tokens.filter((t) => t.id !== id));
      toast.success('Token revoked successfully');
    } catch (error) {
      console.error('Failed to delete token:', error);
      toast.error('Failed to revoke token');
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Developer Tools</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage access tokens for the GeoSync CLI and other integrations.
        </p>
      </div>

      {generatedToken && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Token generated successfully
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>
                  Make sure to copy your personal access token now. You won't be able to see it
                  again!
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 rounded bg-white px-3 py-2 text-sm font-mono text-gray-900 shadow-sm dark:bg-black dark:text-gray-100 border border-green-200 dark:border-green-800 break-all">
                  {generatedToken}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedToken)}
                  className="inline-flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setGeneratedToken(null)}
                  className="text-sm font-medium text-green-800 hover:text-green-900 dark:text-green-200 dark:hover:text-green-100 underline"
                >
                  I have copied the token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Access Tokens
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Tokens you have generated that can be used to access the GeoSync API.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            disabled={isCreating || !!generatedToken}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Generate New Token
          </button>
        </div>

        {isCreating && !generatedToken && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Token Name"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="e.g. MacBook Pro CLI"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateToken()}
              />

              <Select
                label="Expiration"
                value={expirationDays === null ? 'never' : expirationDays}
                onChange={(e) => {
                  const val = e.target.value;
                  setExpirationDays(val === 'never' ? null : Number(val));
                }}
                options={[
                  { value: 30, label: '30 Days' },
                  { value: 60, label: '60 Days' },
                  { value: 90, label: '90 Days' },
                  { value: 365, label: '1 Year' },
                  { value: 'never', label: 'Never (No Expiration)' },
                ]}
              />
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewTokenName('');
                  setExpirationDays(30);
                }}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateToken}
                disabled={!newTokenName.trim()}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
              >
                Generate Token
              </button>
            </div>
          </div>
        )}

        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {tokens.map((token) => (
            <li
              key={token.id}
              className="flex items-center justify-between gap-x-6 px-4 py-5 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-start gap-x-3">
                  <p className="text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                    {token.name}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  <p className="whitespace-nowrap">
                    Created on {new Date(token.createdAt).toLocaleDateString()}
                  </p>
                  <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current" aria-hidden="true">
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <p className="truncate">
                    {token.lastUsedAt
                      ? `Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`
                      : 'Never used'}
                  </p>
                  {token.expiresAt && (
                    <>
                      <svg
                        viewBox="0 0 2 2"
                        className="h-0.5 w-0.5 fill-current"
                        aria-hidden="true"
                      >
                        <circle cx={1} cy={1} r={1} />
                      </svg>
                      <p className="truncate text-orange-600 dark:text-orange-400">
                        Expires {new Date(token.expiresAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-none items-center gap-x-4">
                <button
                  type="button"
                  onClick={() => handleDeleteToken(token.id)}
                  className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400 hover:ring-red-300 dark:hover:ring-red-900 transition-all"
                >
                  <span className="sr-only">Revoke token</span>
                  Revoke
                </button>
              </div>
            </li>
          ))}
          {tokens.length === 0 && !isCreating && !generatedToken && (
            <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No access tokens generated yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
