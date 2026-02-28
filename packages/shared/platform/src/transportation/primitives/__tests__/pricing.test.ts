
import { PricingService, DistanceBasedPricingStrategy } from "../pricing";
import { Route } from "../route";

describe("PricingService", () => {
  it("should calculate fare using the distance-based pricing strategy", () => {
    const pricingStrategy = new DistanceBasedPricingStrategy(10, 2);
    const pricingService = new PricingService(pricingStrategy);
    const route: Route = {
      id: "1",
      name: "Test Route",
      description: "A route for testing",
      waypoints: [],
    };
    const fare = pricingService.calculateFare(route, 50, new Date());
    expect(fare).toBe(110);
  });

  it("should allow setting a new pricing strategy", () => {
    const initialStrategy = new DistanceBasedPricingStrategy(10, 2);
    const pricingService = new PricingService(initialStrategy);
    const newStrategy = new DistanceBasedPricingStrategy(20, 3);
    pricingService.setPricingStrategy(newStrategy);
    const route: Route = {
      id: "1",
      name: "Test Route",
      description: "A route for testing",
      waypoints: [],
    };
    const fare = pricingService.calculateFare(route, 50, new Date());
    expect(fare).toBe(170);
  });
});
