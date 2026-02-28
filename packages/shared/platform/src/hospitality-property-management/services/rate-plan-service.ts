/**
 * Property Management - Rate Plan Service
 * 
 * Business logic for rate plan management and pricing calculations.
 * 
 * @module hospitality-property-management/services/rate-plan-service
 * @author webwakaagent4
 */

import { eq, and, between } from 'drizzle-orm';
import { ratePlans } from '../database/schema';
import { CreateRatePlanDTO, UpdateRatePlanDTO, RatePlan } from '../types';
import { EventPublisher } from '../events/event-publisher';

export class RatePlanService {
  private db: any;
  private eventPublisher: EventPublisher;

  constructor(db: any, eventPublisher: EventPublisher) {
    this.db = db;
    this.eventPublisher = eventPublisher;
  }

  /**
   * Create rate plan
   */
  async createRatePlan(
    tenantId: string,
    propertyId: string,
    dto: CreateRatePlanDTO
  ): Promise<RatePlan> {
    // Validate
    this.validateRatePlanInput(dto);

    // Create
    const [ratePlan] = await this.db
      .insert(ratePlans)
      .values({
        propertyId,
        ...dto,
      })
      .returning();

    // Publish event
    await this.eventPublisher.publish({
      type: 'rateplan.created',
      version: '1.0.0',
      timestamp: new Date(),
      data: {
        ratePlanId: ratePlan.id,
        propertyId,
        roomTypeId: dto.roomTypeId,
        name: ratePlan.name,
      },
    });

    return ratePlan;
  }

  /**
   * Calculate price for a booking
   * 
   * Applies day-of-week pricing, seasonal pricing, occupancy pricing, and length-of-stay discounts.
   */
  async calculatePrice(
    ratePlanId: string,
    checkInDate: Date,
    checkOutDate: Date,
    occupancy: number,
    numberOfNights: number
  ): Promise<number> {
    // Get rate plan
    const [ratePlan] = await this.db
      .select()
      .from(ratePlans)
      .where(eq(ratePlans.id, ratePlanId))
      .limit(1);

    if (!ratePlan) {
      throw new Error(`Rate plan ${ratePlanId} not found`);
    }

    let totalPrice = 0;
    const currentDate = new Date(checkInDate);

    // Calculate price for each night
    for (let i = 0; i < numberOfNights; i++) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayOfWeek];

      // Base price
      let nightPrice = Number(ratePlan.basePrice);

      // Apply day-of-week multiplier
      const dowMultiplier = ratePlan.dayOfWeekPricing[dayName] || 1.0;
      nightPrice *= dowMultiplier;

      // Apply seasonal pricing
      if (ratePlan.seasonalPricing) {
        for (const season of ratePlan.seasonalPricing) {
          const seasonStart = new Date(season.startDate);
          const seasonEnd = new Date(season.endDate);
          if (currentDate >= seasonStart && currentDate <= seasonEnd) {
            nightPrice *= season.multiplier;
            break;
          }
        }
      }

      // Apply occupancy pricing
      let occupancyMultiplier = 1.0;
      if (occupancy === 1) {
        occupancyMultiplier = ratePlan.occupancyPricing.singleOccupancy;
      } else if (occupancy === 2) {
        occupancyMultiplier = ratePlan.occupancyPricing.doubleOccupancy;
      } else if (occupancy >= 3) {
        occupancyMultiplier = ratePlan.occupancyPricing.tripleOccupancy;
      }
      nightPrice *= occupancyMultiplier;

      totalPrice += nightPrice;

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Apply length-of-stay discounts
    if (ratePlan.lengthOfStayDiscounts) {
      for (const discount of ratePlan.lengthOfStayDiscounts) {
        if (numberOfNights >= discount.minimumNights) {
          const discountAmount = (totalPrice * discount.discountPercentage) / 100;
          totalPrice -= discountAmount;
          break; // Apply only the first matching discount
        }
      }
    }

    // Round to 2 decimal places
    return Math.round(totalPrice * 100) / 100;
  }

  /**
   * Get rate plans for a property
   */
  async getRatePlans(
    tenantId: string,
    propertyId: string,
    roomTypeId?: string
  ): Promise<RatePlan[]> {
    const conditions = [eq(ratePlans.propertyId, propertyId)];

    if (roomTypeId) {
      conditions.push(eq(ratePlans.roomTypeId, roomTypeId));
    }

    return await this.db
      .select()
      .from(ratePlans)
      .where(and(...conditions));
  }

  /**
   * Update rate plan
   */
  async updateRatePlan(
    tenantId: string,
    ratePlanId: string,
    dto: UpdateRatePlanDTO
  ): Promise<RatePlan> {
    if (dto.basePrice !== undefined) {
      this.validateRatePlanInput(dto as any);
    }

    const [updated] = await this.db
      .update(ratePlans)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(ratePlans.id, ratePlanId))
      .returning();

    if (!updated) {
      throw new Error(`Rate plan ${ratePlanId} not found`);
    }

    // Publish event
    await this.eventPublisher.publish({
      type: 'rateplan.updated',
      version: '1.0.0',
      timestamp: new Date(),
      data: {
        ratePlanId,
        changes: dto,
      },
    });

    return updated;
  }

  /**
   * Delete rate plan
   */
  async deleteRatePlan(tenantId: string, ratePlanId: string): Promise<void> {
    await this.db
      .delete(ratePlans)
      .where(eq(ratePlans.id, ratePlanId));

    // Publish event
    await this.eventPublisher.publish({
      type: 'rateplan.deleted',
      version: '1.0.0',
      timestamp: new Date(),
      data: {
        ratePlanId,
      },
    });
  }

  /**
   * Validate rate plan input
   */
  private validateRatePlanInput(dto: CreateRatePlanDTO | UpdateRatePlanDTO): void {
    if ('basePrice' in dto && dto.basePrice !== undefined) {
      if (dto.basePrice < 5000 || dto.basePrice > 10000000) {
        throw new Error('Base price must be between ₦5,000 and ₦10,000,000');
      }
    }

    if ('validFrom' in dto && 'validTo' in dto && dto.validFrom && dto.validTo) {
      if (dto.validFrom >= dto.validTo) {
        throw new Error('Valid from date must be before valid to date');
      }
    }

    if ('lengthOfStayDiscounts' in dto && dto.lengthOfStayDiscounts) {
      for (const discount of dto.lengthOfStayDiscounts) {
        if (discount.discountPercentage < 0 || discount.discountPercentage > 50) {
          throw new Error('Length-of-stay discount must be between 0% and 50%');
        }
      }
    }
  }
}
