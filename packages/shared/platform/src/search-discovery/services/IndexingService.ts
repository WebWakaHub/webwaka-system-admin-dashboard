/**
 * Indexing Service for the Search & Discovery Engine
 * Handles adding, updating, and removing documents from the search index
 */

import { MeiliSearch, Index } from 'meilisearch';
import type {
  SearchDocument,
  ContentPublishedEvent,
  ContentUnpublishedEvent,
} from '../types';
import { IndexingError } from '../errors';

export class IndexingService {
  private client: MeiliSearch;
  private index!: Index;
  private eventBus: any;

  constructor(
    meiliSearchHost: string,
    meiliSearchApiKey: string,
    eventBus: any
  ) {
    this.client = new MeiliSearch({
      host: meiliSearchHost,
      apiKey: meiliSearchApiKey,
    });
    this.eventBus = eventBus;
  }

  /**
   * Initialize the indexing service
   */
  async initialize(): Promise<void> {
    try {
      // Create or get the 'content' index
      this.index = this.client.index('content');

      // Configure searchable attributes
      await this.index.updateSearchableAttributes([
        'title',
        'content',
        'author',
        'tags',
      ]);

      // Configure filterable attributes
      await this.index.updateFilterableAttributes([
        'tenantId',
        'contentType',
        'createdAt',
      ]);

      // Configure sortable attributes
      await this.index.updateSortableAttributes(['createdAt', 'updatedAt']);

      // Subscribe to content events
      this.eventBus.on('content.published', this.handleContentPublished.bind(this));
      this.eventBus.on('content.updated', this.handleContentPublished.bind(this));
      this.eventBus.on('content.unpublished', this.handleContentUnpublished.bind(this));
    } catch (error: any) {
      throw new IndexingError(`Failed to initialize indexing service: ${error.message}`);
    }
  }

  /**
   * Handle content published event
   */
  private async handleContentPublished(event: ContentPublishedEvent): Promise<void> {
    try {
      const document: SearchDocument = {
        id: event.id,
        tenantId: event.tenantId,
        contentType: event.contentType,
        title: event.fields.title || '',
        content: event.fields.content || '',
        author: event.fields.author || '',
        tags: event.fields.tags || [],
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };

      await this.addDocument(document);
    } catch (error: any) {
      console.error(`Failed to index content ${event.id}:`, error);
    }
  }

  /**
   * Handle content unpublished event
   */
  private async handleContentUnpublished(event: ContentUnpublishedEvent): Promise<void> {
    try {
      await this.removeDocument(event.id);
    } catch (error: any) {
      console.error(`Failed to remove content ${event.id} from index:`, error);
    }
  }

  /**
   * Add a document to the search index
   */
  async addDocument(document: SearchDocument): Promise<void> {
    try {
      await this.index.addDocuments([document]);
      this.eventBus.emit('search.document.indexed', { documentId: document.id });
    } catch (error: any) {
      throw new IndexingError(`Failed to add document: ${error.message}`);
    }
  }

  /**
   * Remove a document from the search index
   */
  async removeDocument(documentId: string): Promise<void> {
    try {
      await this.index.deleteDocument(documentId);
      this.eventBus.emit('search.document.removed', { documentId });
    } catch (error: any) {
      throw new IndexingError(`Failed to remove document: ${error.message}`);
    }
  }

  /**
   * Shutdown the indexing service
   */
  async shutdown(): Promise<void> {
    // Unsubscribe from events
    this.eventBus.off('content.published', this.handleContentPublished);
    this.eventBus.off('content.updated', this.handleContentPublished);
    this.eventBus.off('content.unpublished', this.handleContentUnpublished);
  }
}
