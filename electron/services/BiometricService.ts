import { systemPreferences } from 'electron';
import keytar from 'keytar';

export const BiometricService = {
  SERVICE_NAME: 'GeoSync',
  ACCOUNT_NAME: 'MasterKey',

  /**
   * Checks if biometrics are available on the system.
   * Note: Electron's systemPreferences.canPromptTouchID() is Mac-only.
   * For cross-platform, we might rely on keytar's behavior or just assume availability if keytar works.
   */
  async isBiometricAvailable(): Promise<boolean> {
    if (process.platform === 'darwin') {
      return systemPreferences.canPromptTouchID();
    }
    // On Windows/Linux, keytar uses DPAPI/libsecret which are generally available but don't strictly imply "biometrics".
    // However, they are the secure storage mechanisms.
    return true;
  },

  /**
   * Saves the master key (or password) to the OS keychain.
   * @param secret The secret to store
   */
  async saveSecret(secret: string): Promise<void> {
    await keytar.setPassword(BiometricService.SERVICE_NAME, BiometricService.ACCOUNT_NAME, secret);
  },

  /**
   * Retrieves the master key from the OS keychain.
   * This may prompt the user for biometrics/password depending on OS settings.
   */
  async getSecret(): Promise<string | null> {
    if (process.platform === 'darwin') {
      try {
        await systemPreferences.promptTouchID('Unlock GeoSync');
      } catch (error) {
        console.error('Biometric prompt failed or cancelled', error);
        return null;
      }
    }
    return await keytar.getPassword(BiometricService.SERVICE_NAME, BiometricService.ACCOUNT_NAME);
  },

  /**
   * Deletes the master key from the OS keychain.
   */
  async deleteSecret(): Promise<boolean> {
    return await keytar.deletePassword(
      BiometricService.SERVICE_NAME,
      BiometricService.ACCOUNT_NAME,
    );
  },
  /**
   * Prompts for biometric authentication without retrieving the secret.
   */
  async authenticate(): Promise<boolean> {
    if (process.platform === 'darwin') {
      try {
        await systemPreferences.promptTouchID('Authenticate to view secret');
        return true;
      } catch (error) {
        console.error('Biometric prompt failed or cancelled', error);
        return false;
      }
    }
    // For other platforms, we assume true for now or implement specific logic
    return true;
  },
};
