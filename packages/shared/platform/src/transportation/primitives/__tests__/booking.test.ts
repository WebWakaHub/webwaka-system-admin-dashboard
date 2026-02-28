
import { BookingService, BookingStatus } from "../booking";

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

describe("BookingService", () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService();
  });

  it("should create a new booking", () => {
    const booking = bookingService.createBooking(
      "trip1",
      "John Doe",
      "1234567890",
      1
    );
    expect(booking).toBeDefined();
    expect(booking.status).toBe(BookingStatus.CONFIRMED);
    expect(booking.id).toBe("mock-uuid");
  });

  it("should throw an error if required fields are missing", () => {
    expect(() => bookingService.createBooking("", "", "", 0)).toThrow(
      "Missing required fields: tripId, passengerName, passengerPhone, and seatNumber are required."
    );
  });

  it("should get bookings by trip ID", () => {
    bookingService.createBooking("trip1", "John Doe", "1234567890", 1);
    const bookings = bookingService.getBookingsByTripId("trip1");
    expect(bookings.length).toBe(1);
  });

  it("should get a booking by ID", () => {
    const newBooking = bookingService.createBooking(
      "trip1",
      "John Doe",
      "1234567890",
      1
    );
    const booking = bookingService.getBookingById(newBooking.id);
    expect(booking).toBeDefined();
    expect(booking?.id).toBe(newBooking.id);
  });

  it("should return null when getting a booking by an invalid ID", () => {
    const booking = bookingService.getBookingById("invalid-id");
    expect(booking).toBeNull();
  });

  it("should cancel a booking", () => {
    const newBooking = bookingService.createBooking(
      "trip1",
      "John Doe",
      "1234567890",
      1
    );
    const cancelledBooking = bookingService.cancelBooking(newBooking.id);
    expect(cancelledBooking).toBeDefined();
    expect(cancelledBooking?.status).toBe(BookingStatus.CANCELLED);
  });

  it("should return null when cancelling a booking with an invalid ID", () => {
    const cancelledBooking = bookingService.cancelBooking("invalid-id");
    expect(cancelledBooking).toBeNull();
  });
});
