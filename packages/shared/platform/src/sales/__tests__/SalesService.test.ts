
import { SalesService } from "../services/SalesService";
import { TripService } from "../../transportation/primitives/trip";

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

describe("SalesService", () => {
  let salesService: SalesService;
  let tripService: TripService;

  beforeEach(() => {
    salesService = new SalesService();
    tripService = new TripService();
  });

  it("should sell a ticket", () => {
    const trip = tripService.createTrip("route-1", new Date(), new Date());
    const sale = salesService.sellTicket(trip.id, "Test Passenger", "A1", "staff-1");
    expect(sale).toBeDefined();
    expect(sale.booking.passengerName).toBe("Test Passenger");
    expect(sale.id).toBe("mock-uuid");
  });

  it("should throw an error if required fields are missing", () => {
    expect(() => salesService.sellTicket("", "", "", "")).toThrow(
      "Missing required fields: tripId, passengerName, seatNumber, and staffId are required."
    );
  });

  it("should throw an error if the trip does not exist", () => {
    expect(() =>
      salesService.sellTicket("invalid-trip-id", "Test Passenger", "A1", "staff-1")
    ).toThrow("Trip not found.");
  });
});
