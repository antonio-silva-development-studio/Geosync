import keytar from 'keytar';
import { systemPreferences } from 'electron';

export class BiometricService {
  private static readonly SERVICE_NAME = 'GeoSync';
  private static readonly ACCOUNT_NAME = 'MasterKey';

  /**
   * Checks if biometrics are available on the system.
   * Note: Electron's systemPreferences.canPromptTouchID() is Mac-only.
   * For cross-platform, we might rely on keytar's behavior or just assume availability if keytar works.
   */
  static async isBiometricAvailable(): Promise<boolean> {
    if (process.platform === 'darwin') {
      return systemPreferences.canPromptTouchID();
    }
    // On Windows/Linux, keytar uses DPAPI/libsecret which are generally available but don't strictly imply "biometrics".
    // However, they are the secure storage mechanisms.
    return true;
  }

  /**
   * Saves the master key (or password) to the OS keychain.
   * @param secret The secret to store
   */
  static async saveSecret(secret: string): Promise<void> {
    await keytar.setPassword(this.SERVICE_NAME, this.ACCOUNT_NAME, secret);
  }

  /**
   * Retrieves the master key from the OS keychain.
   * This may prompt the user for biometrics/password depending on OS settings.
   */
  static async getSecret(): Promise<string | null> {
    if (process.platform === 'darwin') {
      try {
        await systemPreferences.promptTouchID('Unlock GeoSync');
      } catch (error) {
        console.error('Biometric prompt failed or cancelled', error);
        return null;
      }
    }
    return await keytar.getPassword(this.SERVICE_NAME, this.ACCOUNT_NAME);
  }

  /**
   * Deletes the master key from the OS keychain.
   */
  static async deleteSecret(): Promise<boolean> {
    return await keytar.deletePassword(this.SERVICE_NAME, this.ACCOUNT_NAME);
  }
}
