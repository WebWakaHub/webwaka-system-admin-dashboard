import { v4 as uuidv4 } from 'uuid';

export interface SegmentCriteria {
  demographic?: Record<string, any>;
  behavioral?: Record<string, any>;
  geographic?: Record<string, any>;
}

export class AudienceSegment {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  criteria: SegmentCriteria;
  estimatedSize: number;
  isDynamic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  constructor(data: Partial<AudienceSegment>) {
    this.id = data.id || uuidv4();
    this.tenantId = data.tenantId || '';
    this.name = data.name || '';
    this.description = data.description;
    this.criteria = data.criteria || {};
    this.estimatedSize = data.estimatedSize || 0;
    this.isDynamic = data.isDynamic || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.createdBy = data.createdBy || '';
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Segment name is required');
    }

    if (Object.keys(this.criteria).length === 0) {
      errors.push('At least one segmentation criterion is required');
    }

    return errors;
  }

  matchesCriteria(contact: Record<string, any>): boolean {
    // Demographic criteria matching
    if (this.criteria.demographic) {
      for (const [key, value] of Object.entries(this.criteria.demographic)) {
        if (Array.isArray(value)) {
          if (!value.includes(contact[key])) {
            return false;
          }
        } else if (contact[key] !== value) {
          return false;
        }
      }
    }

    // Behavioral criteria matching
    if (this.criteria.behavioral) {
      for (const [key, value] of Object.entries(this.criteria.behavioral)) {
        if (Array.isArray(value)) {
          if (!value.includes(contact[key])) {
            return false;
          }
        } else if (contact[key] !== value) {
          return false;
        }
      }
    }

    // Geographic criteria matching
    if (this.criteria.geographic) {
      for (const [key, value] of Object.entries(this.criteria.geographic)) {
        if (Array.isArray(value)) {
          if (!value.includes(contact[key])) {
            return false;
          }
        } else if (contact[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }
}
