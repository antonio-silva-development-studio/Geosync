import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '../../types';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      setProjects: (projects) => set({ projects }),
      setCurrentProject: (currentProject) => set({ currentProject }),

      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (updatedProject) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
          currentProject:
            state.currentProject?.id === updatedProject.id ? updatedProject : state.currentProject,
        })),

      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'geosync-projects-storage',
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
      }),
    },
  ),
);
