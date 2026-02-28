
import { v4 as uuidv4 } from 'uuid';
import { Route } from './route';
import { Vehicle } from './vehicle';
import { Driver } from './driver';

// Enum for trip status
export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Interface for a transportation trip
export interface Trip {
  id: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  departureTime: Date;
  arrivalTime: Date;
  status: TripStatus;
}

// In-memory data store for trips (for demonstration purposes)
const trips: Trip[] = [];

// Service for managing transportation trips
export class TripService {
  /**
   * Creates a new trip.
   * @param routeId - The ID of the route for this trip.
   * @param vehicleId - The ID of the vehicle for this trip.
   * @param driverId - The ID of the driver for this trip.
   * @param departureTime - The departure time of the trip.
   * @param arrivalTime - The estimated arrival time of the trip.
   * @returns The newly created trip.
   */
  createTrip(routeId: string, vehicleId: string, driverId: string, departureTime: Date, arrivalTime: Date): Trip {
    if (!routeId || !vehicleId || !driverId || !departureTime || !arrivalTime) {
      throw new Error('Missing required fields: routeId, vehicleId, driverId, departureTime, and arrivalTime are required.');
    }

    const newTrip: Trip = {
      id: uuidv4(),
      routeId,
      vehicleId,
      driverId,
      departureTime,
      arrivalTime,
      status: TripStatus.SCHEDULED,
    };

    trips.push(newTrip);
    return newTrip;
  }

  /**
   * Retrieves all trips.
   * @returns An array of all trips.
   */
  getAllTrips(): Trip[] {
    return trips;
  }

  /**
   * Retrieves a single trip by its ID.
   * @param id - The ID of the trip to retrieve.
   * @returns The trip with the specified ID, or null if not found.
   */
  getTripById(id: string): Trip | null {
    const trip = trips.find((t) => t.id === id);
    return trip || null;
  }

  /**
   * Updates an existing trip.
   * @param id - The ID of the trip to update.
   * @param updates - An object containing the fields to update.
   * @returns The updated trip, or null if not found.
   */
  updateTrip(id: string, updates: Partial<Trip>): Trip | null {
    const tripIndex = trips.findIndex((t) => t.id === id);

    if (tripIndex === -1) {
      return null;
    }

    trips[tripIndex] = { ...trips[tripIndex], ...updates };
    return trips[tripIndex];
  }

  /**
   * Deletes a trip.
   * @param id - The ID of the trip to delete.
   * @returns True if the trip was deleted, false otherwise.
   */
  deleteTrip(id: string): boolean {
    const tripIndex = trips.findIndex((t) => t.id === id);

    if (tripIndex === -1) {
      return false;
    }

    trips.splice(tripIndex, 1);
    return true;
  }

  /**
   * Updates the status of a trip.
   * @param id - The ID of the trip to update.
   * @param status - The new status of the trip.
   * @returns The updated trip, or null if not found.
   */
  updateTripStatus(id: string, status: TripStatus): Trip | null {
    const tripIndex = trips.findIndex((t) => t.id === id);

    if (tripIndex === -1) {
      return null;
    }

    trips[tripIndex].status = status;
    return trips[tripIndex];
  }
}
