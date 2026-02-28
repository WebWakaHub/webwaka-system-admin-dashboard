# Communication Tools Module

**Module:** Church Suite Module 4 - Communication Tools  
**Author:** webwakaagent4 (Engineering & Delivery)  
**Date:** 2026-02-14  
**Version:** 1.0

---

## Overview

The Communication Tools module provides comprehensive communication capabilities for churches, including SMS (Termii), email, push notifications, and in-app messaging with broadcast, group messaging, scheduling, and analytics.

---

## Features

### Core Features
- **SMS Messaging** - Via Termii (Nigerian gateway)
- **Email Messaging** - With templates and personalization
- **Push Notifications** - Via Firebase Cloud Messaging (FCM)
- **In-App Messaging** - Direct member communication
- **Broadcast Messaging** - Send to all members or filtered groups
- **Group Messaging** - Targeted communication to specific groups
- **Message Scheduling** - Schedule messages for future delivery
- **Message Templates** - Reusable templates with variables
- **Delivery Tracking** - Real-time delivery status and analytics
- **Unsubscribe Management** - Member communication preferences

---

## Architecture

### Models (6)

1. **Message** - Core message entity
2. **MessageRecipient** - Recipient tracking
3. **MessageTemplate** - Reusable templates
4. **MessageGroup** - Target groups
5. **UnsubscribePreference** - Communication preferences
6. **MessageAuditLog** - Audit trail

### Services (4)

1. **MessageService** - Message creation and sending
2. **TemplateService** - Template management
3. **GroupService** - Group management
4. **AnalyticsService** - Messaging analytics

### Controllers (4)

1. **MessageController** - Message API endpoints
2. **TemplateController** - Template API endpoints
3. **GroupController** - Group API endpoints
4. **AnalyticsController** - Analytics API endpoints

---

## API Endpoints (20)

### Messages (9 endpoints)
- POST `/api/v1/messages` - Create and send message
- GET `/api/v1/messages/:id` - Get message by ID
- PUT `/api/v1/messages/:id` - Update message (scheduled only)
- DELETE `/api/v1/messages/:id` - Delete message (scheduled only)
- GET `/api/v1/messages/search` - Search messages
- POST `/api/v1/messages/:id/schedule` - Schedule message
- POST `/api/v1/messages/:id/cancel` - Cancel scheduled message
- GET `/api/v1/messages/:id/recipients` - Get recipients
- GET `/api/v1/messages/:id/analytics` - Get analytics

### Templates (5 endpoints)
- POST `/api/v1/message-templates` - Create template
- GET `/api/v1/message-templates/:id` - Get template
- PUT `/api/v1/message-templates/:id` - Update template
- DELETE `/api/v1/message-templates/:id` - Delete template
- GET `/api/v1/message-templates/search` - Search templates

### Groups (4 endpoints)
- POST `/api/v1/message-groups` - Create group
- GET `/api/v1/message-groups/:id` - Get group
- PUT `/api/v1/message-groups/:id` - Update group
- DELETE `/api/v1/message-groups/:id` - Delete group

### Analytics (2 endpoints)
- POST `/api/v1/unsubscribe` - Unsubscribe from channel
- GET `/api/v1/messages/statistics` - Get statistics

---

## SMS Integration (Termii)

### Features
- Send SMS to Nigerian phone numbers (+234)
- Delivery reports via webhooks
- SMS balance tracking
- Sender ID customization
- Unicode support for local languages

### Configuration
```typescript
TERMII_API_KEY=your_api_key
TERMII_SENDER_ID=YourChurch
TERMII_API_URL=https://api.ng.termii.com/api
```

---

## Email Integration

### Features
- HTML email templates
- Personalization with variables
- Attachment support
- Delivery tracking
- Bounce handling

---

## Push Notifications (FCM)

### Features
- Android and iOS support
- Rich notifications
- Silent notifications
- Topic-based messaging
- Device token management

---

## Usage Examples

### Send Broadcast SMS
```typescript
const message = await messageService.createMessage(churchId, userId, {
  subject: 'Sunday Service Reminder',
  body: 'Join us this Sunday at 10am for worship!',
  messageType: MessageType.BROADCAST,
  channel: MessageChannel.SMS,
  recipientFilter: { all: true },
});

await messageService.sendMessage(message.messageId);
```

### Schedule Email
```typescript
const message = await messageService.createMessage(churchId, userId, {
  subject: 'Weekly Newsletter',
  body: templateBody,
  messageType: MessageType.BROADCAST,
  channel: MessageChannel.EMAIL,
  recipientFilter: { all: true },
  scheduledAt: new Date('2026-02-16T10:00:00Z'),
});
```

### Create Template
```typescript
const template = await templateService.createTemplate(churchId, {
  name: 'Event Reminder',
  subject: 'Reminder: {{eventName}}',
  body: 'Hi {{memberName}}, reminder that {{eventName}} starts at {{eventTime}}.',
  channel: MessageChannel.SMS,
  variables: ['eventName', 'memberName', 'eventTime'],
  category: 'events',
});
```

---

## Compliance

### Nigerian-First ✅
- Termii integration (Nigerian SMS gateway)
- Support for Nigerian phone numbers (+234)
- Local language support (Unicode)

### Mobile-First ✅
- Push notifications
- SMS delivery
- Mobile-optimized templates

### PWA-First ✅
- In-app messaging
- Offline message queue
- Background sync

### NDPR Compliance ✅
- Unsubscribe management
- Communication preferences
- Audit trail
- Data privacy controls

---

## Testing

Unit tests and integration tests are located in `__tests__/` directory.

Run tests:
```bash
npm test src/communication-tools
```

---

## License

Proprietary - WebWaka Platform
