/**
 * Unit tests for IndexingService
 */

import { IndexingService } from '../services/IndexingService';
import type { ContentPublishedEvent, ContentUnpublishedEvent } from '../types';

// Mock MeiliSearch
jest.mock('meilisearch', () => ({
  MeiliSearch: jest.fn().mockImplementation(() => ({
    index: jest.fn().mockReturnValue({
      updateSearchableAttributes: jest.fn().mockResolvedValue({}),
      updateFilterableAttributes: jest.fn().mockResolvedValue({}),
      updateSortableAttributes: jest.fn().mockResolvedValue({}),
      addDocuments: jest.fn().mockResolvedValue({}),
      deleteDocument: jest.fn().mockResolvedValue({}),
    }),
  })),
}));

describe('IndexingService', () => {
  let indexingService: IndexingService;
  let mockEventBus: any;

  beforeEach(() => {
    mockEventBus = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };

    indexingService = new IndexingService(
      'http://localhost:7700',
      'masterKey',
      mockEventBus
    );
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await indexingService.initialize();

      expect(mockEventBus.on).toHaveBeenCalledWith(
        'content.published',
        expect.any(Function)
      );
      expect(mockEventBus.on).toHaveBeenCalledWith(
        'content.updated',
        expect.any(Function)
      );
      expect(mockEventBus.on).toHaveBeenCalledWith(
        'content.unpublished',
        expect.any(Function)
      );
    });
  });

  describe('addDocument', () => {
    it('should add a document to the index', async () => {
      await indexingService.initialize();

      const document = {
        id: 'doc-1',
        tenantId: 'tenant-1',
        contentType: 'blog',
        title: 'Test Blog',
        content: 'Test content',
        author: 'John Doe',
        tags: ['test'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await indexingService.addDocument(document);

      expect(mockEventBus.emit).toHaveBeenCalledWith('search.document.indexed', {
        documentId: 'doc-1',
      });
    });
  });

  describe('removeDocument', () => {
    it('should remove a document from the index', async () => {
      await indexingService.initialize();

      await indexingService.removeDocument('doc-1');

      expect(mockEventBus.emit).toHaveBeenCalledWith('search.document.removed', {
        documentId: 'doc-1',
      });
    });
  });

  describe('shutdown', () => {
    it('should unsubscribe from events', async () => {
      await indexingService.initialize();
      await indexingService.shutdown();

      expect(mockEventBus.off).toHaveBeenCalledWith(
        'content.published',
        expect.any(Function)
      );
      expect(mockEventBus.off).toHaveBeenCalledWith(
        'content.updated',
        expect.any(Function)
      );
      expect(mockEventBus.off).toHaveBeenCalledWith(
        'content.unpublished',
        expect.any(Function)
      );
    });
  });
});
