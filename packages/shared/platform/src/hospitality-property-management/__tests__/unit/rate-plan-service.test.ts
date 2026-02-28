/**
 * Property Management - Rate Plan Service Unit Tests
 * 
 * @module hospitality-property-management/__tests__/unit/rate-plan-service.test.ts
 * @author webwakaagent5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RatePlanService } from '../../services/rate-plan-service';
import { EventPublisher } from '../../events/event-publisher';

describe('RatePlanService', () => {
  let service: RatePlanService;
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
      delete: vi.fn().mockReturnThis(),
    };

    mockEventPublisher = {
      publish: vi.fn(),
    } as any;

    service = new RatePlanService(mockDb, mockEventPublisher);
  });

  describe('createRatePlan', () => {
    it('should create rate plan successfully', async () => {
      const dto = {
        roomTypeId: 'room-123',
        name: 'Standard Rate',
        basePrice: 25000,
        currency: 'NGN',
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.2,
          saturday: 1.5,
          sunday: 1.3,
        },
        occupancyPricing: {
          singleOccupancy: 0.8,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.2,
        },
      };

      mockDb.returning.mockResolvedValueOnce([{ id: 'rate-123', ...dto }]);

      const result = await service.createRatePlan('tenant-123', 'prop-123', dto);

      expect(result.id).toBe('rate-123');
      expect(result.name).toBe('Standard Rate');
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rateplan.created',
        })
      );
    });

    it('should validate base price minimum', async () => {
      const dto = {
        roomTypeId: 'room-123',
        name: 'Standard Rate',
        basePrice: 4000, // Below minimum
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0,
        },
        occupancyPricing: {
          singleOccupancy: 1.0,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.0,
        },
      };

      await expect(service.createRatePlan('tenant-123', 'prop-123', dto)).rejects.toThrow(
        'Base price must be between ₦5,000 and ₦10,000,000'
      );
    });

    it('should validate base price maximum', async () => {
      const dto = {
        roomTypeId: 'room-123',
        name: 'Standard Rate',
        basePrice: 15000000, // Above maximum
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0,
        },
        occupancyPricing: {
          singleOccupancy: 1.0,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.0,
        },
      };

      await expect(service.createRatePlan('tenant-123', 'prop-123', dto)).rejects.toThrow(
        'Base price must be between ₦5,000 and ₦10,000,000'
      );
    });

    it('should validate valid date range', async () => {
      const dto = {
        roomTypeId: 'room-123',
        name: 'Standard Rate',
        basePrice: 25000,
        validFrom: new Date('2026-12-31'),
        validTo: new Date('2026-01-01'), // Invalid range
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0,
        },
        occupancyPricing: {
          singleOccupancy: 1.0,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.0,
        },
      };

      await expect(service.createRatePlan('tenant-123', 'prop-123', dto)).rejects.toThrow(
        'Valid from date must be before valid to date'
      );
    });

    it('should validate length-of-stay discount percentage', async () => {
      const dto = {
        roomTypeId: 'room-123',
        name: 'Standard Rate',
        basePrice: 25000,
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0,
        },
        occupancyPricing: {
          singleOccupancy: 1.0,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.0,
        },
        lengthOfStayDiscounts: [
          {
            minimumNights: 3,
            discountPercentage: 60, // Above maximum
          },
        ],
      };

      await expect(service.createRatePlan('tenant-123', 'prop-123', dto)).rejects.toThrow(
        'Length-of-stay discount must be between 0% and 50%'
      );
    });
  });

  describe('calculatePrice', () => {
    it('should calculate base price for single night', async () => {
      const ratePlan = {
        id: 'rate-123',
        basePrice: 10000,
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0,
        },
        occupancyPricing: {
          singleOccupancy: 1.0,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.0,
        },
        seasonalPricing: null,
        lengthOfStayDiscounts: null,
      };

      mockDb.limit.mockResolvedValueOnce([ratePlan]);

      const price = await service.calculatePrice(
        'rate-123',
        new Date('2026-03-16'), // Monday
        new Date('2026-03-17'),
        2,
        1
      );

      expect(price).toBe(10000);
    });

    it('should apply day-of-week pricing', async () => {
      const ratePlan = {
        id: 'rate-123',
        basePrice: 10000,
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.2,
          saturday: 1.5,
          sunday: 1.3,
        },
        occupancyPricing: {
          singleOccupancy: 1.0,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.0,
        },
        seasonalPricing: null,
        lengthOfStayDiscounts: null,
      };

      mockDb.limit.mockResolvedValueOnce([ratePlan]);

      // Friday to Saturday (2 nights)
      const price = await service.calculatePrice(
        'rate-123',
        new Date('2026-03-20'), // Friday
        new Date('2026-03-22'), // Sunday
        2,
        2
      );

      // Friday: 10000 * 1.2 = 12000
      // Saturday: 10000 * 1.5 = 15000
      // Total: 27000
      expect(price).toBe(27000);
    });

    it('should apply occupancy pricing', async () => {
      const ratePlan = {
        id: 'rate-123',
        basePrice: 10000,
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0,
        },
        occupancyPricing: {
          singleOccupancy: 0.8,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.2,
        },
        seasonalPricing: null,
        lengthOfStayDiscounts: null,
      };

      mockDb.limit.mockResolvedValueOnce([ratePlan]);

      // Single occupancy
      const priceSingle = await service.calculatePrice(
        'rate-123',
        new Date('2026-03-16'),
        new Date('2026-03-17'),
        1,
        1
      );

      expect(priceSingle).toBe(8000); // 10000 * 0.8

      // Triple occupancy
      mockDb.limit.mockResolvedValueOnce([ratePlan]);

      const priceTriple = await service.calculatePrice(
        'rate-123',
        new Date('2026-03-16'),
        new Date('2026-03-17'),
        3,
        1
      );

      expect(priceTriple).toBe(12000); // 10000 * 1.2
    });

    it('should apply seasonal pricing', async () => {
      const ratePlan = {
        id: 'rate-123',
        basePrice: 10000,
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0,
        },
        occupancyPricing: {
          singleOccupancy: 1.0,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.0,
        },
        seasonalPricing: [
          {
            name: 'High Season',
            startDate: new Date('2026-12-01'),
            endDate: new Date('2026-12-31'),
            multiplier: 2.0,
          },
        ],
        lengthOfStayDiscounts: null,
      };

      mockDb.limit.mockResolvedValueOnce([ratePlan]);

      const price = await service.calculatePrice(
        'rate-123',
        new Date('2026-12-15'),
        new Date('2026-12-16'),
        2,
        1
      );

      expect(price).toBe(20000); // 10000 * 2.0 (seasonal)
    });

    it('should apply length-of-stay discounts', async () => {
      const ratePlan = {
        id: 'rate-123',
        basePrice: 10000,
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.0,
          saturday: 1.0,
          sunday: 1.0,
        },
        occupancyPricing: {
          singleOccupancy: 1.0,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.0,
        },
        seasonalPricing: null,
        lengthOfStayDiscounts: [
          {
            minimumNights: 3,
            discountPercentage: 10,
          },
          {
            minimumNights: 7,
            discountPercentage: 20,
          },
        ],
      };

      mockDb.limit.mockResolvedValueOnce([ratePlan]);

      // 3 nights: 30000 - 10% = 27000
      const price3 = await service.calculatePrice(
        'rate-123',
        new Date('2026-03-16'),
        new Date('2026-03-19'),
        2,
        3
      );

      expect(price3).toBe(27000);

      // 7 nights: 70000 - 20% = 56000
      mockDb.limit.mockResolvedValueOnce([ratePlan]);

      const price7 = await service.calculatePrice(
        'rate-123',
        new Date('2026-03-16'),
        new Date('2026-03-23'),
        2,
        7
      );

      expect(price7).toBe(56000);
    });

    it('should apply all pricing factors combined', async () => {
      const ratePlan = {
        id: 'rate-123',
        basePrice: 10000,
        dayOfWeekPricing: {
          monday: 1.0,
          tuesday: 1.0,
          wednesday: 1.0,
          thursday: 1.0,
          friday: 1.2,
          saturday: 1.5,
          sunday: 1.3,
        },
        occupancyPricing: {
          singleOccupancy: 0.8,
          doubleOccupancy: 1.0,
          tripleOccupancy: 1.2,
        },
        seasonalPricing: [
          {
            name: 'High Season',
            startDate: new Date('2026-12-01'),
            endDate: new Date('2026-12-31'),
            multiplier: 1.5,
          },
        ],
        lengthOfStayDiscounts: [
          {
            minimumNights: 3,
            discountPercentage: 10,
          },
        ],
      };

      mockDb.limit.mockResolvedValueOnce([ratePlan]);

      // Friday-Sunday (3 nights) in high season, single occupancy
      // Friday: 10000 * 1.2 (dow) * 1.5 (seasonal) * 0.8 (occupancy) = 14400
      // Saturday: 10000 * 1.5 (dow) * 1.5 (seasonal) * 0.8 (occupancy) = 18000
      // Sunday: 10000 * 1.3 (dow) * 1.5 (seasonal) * 0.8 (occupancy) = 15600
      // Subtotal: 48000
      // Length-of-stay discount (10%): 48000 - 4800 = 43200
      const price = await service.calculatePrice(
        'rate-123',
        new Date('2026-12-19'), // Friday
        new Date('2026-12-22'), // Monday
        1, // Single occupancy
        3
      );

      expect(price).toBe(43200);
    });

    it('should throw error if rate plan not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(
        service.calculatePrice('rate-123', new Date(), new Date(), 2, 1)
      ).rejects.toThrow('Rate plan rate-123 not found');
    });
  });

  describe('updateRatePlan', () => {
    it('should update rate plan successfully', async () => {
      const updated = {
        id: 'rate-123',
        name: 'Updated Rate',
        basePrice: 30000,
      };

      mockDb.returning.mockResolvedValueOnce([updated]);

      const result = await service.updateRatePlan('tenant-123', 'rate-123', {
        name: 'Updated Rate',
        basePrice: 30000,
      });

      expect(result.name).toBe('Updated Rate');
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rateplan.updated',
        })
      );
    });
  });

  describe('deleteRatePlan', () => {
    it('should delete rate plan successfully', async () => {
      await service.deleteRatePlan('tenant-123', 'rate-123');

      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rateplan.deleted',
        })
      );
    });
  });
});
