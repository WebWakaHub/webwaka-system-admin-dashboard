/**
 * Integration tests for Search & Discovery Engine
 */

import { SearchDiscovery } from '../SearchDiscovery';

// Mock MeiliSearch
const mockSearch = jest.fn();
const mockAddDocuments = jest.fn();
const mockDeleteDocument = jest.fn();

jest.mock('meilisearch', () => ({
  MeiliSearch: jest.fn().mockImplementation(() => ({
    index: jest.fn().mockReturnValue({
      updateSearchableAttributes: jest.fn().mockResolvedValue({}),
      updateFilterableAttributes: jest.fn().mockResolvedValue({}),
      updateSortableAttributes: jest.fn().mockResolvedValue({}),
      addDocuments: mockAddDocuments,
      deleteDocument: mockDeleteDocument,
      search: mockSearch,
    }),
  })),
}));

describe('SearchDiscovery Integration Tests', () => {
  let searchDiscovery: SearchDiscovery;
  let mockEventBus: any;

  beforeEach(async () => {
    mockEventBus = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };

    searchDiscovery = new SearchDiscovery({
      database: {},
      eventBus: mockEventBus,
      meiliSearchHost: 'http://localhost:7700',
      meiliSearchApiKey: 'masterKey',
    });

    await searchDiscovery.initialize();

    mockSearch.mockClear();
    mockAddDocuments.mockClear();
    mockDeleteDocument.mockClear();
  });

  describe('Complete Search Flow', () => {
    it('should index content and make it searchable', async () => {
      // Simulate content published event
      const contentEvent = {
        id: 'content-1',
        tenantId: 'tenant-1',
        contentType: 'blog',
        fields: {
          title: 'My First Blog Post',
          content: 'This is the content of my first blog post.',
          author: 'John Doe',
          tags: ['blog', 'first'],
        },
        authorId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Get the event handler
      const contentPublishedHandler = mockEventBus.on.mock.calls.find(
        (call: any) => call[0] === 'content.published'
      )[1];

      // Trigger the event
      await contentPublishedHandler(contentEvent);

      // Verify document was added to index
      expect(mockAddDocuments).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'content-1',
          tenantId: 'tenant-1',
          contentType: 'blog',
          title: 'My First Blog Post',
        }),
      ]);

      // Mock search result
      mockSearch.mockResolvedValue({
        hits: [
          {
            id: 'content-1',
            title: 'My First Blog Post',
            contentType: 'blog',
          },
        ],
        estimatedTotalHits: 1,
        processingTimeMs: 20,
      });

      // Search for the content
      const results = await searchDiscovery.searchContent('tenant-1', {
        query: 'blog post',
      });

      expect(results.hits).toHaveLength(1);
      expect(results.hits[0].title).toBe('My First Blog Post');
    });

    it('should remove content from index when unpublished', async () => {
      // Simulate content unpublished event
      const unpublishEvent = {
        id: 'content-1',
        tenantId: 'tenant-1',
      };

      // Get the event handler
      const contentUnpublishedHandler = mockEventBus.on.mock.calls.find(
        (call: any) => call[0] === 'content.unpublished'
      )[1];

      // Trigger the event
      await contentUnpublishedHandler(unpublishEvent);

      // Verify document was removed from index
      expect(mockDeleteDocument).toHaveBeenCalledWith('content-1');
    });
  });

  describe('Search Suggestions', () => {
    it('should return search suggestions', async () => {
      mockSearch.mockResolvedValue({
        hits: [
          { id: 'doc-1', title: 'Blog Post 1' },
          { id: 'doc-2', title: 'Blog Post 2' },
        ],
        estimatedTotalHits: 2,
        processingTimeMs: 15,
      });

      const suggestions = await searchDiscovery.getSuggestions('tenant-1', 'blog');

      expect(suggestions).toEqual(['Blog Post 1', 'Blog Post 2']);
    });
  });
});
