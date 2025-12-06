import { ChevronDown, Info, Server, Tag } from 'lucide-react';
import { useState } from 'react';
import type { PathItem, UploadedFile } from '../../../../types/api-spec';
import { EndpointCard } from './EndpointCard';

interface ApiVisualizationProps {
  file: UploadedFile;
}

export const ApiVisualization = ({ file }: ApiVisualizationProps) => {
  const spec = file.parsed;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  if (!spec) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center animate-fade-in border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Unable to parse this file as an API specification.
        </p>
        <pre className="mt-4 p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded text-xs text-left overflow-auto max-h-96 font-mono text-gray-700 dark:text-gray-300">
          {file.content}
        </pre>
      </div>
    );
  }

  // Extract all endpoints
  const endpoints: Array<{
    path: string;
    method: string;
    operation: NonNullable<PathItem['get']>;
  }> = [];

  if (spec.paths) {
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'] as const;
      methods.forEach((method) => {
        const operation = pathItem[method];
        if (operation) {
          endpoints.push({ path, method, operation });
        }
      });
    });
  }

  // Group endpoints by tags
  const groupedEndpoints: Record<string, typeof endpoints> = {};
  const untaggedEndpoints: typeof endpoints = [];

  endpoints.forEach((endpoint) => {
    const tags = endpoint.operation.tags;
    if (tags && tags.length > 0) {
      tags.forEach((tag) => {
        if (!groupedEndpoints[tag]) {
          groupedEndpoints[tag] = [];
        }
        groupedEndpoints[tag].push(endpoint);
      });
    } else {
      untaggedEndpoints.push(endpoint);
    }
  });

  // Get tag descriptions from spec
  const tagDescriptions: Record<string, string> = {};
  if (spec.tags) {
    spec.tags.forEach((tag) => {
      if (tag.description) {
        tagDescriptions[tag.name] = tag.description;
      }
    });
  }

  const toggleSection = (tag: string) => {
    setOpenSections((prev) => ({ ...prev, [tag]: !prev[tag] }));
  };

  const sortedTags = Object.keys(groupedEndpoints).sort();

  return (
    <div className="space-y-6 animate-fade-in p-4">
      {/* Header Info */}
      {spec.info && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {spec.info.title || 'API Documentation'}
                </h2>
                {spec.info.version && (
                  <span className="px-2 py-0.5 text-xs rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono">
                    v{spec.info.version}
                  </span>
                )}
                {(spec.openapi || spec.swagger) && (
                  <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-mono">
                    {spec.openapi ? `OpenAPI ${spec.openapi}` : `Swagger ${spec.swagger}`}
                  </span>
                )}
              </div>
              {spec.info.description && (
                <p className="text-gray-500 dark:text-gray-400 mt-2">{spec.info.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Servers */}
      {spec.servers && spec.servers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Servers</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {spec.servers.map((server) => (
              <div
                key={server.url}
                className="px-3 py-1.5 rounded bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              >
                <code className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  {server.url}
                </code>
                {server.description && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    — {server.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grouped Endpoints by Tags */}
      {endpoints.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Endpoints
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({endpoints.length})
            </span>
          </h3>

          {sortedTags.map((tag) => (
            <div
              key={tag}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleSection(tag)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-gray-900 dark:text-white capitalize">
                    {tag}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {groupedEndpoints[tag].length}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${openSections[tag] ? 'rotate-180' : ''}`}
                />
              </button>

              {tagDescriptions[tag] && openSections[tag] && (
                <p className="px-4 pb-2 text-sm text-gray-500 dark:text-gray-400 -mt-2 border-b border-gray-100 dark:border-gray-700/50 mb-2">
                  {tagDescriptions[tag]}
                </p>
              )}

              {openSections[tag] && (
                <div className="p-4 pt-0 space-y-3 animate-fade-in border-t border-gray-100 dark:border-gray-700/50 mt-2">
                  {groupedEndpoints[tag].map((endpoint, idx) => (
                    <EndpointCard
                      key={`${endpoint.method}-${endpoint.path}-${idx}`}
                      path={endpoint.path}
                      method={endpoint.method}
                      operation={endpoint.operation}
                      spec={spec}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Untagged endpoints */}
          {untaggedEndpoints.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('_untagged')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">Other</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {untaggedEndpoints.length}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${openSections._untagged ? 'rotate-180' : ''}`}
                />
              </button>

              {openSections._untagged && (
                <div className="p-4 pt-0 space-y-3 animate-fade-in border-t border-gray-100 dark:border-gray-700/50 mt-2">
                  {untaggedEndpoints.map((endpoint, idx) => (
                    <EndpointCard
                      key={`${endpoint.method}-${endpoint.path}-${idx}`}
                      path={endpoint.path}
                      method={endpoint.method}
                      operation={endpoint.operation}
                      spec={spec}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No endpoints found in this specification.
          </p>
          <pre className="mt-4 p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded text-xs text-left overflow-auto max-h-96 font-mono text-gray-700 dark:text-gray-300">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
