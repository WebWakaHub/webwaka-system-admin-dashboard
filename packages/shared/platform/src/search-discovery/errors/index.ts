/**
 * Custom error classes for the Search & Discovery Engine
 */

/**
 * Base error class for Search & Discovery Engine errors
 */
export class SearchDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchDiscoveryError';
  }
}

/**
 * Error thrown when indexing fails
 */
export class IndexingError extends SearchDiscoveryError {
  constructor(message: string) {
    super(message);
    this.name = 'IndexingError';
  }
}

/**
 * Error thrown when search fails
 */
export class SearchError extends SearchDiscoveryError {
  constructor(message: string) {
    super(message);
    this.name = 'SearchError';
  }
}

/**
 * Error thrown when document is not found
 */
export class DocumentNotFoundError extends SearchDiscoveryError {
  constructor(documentId: string) {
    super(`Document not found: ${documentId}`);
    this.name = 'DocumentNotFoundError';
  }
}
