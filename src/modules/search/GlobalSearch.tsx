import { FileText, Folder, Layers, Search, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useProjectsStore } from '../projects/store';

interface SearchResult {
  type: 'project' | 'variable' | 'document';
  id: string;
  title: string;
  subtitle?: string;
  projectId?: string;
  projectName?: string;
}

export const GlobalSearch: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { organizations, currentOrganization, variables, documents } = useAppStore();
  const { projects, setCurrentProject } = useProjectsStore();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search projects
    (projects || []).forEach((project) => {
      if (project.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: 'project',
          id: project.id,
          title: project.name,
          subtitle: project.description || undefined,
        });
      }
    });

    // Search variables
    (variables || []).forEach((variable) => {
      if (variable.key.toLowerCase().includes(lowerQuery)) {
        const project = (projects || []).find((p) => p.id === variable.projectId);
        searchResults.push({
          type: 'variable',
          id: variable.id,
          title: variable.key,
          subtitle: variable.description || undefined,
          projectId: variable.projectId,
          projectName: project?.name,
        });
      }
    });

    // Search documents
    (documents || []).forEach((doc) => {
      if (
        doc.title.toLowerCase().includes(lowerQuery) ||
        doc.content.toLowerCase().includes(lowerQuery)
      ) {
        const project = (projects || []).find((p) => p.id === doc.projectId);
        searchResults.push({
          type: 'document',
          id: doc.id,
          title: doc.title,
          subtitle: project?.name,
          projectId: doc.projectId,
          projectName: project?.name,
        });
      }
    });

    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, projects, variables, documents]);

  const handleSelectResult = (result: SearchResult) => {
    if (result.type === 'project' && result.id) {
      const project = (projects || []).find((p) => p.id === result.id);
      if (project) {
        setCurrentProject(project);
        onClose();
      }
    } else if (result.projectId) {
      // For variables and documents, switch to the project first
      const project = (projects || []).find((p) => p.id === result.projectId);
      if (project) {
        setCurrentProject(project);
        onClose();
        // TODO: Could navigate to specific variable/document if needed
      }
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'project':
        return <Folder className="h-4 w-4" />;
      case 'variable':
        return <Layers className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Modal */}
      <div className="fixed left-1/2 top-20 z-50 w-full max-w-2xl -translate-x-1/2">
        <div className="rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, variables, documents..."
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500"
              autoFocus
            />
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 && query ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No results found
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Start typing to search...
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => handleSelectResult(result)}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex-shrink-0 text-gray-400">{getIcon(result.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {result.subtitle}
                        </div>
                      )}
                      {result.projectName && result.type !== 'project' && (
                        <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {result.projectName}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

