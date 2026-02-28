/**
 * Type definitions for the Search & Discovery Engine
 */

/**
 * Configuration for the Search & Discovery Engine
 */
export interface SearchDiscoveryConfig {
  /** Database connection */
  database: any;
  /** Event bus for emitting/receiving events */
  eventBus: any;
  /** MeiliSearch host URL */
  meiliSearchHost: string;
  /** MeiliSearch API key */
  meiliSearchApiKey: string;
}

/**
 * Represents a document in the search index
 */
export interface SearchDocument {
  /** Unique ID of the document */
  id: string;
  /** Tenant ID for multi-tenancy */
  tenantId: string;
  /** Content type (e.g., 'blog', 'product') */
  contentType: string;
  /** Title of the content */
  title: string;
  /** Main body content */
  content: string;
  /** Author name */
  author?: string;
  /** Tags associated with the content */
  tags?: string[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  /** Search term */
  query: string;
  /** Filter expression (e.g., 'contentType:blog') */
  filter?: string;
  /** Fields to facet on */
  facets?: string[];
  /** Page number for pagination */
  page?: number;
  /** Number of results per page */
  limit?: number;
}

/**
 * Search result
 */
export interface SearchResult {
  /** Matching documents */
  hits: SearchDocument[];
  /** Total number of hits */
  nbHits: number;
  /** Current page */
  page: number;
  /** Results per page */
  limit: number;
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Original query */
  query: string;
  /** Facet distribution (if requested) */
  facetDistribution?: Record<string, Record<string, number>>;
}

/**
 * Content published event payload
 */
export interface ContentPublishedEvent {
  /** Content entry ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
  /** Content model name */
  contentType: string;
  /** Content fields */
  fields: Record<string, any>;
  /** Author ID */
  authorId: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Content unpublished event payload
 */
export interface ContentUnpublishedEvent {
  /** Content entry ID */
  id: string;
  /** Tenant ID */
  tenantId: string;
}
