import { ipcMain } from 'electron';
import { BiometricService } from '../services/BiometricService';

export function registerBiometricHandlers() {
  ipcMain.handle('bio:is-available', async () => {
    return await BiometricService.isBiometricAvailable();
  });

  ipcMain.handle('bio:save-secret', async (_, secret) => {
    await BiometricService.saveSecret(secret);
    return true;
  });

  ipcMain.handle('bio:get-secret', async () => {
    return await BiometricService.getSecret();
  });

  ipcMain.handle('bio:delete-secret', async () => {
    return await BiometricService.deleteSecret();
  });
}
