import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../../lib/utils';
import type { ApiSpec, Operation, Parameter } from '../../../../types/api-spec';
import { MethodBadge } from './MethodBadge';

interface EndpointCardProps {
  path: string;
  method: string;
  operation: Operation;
  spec?: ApiSpec | null;
}

export const EndpointCard = ({ path, method, operation, spec }: EndpointCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const resolveRef = (ref: string): any => {
    if (!spec || !ref.startsWith('#/')) return null;

    const parts = ref.replace('#/', '').split('/');
    let current: any = spec;

    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return null;
      }
    }

    return current;
  };

  const renderSchema = (schema: any, indent = 0) => {
    if (!schema) return null;

    // Handle $ref
    if (schema.$ref) {
      const resolved = resolveRef(schema.$ref);
      if (resolved) {
        return renderSchema(resolved, indent);
      }
      return (
        <span className="text-xs text-gray-500 italic">Reference not found: {schema.$ref}</span>
      );
    }

    // Handle array type
    if (schema.type === 'array' && schema.items) {
      return (
        <div className="ml-2">
          <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
            [{' '}
            <span className="text-blue-600 dark:text-blue-400">
              {schema.items.type || 'object'}
            </span>{' '}
            ]
          </div>
          {schema.items.properties && renderSchema(schema.items, indent)}
          {schema.items.$ref && renderSchema(schema.items, indent)}
        </div>
      );
    }

    // Handle object properties
    if (schema.properties) {
      return (
        <div className="space-y-1 mt-1">
          {Object.entries(schema.properties).map(([propName, propSchema]: [string, any]) => (
            <div
              key={propName}
              style={{ paddingLeft: `${indent * 12}px` }}
              className="flex items-start gap-2"
            >
              <div className="min-w-[120px]">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {propName}
                </span>
                {schema.required?.includes(propName) && (
                  <span className="text-[10px] text-red-500 ml-1">*</span>
                )}
              </div>
              <div className="flex-1">
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  {propSchema.type}
                  {propSchema.format && (
                    <span className="text-gray-400 ml-1">(${propSchema.format})</span>
                  )}
                </span>
                {propSchema.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {propSchema.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
        {schema.type}
        {schema.format && <span className="text-gray-400 ml-1">(${schema.format})</span>}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-fade-in transition-all hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <MethodBadge method={method} />
        <code className="text-sm font-mono text-gray-700 dark:text-gray-300 flex-1 text-left">
          {path}
        </code>
        {operation.summary && (
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:block truncate max-w-[300px]">
            {operation.summary}
          </span>
        )}
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-800/50 space-y-6 animate-fade-in">
          {operation.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{operation.description}</p>
          )}

          {operation.tags && operation.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {operation.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Parameters Section */}
          {operation.parameters && operation.parameters.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-700/50 pb-2">
                Parameters
              </h4>
              <div className="space-y-3">
                {operation.parameters.map((param: Parameter) => (
                  <div
                    key={`${param.in}-${param.name}`}
                    className="grid grid-cols-[1fr,2fr] gap-4 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {param.name}
                        </span>
                        {param.required && (
                          <span className="text-xs text-red-500 font-medium">* required</span>
                        )}
                      </div>
                      <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
                        {param.in}
                        {param.schema?.type && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            {param.schema.type}
                            {param.schema.format && (
                              <span className="text-gray-400">(${param.schema.format})</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {param.description || (
                        <span className="text-gray-400 italic">No description</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body Section */}
          {operation.requestBody && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-700/50 pb-2">
                Request Body
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-100 dark:border-gray-800">
                {operation.requestBody.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {operation.requestBody.description}
                  </p>
                )}
                {operation.requestBody.content &&
                  Object.entries(operation.requestBody.content).map(([contentType, content]) => (
                    <div key={contentType}>
                      <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-2">
                        Content-Type: {contentType}
                      </div>
                      {content.schema && (
                        <div className="pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                          {renderSchema(content.schema)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Responses Section */}
          {operation.responses && Object.keys(operation.responses).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-100 dark:border-gray-700/50 pb-2">
                Responses
              </h4>
              <div className="space-y-2">
                {Object.entries(operation.responses).map(([code, response]) => (
                  <div
                    key={code}
                    className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-mono rounded min-w-[3rem] text-center',
                        code.startsWith('2')
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                          : code.startsWith('4')
                            ? 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
                            : code.startsWith('5')
                              ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                      )}
                    >
                      {code}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {response.description}
                      </p>
                      {response.content &&
                        Object.entries(response.content).map(([type, content]) => (
                          <div key={type} className="mt-2">
                            <div className="text-xs font-mono text-gray-500 mb-1">{type}</div>
                            {content.schema && (
                              <div className="pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                                {renderSchema(content.schema)}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
