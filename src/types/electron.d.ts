export interface IElectronAPI {
  // Database
  isConfigured: () => Promise<boolean>;
  setMasterPassword: (hash: string) => Promise<any>;
  verifyMasterPassword: (hash: string) => Promise<boolean>;

  getProjects: () => Promise<any[]>;
  createProject: (data: any) => Promise<any>;
  getEnvironments: (projectId: string) => Promise<any[]>;
  createEnvironment: (data: any) => Promise<any>;
  saveVariableDefinition: (data: any) => Promise<any>;
  saveVariableValue: (data: any) => Promise<any>;
  getVariables: (data: { projectId: string; environmentId: string; masterKey: string }) => Promise<any[]>;

  // Biometrics
  isBiometricAvailable: () => Promise<boolean>;
  saveSecret: (secret: string) => Promise<boolean>;
  getSecret: () => Promise<string | null>;
  deleteSecret: () => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
