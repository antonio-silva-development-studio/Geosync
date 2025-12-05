import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Database
  isConfigured: () => ipcRenderer.invoke('db:is-configured'),
  setMasterPassword: (hash: string) => ipcRenderer.invoke('db:set-master-password', hash),
  verifyMasterPassword: (hash: string) => ipcRenderer.invoke('db:verify-master-password', hash),
  updateSystemProfile: (data: any) => ipcRenderer.invoke('db:update-system-profile', data),
  changeMasterPassword: (oldHash: string, newHash: string) => ipcRenderer.invoke('db:change-master-password', { oldHash, newHash }),

  getOrganizations: () => ipcRenderer.invoke('db:get-organizations'),
  createOrganization: (data: any) => ipcRenderer.invoke('db:create-organization', data),

  getProjects: (organizationId: string) => ipcRenderer.invoke('db:get-projects', organizationId),
  createProject: (data: any) => ipcRenderer.invoke('db:create-project', data),
  deleteProject: (id: string) => ipcRenderer.invoke('db:delete-project', id),
  getEnvironments: (projectId: string) => ipcRenderer.invoke('db:get-environments', projectId),
  createEnvironment: (data: any) => ipcRenderer.invoke('db:create-environment', data),
  updateEnvironment: (id: string, data: any) => ipcRenderer.invoke('db:update-environment', { id, data }),
  deleteEnvironment: (id: string) => ipcRenderer.invoke('db:delete-environment', id),
  saveVariableDefinition: (data: any) => ipcRenderer.invoke('db:save-variable-definition', data),
  saveVariableValue: (data: any) => ipcRenderer.invoke('db:save-variable-value', data),
  deleteVariable: (id: string) => ipcRenderer.invoke('db:delete-variable-definition', id),
  getVariables: (projectId: string, environmentId: string, masterKey: string) => ipcRenderer.invoke('db:get-variables', { projectId, environmentId, masterKey }),

  // Documents
  getDocuments: (projectId: string) => ipcRenderer.invoke('db:get-documents', projectId),
  createDocument: (data: any) => ipcRenderer.invoke('db:create-document', data),
  updateDocument: (id: string, data: any) => ipcRenderer.invoke('db:update-document', { id, data }),
  deleteDocument: (id: string) => ipcRenderer.invoke('db:delete-document', id),

  // Biometrics
  isBiometricAvailable: () => ipcRenderer.invoke('bio:is-available'),
  saveSecret: (secret: string) => ipcRenderer.invoke('bio:save-secret', secret),
  getSecret: () => ipcRenderer.invoke('bio:get-secret'),
  deleteSecret: () => ipcRenderer.invoke('bio:delete-secret'),
  authenticateBiometric: () => ipcRenderer.invoke('bio:authenticate'),
})
