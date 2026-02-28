/**
 * Property Management - Property Service Unit Tests
 * 
 * @module hospitality-property-management/__tests__/unit/property-service.test.ts
 * @author webwakaagent5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PropertyService } from '../../services/property-service';
import { EventPublisher } from '../../events/event-publisher';
import { PropertyType, PropertyStatus, CancellationPolicy, PaymentPolicy } from '../../types';

describe('PropertyService', () => {
  let service: PropertyService;
  let mockDb: any;
  let mockEventPublisher: EventPublisher;

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
    };

    mockEventPublisher = {
      publish: vi.fn(),
    } as any;

    service = new PropertyService(mockDb, mockEventPublisher);
  });

  describe('createProperty', () => {
    it('should create a property successfully', async () => {
      const dto = {
        name: 'Grand Hotel Lagos',
        type: PropertyType.HOTEL,
        description: 'Luxury hotel in Victoria Island',
        address: {
          street: '123 Victoria Island',
          city: 'Lagos',
          state: 'Lagos',
          lga: 'Lagos Island',
          country: 'Nigeria',
        },
        contact: {
          phone: '+2348012345678',
          email: 'info@grandhotel.com',
        },
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: CancellationPolicy.MODERATE,
        paymentPolicy: PaymentPolicy.PAY_NOW,
      };

      mockDb.limit.mockResolvedValueOnce([]); // No existing property
      mockDb.returning.mockResolvedValueOnce([{ id: 'prop-123', ...dto, status: PropertyStatus.INACTIVE }]);

      const result = await service.createProperty('tenant-123', dto);

      expect(result.id).toBe('prop-123');
      expect(result.name).toBe('Grand Hotel Lagos');
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'property.created',
        })
      );
    });

    it('should throw error if property name already exists', async () => {
      const dto = {
        name: 'Grand Hotel Lagos',
        type: PropertyType.HOTEL,
        address: {
          street: '123 Victoria Island',
          city: 'Lagos',
          state: 'Lagos',
          lga: 'Lagos Island',
          country: 'Nigeria',
        },
        contact: {
          phone: '+2348012345678',
          email: 'info@grandhotel.com',
        },
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: CancellationPolicy.MODERATE,
        paymentPolicy: PaymentPolicy.PAY_NOW,
      };

      mockDb.limit.mockResolvedValueOnce([{ id: 'existing-123', name: 'Grand Hotel Lagos' }]);

      await expect(service.createProperty('tenant-123', dto)).rejects.toThrow(
        'Property with name "Grand Hotel Lagos" already exists'
      );
    });

    it('should validate property name length', async () => {
      const dto = {
        name: 'AB', // Too short
        type: PropertyType.HOTEL,
        address: {
          street: '123 Victoria Island',
          city: 'Lagos',
          state: 'Lagos',
          lga: 'Lagos Island',
          country: 'Nigeria',
        },
        contact: {
          phone: '+2348012345678',
          email: 'info@grandhotel.com',
        },
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: CancellationPolicy.MODERATE,
        paymentPolicy: PaymentPolicy.PAY_NOW,
      };

      await expect(service.createProperty('tenant-123', dto)).rejects.toThrow(
        'Property name must be between 3 and 255 characters'
      );
    });

    it('should validate Nigerian phone format', async () => {
      const dto = {
        name: 'Grand Hotel Lagos',
        type: PropertyType.HOTEL,
        address: {
          street: '123 Victoria Island',
          city: 'Lagos',
          state: 'Lagos',
          lga: 'Lagos Island',
          country: 'Nigeria',
        },
        contact: {
          phone: '+1234567890', // Invalid format
          email: 'info@grandhotel.com',
        },
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: CancellationPolicy.MODERATE,
        paymentPolicy: PaymentPolicy.PAY_NOW,
      };

      await expect(service.createProperty('tenant-123', dto)).rejects.toThrow(
        'Phone number must be in Nigerian format (+234)'
      );
    });

    it('should validate email format', async () => {
      const dto = {
        name: 'Grand Hotel Lagos',
        type: PropertyType.HOTEL,
        address: {
          street: '123 Victoria Island',
          city: 'Lagos',
          state: 'Lagos',
          lga: 'Lagos Island',
          country: 'Nigeria',
        },
        contact: {
          phone: '+2348012345678',
          email: 'invalid-email', // Invalid format
        },
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: CancellationPolicy.MODERATE,
        paymentPolicy: PaymentPolicy.PAY_NOW,
      };

      await expect(service.createProperty('tenant-123', dto)).rejects.toThrow('Invalid email address');
    });

    it('should validate Nigerian state and LGA', async () => {
      const dto = {
        name: 'Grand Hotel Lagos',
        type: PropertyType.HOTEL,
        address: {
          street: '123 Victoria Island',
          city: 'Lagos',
          state: '', // Missing
          lga: '', // Missing
          country: 'Nigeria',
        },
        contact: {
          phone: '+2348012345678',
          email: 'info@grandhotel.com',
        },
        checkInTime: '14:00',
        checkOutTime: '12:00',
        cancellationPolicy: CancellationPolicy.MODERATE,
        paymentPolicy: PaymentPolicy.PAY_NOW,
      };

      await expect(service.createProperty('tenant-123', dto)).rejects.toThrow(
        'Nigerian state and LGA are required'
      );
    });
  });

  describe('getProperty', () => {
    it('should get property by ID', async () => {
      const property = {
        id: 'prop-123',
        tenantId: 'tenant-123',
        name: 'Grand Hotel Lagos',
        type: PropertyType.HOTEL,
      };

      mockDb.limit.mockResolvedValueOnce([property]);

      const result = await service.getProperty('tenant-123', 'prop-123');

      expect(result.id).toBe('prop-123');
      expect(result.name).toBe('Grand Hotel Lagos');
    });

    it('should throw error if property not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(service.getProperty('tenant-123', 'prop-123')).rejects.toThrow(
        'Property prop-123 not found'
      );
    });
  });

  describe('updateProperty', () => {
    it('should update property successfully', async () => {
      const existing = {
        id: 'prop-123',
        tenantId: 'tenant-123',
        name: 'Grand Hotel Lagos',
        version: 1,
      };

      const updated = { ...existing, name: 'Grand Hotel Lagos Updated', version: 2 };

      mockDb.limit.mockResolvedValueOnce([existing]); // getProperty
      mockDb.limit.mockResolvedValueOnce([]); // No name conflict
      mockDb.returning.mockResolvedValueOnce([updated]);

      const result = await service.updateProperty('tenant-123', 'prop-123', {
        name: 'Grand Hotel Lagos Updated',
      });

      expect(result.name).toBe('Grand Hotel Lagos Updated');
      expect(result.version).toBe(2);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'property.updated',
        })
      );
    });

    it('should handle optimistic locking conflict', async () => {
      const existing = {
        id: 'prop-123',
        tenantId: 'tenant-123',
        name: 'Grand Hotel Lagos',
        version: 1,
      };

      mockDb.limit.mockResolvedValueOnce([existing]); // getProperty
      mockDb.limit.mockResolvedValueOnce([]); // No name conflict
      mockDb.returning.mockResolvedValueOnce([]); // Version conflict

      await expect(
        service.updateProperty('tenant-123', 'prop-123', { name: 'Updated' })
      ).rejects.toThrow('Property was modified by another user');
    });
  });

  describe('deleteProperty', () => {
    it('should soft delete property', async () => {
      const property = {
        id: 'prop-123',
        tenantId: 'tenant-123',
        name: 'Grand Hotel Lagos',
      };

      mockDb.limit.mockResolvedValueOnce([property]); // getProperty

      await service.deleteProperty('tenant-123', 'prop-123');

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'property.deleted',
        })
      );
    });
  });

  describe('activateProperty', () => {
    it('should activate property', async () => {
      const property = {
        id: 'prop-123',
        tenantId: 'tenant-123',
        name: 'Grand Hotel Lagos',
        status: PropertyStatus.INACTIVE,
        version: 1,
      };

      const activated = { ...property, status: PropertyStatus.ACTIVE, version: 2 };

      mockDb.limit.mockResolvedValueOnce([property]); // getProperty
      mockDb.limit.mockResolvedValueOnce([]); // No conflict
      mockDb.returning.mockResolvedValueOnce([activated]);

      const result = await service.activateProperty('tenant-123', 'prop-123');

      expect(result.status).toBe(PropertyStatus.ACTIVE);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'property.activated',
        })
      );
    });
  });

  describe('listProperties', () => {
    it('should list properties with pagination', async () => {
      const properties = [
        { id: 'prop-1', name: 'Hotel 1' },
        { id: 'prop-2', name: 'Hotel 2' },
      ];

      mockDb.offset.mockResolvedValueOnce(properties);
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);

      const result = await service.listProperties('tenant-123', { page: 1, limit: 20 });

      expect(result.properties).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter properties by status', async () => {
      const properties = [{ id: 'prop-1', name: 'Hotel 1', status: PropertyStatus.ACTIVE }];

      mockDb.offset.mockResolvedValueOnce(properties);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

      const result = await service.listProperties('tenant-123', { status: PropertyStatus.ACTIVE });

      expect(result.properties).toHaveLength(1);
    });
  });
});
