export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  organizationId?: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

export interface Environment {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface VariableDefinition {
  id: string;
  projectId: string;
  key: string;
  description: string | null;
  defaultValue: string | null; // Decrypted value
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
  value?: string | null; // The specific value for the current environment (if any)
  isOverridden?: boolean;
}

export interface ApiCollection {
  id: string;
  projectId: string;
  name: string;
  content: string; // Decrypted content
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessToken {
  id: string;
  name: string;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}
