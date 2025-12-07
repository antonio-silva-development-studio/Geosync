import { zodResolver } from '@hookform/resolvers/zod';
import { Fingerprint } from 'lucide-react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import {
  type LoginFormData,
  loginSchema,
  type MasterPasswordFormData,
  masterPasswordSchema,
} from '../schema';

interface LoginViewProps {
  isConfigured: boolean | null;
  loading: boolean;
  error: string;
  onSubmit: (data: LoginFormData | MasterPasswordFormData) => void;
  onBiometricLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  isConfigured,
  loading,
  error,
  onSubmit,
  onBiometricLogin,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | MasterPasswordFormData>({
    resolver: zodResolver(isConfigured ? loginSchema : masterPasswordSchema),
  });

  if (isConfigured === null)
    return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center">
            {isConfigured ? (
              <img src="satellite.png" alt="Lock" title="Lock" />
            ) : (
              <img src="satellite-lock.png" alt="Satellite" title="Satellite" />
            )}
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <Input
                {...register('password')}
                type="password"
                placeholder="Master Password"
                error={errors.password?.message as string}
              />
            </div>
            {!isConfigured && (
              <div className="mt-4">
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirm Password"
                  // biome-ignore lint/suspicious/noExplicitAny: react-hook-form types
                  error={(errors as any).confirmPassword?.message}
                />
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-500 text-center">{error}</div>}

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 h-auto"
            >
              {loading ? 'Processing...' : isConfigured ? 'Unlock' : 'Create Vault'}
            </Button>
          </div>

          {isConfigured && (
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onBiometricLogin}
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white h-auto"
              >
                <Fingerprint className="h-5 w-5" />
                Unlock with Biometrics
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
