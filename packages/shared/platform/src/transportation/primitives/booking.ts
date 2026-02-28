
import { v4 as uuidv4 } from 'uuid';

// Enum for booking status
export enum BookingStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

// Interface for a booking
export interface Booking {
  id: string;
  tripId: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: number;
  status: BookingStatus;
}

// In-memory data store for bookings (for demonstration purposes)
const bookings: Booking[] = [];

// Service for managing bookings
export class BookingService {
  /**
   * Creates a new booking.
   * @param tripId - The ID of the trip for this booking.
   * @param passengerName - The name of the passenger.
   * @param passengerPhone - The phone number of the passenger.
   * @param seatNumber - The seat number for this booking.
   * @returns The newly created booking.
   */
  createBooking(tripId: string, passengerName: string, passengerPhone: string, seatNumber: number): Booking {
    if (!tripId || !passengerName || !passengerPhone || !seatNumber) {
      throw new Error('Missing required fields: tripId, passengerName, passengerPhone, and seatNumber are required.');
    }

    const newBooking: Booking = {
      id: uuidv4(),
      tripId,
      passengerName,
      passengerPhone,
      seatNumber,
      status: BookingStatus.CONFIRMED,
    };

    bookings.push(newBooking);
    return newBooking;
  }

  /**
   * Retrieves all bookings for a trip.
   * @param tripId - The ID of the trip.
   * @returns An array of all bookings for the specified trip.
   */
  getBookingsByTripId(tripId: string): Booking[] {
    return bookings.filter((b) => b.tripId === tripId);
  }

  /**
   * Retrieves a single booking by its ID.
   * @param id - The ID of the booking to retrieve.
   * @returns The booking with the specified ID, or null if not found.
   */
  getBookingById(id: string): Booking | null {
    const booking = bookings.find((b) => b.id === id);
    return booking || null;
  }

  /**
   * Cancels a booking.
   * @param id - The ID of the booking to cancel.
   * @returns The updated booking, or null if not found.
   */
  cancelBooking(id: string): Booking | null {
    const bookingIndex = bookings.findIndex((b) => b.id === id);

    if (bookingIndex === -1) {
      return null;
    }

    bookings[bookingIndex].status = BookingStatus.CANCELLED;
    return bookings[bookingIndex];
  }
}
