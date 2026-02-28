import { Member } from '../models/Member';

/**
 * MemberEventPublisher
 * Publishes CloudEvents for member-related actions.
 * Events are published to RabbitMQ/NATS for consumption by other modules.
 */
export class MemberEventPublisher {
  constructor(private eventBus: any) {} // EventBus from event-system module

  /**
   * Publish member.created event
   */
  async publishMemberCreated(tenantId: string, member: Member): Promise<void> {
    const event = {
      specversion: '1.0',
      type: 'com.webwaka.member.created',
      source: '/member-management',
      id: `${member.id}-created-${Date.now()}`,
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data: {
        tenantId,
        memberId: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        email: member.email,
        status: member.status,
        createdAt: member.createdAt,
      },
    };

    await this.eventBus.publish('member.created', event);
  }

  /**
   * Publish member.updated event
   */
  async publishMemberUpdated(tenantId: string, member: Member): Promise<void> {
    const event = {
      specversion: '1.0',
      type: 'com.webwaka.member.updated',
      source: '/member-management',
      id: `${member.id}-updated-${Date.now()}`,
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data: {
        tenantId,
        memberId: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone,
        email: member.email,
        status: member.status,
        updatedAt: member.updatedAt,
      },
    };

    await this.eventBus.publish('member.updated', event);
  }

  /**
   * Publish member.deleted event
   */
  async publishMemberDeleted(tenantId: string, member: Member): Promise<void> {
    const event = {
      specversion: '1.0',
      type: 'com.webwaka.member.deleted',
      source: '/member-management',
      id: `${member.id}-deleted-${Date.now()}`,
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data: {
        tenantId,
        memberId: member.id,
        deletedAt: new Date().toISOString(),
      },
    };

    await this.eventBus.publish('member.deleted', event);
  }

  /**
   * Publish member.status.changed event
   */
  async publishMemberStatusChanged(
    tenantId: string,
    member: Member,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const event = {
      specversion: '1.0',
      type: 'com.webwaka.member.status.changed',
      source: '/member-management',
      id: `${member.id}-status-changed-${Date.now()}`,
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data: {
        tenantId,
        memberId: member.id,
        oldStatus,
        newStatus,
        changedAt: new Date().toISOString(),
      },
    };

    await this.eventBus.publish('member.status.changed', event);
  }

  /**
   * Publish family.updated event
   */
  async publishFamilyUpdated(tenantId: string, familyId: string): Promise<void> {
    const event = {
      specversion: '1.0',
      type: 'com.webwaka.family.updated',
      source: '/member-management',
      id: `${familyId}-updated-${Date.now()}`,
      time: new Date().toISOString(),
      datacontenttype: 'application/json',
      data: {
        tenantId,
        familyId,
        updatedAt: new Date().toISOString(),
      },
    };

    await this.eventBus.publish('family.updated', event);
  }
}
