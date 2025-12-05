import React, { useState } from 'react';
// Component for listing projects
import { useAppStore } from '../store/useAppStore';
import { Plus, Folder, FolderOpen, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { ContextMenu } from './ContextMenu';

export const ProjectList: React.FC = () => {
  const { projects, currentProject, setCurrentProject, setProjects, currentOrganization, fetchProjects } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  React.useEffect(() => {
    if (currentOrganization) {
      fetchProjects(currentOrganization.id);
    }
  }, [currentOrganization, fetchProjects]);



  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    // Mock delete for now
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);

    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ... (header remains same) */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Projects
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="New Project"
        >
          <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {isCreating && (
        <div className="mb-2">
          <input
            autoFocus
            type="text"
            className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onBlur={() => !newProjectName && setIsCreating(false)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!newProjectName.trim()) return;

                try {
                  const newProject = await window.electronAPI.createProject({
                    name: newProjectName,
                    description: '',
                    organizationId: currentOrganization?.id,
                  });
                  setProjects([...projects, newProject]);
                  setNewProjectName('');
                  setIsCreating(false);
                  setCurrentProject(newProject);
                } catch (error) {
                  console.error('Failed to create project', error);
                  alert('Failed to create project: ' + (error as Error).message);
                }
              }
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewProjectName('');
              }
            }}
          />
        </div>
      )}

      <div className="space-y-1">
        {projects.map((project) => (
          <ContextMenu
            key={project.id}
            items={[
              {
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                danger: true,
                onClick: () => handleDeleteProject(project.id)
              }
            ]}
          >
            <button
              onClick={() => setCurrentProject(project)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                currentProject?.id === project.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              {currentProject?.id === project.id ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
              {project.name}
            </button>
          </ContextMenu>
        ))}
      </div>
    </div>
  );
};
