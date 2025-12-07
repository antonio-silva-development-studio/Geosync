import { clsx } from 'clsx';
import { Folder, FolderOpen, Plus, Tag as TagIcon, Trash2 } from 'lucide-react';
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
  onUpdateProjectTags: (projectId: string, tagIds: string[]) => Promise<void>;
  tags: Tag[];
  hasOrganization: boolean;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onDeleteProject,
  onCreateProject,
  onUpdateProjectTags,
  tags,
  hasOrganization,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const [editingTagsProjectId, setEditingTagsProjectId] = useState<string | null>(null);
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);

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

      {isCreating && !hasOrganization && (
        <div className="mb-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
          Please select or create an organization first before creating a project.
        </div>
      )}

      {isCreating && hasOrganization && (
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
                label: 'Manage Tags',
                icon: <TagIcon className="h-4 w-4" />,
                onClick: () => {
                  setEditingTagsProjectId(project.id);
                  setEditingTagIds(project.tags?.map((t) => t.id) || []);
                },
              },
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

      {/* Tags Management Modal */}
      {editingTagsProjectId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => {
              setEditingTagsProjectId(null);
              setEditingTagIds([]);
            }}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Manage Tags
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Select tags to assign to this project. Use tags as context of work (e.g., "Agência X", "Pessoal", "Freelance").
            </p>
            <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tags available. Create tags in Settings first.
                </p>
              ) : (
                tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                  >
                    <input
                      type="checkbox"
                      checked={editingTagIds.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingTagIds([...editingTagIds, tag.id]);
                        } else {
                          setEditingTagIds(editingTagIds.filter((id) => id !== tag.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingTagsProjectId(null);
                  setEditingTagIds([]);
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onUpdateProjectTags(editingTagsProjectId, editingTagIds);
                    setEditingTagsProjectId(null);
                    setEditingTagIds([]);
                  } catch {
                    // Error handling is done in container
                  }
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
