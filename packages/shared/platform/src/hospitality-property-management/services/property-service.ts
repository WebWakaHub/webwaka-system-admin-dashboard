/**
 * Property Management - Property Service
 * 
 * Business logic for property management operations.
 * 
 * @module hospitality-property-management/services/property-service
 * @author webwakaagent4
 */

import { eq, and, like, desc } from 'drizzle-orm';
import { properties } from '../database/schema';
import { 
  CreatePropertyDTO, 
  UpdatePropertyDTO, 
  Property, 
  PropertyStatus 
} from '../types';
import { EventPublisher } from '../events/event-publisher';

export class PropertyService {
  private db: any; // Drizzle DB instance
  private eventPublisher: EventPublisher;

  constructor(db: any, eventPublisher: EventPublisher) {
    this.db = db;
    this.eventPublisher = eventPublisher;
  }

  /**
   * Create a new property
   */
  async createProperty(
    tenantId: string,
    dto: CreatePropertyDTO
  ): Promise<Property> {
    // Validate input
    this.validatePropertyInput(dto);

    // Check for duplicate name within tenant
    const existing = await this.db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.tenantId, tenantId),
          eq(properties.name, dto.name)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Property with name "${dto.name}" already exists`);
    }

    // Create property
    const [property] = await this.db
      .insert(properties)
      .values({
        tenantId,
        ...dto,
        status: PropertyStatus.INACTIVE,
      })
      .returning();

    // Publish event
    await this.eventPublisher.publish({
      type: 'property.created',
      version: '1.0.0',
      timestamp: new Date(),
      data: {
        propertyId: property.id,
        tenantId,
        name: property.name,
        type: property.type,
      },
    });

    return property;
  }

  /**
   * Get property by ID
   */
  async getProperty(tenantId: string, propertyId: string): Promise<Property> {
    const [property] = await this.db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    return property;
  }

  /**
   * List properties with pagination and filtering
   */
  async listProperties(
    tenantId: string,
    options: {
      page?: number;
      limit?: number;
      status?: PropertyStatus;
      type?: string;
      search?: string;
    } = {}
  ): Promise<{ properties: Property[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [eq(properties.tenantId, tenantId)];

    if (options.status) {
      conditions.push(eq(properties.status, options.status));
    }

    if (options.type) {
      conditions.push(eq(properties.type, options.type));
    }

    if (options.search) {
      conditions.push(like(properties.name, `%${options.search}%`));
    }

    // Get properties
    const results = await this.db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await this.db
      .select({ count: properties.id })
      .from(properties)
      .where(and(...conditions));

    return {
      properties: results,
      total: Number(count),
    };
  }

  /**
   * Update property
   */
  async updateProperty(
    tenantId: string,
    propertyId: string,
    dto: UpdatePropertyDTO
  ): Promise<Property> {
    // Get existing property
    const existing = await this.getProperty(tenantId, propertyId);

    // Check for name conflict if name is being updated
    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.db
        .select()
        .from(properties)
        .where(
          and(
            eq(properties.tenantId, tenantId),
            eq(properties.name, dto.name)
          )
        )
        .limit(1);

      if (conflict.length > 0) {
        throw new Error(`Property with name "${dto.name}" already exists`);
      }
    }

    // Update property
    const [updated] = await this.db
      .update(properties)
      .set({
        ...dto,
        updatedAt: new Date(),
        version: existing.version + 1,
      })
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.tenantId, tenantId),
          eq(properties.version, existing.version) // Optimistic locking
        )
      )
      .returning();

    if (!updated) {
      throw new Error('Property was modified by another user. Please refresh and try again.');
    }

    // Publish event
    await this.eventPublisher.publish({
      type: 'property.updated',
      version: '1.0.0',
      timestamp: new Date(),
      data: {
        propertyId: updated.id,
        tenantId,
        changes: dto,
      },
    });

    return updated;
  }

  /**
   * Delete property (soft delete)
   */
  async deleteProperty(tenantId: string, propertyId: string): Promise<void> {
    // Get existing property
    await this.getProperty(tenantId, propertyId);

    // Soft delete (archive)
    await this.db
      .update(properties)
      .set({
        status: PropertyStatus.ARCHIVED,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(properties.id, propertyId),
          eq(properties.tenantId, tenantId)
        )
      );

    // Publish event
    await this.eventPublisher.publish({
      type: 'property.deleted',
      version: '1.0.0',
      timestamp: new Date(),
      data: {
        propertyId,
        tenantId,
      },
    });
  }

  /**
   * Activate property
   */
  async activateProperty(tenantId: string, propertyId: string): Promise<Property> {
    // Validate property has at least one active room type
    // (This would require RoomTypeService integration)

    const updated = await this.updateProperty(tenantId, propertyId, {
      status: PropertyStatus.ACTIVE,
    });

    // Publish event
    await this.eventPublisher.publish({
      type: 'property.activated',
      version: '1.0.0',
      timestamp: new Date(),
      data: {
        propertyId,
        tenantId,
      },
    });

    return updated;
  }

  /**
   * Deactivate property
   */
  async deactivateProperty(tenantId: string, propertyId: string): Promise<Property> {
    const updated = await this.updateProperty(tenantId, propertyId, {
      status: PropertyStatus.INACTIVE,
    });

    // Publish event
    await this.eventPublisher.publish({
      type: 'property.deactivated',
      version: '1.0.0',
      timestamp: new Date(),
      data: {
        propertyId,
        tenantId,
      },
    });

    return updated;
  }

  /**
   * Validate property input
   */
  private validatePropertyInput(dto: CreatePropertyDTO | UpdatePropertyDTO): void {
    if ('name' in dto && dto.name) {
      if (dto.name.length < 3 || dto.name.length > 255) {
        throw new Error('Property name must be between 3 and 255 characters');
      }
    }

    if ('contact' in dto && dto.contact) {
      if (!dto.contact.phone.startsWith('+234')) {
        throw new Error('Phone number must be in Nigerian format (+234)');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.contact.email)) {
        throw new Error('Invalid email address');
      }
    }

    if ('address' in dto && dto.address) {
      if (!dto.address.state || !dto.address.lga) {
        throw new Error('Nigerian state and LGA are required');
      }
    }
  }
}
