# Website Builder Module

## Overview
The Website Builder module is a specialized component of the Sites & Funnels Suite, designed for creating high-converting marketing websites, landing pages, and sales funnels with advanced A/B testing and analytics capabilities.

## Features
- Drag-and-drop page builder with pre-built components
- Template library for quick page creation
- A/B testing for conversion optimization
- Real-time analytics and conversion tracking
- SEO management tools
- Event-driven architecture for seamless integration

## Installation
```typescript
import { WebsiteBuilderService } from './sites-funnels-website-builder';

const websiteBuilder = new WebsiteBuilderService();
```

## Usage

### Create a New Page
```typescript
const page = await websiteBuilder.createPage('tenant-123', 'My Landing Page');
```

### Update Page Content
```typescript
await websiteBuilder.updatePageContent(page.id, {
  components: [
    {
      id: 'hero-1',
      type: 'hero',
      properties: {
        heading: 'Welcome to Our Product',
        ctaText: 'Get Started'
      }
    }
  ],
  styles: {},
  scripts: []
});
```

### Publish a Page
```typescript
await websiteBuilder.publishPage(page.id);
```

### Create an A/B Test
```typescript
const abTest = await websiteBuilder.createABTest(
  'tenant-123',
  page.id,
  [
    { id: 'var-1', name: 'Control', content: originalContent },
    { id: 'var-2', name: 'Variant A', content: variantContent }
  ],
  { 'var-1': 50, 'var-2': 50 }
);
```

### Track Analytics
```typescript
await websiteBuilder.recordPageView(page.id, 'tenant-123', { variationId: 'var-1' });
await websiteBuilder.recordConversion(page.id, 'tenant-123', { variationId: 'var-1' });
```

## Architecture
The Website Builder follows the WebWaka platform's architectural invariants:
- **Plugin-First**: Implemented as a plugin to the core platform
- **Event-Driven**: All state changes emit events to the Event Bus
- **Multi-Tenant**: All data is tenant-scoped
- **Offline-First**: Supports offline editing and publishing
