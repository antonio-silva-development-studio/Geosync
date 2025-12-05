import { create } from 'zustand';
import type { Document, Environment, Organization, VariableDefinition } from '../types';

interface AppState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  environments: Environment[];
  currentEnvironment: Environment | null;
  variables: VariableDefinition[];
  documents: Document[];

  activeView: 'project' | 'settings';
  theme: 'light' | 'dark' | 'system';

  // Actions
  setOrganizations: (orgs: Organization[]) => void;
  setCurrentOrganization: (org: Organization | null) => void;
  setEnvironments: (envs: Environment[]) => void;
  setCurrentEnvironment: (env: Environment | null) => void;
  setVariables: (vars: VariableDefinition[]) => void;
  setDocuments: (docs: Document[]) => void;
  fetchDocuments: (projectId: string) => Promise<void>;
  addDocument: (doc: Partial<Document>) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;

  setActiveView: (view: 'project' | 'settings') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  organizations: [],
  currentOrganization: null,
  environments: [],
  currentEnvironment: null,
  variables: [],
  documents: [],

  activeView: 'project',
  theme: 'system',

  setOrganizations: (organizations) => set({ organizations }),
  setCurrentOrganization: (org) => set({ currentOrganization: org }),
  setEnvironments: (environments) => set({ environments }),
  setCurrentEnvironment: (env) => set({ currentEnvironment: env }),
  setVariables: (variables) => set({ variables }),
  setDocuments: (documents) => set({ documents }),

  setActiveView: (view) => set({ activeView: view }),
  setTheme: (theme) => set({ theme }),

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
        documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      }));
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  },

  removeDocument: async (id) => {
    try {
      await window.electronAPI.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  },
}));
