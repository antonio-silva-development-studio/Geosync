export interface ApiSpec {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  paths?: Record<string, PathItem>;
  servers?: Array<{ url: string; description?: string }>;
  tags?: Array<{ name: string; description?: string }>;
  components?: {
    schemas?: Record<string, Schema>;
  };
  definitions?: Record<string, Schema>;
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  options?: Operation;
  head?: Operation;
}

export interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: Record<string, Response>;
  security?: Array<Record<string, string[]>>;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: Schema;
}

export interface RequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: Schema }>;
}

export interface Response {
  description?: string;
  content?: Record<string, { schema?: Schema }>;
}

export interface Schema {
  type?: string;
  format?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  example?: unknown;
  $ref?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'yaml' | 'json';
  content: string;
  parsed: ApiSpec | null;
  uploadedAt: Date;
}
