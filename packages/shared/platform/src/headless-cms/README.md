# Headless CMS Module

A decoupled content management system that provides content modeling, content management, and content delivery via RESTful APIs.

## Overview

The Headless CMS module enables users to create custom content models, manage content entries, and deliver content to front-end applications through a high-performance API. It is designed to be flexible, scalable, and multi-tenant.

## Features

- **Content Modeling:** Define custom content types with flexible field definitions
- **Content Management:** Create, read, update, delete, publish, and archive content entries
- **Content Delivery:** High-performance read-only API for delivering published content
- **Multi-Tenant:** Strict data isolation between tenants
- **Event-Driven:** Emits events for all content operations
- **Permission-Based:** Integrates with WEEG for fine-grained access control
- **Versioning:** Track content versions and history
- **Search:** Full-text search across all content

## Architecture

The module follows a service-oriented architecture with three main services:

1. **ContentModelService:** Manages content models (content type definitions)
2. **ContentEntryService:** Manages content entries (actual content data)
3. **ContentDeliveryService:** Provides public read-only API for content delivery

## API Endpoints

### Content Management API (Protected)

**Content Models:**
- `POST /api/v1/cms/models` - Create a content model
- `GET /api/v1/cms/models` - List all content models
- `GET /api/v1/cms/models/:modelId` - Get a content model by ID
- `PUT /api/v1/cms/models/:modelId` - Update a content model
- `DELETE /api/v1/cms/models/:modelId` - Delete a content model

**Content Entries:**
- `POST /api/v1/cms/models/:modelId/entries` - Create a content entry
- `GET /api/v1/cms/models/:modelId/entries` - Query content entries
- `GET /api/v1/cms/entries/:entryId` - Get a content entry by ID
- `PUT /api/v1/cms/entries/:entryId` - Update a content entry
- `POST /api/v1/cms/entries/:entryId/publish` - Publish a content entry
- `POST /api/v1/cms/entries/:entryId/archive` - Archive a content entry
- `DELETE /api/v1/cms/entries/:entryId` - Delete a content entry

### Content Delivery API (Public)

- `GET /api/v1/content/:modelPluralName` - Get published content by model
- `GET /api/v1/content/entry/:entryId` - Get a single published entry
- `GET /api/v1/content/search?q=term` - Search published content

## Usage Example

```typescript
import { HeadlessCMS } from './headless-cms';

// Initialize the module
const cms = new HeadlessCMS({
  eventBus: eventBusInstance,
  database: databaseConnection,
  permissionSystem: weegInstance,
});

await cms.initialize();

// Create a content model
const model = await cms.getModelService().createModel(
  tenantId,
  userId,
  {
    name: 'blog_post',
    pluralName: 'blog_posts',
    description: 'Blog post content type',
    fields: [
      {
        id: 'title',
        name: 'title',
        type: FieldType.TEXT,
        required: true,
      },
      {
        id: 'body',
        name: 'body',
        type: FieldType.RICH_TEXT,
        required: true,
      },
    ],
  }
);

// Create a content entry
const entry = await cms.getEntryService().createEntry(
  tenantId,
  userId,
  model.id,
  {
    title: 'My First Blog Post',
    body: '<p>This is the content of my blog post.</p>',
  }
);

// Publish the entry
await cms.getEntryService().publishEntry(tenantId, userId, entry.id);

// Retrieve published content
const content = await cms.getDeliveryService().getContentByModel(
  tenantId,
  'blog_posts',
  { limit: 10 }
);
```

## Events

The module emits the following events:

- `content.model.created` - When a content model is created
- `content.model.updated` - When a content model is updated
- `content.model.deleted` - When a content model is deleted
- `content.entry.created` - When a content entry is created
- `content.entry.updated` - When a content entry is updated
- `content.entry.deleted` - When a content entry is deleted
- `content.entry.published` - When a content entry is published
- `content.entry.archived` - When a content entry is archived

## Database Schema

**content_models table:**
- `id` (UUID, primary key)
- `tenant_id` (UUID, not null)
- `name` (VARCHAR, not null)
- `plural_name` (VARCHAR, not null)
- `description` (TEXT)
- `fields` (JSONB, not null)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `created_by` (UUID, not null)
- `updated_by` (UUID, not null)

**content_entries table:**
- `id` (UUID, primary key)
- `tenant_id` (UUID, not null)
- `model_id` (UUID, foreign key to content_models)
- `data` (JSONB, not null)
- `status` (VARCHAR, default 'draft')
- `version` (INTEGER, default 1)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `published_at` (TIMESTAMP)
- `created_by` (UUID, not null)
- `updated_by` (UUID, not null)

## Permissions

The module requires the following permissions:

- `content.model.create` - Create content models
- `content.model.update` - Update content models
- `content.model.delete` - Delete content models
- `content.entry.create` - Create content entries
- `content.entry.update` - Update content entries
- `content.entry.delete` - Delete content entries
- `content.entry.publish` - Publish content entries
- `content.entry.archive` - Archive content entries

## Testing

Unit tests and integration tests are located in the `__tests__` directory. Run tests with:

```bash
npm test
```

## License

PROPRIETARY - All Rights Reserved
