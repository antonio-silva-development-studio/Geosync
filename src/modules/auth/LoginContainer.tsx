import type React from 'react';
import { useEffect, useState } from 'react';
import { LoginView } from './components/LoginView';
import type { LoginFormData, MasterPasswordFormData } from './schema';
import { useAuthStore } from './store';

export const LoginContainer: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  // biome-ignore lint/correctness/useExhaustiveDependencies: checkConfiguration is stable
  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    const configured = await window.electronAPI.isConfigured();
    setIsConfigured(configured);

    if (configured) {
      const available = await window.electronAPI.isBiometricAvailable();
      if (available) {
        // Automatically try to get secret? Maybe better to let user click button
      }
    }
  };

  const handleCreate = async (data: LoginFormData | MasterPasswordFormData) => {
    if (!('confirmPassword' in data)) return;
    setLoading(true);
    try {
      const { password } = data;
      // Generate SHA-256 hash of the password
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      // Store the hash as the master password verification
      await window.electronAPI.setMasterPassword(hashHex);

      // Save raw password to keychain if biometric is available
      const bioAvailable = await window.electronAPI.isBiometricAvailable();
      if (bioAvailable) {
        await window.electronAPI.saveSecret(password);
      }

      // Use the hash as the encryption key (32 bytes when decoded from hex)
      setAuthenticated(hashHex, 'password');
    } catch (err) {
      setError('Failed to create master password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (data: LoginFormData | MasterPasswordFormData) => {
    setLoading(true);
    setError('');

    try {
      const { password } = data;
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const result = await window.electronAPI.verifyMasterPassword(hashHex);

      if (result.valid) {
        setAuthenticated(hashHex, 'password', result.user);
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
        const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

        const result = await window.electronAPI.verifyMasterPassword(hashHex);
        if (result.valid) {
          setAuthenticated(hashHex, 'biometric', result.user);
        } else {
          setError('Biometric secret invalid or changed');
        }
      }
    } catch (err) {
      console.error('Biometric login failed', err);
    }
  };

  return (
    <LoginView
      isConfigured={isConfigured}
      loading={loading}
      error={error}
      onSubmit={isConfigured ? handleLogin : handleCreate}
      onBiometricLogin={handleBiometricLogin}
    />
  );
};
