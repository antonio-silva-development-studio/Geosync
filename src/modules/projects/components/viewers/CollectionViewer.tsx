import { clsx } from 'clsx';
import { ChevronDown, ChevronRight, Code, FileText, Folder, Globe } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { type CollectionItem, parseCollection } from './parsers';

interface CollectionViewerProps {
  content: string;
}

export const CollectionViewer: React.FC<CollectionViewerProps> = ({ content }) => {
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  const { items, error } = useMemo(() => {
    try {
      const result = parseCollection(content);
      return { items: result, error: null, rawParsed: result };
    } catch (e) {
      return { items: [], error: e instanceof Error ? e.message : String(e), rawParsed: null };
    }
  }, [content]);

  return (
    <div className="flex h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Explorer
          </h3>
          <div className="space-y-1">
            {items.length > 0 ? (
              items.map((item) => (
                <TreeItem
                  key={item.id}
                  item={item}
                  onSelect={setSelectedItem}
                  selectedId={selectedItem?.id}
                />
              ))
            ) : (
              <div className="p-4 text-xs text-gray-500">
                <p className="font-bold mb-2">No items found.</p>
                {error && <p className="text-red-500 mb-2">Error: {error}</p>}
                <p className="mb-1">Debug Info:</p>
                <pre className="bg-gray-200 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
                  {content.slice(0, 200)}...
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {selectedItem ? (
          <RequestDetails item={selectedItem} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText className="h-12 w-12 mb-2 opacity-20" />
            <p>Select a request to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TreeItemProps {
  item: CollectionItem;
  onSelect: (item: CollectionItem) => void;
  selectedId?: string;
  level?: number;
}

const TreeItem: React.FC<TreeItemProps> = ({ item, onSelect, selectedId, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isGroup = item.type === 'group';
  const isSelected = item.id === selectedId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGroup) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={clsx(
          'flex w-full items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm transition-colors text-left',
          isSelected
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {isGroup && (
          <span className="text-gray-400">
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </span>
        )}

        {isGroup ? (
          <Folder className="h-4 w-4 text-yellow-500" />
        ) : (
          <span
            className={clsx(
              'text-[10px] font-bold px-1 rounded w-8 text-center',
              getMethodColor(item.method),
            )}
          >
            {item.method || 'GET'}
          </span>
        )}

        <span className="truncate">{item.name}</span>
      </button>

      {isGroup && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              onSelect={onSelect}
              selectedId={selectedId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RequestDetails: React.FC<{ item: CollectionItem }> = ({ item }) => {
  if (item.type === 'group') return null;

  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h2>
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm">
          <span className={clsx('font-bold px-2 py-0.5 rounded', getMethodColor(item.method))}>
            {item.method || 'GET'}
          </span>
          <span className="text-gray-600 dark:text-gray-300 break-all">{item.url}</span>
        </div>
      </div>

      {item.headers && Object.keys(item.headers).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Headers
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Key</th>
                  <th className="px-4 py-2 font-medium">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {Object.entries(item.headers).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-4 py-2 font-mono text-gray-700 dark:text-gray-300">{key}</td>
                    <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400 break-all">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {item.body && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Code className="h-4 w-4" /> Body
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">{item.body}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

const getMethodColor = (method?: string) => {
  switch (method?.toUpperCase()) {
    case 'GET':
      return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    case 'POST':
      return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
    case 'PUT':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
    case 'DELETE':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
    case 'PATCH':
      return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
  }
};
