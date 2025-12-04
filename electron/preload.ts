import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Database
  isConfigured: () => ipcRenderer.invoke('db:is-configured'),
  setMasterPassword: (hash: string) => ipcRenderer.invoke('db:set-master-password', hash),
  verifyMasterPassword: (hash: string) => ipcRenderer.invoke('db:verify-master-password', hash),

  getProjects: () => ipcRenderer.invoke('db:get-projects'),
  createProject: (data: any) => ipcRenderer.invoke('db:create-project', data),
  getEnvironments: (projectId: string) => ipcRenderer.invoke('db:get-environments', projectId),
  createEnvironment: (data: any) => ipcRenderer.invoke('db:create-environment', data),
  saveVariableDefinition: (data: any) => ipcRenderer.invoke('db:save-variable-definition', data),
  saveVariableValue: (data: any) => ipcRenderer.invoke('db:save-variable-value', data),
  getVariables: (data: any) => ipcRenderer.invoke('db:get-variables', data),

  // Biometrics
  isBiometricAvailable: () => ipcRenderer.invoke('bio:is-available'),
  saveSecret: (secret: string) => ipcRenderer.invoke('bio:save-secret', secret),
  getSecret: () => ipcRenderer.invoke('bio:get-secret'),
  deleteSecret: () => ipcRenderer.invoke('bio:delete-secret'),
})
