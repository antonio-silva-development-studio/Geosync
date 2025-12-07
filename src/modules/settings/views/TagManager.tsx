import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useAppStore } from '../../../store/useAppStore';

export function TagManager() {
  const { tags, fetchTags, addTag, updateTag, deleteTag } = useAppStore();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); // Default blue
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    await addTag({ name: newTagName, color: newTagColor, isEnabled: true });
    setNewTagName('');
    setNewTagColor('#3b82f6');
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      await deleteTag(id);
    }
  };

  const handleToggleTag = async (id: string, currentStatus: boolean) => {
    await updateTag(id, { isEnabled: !currentStatus });
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const colors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#14b8a6', // Teal
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tags</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage tags to categorize your projects.
        </p>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            label="Tag Name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTag();
              }
            }}
            placeholder="e.g. E-commerce"
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </span>
          <div className="flex gap-1">
            {colors.map((color) => (
              <Button
                variant="ghost"
                key={color}
                onClick={() => setNewTagColor(color)}
                className={`w-10 h-10 rounded-full border-2 p-0 hover:bg-transparent ${
                  newTagColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
        <Button
          onClick={handleAddTag}
          disabled={!newTagName.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mb-[1px] h-auto"
        >
          <Plus size={18} />
          Add Tag
        </Button>
      </div>

      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTags.map((tag) => (
          <div
            key={tag.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              tag.isEnabled !== false
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={tag.isEnabled !== false}
                onChange={() => handleToggleTag(tag.id, tag.isEnabled !== false)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
              <span className="font-medium text-gray-900 dark:text-white">{tag.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteTag(tag.id)}
              className="text-gray-400 hover:text-red-500 transition-colors h-8 w-8"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        ))}
        {filteredTags.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No tags found.
          </div>
        )}
      </div>
    </div>
  );
}
