import { clsx } from 'clsx';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { ContextMenu } from '../../../shared/ui/ContextMenu';
import type { Project } from '../../../types';

interface ProjectListViewProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject: (name: string) => Promise<void>;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onDeleteProject,
  onCreateProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!newProjectName.trim()) return;

      try {
        await onCreateProject(newProjectName);
        setIsCreating(false);
      } catch {
        // Error handling is done in container, but we catch here to prevent unhandled rejection if needed
        // or rely on container to toast.
      }
    }
    if (e.key === 'Escape') {
      setIsCreating(false);
      setNewProjectName('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Projects
        </h2>
        <button
          type="button"
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
            type="text"
            className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onBlur={() => !newProjectName && setIsCreating(false)}
            onKeyDown={handleCreate}
            // biome-ignore lint/a11y/noAutofocus: input focus on creation
            autoFocus
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
                onClick: () => onDeleteProject(project.id),
              },
            ]}
          >
            <button
              type="button"
              onClick={() => onSelectProject(project)}
              className={clsx(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                currentProject?.id === project.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
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
