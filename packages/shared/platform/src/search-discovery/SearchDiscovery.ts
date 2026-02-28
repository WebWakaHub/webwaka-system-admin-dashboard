/**
 * Search & Discovery Engine
 * Main class for the Search & Discovery Engine module
 */

import type { SearchDiscoveryConfig, SearchQuery, SearchResult } from './types';
import { IndexingService } from './services/IndexingService';
import { SearchService } from './services/SearchService';

export class SearchDiscovery {
  private config: SearchDiscoveryConfig;
  public indexing: IndexingService;
  public search: SearchService;

  constructor(config: SearchDiscoveryConfig) {
    this.config = config;

    // Initialize services
    this.indexing = new IndexingService(
      config.meiliSearchHost,
      config.meiliSearchApiKey,
      config.eventBus
    );

    this.search = new SearchService(
      config.meiliSearchHost,
      config.meiliSearchApiKey
    );
  }

  /**
   * Initialize the Search & Discovery Engine
   */
  async initialize(): Promise<void> {
    await this.indexing.initialize();
  }

  /**
   * Search for content
   */
  async searchContent(tenantId: string, query: SearchQuery): Promise<SearchResult> {
    return this.search.search(tenantId, query);
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(tenantId: string, query: string, limit?: number): Promise<string[]> {
    return this.search.getSuggestions(tenantId, query, limit);
  }

  /**
   * Shutdown the Search & Discovery Engine
   */
  async shutdown(): Promise<void> {
    await this.indexing.shutdown();
  }
}
