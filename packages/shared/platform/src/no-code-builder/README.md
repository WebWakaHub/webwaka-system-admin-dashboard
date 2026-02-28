# No-Code/Low-Code Builder Module

A visual, drag-and-drop application builder that empowers non-technical users to create and deploy web applications without writing code.

## Overview

The No-Code/Low-Code Builder module enables users to create data-driven web applications using a visual interface. Users can drag and drop pre-built components, connect them to data from the Headless CMS, define simple interactions, and deploy their applications to a public URL with a single click.

## Features

- **Visual Canvas:** Drag-and-drop interface for arranging UI components
- **Component Library:** Pre-built, responsive components (Text, Image, Button, Form, Input, Container, Repeater)
- **Data Binding:** Connect components to content from the Headless CMS
- **Event-Based Logic:** Define simple client-side interactions (click, submit, navigate, alert)
- **One-Click Deployment:** Deploy applications to a public URL instantly
- **Multi-Tenant:** Strict data isolation between tenants
- **Event-Driven:** Emits events for all application operations

## Architecture

The module consists of three main services:

1.  **ApplicationService:** Manages application definitions (CRUD operations)
2.  **DeploymentService:** Handles the deployment of applications to a public URL
3.  **ComponentRenderer:** Renders applications based on their JSON definitions

## API Endpoints

### Application Management

- `POST /api/v1/builder/apps` - Create a new application
- `GET /api/v1/builder/apps` - List all applications
- `GET /api/v1/builder/apps/:appId` - Get a specific application
- `PUT /api/v1/builder/apps/:appId` - Update an application
- `DELETE /api/v1/builder/apps/:appId` - Delete an application

### Deployment

- `POST /api/v1/builder/apps/:appId/deploy` - Deploy an application
- `POST /api/v1/builder/apps/:appId/undeploy` - Undeploy an application

## Usage Example

```typescript
import { NoCodeBuilder } from './no-code-builder';

// Initialize the module
const builder = new NoCodeBuilder({
  database: databaseConnection,
  eventBus: eventBusInstance,
  permissionSystem: weegInstance,
  deploymentProvider: deploymentProviderInstance,
});

await builder.initialize();

// Create an application
const app = await builder.getApplicationService().createApplication(
  tenantId,
  userId,
  {
    name: 'My First App',
    description: 'A simple application',
  }
);

// Update the application with pages and components
await builder.getApplicationService().updateApplication(
  tenantId,
  userId,
  app.id,
  {
    pages: [
      {
        id: 'page-1',
        name: 'Home',
        path: '/',
        components: [
          {
            id: 'text-1',
            type: 'text',
            properties: {
              content: 'Welcome to my app!',
              style: { fontSize: '24px', fontWeight: 'bold' },
            },
          },
        ],
      },
    ],
  }
);

// Deploy the application
const publicUrl = await builder.getDeploymentService().deployApplication(
  tenantId,
  userId,
  app.id
);

console.log(`Application deployed at: ${publicUrl}`);
```

## Events

The module emits the following events:

- `builder.app.created` - When an application is created
- `builder.app.updated` - When an application is updated
- `builder.app.deleted` - When an application is deleted
- `builder.app.deployed` - When an application is deployed
- `builder.app.undeployed` - When an application is undeployed

## Database Schema

**builder_apps table:**
- `id` (UUID, primary key)
- `tenant_id` (UUID, not null)
- `created_by` (UUID, not null)
- `name` (VARCHAR, not null)
- `description` (TEXT)
- `definition` (JSONB, not null)
- `deployment_status` (VARCHAR, default 'draft')
- `public_url` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Permissions

The module requires the following permissions:

- `builder.app.create` - Create applications
- `builder.app.update` - Update applications
- `builder.app.delete` - Delete applications
- `builder.app.deploy` - Deploy/undeploy applications

## Testing

Unit tests and integration tests are located in the `__tests__` directory. Run tests with:

```bash
npm test
```

## License

PROPRIETARY - All Rights Reserved
