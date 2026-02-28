# Search & Discovery Engine

The Search & Discovery Engine provides a unified, fast, and relevant search experience across all WebWaka platform content. It is built on top of **MeiliSearch** for high performance and scalability.

## Features

- **Full-Text Search:** Search across all indexed content with relevance ranking.
- **Filtering:** Filter results by content type, date, and other attributes.
- **Faceting:** Get facet distributions for advanced filtering.
- **Multi-Tenant:** All search results are isolated by tenant.
- **Event-Driven:** Automatically indexes content when published via the Event Bus.
- **Fast:** Search API response time < 150ms for 95th percentile.

## Architecture

The Search & Discovery Engine consists of two main services:

1. **IndexingService:** Listens to `content.published` and `content.unpublished` events and updates the MeiliSearch index accordingly.
2. **SearchService:** Provides a public API for querying the search index.

## Usage

### Initialize the Engine

```typescript
import { SearchDiscovery } from './search-discovery';

const searchEngine = new SearchDiscovery({
  database: db,
  eventBus: eventBus,
  meiliSearchHost: 'http://localhost:7700',
  meiliSearchApiKey: 'masterKey',
});

await searchEngine.initialize();
```

### Search for Content

```typescript
const results = await searchEngine.searchContent('tenant-1', {
  query: 'blog post',
  filter: 'contentType:blog',
  page: 1,
  limit: 20,
});

console.log(results.hits);
```

### Get Search Suggestions

```typescript
const suggestions = await searchEngine.getSuggestions('tenant-1', 'blog', 5);
console.log(suggestions); // ['Blog Post 1', 'Blog Post 2', ...]
```

## API Endpoints

### `GET /search`

Search for content across the platform.

**Query Parameters:**
- `query` (string, required): The search term.
- `filter` (string, optional): A filter expression (e.g., `contentType:blog`).
- `facets` (string, optional): Comma-separated list of fields to facet on.
- `page` (number, optional): The page number for pagination.
- `limit` (number, optional): The number of results per page.

**Response:**
```json
{
  "hits": [...],
  "nbHits": 42,
  "page": 1,
  "limit": 20,
  "processingTimeMs": 25,
  "query": "blog post"
}
```

## Events

### Emitted Events

- `search.document.indexed`: Emitted when a document is successfully indexed.
- `search.document.removed`: Emitted when a document is removed from the index.

### Subscribed Events

- `content.published`: Triggers indexing of new content.
- `content.updated`: Triggers re-indexing of updated content.
- `content.unpublished`: Triggers removal of content from the index.

## Dependencies

- **MeiliSearch:** The underlying search engine.
- **Headless CMS:** Provides the content to be indexed.
- **Event Bus:** Used for event-driven indexing.

## Testing

Run unit tests:
```bash
npm test -- src/search-discovery/__tests__/
```

## License

Proprietary - WebWaka Platform
