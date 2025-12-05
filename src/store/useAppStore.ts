import { create } from 'zustand';
import { Project, Environment, VariableDefinition, Document, Organization } from '../types';

interface AppState {
  isAuthenticated: boolean;
  masterKey: string | null; // Kept in memory only
  userProfile: { name: string; email: string } | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  projects: Project[];
  currentProject: Project | null;
  environments: Environment[];
  currentEnvironment: Environment | null;
  variables: VariableDefinition[];
  documents: Document[];
  authMethod: 'password' | 'biometric' | null;
  activeView: 'project' | 'settings';

  // Actions
  setAuthenticated: (key: string, method: 'password' | 'biometric', user?: { name: string; email: string }) => void;
  setUserProfile: (profile: { name: string; email: string }) => void;
  logout: () => void;
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setEnvironments: (envs: Environment[]) => void;
  setCurrentEnvironment: (env: Environment | null) => void;
  setVariables: (vars: VariableDefinition[]) => void;
  setDocuments: (docs: Document[]) => void;
  fetchProjects: (organizationId: string) => Promise<void>;
  fetchDocuments: (projectId: string) => Promise<void>;
  addDocument: (doc: Partial<Document>) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
  setActiveView: (view: 'project' | 'settings') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  masterKey: null,
  userProfile: null,
  organizations: [],
  currentOrganization: null,
  projects: [],
  currentProject: null,
  environments: [],
  currentEnvironment: null,
  variables: [],
  documents: [],
  authMethod: null,
  activeView: 'project',

  setAuthenticated: (key, method, user) => set({
    isAuthenticated: true,
    masterKey: key,
    authMethod: method,
    userProfile: user || null
  }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  logout: () => set({
    isAuthenticated: false,
    masterKey: null,
    authMethod: null,
    userProfile: null,
    currentOrganization: null,
    currentProject: null,
    currentEnvironment: null,
    activeView: 'project'
  }),
  setOrganizations: (organizations) => set({ organizations }),
  setCurrentOrganization: (org) => set({ currentOrganization: org }),
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project, activeView: 'project' }),
  setEnvironments: (environments) => set({ environments }),
  setCurrentEnvironment: (env) => set({ currentEnvironment: env }),
  setVariables: (variables) => set({ variables }),
  setDocuments: (documents) => set({ documents }),
  setActiveView: (view) => set({ activeView: view }),

  fetchProjects: async (organizationId: string) => {
    try {
      const projects = await window.electronAPI.getProjects(organizationId);
      set({ projects });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  },

  fetchDocuments: async (projectId: string) => {
    try {
      const docs = await window.electronAPI.getDocuments(projectId);
      set({ documents: docs });
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  },

  addDocument: async (doc) => {
    try {
      // Ensure projectId is set
      if (!doc.projectId) {
        console.error('Project ID is missing for document');
        return;
      }
      const newDoc = await window.electronAPI.createDocument(doc);
      set((state) => ({ documents: [...state.documents, newDoc] }));
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  },

  updateDocument: async (id, updates) => {
    try {
      await window.electronAPI.updateDocument(id, updates);
      set((state) => ({
        documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d))
      }));
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  },

  removeDocument: async (id) => {
    try {
      await window.electronAPI.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  },
}));
