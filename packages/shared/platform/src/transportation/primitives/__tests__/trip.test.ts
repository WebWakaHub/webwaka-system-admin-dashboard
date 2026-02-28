
import { TripService, TripStatus } from "../trip";

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe("TripService", () => {
  let tripService: TripService;

  beforeEach(() => {
    tripService = new TripService();
  });

  it("should create a new trip", () => {
    const trip = tripService.createTrip(
      "route1",
      "vehicle1",
      "driver1",
      new Date(),
      new Date()
    );
    expect(trip).toBeDefined();
    expect(trip.status).toBe(TripStatus.SCHEDULED);
    expect(trip.id).toBe('mock-uuid');
  });

  it("should throw an error if required fields are missing", () => {
    expect(() =>
      tripService.createTrip("", "", "", new Date(), new Date())
    ).toThrow(
      "Missing required fields: routeId, vehicleId, driverId, departureTime, and arrivalTime are required."
    );
  });

  it("should get all trips", () => {
    tripService.createTrip(
      "route1",
      "vehicle1",
      "driver1",
      new Date(),
      new Date()
    );
    const trips = tripService.getAllTrips();
    expect(trips.length).toBe(1);
  });

  it("should get a trip by ID", () => {
    const newTrip = tripService.createTrip(
      "route1",
      "vehicle1",
      "driver1",
      new Date(),
      new Date()
    );
    const trip = tripService.getTripById(newTrip.id);
    expect(trip).toBeDefined();
    expect(trip?.id).toBe(newTrip.id);
  });

  it("should return null when getting a trip by an invalid ID", () => {
    const trip = tripService.getTripById("invalid-id");
    expect(trip).toBeNull();
  });

  it("should update a trip", () => {
    const newTrip = tripService.createTrip(
      "route1",
      "vehicle1",
      "driver1",
      new Date(),
      new Date()
    );
    const updatedTrip = tripService.updateTrip(newTrip.id, {
      status: TripStatus.IN_PROGRESS,
    });
    expect(updatedTrip).toBeDefined();
    expect(updatedTrip?.status).toBe(TripStatus.IN_PROGRESS);
  });

  it("should return null when updating a trip with an invalid ID", () => {
    const updatedTrip = tripService.updateTrip("invalid-id", {
      status: TripStatus.IN_PROGRESS,
    });
    expect(updatedTrip).toBeNull();
  });

  it("should delete a trip", () => {
    const newTrip = tripService.createTrip(
      "route1",
      "vehicle1",
      "driver1",
      new Date(),
      new Date()
    );
    const result = tripService.deleteTrip(newTrip.id);
    expect(result).toBe(true);
    const trips = tripService.getAllTrips();
    expect(trips.length).toBe(0);
  });

  it("should return false when deleting a trip with an invalid ID", () => {
    const result = tripService.deleteTrip("invalid-id");
    expect(result).toBe(false);
  });

  it("should update trip status", () => {
    const newTrip = tripService.createTrip(
      "route1",
      "vehicle1",
      "driver1",
      new Date(),
      new Date()
    );
    const updatedTrip = tripService.updateTripStatus(
      newTrip.id,
      TripStatus.COMPLETED
    );
    expect(updatedTrip).toBeDefined();
    expect(updatedTrip?.status).toBe(TripStatus.COMPLETED);
  });

  it("should return null when updating the status of a trip with an invalid ID", () => {
    const updatedTrip = tripService.updateTripStatus(
      "invalid-id",
      TripStatus.COMPLETED
    );
    expect(updatedTrip).toBeNull();
  });
});
