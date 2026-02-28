import { AudienceSegment } from '../models/audience-segment';
import { EventEmitter } from 'events';

export interface IAudienceSegmentRepository {
  create(segment: AudienceSegment): Promise<AudienceSegment>;
  findById(id: string, tenantId: string): Promise<AudienceSegment | null>;
  findByTenant(tenantId: string): Promise<AudienceSegment[]>;
  update(segment: AudienceSegment): Promise<AudienceSegment>;
  delete(id: string, tenantId: string): Promise<boolean>;
}

export class AudienceSegmentService {
  private repository: IAudienceSegmentRepository;
  private eventEmitter: EventEmitter;

  constructor(repository: IAudienceSegmentRepository, eventEmitter: EventEmitter) {
    this.repository = repository;
    this.eventEmitter = eventEmitter;
  }

  async createSegment(data: Partial<AudienceSegment>, userId: string): Promise<AudienceSegment> {
    const segment = new AudienceSegment({
      ...data,
      createdBy: userId,
    });

    const errors = segment.validate();
    if (errors.length > 0) {
      throw new Error(`Segment validation failed: ${errors.join(', ')}`);
    }

    const created = await this.repository.create(segment);
    this.eventEmitter.emit('segment.created', {
      segmentId: created.id,
      tenantId: created.tenantId,
      name: created.name,
      estimatedSize: created.estimatedSize,
    });

    return created;
  }

  async getSegment(id: string, tenantId: string): Promise<AudienceSegment> {
    const segment = await this.repository.findById(id, tenantId);
    if (!segment) {
      throw new Error(`Segment not found: ${id}`);
    }
    return segment;
  }

  async listSegments(tenantId: string): Promise<AudienceSegment[]> {
    return this.repository.findByTenant(tenantId);
  }

  async updateSegment(id: string, tenantId: string, data: Partial<AudienceSegment>, userId: string): Promise<AudienceSegment> {
    const segment = await this.getSegment(id, tenantId);

    const updated = new AudienceSegment({
      ...segment,
      ...data,
      updatedAt: new Date(),
    });

    const errors = updated.validate();
    if (errors.length > 0) {
      throw new Error(`Segment validation failed: ${errors.join(', ')}`);
    }

    const result = await this.repository.update(updated);
    this.eventEmitter.emit('segment.updated', {
      segmentId: result.id,
      tenantId: result.tenantId,
      estimatedSize: result.estimatedSize,
    });

    return result;
  }

  async deleteSegment(id: string, tenantId: string, userId: string): Promise<void> {
    const deleted = await this.repository.delete(id, tenantId);
    if (!deleted) {
      throw new Error(`Failed to delete segment: ${id}`);
    }

    this.eventEmitter.emit('segment.deleted', {
      segmentId: id,
      tenantId: tenantId,
    });
  }

  async evaluateSegment(id: string, tenantId: string, contacts: Record<string, any>[]): Promise<Record<string, any>[]> {
    const segment = await this.getSegment(id, tenantId);
    return contacts.filter((contact) => segment.matchesCriteria(contact));
  }
}
