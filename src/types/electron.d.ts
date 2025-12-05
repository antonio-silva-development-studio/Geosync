export interface IElectronAPI {
  // Database
  isConfigured: () => Promise<boolean>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  setMasterPassword: (hash: string) => Promise<any>;
  verifyMasterPassword: (
    hash: string,
  ) => Promise<{ valid: boolean; user?: { name: string; email: string } }>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  updateSystemProfile: (data: { name?: string; email?: string }) => Promise<any>;
  changeMasterPassword: (oldHash: string, newHash: string) => Promise<boolean>;

  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  getOrganizations: () => Promise<any[]>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  createOrganization: (data: any) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  getProjects: (organizationId: string) => Promise<any[]>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  createProject: (data: any) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  deleteProject: (id: string) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  getEnvironments: (projectId: string) => Promise<any[]>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  createEnvironment: (data: any) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  updateEnvironment: (id: string, data: any) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  deleteEnvironment: (id: string) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  saveVariableDefinition: (data: any) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  saveVariableValue: (data: any) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  deleteVariableValue: (environmentId: string, definitionId: string) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  deleteVariable: (id: string) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  getVariables: (projectId: string, environmentId: string, masterKey: string) => Promise<any[]>;

  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  getDocuments: (projectId: string) => Promise<any[]>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  createDocument: (data: any) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
  updateDocument: (id: string, data: any) => Promise<any>;
  // biome-ignore lint/suspicious/noExplicitAny: legacy type
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
