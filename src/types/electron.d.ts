export interface IElectronAPI {
  // Database
  isConfigured: () => Promise<boolean>;
  setMasterPassword: (hash: string) => Promise<any>;
  verifyMasterPassword: (hash: string) => Promise<{ valid: boolean; user?: { name: string; email: string } }>;
  updateSystemProfile: (data: { name?: string; email?: string }) => Promise<any>;
  changeMasterPassword: (oldHash: string, newHash: string) => Promise<boolean>;

  getOrganizations: () => Promise<any[]>;
  createOrganization: (data: any) => Promise<any>;
  getProjects: (organizationId: string) => Promise<any[]>;
  createProject: (data: any) => Promise<any>;
  getEnvironments: (projectId: string) => Promise<any[]>;
  createEnvironment: (data: any) => Promise<any>;
  updateEnvironment: (id: string, data: any) => Promise<any>;
  deleteEnvironment: (id: string) => Promise<any>;
  saveVariableDefinition: (data: any) => Promise<any>;
  saveVariableValue: (data: any) => Promise<any>;
  getVariables: (projectId: string, environmentId: string, masterKey: string) => Promise<any[]>;

  getDocuments: (projectId: string) => Promise<any[]>;
  createDocument: (data: any) => Promise<any>;
  updateDocument: (id: string, data: any) => Promise<any>;
  deleteDocument: (id: string) => Promise<any>;

  // Biometrics
  isBiometricAvailable: () => Promise<boolean>;
  saveSecret: (secret: string) => Promise<boolean>;
  getSecret: () => Promise<string | null>;
  deleteSecret: () => Promise<boolean>;
  authenticateBiometric: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
