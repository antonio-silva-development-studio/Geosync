import { clsx } from 'clsx';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { ContextMenu } from '../../../shared/ui/ContextMenu';
import { Input } from '../../../shared/ui/Input';
import type { Project, Tag } from '../../../types';

interface ProjectListViewProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onCreateProject: (name: string, tags: string[]) => Promise<void>;
  tags: Tag[];
  hasOrganization: boolean;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onDeleteProject,
  onCreateProject,
  tags,
  hasOrganization,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [filterTagId, setFilterTagId] = useState<string | null>(null);

  const filteredProjects = filterTagId
    ? projects.filter((p) => p.tags?.some((t) => t.id === filterTagId))
    : projects;

  const handleCreate = async () => {
    if (!newProjectName.trim()) return;

    try {
      await onCreateProject(newProjectName, selectedTagIds);
      setIsCreating(false);
      setNewProjectName('');
      setSelectedTagIds([]);
    } catch {
      // Error handling is done in container
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === 'Escape') {
      setIsCreating(false);
      setNewProjectName('');
      setSelectedTagIds([]);
    }
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Projects
        </h2>
        {tags.length > 0 && (
          <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[120px]">
            <button
              type="button"
              onClick={() => setFilterTagId(null)}
              className={clsx(
                'w-2 h-2 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0',
                filterTagId === null ? 'bg-gray-400' : 'bg-transparent',
              )}
              title="All Projects"
            />
            {tags.map((tag) => (
              <button
                type="button"
                key={tag.id}
                onClick={() => setFilterTagId(filterTagId === tag.id ? null : tag.id)}
                className={clsx(
                  'w-2 h-2 rounded-full flex-shrink-0 transition-all',
                  filterTagId === tag.id
                    ? 'ring-1 ring-offset-1 ring-offset-white dark:ring-offset-gray-800'
                    : 'opacity-70 hover:opacity-100',
                )}
                style={{ backgroundColor: tag.color }}
                title={tag.name}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          disabled={!hasOrganization}
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title={hasOrganization ? 'New Project' : 'Create an organization first'}
        >
          <Plus className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {isCreating && (
        <div className="mb-2">
          <Input
            type="text"
            className="w-full"
            placeholder="Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onBlur={() => !newProjectName && setIsCreating(false)}
            onKeyDown={handleKeyDown}
            // biome-ignore lint/a11y/noAutofocus: input focus on creation
            autoFocus
          />
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagSelection(tag.id)}
                  className={clsx(
                    'px-2 py-0.5 text-xs rounded-full border transition-colors',
                    selectedTagIds.includes(tag.id)
                      ? 'border-transparent text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800',
                  )}
                  style={selectedTagIds.includes(tag.id) ? { backgroundColor: tag.color } : {}}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {filteredProjects.map((project) => (
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
              {project.tags && project.tags.length > 0 && (
                <div className="ml-auto flex gap-1">
                  {project.tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tag.color }}
                      title={tag.name}
                    />
                  ))}
                </div>
              )}
            </button>
          </ContextMenu>
        ))}
      </div>
    </div>
  );
};
