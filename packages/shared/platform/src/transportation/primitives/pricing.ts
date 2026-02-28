
import { Route } from './route';

// Interface for pricing strategy
export interface PricingStrategy {
  calculateFare(route: Route, distance: number, timeOfDay: Date): number;
}

// Simple pricing strategy based on distance
export class DistanceBasedPricingStrategy implements PricingStrategy {
  private readonly baseFare: number;
  private readonly perKilometerRate: number;

  constructor(baseFare: number, perKilometerRate: number) {
    this.baseFare = baseFare;
    this.perKilometerRate = perKilometerRate;
  }

  calculateFare(route: Route, distance: number, timeOfDay: Date): number {
    return this.baseFare + distance * this.perKilometerRate;
  }
}

// Pricing service for calculating fares
export class PricingService {
  private pricingStrategy: PricingStrategy;

  constructor(pricingStrategy: PricingStrategy) {
    this.pricingStrategy = pricingStrategy;
  }

  /**
   * Calculates the fare for a trip.
   * @param route - The route of the trip.
   * @param distance - The distance of the trip in kilometers.
   * @param timeOfDay - The time of day of the trip.
   * @returns The calculated fare.
   */
  calculateFare(route: Route, distance: number, timeOfDay: Date): number {
    // Placeholder for dynamic pricing logic
    // Placeholder for discount logic

    return this.pricingStrategy.calculateFare(route, distance, timeOfDay);
  }

  /**
   * Sets the pricing strategy.
   * @param pricingStrategy - The new pricing strategy.
   */
  setPricingStrategy(pricingStrategy: PricingStrategy) {
    this.pricingStrategy = pricingStrategy;
  }
}

