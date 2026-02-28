
import { ManifestService } from "../manifest";
import { BookingService } from "../booking";

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

describe("ManifestService", () => {
  let manifestService: ManifestService;
  let bookingService: BookingService;

  beforeEach(() => {
    manifestService = new ManifestService();
    bookingService = new BookingService();
  });

  it("should generate a manifest for a trip", () => {
    bookingService.createBooking("trip1", "John Doe", "1234567890", 1);
    const manifest = manifestService.generateManifest("trip1");
    expect(manifest).toBeDefined();
    expect(manifest.passengers.length).toBe(1);
    expect(manifest.id).toBe("mock-uuid");
  });

  it("should throw an error if tripId is missing", () => {
    expect(() => manifestService.generateManifest("")).toThrow(
      "Missing required field: tripId is required."
    );
  });

  it("should get a manifest by trip ID", () => {
    bookingService.createBooking("trip1", "John Doe", "1234567890", 1);
    manifestService.generateManifest("trip1");
    const manifest = manifestService.getManifestByTripId("trip1");
    expect(manifest).toBeDefined();
    expect(manifest?.tripId).toBe("trip1");
  });

  it("should return null when getting a manifest by an invalid trip ID", () => {
    const manifest = manifestService.getManifestByTripId("invalid-id");
    expect(manifest).toBeNull();
  });

  it("should update a manifest", () => {
    bookingService.createBooking("trip1", "John Doe", "1234567890", 1);
    manifestService.generateManifest("trip1");
    const updatedManifest = manifestService.updateManifest("trip1", {
      passengers: [],
    });
    expect(updatedManifest).toBeDefined();
    expect(updatedManifest?.passengers.length).toBe(0);
  });

  it("should return null when updating a manifest with an invalid trip ID", () => {
    const updatedManifest = manifestService.updateManifest("invalid-id", {
      passengers: [],
    });
    expect(updatedManifest).toBeNull();
  });
});
