import { clsx } from 'clsx';
import yaml from 'js-yaml';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileCode,
  FileJson,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ApiVisualization } from './components/viewers/ApiVisualization';
import { CollectionViewer } from './components/viewers/CollectionViewer';
// import SwaggerUI from 'swagger-ui-react';
// import 'swagger-ui-react/swagger-ui.css';
import { useProjectsStore } from './store';

interface ApiCollection {
  id: string;
  name: string;
  content: string;
  version: number;
  createdAt: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SwaggerUI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 bg-red-50 rounded border border-red-200">
          <h3 className="font-bold">Failed to render API Documentation</h3>
          <p className="text-sm mt-1">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export const CollectionManager: React.FC = () => {
  const { currentProject } = useProjectsStore();
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<ApiCollection | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadCollections = React.useCallback(async () => {
    if (!currentProject) return;
    try {
      const data = await window.electronAPI.getCollections(currentProject.id);
      setCollections(data);
      if (data.length > 0 && !selectedCollection) {
        setSelectedCollection(data[0]);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
      toast.error('Failed to load collections');
    }
  }, [currentProject, selectedCollection]);

  useEffect(() => {
    if (currentProject) {
      // Use setTimeout to avoid calling setState synchronously within effect
      const timer = setTimeout(() => {
        loadCollections();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentProject, loadCollections]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentProject) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const newCollection = await window.electronAPI.createCollection({
          projectId: currentProject.id,
          name: file.name,
          content: content,
          version: 1,
        });
        toast.success('Collection uploaded successfully');
        setCollections((prev) => [...prev, newCollection]);
        setSelectedCollection(newCollection);
      } catch (error) {
        console.error('Failed to upload collection:', error);
        toast.error('Failed to upload collection');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = (e: React.MouseEvent, collection: ApiCollection) => {
    e.stopPropagation();
    const blob = new Blob([collection.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = collection.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await window.electronAPI.deleteCollection(id);
      toast.success('Collection deleted');
      const newCollections = collections.filter((c) => c.id !== id);
      setCollections(newCollections);
      if (selectedCollection?.id === id) {
        setSelectedCollection(newCollections[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getIcon = (name: string) => {
    if (name.endsWith('.json')) return <FileJson className="h-5 w-5 text-yellow-500" />;
    if (name.endsWith('.yaml') || name.endsWith('.yml'))
      return <FileCode className="h-5 w-5 text-blue-500" />;
    return <FileCode className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header & Carousel Section */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Collections</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and visualize your API collections
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.yaml,.yml"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Collection
            </button>
          </div>
        </div>

        {/* Carousel */}
        {collections.length > 0 ? (
          <div className="relative group mb-6">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {collections.map((collection) => (
                <button
                  type="button"
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection)}
                  className={clsx(
                    'flex-shrink-0 w-64 p-4 rounded-lg border cursor-pointer transition-all snap-start text-left',
                    selectedCollection?.id === collection.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700',
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {getIcon(collection.name)}
                      <span
                        className="font-medium text-sm text-gray-900 dark:text-white truncate"
                        title={collection.name}
                      >
                        {collection.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, collection)}
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, collection.id)}
                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg mb-6">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">No collections yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload a JSON or YAML file to get started
            </p>
          </div>
        )}
      </div>

      {/* Swagger UI Section */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-6">
        {selectedCollection ? (
          <div className="rounded-lg overflow-hidden">
            {/* Swagger UI wrapper to handle dark mode if needed, though native support is limited */}
            <div className="swagger-wrapper">
              <ErrorBoundary>
                {(() => {
                  const content = selectedCollection.content;
                  const isOpenApi =
                    content.includes('openapi:') ||
                    content.includes('swagger:') ||
                    content.includes('"openapi":') ||
                    content.includes('"swagger":');

                  if (isOpenApi) {
                    // biome-ignore lint/suspicious/noExplicitAny: OpenAPI spec can have various structures
                    let specToRender: any = null;
                    if (typeof content === 'string') {
                      try {
                        specToRender = JSON.parse(content);
                      } catch (_e) {
                        try {
                          specToRender = yaml.load(content);
                        } catch (_e2) {
                          // Ignore parse error, specToRender remains null
                        }
                      }
                    }

                    // Ensure it's an object (ApiSpec) and not a scalar from YAML load
                    if (specToRender && typeof specToRender !== 'object') {
                      specToRender = null;
                    }

                    // Use custom ApiVisualization
                    return (
                      <ApiVisualization
                        file={{
                          id: selectedCollection.id,
                          name: selectedCollection.name,
                          type: 'json', // Defaulting to json, but could be yaml
                          content: content,
                          parsed: specToRender,
                          uploadedAt: new Date(),
                        }}
                      />
                    );
                  }

                  return (
                    <ErrorBoundary>
                      <CollectionViewer content={content} />
                    </ErrorBoundary>
                  );
                })()}
              </ErrorBoundary>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Select a collection to view documentation</p>
          </div>
        )}
      </div>
    </div>
  );
};
