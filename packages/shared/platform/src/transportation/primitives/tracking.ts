
import { v4 as uuidv4 } from 'uuid';

// Interface for a location point
export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

// In-memory data store for vehicle locations (for demonstration purposes)
const vehicleLocations: { [vehicleId: string]: LocationPoint[] } = {};

// Service for managing real-time vehicle tracking
export class TrackingService {
  /**
   * Updates the location of a vehicle.
   * @param vehicleId - The ID of the vehicle.
   * @param latitude - The latitude of the vehicle's location.
   * @param longitude - The longitude of the vehicle's location.
   */
  updateLocation(vehicleId: string, latitude: number, longitude: number): void {
    if (!vehicleId || latitude === undefined || longitude === undefined) {
      throw new Error('Missing required fields: vehicleId, latitude, and longitude are required.');
    }

    if (!vehicleLocations[vehicleId]) {
      vehicleLocations[vehicleId] = [];
    }

    const newLocation: LocationPoint = {
      latitude,
      longitude,
      timestamp: new Date(),
    };

    vehicleLocations[vehicleId].push(newLocation);
  }

  /**
   * Retrieves the last known location of a vehicle.
   * @param vehicleId - The ID of the vehicle.
   * @returns The last known location of the vehicle, or null if not found.
   */
  getLastKnownLocation(vehicleId: string): LocationPoint | null {
    const locations = vehicleLocations[vehicleId];

    if (!locations || locations.length === 0) {
      return null;
    }

    return locations[locations.length - 1];
  }

  /**
   * Retrieves the location history of a vehicle for a given time period.
   * @param vehicleId - The ID of the vehicle.
   * @param startTime - The start of the time period.
   * @param endTime - The end of the time period.
   * @returns An array of location points for the specified time period.
   */
  getLocationHistory(vehicleId: string, startTime: Date, endTime: Date): LocationPoint[] {
    const locations = vehicleLocations[vehicleId];

    if (!locations) {
      return [];
    }

    return locations.filter((location) => location.timestamp >= startTime && location.timestamp <= endTime);
  }
}

