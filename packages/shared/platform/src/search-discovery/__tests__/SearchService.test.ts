/**
 * Unit tests for SearchService
 */

import { SearchService } from '../services/SearchService';

// Mock MeiliSearch
const mockSearch = jest.fn();
jest.mock('meilisearch', () => ({
  MeiliSearch: jest.fn().mockImplementation(() => ({
    index: jest.fn().mockReturnValue({
      search: mockSearch,
    }),
  })),
}));

describe('SearchService', () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService('http://localhost:7700', 'masterKey');
    mockSearch.mockClear();
  });

  describe('search', () => {
    it('should search for content successfully', async () => {
      mockSearch.mockResolvedValue({
        hits: [
          {
            id: 'doc-1',
            title: 'Test Blog',
            contentType: 'blog',
          },
        ],
        estimatedTotalHits: 1,
        processingTimeMs: 25,
      });

      const result = await searchService.search('tenant-1', {
        query: 'test',
        page: 1,
        limit: 20,
      });

      expect(result.hits).toHaveLength(1);
      expect(result.nbHits).toBe(1);
      expect(result.query).toBe('test');
      expect(mockSearch).toHaveBeenCalledWith('test', {
        filter: 'tenantId = tenant-1',
        facets: undefined,
        limit: 20,
        offset: 0,
      });
    });

    it('should apply filters correctly', async () => {
      mockSearch.mockResolvedValue({
        hits: [],
        estimatedTotalHits: 0,
        processingTimeMs: 10,
      });

      await searchService.search('tenant-1', {
        query: 'test',
        filter: 'contentType:blog',
        page: 1,
        limit: 20,
      });

      expect(mockSearch).toHaveBeenCalledWith('test', {
        filter: 'tenantId = tenant-1 AND contentType:blog',
        facets: undefined,
        limit: 20,
        offset: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      mockSearch.mockResolvedValue({
        hits: [],
        estimatedTotalHits: 0,
        processingTimeMs: 10,
      });

      await searchService.search('tenant-1', {
        query: 'test',
        page: 2,
        limit: 10,
      });

      expect(mockSearch).toHaveBeenCalledWith('test', {
        filter: 'tenantId = tenant-1',
        facets: undefined,
        limit: 10,
        offset: 10,
      });
    });
  });

  describe('getSuggestions', () => {
    it('should return search suggestions', async () => {
      mockSearch.mockResolvedValue({
        hits: [
          { id: 'doc-1', title: 'Blog Post 1' },
          { id: 'doc-2', title: 'Blog Post 2' },
        ],
        estimatedTotalHits: 2,
        processingTimeMs: 15,
      });

      const suggestions = await searchService.getSuggestions('tenant-1', 'blog', 5);

      expect(suggestions).toEqual(['Blog Post 1', 'Blog Post 2']);
    });
  });
});
