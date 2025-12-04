import { create } from 'zustand';
import { Project, Environment, VariableDefinition, Document } from '../types';

interface AppState {
  isAuthenticated: boolean;
  masterKey: string | null; // Kept in memory only
  projects: Project[];
  currentProject: Project | null;
  environments: Environment[];
  currentEnvironment: Environment | null;
  variables: VariableDefinition[];
  documents: Document[];

  // Actions
  setAuthenticated: (key: string) => void;
  logout: () => void;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  setEnvironments: (envs: Environment[]) => void;
  setCurrentEnvironment: (env: Environment | null) => void;
  setVariables: (vars: VariableDefinition[]) => void;
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  masterKey: null,
  projects: [],
  currentProject: null,
  environments: [],
  currentEnvironment: null,
  variables: [],
  documents: [],

  setAuthenticated: (key) => set({ isAuthenticated: true, masterKey: key }),
  logout: () => set({
    isAuthenticated: false,
    masterKey: null,
    currentProject: null,
    currentEnvironment: null
  }),
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setEnvironments: (environments) => set({ environments }),
  setCurrentEnvironment: (env) => set({ currentEnvironment: env }),
  setVariables: (variables) => set({ variables }),
  setDocuments: (documents) => set({ documents }),
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d))
  })),
  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter((d) => d.id !== id)
  })),
}));
