/**
 * Type definitions for Headless CMS module
 */

/**
 * Field types supported in content models
 */
export enum FieldType {
  TEXT = 'text',
  RICH_TEXT = 'rich_text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  MEDIA = 'media',
  REFERENCE = 'reference',
  JSON = 'json',
}

/**
 * Field definition in a content model
 */
export interface ContentField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
  validationRules?: Record<string, any>;
  helpText?: string;
}

/**
 * Content model definition
 */
export interface ContentModel {
  id: string;
  tenantId: string;
  name: string;
  pluralName: string;
  description?: string;
  fields: ContentField[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Content entry
 */
export interface ContentEntry {
  id: string;
  tenantId: string;
  modelId: string;
  data: Record<string, any>;
  status: ContentStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Content status
 */
export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Content query options
 */
export interface ContentQueryOptions {
  filters?: Record<string, any>;
  sort?: { field: string; order: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
  populate?: string[];
}

/**
 * Content query result
 */
export interface ContentQueryResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Headless CMS configuration
 */
export interface HeadlessCMSConfig {
  eventBus: any; // EventBus instance
  database: any; // Database connection
  permissionSystem: any; // WEEG instance
}

/**
 * Content event types
 */
export enum ContentEventType {
  MODEL_CREATED = 'content.model.created',
  MODEL_UPDATED = 'content.model.updated',
  MODEL_DELETED = 'content.model.deleted',
  ENTRY_CREATED = 'content.entry.created',
  ENTRY_UPDATED = 'content.entry.updated',
  ENTRY_DELETED = 'content.entry.deleted',
  ENTRY_PUBLISHED = 'content.entry.published',
  ENTRY_ARCHIVED = 'content.entry.archived',
}

/**
 * Content event payload
 */
export interface ContentEventPayload {
  eventType: ContentEventType;
  tenantId: string;
  modelId?: string;
  entryId?: string;
  userId: string;
  timestamp: Date;
  data?: any;
}
