import type React from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import { ProjectListView } from './components/ProjectListView';
import { useProjectsStore } from './store';

export const ProjectListContainer: React.FC = () => {
  const { currentOrganization, tags, fetchTags } = useAppStore();
  const {
    projects,
    currentProject,
    setProjects,
    setCurrentProject,
    addProject,
    deleteProject,
    updateProject,
  } = useProjectsStore();

  useEffect(() => {
    const loadProjects = async () => {
      if (currentOrganization) {
        try {
          const fetchedProjects = await window.electronAPI.getProjects(currentOrganization.id);
          setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
        } catch (error) {
          console.error('Failed to fetch projects', error);
          toast.error('Failed to load projects');
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
    };
    loadProjects();
    fetchTags();
  }, [currentOrganization, setProjects, fetchTags]);

  const handleCreateProject = async (name: string, selectedTags: string[]) => {
    if (!currentOrganization) return;
    try {
      const newProject = await window.electronAPI.createProject({
        name,
        description: '',
        organizationId: currentOrganization.id,
        tags: {
          connect: selectedTags.map((id) => ({ id })),
        },
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

  const handleUpdateProjectTags = async (projectId: string, tagIds: string[]) => {
    try {
      const updatedProject = await window.electronAPI.updateProject(projectId, {
        tags: {
          set: tagIds.map((id) => ({ id })),
        },
      });
      // Update project in store
      updateProject(updatedProject);
      toast.success('Tags updated successfully');
    } catch (error) {
      console.error('Failed to update project tags', error);
      toast.error('Failed to update tags');
      throw error;
    }
  };

  return (
    <ProjectListView
      projects={projects}
      currentProject={currentProject}
      onSelectProject={setCurrentProject}
      onDeleteProject={handleDeleteProject}
      onCreateProject={handleCreateProject}
      onUpdateProjectTags={handleUpdateProjectTags}
      tags={tags}
      hasOrganization={!!currentOrganization}
    />
  );
};
