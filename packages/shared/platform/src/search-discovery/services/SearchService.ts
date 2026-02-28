/**
 * Search Service for the Search & Discovery Engine
 * Handles querying the search index
 */

import { MeiliSearch, Index } from 'meilisearch';
import type { SearchQuery, SearchResult } from '../types';
import { SearchError } from '../errors';

export class SearchService {
  private client: MeiliSearch;
  private index: Index;

  constructor(meiliSearchHost: string, meiliSearchApiKey: string) {
    this.client = new MeiliSearch({
      host: meiliSearchHost,
      apiKey: meiliSearchApiKey,
    });
    this.index = this.client.index('content');
  }

  /**
   * Search for content
   */
  async search(tenantId: string, query: SearchQuery): Promise<SearchResult> {
    try {
      const {
        query: searchQuery,
        filter,
        facets,
        page = 1,
        limit = 20,
      } = query;

      // Build filter expression to include tenant isolation
      const tenantFilter = `tenantId = ${tenantId}`;
      const finalFilter = filter ? `${tenantFilter} AND ${filter}` : tenantFilter;

      // Perform search
      const result = await this.index.search(searchQuery, {
        filter: finalFilter,
        facets,
        limit,
        offset: (page - 1) * limit,
      });

      return {
        hits: result.hits as any[],
        nbHits: result.estimatedTotalHits || 0,
        page,
        limit,
        processingTimeMs: result.processingTimeMs,
        query: searchQuery,
        facetDistribution: result.facetDistribution,
      };
    } catch (error: any) {
      throw new SearchError(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(tenantId: string, query: string, limit: number = 5): Promise<string[]> {
    try {
      const result = await this.search(tenantId, { query, limit });
      return result.hits.map((hit) => hit.title);
    } catch (error: any) {
      throw new SearchError(`Failed to get suggestions: ${error.message}`);
    }
  }
}
