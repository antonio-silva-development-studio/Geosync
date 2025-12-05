import type React from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import { ProjectListView } from './components/ProjectListView';
import { useProjectsStore } from './store';

export const ProjectListContainer: React.FC = () => {
  const { currentOrganization } = useAppStore();
  const { projects, currentProject, setProjects, setCurrentProject, addProject, deleteProject } =
    useProjectsStore();

  useEffect(() => {
    const loadProjects = async () => {
      if (currentOrganization) {
        try {
          const fetchedProjects = await window.electronAPI.getProjects(currentOrganization.id);
          setProjects(fetchedProjects);
        } catch (error) {
          console.error('Failed to fetch projects', error);
          toast.error('Failed to load projects');
        }
      }
    };
    loadProjects();
  }, [currentOrganization, setProjects]);

  const handleCreateProject = async (name: string) => {
    if (!currentOrganization) return;
    try {
      const newProject = await window.electronAPI.createProject({
        name,
        description: '',
        organizationId: currentOrganization.id,
      });
      addProject(newProject);
      setCurrentProject(newProject);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Failed to create project', error);
      toast.error(`Failed to create project: ${(error as Error).message}`);
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await window.electronAPI.deleteProject(projectId);
      deleteProject(projectId);
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project', error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <ProjectListView
      projects={projects}
      currentProject={currentProject}
      onSelectProject={setCurrentProject}
      onDeleteProject={handleDeleteProject}
      onCreateProject={handleCreateProject}
    />
  );
};
