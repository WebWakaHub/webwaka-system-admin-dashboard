
import { TrackingService } from "../tracking";

describe("TrackingService", () => {
  let trackingService: TrackingService;

  beforeEach(() => {
    trackingService = new TrackingService();
  });

  it("should update vehicle location", () => {
    trackingService.updateLocation("vehicle1", 1, 1);
    const location = trackingService.getLastKnownLocation("vehicle1");
    expect(location).toBeDefined();
    expect(location?.latitude).toBe(1);
  });

  it("should throw an error if required fields are missing", () => {
    expect(() => trackingService.updateLocation("", 0, 0)).toThrow(
      "Missing required fields: vehicleId, latitude, and longitude are required."
    );
  });

  it("should get last known location", () => {
    trackingService.updateLocation("vehicle1", 1, 1);
    trackingService.updateLocation("vehicle1", 2, 2);
    const location = trackingService.getLastKnownLocation("vehicle1");
    expect(location?.latitude).toBe(2);
  });

  it("should return null when getting last known location for a vehicle with no history", () => {
    const location = trackingService.getLastKnownLocation("vehicle2");
    expect(location).toBeNull();
  });

  it("should get location history", () => {
    trackingService.updateLocation("vehicle1", 1, 1);
    trackingService.updateLocation("vehicle1", 2, 2);
    const history = trackingService.getLocationHistory(
      "vehicle1",
      new Date(0),
      new Date()
    );
    expect(history.length).toBe(2);
  });

  it("should return an empty array when getting location history for a vehicle with no history", () => {
    const history = trackingService.getLocationHistory(
      "vehicle2",
      new Date(0),
      new Date()
    );
    expect(history.length).toBe(0);
  });
});
