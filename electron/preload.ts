import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Database
  isConfigured: () => ipcRenderer.invoke('db:is-configured'),
  setMasterPassword: (hash: string) => ipcRenderer.invoke('db:set-master-password', hash),
  verifyMasterPassword: (hash: string) => ipcRenderer.invoke('db:verify-master-password', hash),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  updateSystemProfile: (data: any) => ipcRenderer.invoke('db:update-system-profile', data),
  changeMasterPassword: (oldHash: string, newHash: string) =>
    ipcRenderer.invoke('db:change-master-password', { oldHash, newHash }),

  // Workspaces
  getWorkspaces: () => ipcRenderer.invoke('db:get-workspaces'),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  createWorkspace: (data: any) => ipcRenderer.invoke('db:create-workspace', data),
  setActiveWorkspace: (id: string) => ipcRenderer.invoke('db:set-active-workspace', id),

  getOrganizations: () => ipcRenderer.invoke('db:get-organizations'),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  createOrganization: (data: any) => ipcRenderer.invoke('db:create-organization', data),

  getProjects: (organizationId: string) => ipcRenderer.invoke('db:get-projects', organizationId),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  createTag: (tag: any) => ipcRenderer.invoke('db:create-tag', tag),

  // Projects
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  createProject: (data: any) => ipcRenderer.invoke('db:create-project', data),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  updateProject: (id: string, data: any) => ipcRenderer.invoke('db:update-project', { id, data }),
  deleteProject: (id: string) => ipcRenderer.invoke('db:delete-project', id),
  updateTag: (id: string, updates: any) =>
    ipcRenderer.invoke('db:update-tag', { id, data: updates }),
  deleteTag: (id: string) => ipcRenderer.invoke('db:delete-tag', id),
  getEnvironments: (projectId: string) => ipcRenderer.invoke('db:get-environments', projectId),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  createEnvironment: (data: any) => ipcRenderer.invoke('db:create-environment', data),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  updateEnvironment: (id: string, data: any) =>
    ipcRenderer.invoke('db:update-environment', { id, data }),
  deleteEnvironment: (id: string) => ipcRenderer.invoke('db:delete-environment', id),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  saveVariableDefinition: (data: any) => ipcRenderer.invoke('db:save-variable-definition', data),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  saveVariableValue: (data: any) => ipcRenderer.invoke('db:save-variable-value', data),
  deleteVariableValue: (environmentId: string, definitionId: string) =>
    ipcRenderer.invoke('db:delete-variable-value', { environmentId, definitionId }),
  deleteVariable: (id: string) => ipcRenderer.invoke('db:delete-variable-definition', id),
  getVariables: (projectId: string, environmentId: string, masterKey: string) =>
    ipcRenderer.invoke('db:get-variables', { projectId, environmentId, masterKey }),

  // Documents
  getDocuments: (projectId: string) => ipcRenderer.invoke('db:get-documents', projectId),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  createDocument: (data: any) => ipcRenderer.invoke('db:create-document', data),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  updateDocument: (id: string, data: any) => ipcRenderer.invoke('db:update-document', { id, data }),
  deleteDocument: (id: string) => ipcRenderer.invoke('db:delete-document', id),

  // Collections
  getCollections: (projectId: string) => ipcRenderer.invoke('db:get-collections', projectId),
  // biome-ignore lint/suspicious/noExplicitAny: generic data object
  createCollection: (data: any) => ipcRenderer.invoke('db:create-collection', data),
  deleteCollection: (id: string) => ipcRenderer.invoke('db:delete-collection', id),

  // Biometrics
  isBiometricAvailable: () => ipcRenderer.invoke('bio:is-available'),
  saveSecret: (secret: string) => ipcRenderer.invoke('bio:save-secret', secret),
  getSecret: () => ipcRenderer.invoke('bio:get-secret'),
  deleteSecret: () => ipcRenderer.invoke('bio:delete-secret'),
  authenticateBiometric: () => ipcRenderer.invoke('bio:authenticate'),

  // Access Tokens
  createAccessToken: (name: string, expiresInDays: number | null) =>
    ipcRenderer.invoke('db:create-access-token', { name, expiresInDays }),
  getAccessTokens: () => ipcRenderer.invoke('db:get-access-tokens'),
  deleteAccessToken: (id: string) => ipcRenderer.invoke('db:delete-access-token', id),
});
