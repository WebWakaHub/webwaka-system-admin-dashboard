
import { ReportingService } from "../reporting";
import { TripService } from "../trip";
import { BookingService } from "../booking";

describe("ReportingService", () => {
  let reportingService: ReportingService;
  let tripService: TripService;
  let bookingService: BookingService;

  beforeEach(() => {
    reportingService = new ReportingService();
    tripService = new TripService();
    bookingService = new BookingService();
    // Clear the trips and bookings arrays before each test
    (tripService as any).getAllTrips().length = 0;
    (bookingService as any).getBookingsByTripId("").length = 0; // This is a hack to clear the bookings array as there is no direct access to it.
    (bookingService as any).getBookingsByTripId = jest.fn().mockReturnValue([]);
  });

  it("should generate a sales report", () => {
    const trip = tripService.createTrip(
      "route1",
      "vehicle1",
      "driver1",
      new Date(),
      new Date()
    );
    bookingService.createBooking(trip.id, "John Doe", "1234567890", 1);
    const report = reportingService.generateSalesReport(
      new Date(0),
      new Date()
    );
    expect(report).toBeDefined();
    expect(report.totalBookings).toBe(1);
  });

  it("should generate an empty sales report when there are no trips", () => {
    const report = reportingService.generateSalesReport(
      new Date(0),
      new Date()
    );
    expect(report).toBeDefined();
    expect(report.totalBookings).toBe(0);
  });
});
