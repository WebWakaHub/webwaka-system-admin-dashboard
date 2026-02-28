
import { v4 as uuidv4 } from 'uuid';
import { BookingService, Booking } from '../../transportation/primitives/booking';
import { TripService, Trip } from '../../transportation/primitives/trip';

// Interface for a sale
export interface Sale {
  id: string;
  booking: Booking;
  staffId: string;
  createdAt: Date;
}

// In-memory data store for sales (for demonstration purposes)
const sales: Sale[] = [];

// Service for managing sales
export class SalesService {
  private bookingService: BookingService;
  private tripService: TripService;

  constructor() {
    this.bookingService = new BookingService();
    this.tripService = new TripService();
  }

  /**
   * Sells a ticket for a trip.
   * @param tripId - The ID of the trip.
   * @param passengerName - The name of the passenger.
   * @param seatNumber - The seat number.
   * @param staffId - The ID of the staff member who made the sale.
   * @returns The newly created sale.
   */
  sellTicket(tripId: string, passengerName: string, seatNumber: string, staffId: string): Sale {
    if (!tripId || !passengerName || !seatNumber || !staffId) {
      throw new Error('Missing required fields: tripId, passengerName, seatNumber, and staffId are required.');
    }

    const trip = this.tripService.getTripById(tripId);
    if (!trip) {
      throw new Error('Trip not found.');
    }

    const booking = this.bookingService.createBooking(tripId, passengerName, seatNumber);

    const newSale: Sale = {
      id: uuidv4(),
      booking,
      staffId,
      createdAt: new Date(),
    };

    sales.push(newSale);
    return newSale;
  }
}
