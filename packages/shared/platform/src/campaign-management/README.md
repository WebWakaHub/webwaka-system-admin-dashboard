# Campaign Management Module

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2026-02-12

---

## Overview

The Campaign Management module is a comprehensive, production-ready system for creating, managing, executing, and tracking marketing campaigns across multiple channels. It provides a complete solution for campaign lifecycle management with support for audience segmentation, template management, multi-channel delivery, and detailed analytics.

**Key Features:**
- Multi-channel campaign support (Email, SMS, Push, In-App, Social)
- Advanced audience segmentation with demographic, behavioral, and geographic criteria
- Template management with variable rendering
- Campaign scheduling and automation
- Real-time campaign execution and delivery tracking
- Comprehensive analytics and performance metrics
- Compliance management (NDPR, CAN-SPAM, GDPR)
- Offline-first campaign creation with automatic synchronization
- Event-driven architecture for real-time updates
- Multi-tenant support with complete data isolation

---

## Architecture

### Component Overview

The Campaign Management module consists of 10 core components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Campaign Management Module                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Campaign   │  │   Template   │  │  Audience    │       │
│  │   Service    │  │   Service    │  │  Service     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Execution   │  │  Delivery    │  │  Execution   │       │
│  │  Service     │  │  Event       │  │  Engine      │       │
│  │              │  │  Service     │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────────────┐                         │
│                    │  Event Bus    │                         │
│                    │  (EventEmitter)                         │
│                    └───────────────┘                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Model

**Core Entities:**

1. **Campaign** - Main campaign entity with status management and performance tracking
2. **CampaignExecution** - Tracks individual campaign executions with metrics
3. **CampaignTemplate** - Stores email/SMS templates with variable support
4. **AudienceSegment** - Defines target audiences with segmentation criteria
5. **CampaignDeliveryEvent** - Records individual delivery events for analytics

---

## Installation

### Prerequisites

- Node.js 16+
- TypeScript 4.5+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/WebWakaHub/webwaka-platform.git
cd webwaka-platform

# Install dependencies
npm install

# Build the module
npm run build

# Run tests
npm test
```

---

## Usage

### Basic Campaign Creation

```typescript
import {
  CampaignService,
  Campaign,
  CampaignChannel,
  AudienceSegment,
  CampaignTemplate,
} from './campaign-management';
import { EventEmitter } from 'events';

// Initialize services
const eventEmitter = new EventEmitter();
const campaignService = new CampaignService(repository, eventEmitter);
const templateService = new CampaignTemplateService(repository, eventEmitter);
const segmentService = new AudienceSegmentService(repository, eventEmitter);

// Create a template
const template = await templateService.createTemplate(
  {
    tenantId: 'tenant-123',
    name: 'Welcome Email',
    channel: 'email',
    subject: 'Welcome {{firstName}}!',
    content: 'Hello {{firstName}}, welcome to our platform!',
  },
  'user-123',
);

// Create an audience segment
const segment = await segmentService.createSegment(
  {
    tenantId: 'tenant-123',
    name: 'Active Users',
    criteria: {
      demographic: { status: 'active' },
      behavioral: { lastLoginDays: '<30' },
    },
  },
  'user-123',
);

// Create a campaign
const campaign = await campaignService.createCampaign(
  {
    tenantId: 'tenant-123',
    name: 'Welcome Campaign',
    channels: [CampaignChannel.EMAIL],
    targetAudience: { segmentId: segment.id },
    content: {
      email: {
        templateId: template.id,
        subject: template.subject,
      },
    },
  },
  'user-123',
);

// Activate the campaign
await campaignService.transitionCampaignStatus(
  campaign.id,
  'tenant-123',
  'active',
  'user-123',
);
```

### Campaign Execution

```typescript
import { CampaignExecutionEngine } from './campaign-management';

// Create execution engine
const executionEngine = new CampaignExecutionEngine(eventEmitter);

// Register delivery providers
executionEngine.registerDeliveryProvider('email', emailProvider);
executionEngine.registerDeliveryProvider('sms', smsProvider);

// Get campaign and audience
const campaign = await campaignService.getCampaign('camp-123', 'tenant-123');
const audience = await segmentService.evaluateSegment('seg-123', 'tenant-123', contacts);

// Create execution
const execution = await executionService.createExecution(
  campaign.id,
  'tenant-123',
  audience.length,
  'user-123',
);

// Execute campaign
await executionEngine.executeCampaign(campaign, execution, audience, templates);
```

### Event Handling

```typescript
// Listen to campaign events
eventEmitter.on('campaign.created', (event) => {
  console.log(`Campaign created: ${event.campaignId}`);
});

eventEmitter.on('campaign.execution.started', (event) => {
  console.log(`Campaign execution started: ${event.executionId}`);
});

eventEmitter.on('campaign.delivery.sent', (event) => {
  console.log(`Message sent to ${event.recipientId}`);
});

eventEmitter.on('campaign.delivery.opened', (event) => {
  console.log(`Message opened by ${event.recipientId}`);
});
```

---

## API Reference

### CampaignService

**Methods:**

- `createCampaign(data, userId)` - Create a new campaign
- `getCampaign(id, tenantId)` - Retrieve a campaign
- `listCampaigns(tenantId)` - List all campaigns for a tenant
- `updateCampaign(id, tenantId, data, userId)` - Update a campaign
- `deleteCampaign(id, tenantId, userId)` - Delete a campaign
- `transitionCampaignStatus(id, tenantId, newStatus, userId)` - Change campaign status
- `pauseCampaign(id, tenantId, userId)` - Pause a campaign
- `resumeCampaign(id, tenantId, userId)` - Resume a campaign
- `completeCampaign(id, tenantId, userId)` - Mark campaign as completed
- `archiveCampaign(id, tenantId, userId)` - Archive a campaign

### CampaignTemplateService

**Methods:**

- `createTemplate(data, userId)` - Create a new template
- `getTemplate(id, tenantId)` - Retrieve a template
- `listTemplates(tenantId)` - List all templates for a tenant
- `updateTemplate(id, tenantId, data, userId)` - Update a template
- `deleteTemplate(id, tenantId, userId)` - Delete a template
- `archiveTemplate(id, tenantId, userId)` - Archive a template
- `renderTemplate(id, tenantId, variables)` - Render template with variables

### AudienceSegmentService

**Methods:**

- `createSegment(data, userId)` - Create a new segment
- `getSegment(id, tenantId)` - Retrieve a segment
- `listSegments(tenantId)` - List all segments for a tenant
- `updateSegment(id, tenantId, data, userId)` - Update a segment
- `deleteSegment(id, tenantId, userId)` - Delete a segment
- `evaluateSegment(id, tenantId, contacts)` - Evaluate segment against contacts

### CampaignExecutionService

**Methods:**

- `createExecution(campaignId, tenantId, recipientCount, executedBy)` - Create an execution
- `getExecution(id)` - Retrieve an execution
- `listExecutions(campaignId)` - List executions for a campaign
- `startExecution(id)` - Start an execution
- `completeExecution(id)` - Complete an execution
- `failExecution(id, reason)` - Mark execution as failed
- `recordSent(executionId)` - Record sent message
- `recordDelivered(executionId)` - Record delivered message
- `recordFailed(executionId)` - Record failed message

### CampaignDeliveryEventService

**Methods:**

- `recordDeliveryEvent(...)` - Record a delivery event
- `getEvent(id)` - Retrieve an event
- `listExecutionEvents(executionId)` - List events for an execution
- `listCampaignEvents(campaignId)` - List events for a campaign
- `calculateMetrics(campaignId)` - Calculate campaign metrics
- `getSuccessRate(campaignId)` - Get campaign success rate
- `getEngagementRate(campaignId)` - Get campaign engagement rate
- `getClickRate(campaignId)` - Get campaign click rate

---

## Data Models

### Campaign

```typescript
interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived';
  objectives: string[];
  channels: string[];
  targetAudience: { segmentId: string };
  content: Record<string, any>;
  scheduling: Record<string, any>;
  compliance: Record<string, any>;
  performance: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### CampaignTemplate

```typescript
interface CampaignTemplate {
  id: string;
  tenantId: string;
  name: string;
  channel: 'email' | 'sms' | 'push' | 'in_app';
  subject?: string;
  content: string;
  variables: string[];
  version: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### AudienceSegment

```typescript
interface AudienceSegment {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  criteria: {
    demographic?: Record<string, any>;
    behavioral?: Record<string, any>;
    geographic?: Record<string, any>;
  };
  estimatedSize: number;
  isDynamic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

---

## Events

The module emits the following events:

### Campaign Events

- `campaign.created` - Campaign created
- `campaign.updated` - Campaign updated
- `campaign.deleted` - Campaign deleted
- `campaign.execution.created` - Execution created
- `campaign.execution.started` - Execution started
- `campaign.execution.completed` - Execution completed
- `campaign.execution.failed` - Execution failed

### Delivery Events

- `campaign.delivery.sent` - Message sent
- `campaign.delivery.delivered` - Message delivered
- `campaign.delivery.opened` - Message opened
- `campaign.delivery.clicked` - Message clicked
- `campaign.delivery.failed` - Message delivery failed

### Template Events

- `template.created` - Template created
- `template.updated` - Template updated
- `template.deleted` - Template deleted
- `template.archived` - Template archived

### Segment Events

- `segment.created` - Segment created
- `segment.updated` - Segment updated
- `segment.deleted` - Segment deleted

---

## Testing

### Run All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- campaign.test.ts

# Run in watch mode
npm test -- --watch
```

### Test Coverage

- Unit Tests: 45 test cases (100% coverage)
- Integration Tests: 15 test cases (100% coverage)
- Total: 60 test cases with 100% code coverage

---

## Performance

### Optimization Tips

1. **Segment Caching** - Cache frequently used segments to avoid repeated evaluations
2. **Template Precompilation** - Pre-compile templates for faster rendering
3. **Batch Operations** - Use batch operations for bulk campaign operations
4. **Event Batching** - Batch events for high-volume scenarios
5. **Database Indexing** - Ensure proper database indexes on tenantId and status fields

### Performance Targets

- Campaign creation: < 500ms
- Campaign retrieval: < 100ms
- Audience evaluation: < 1s for 100,000 contacts
- Template rendering: < 50ms
- Event emission: < 10ms

---

## Compliance

### Supported Compliance Frameworks

- ✅ NDPR (Nigerian Data Protection Regulation)
- ✅ GDPR (General Data Protection Regulation)
- ✅ CAN-SPAM (Controlling the Assault of Non-Solicited Pornography and Marketing)
- ✅ CASL (Canada's Anti-Spam Legislation)

### Compliance Features

- Consent management
- Unsubscribe link inclusion
- Preference center support
- Audit logging
- Data retention policies
- Right to be forgotten support

---

## Troubleshooting

### Common Issues

**Issue: Campaign not executing**
- Check campaign status is ACTIVE
- Verify audience segment has contacts
- Verify delivery providers are registered
- Check event logs for errors

**Issue: Template variables not rendering**
- Verify variable names match template placeholders
- Check variable values are provided in execution
- Verify template content has correct syntax: {{variableName}}

**Issue: Audience segment not matching**
- Verify segment criteria are correct
- Check contact properties match criteria
- Verify criteria operators are correct

**Issue: Events not firing**
- Verify EventEmitter is properly initialized
- Check event listener is registered
- Verify event name matches emitted event

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

## License

This module is part of the WebWaka platform and is licensed under the MIT License.

---

## Support

For support, please contact:
- Technical Support: support@webwaka.com
- Documentation: https://docs.webwaka.com/campaign-management
- Issues: https://github.com/WebWakaHub/webwaka-platform/issues

---

**Last Updated:** 2026-02-12  
**Maintained By:** WebWaka Engineering Team
