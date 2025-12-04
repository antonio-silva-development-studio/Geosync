
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Fingerprint } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAppStore((state) => state.setAuthenticated);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    const configured = await window.electronAPI.isConfigured();
    setIsConfigured(configured);

    // If configured, try to unlock with biometrics
    if (configured) {
      const available = await window.electronAPI.isBiometricAvailable();
      if (available) {
        // Automatically try to get secret? Maybe better to let user click button
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      // Generate SHA-256 hash of the password
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Store the hash as the master password verification
      await window.electronAPI.setMasterPassword(hashHex);

      // Save raw password to keychain if biometric is available
      const bioAvailable = await window.electronAPI.isBiometricAvailable();
      if (bioAvailable) {
        await window.electronAPI.saveSecret(password);
      }

      // Use the hash as the encryption key (32 bytes when decoded from hex)
      // This ensures the key length is correct for AES-256
      setAuthenticated(hashHex);
    } catch (err) {
      setError('Failed to create master password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const isValid = await window.electronAPI.verifyMasterPassword(hashHex);

      if (isValid) {
        // Use the hash as the encryption key
        setAuthenticated(hashHex);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Login failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const secret = await window.electronAPI.getSecret();
      if (secret) {
        // Verify just in case
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const isValid = await window.electronAPI.verifyMasterPassword(hashHex);
        if (isValid) {
          setAuthenticated(hashHex);
        } else {
          setError('Biometric secret invalid or changed');
        }
      }
    } catch (err) {
      console.error('Biometric login failed', err);
    }
  };

  if (isConfigured === null) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center">
            {isConfigured ? <img src="/satellite.png" alt="Lock" title="Lock" /> : <img src="/satellite-lock.png" alt="Satellite" title="Satellite" />}
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {isConfigured ? 'GeoSync Personal Vault' : 'Setup Master Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isConfigured
              ? 'Enter your master password to access your secure environment variables.'
              : 'Create a strong master password. This will be used to encrypt all your data.'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={isConfigured ? handleLogin : handleCreate}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                type="password"
                required
                className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {!isConfigured && (
              <div className="mt-4">
                <input
                  type="password"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-500 text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isConfigured ? 'Unlock' : 'Create Vault')}
            </button>
          </div>

          {isConfigured && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleBiometricLogin}
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <Fingerprint className="h-5 w-5" />
                Unlock with Biometrics
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
