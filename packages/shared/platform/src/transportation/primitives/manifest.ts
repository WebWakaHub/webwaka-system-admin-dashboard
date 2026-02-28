
import { v4 as uuidv4 } from 'uuid';
import { Booking, BookingService } from './booking';

// Interface for a passenger manifest
export interface Manifest {
  id: string;
  tripId: string;
  passengers: Booking[];
  generatedAt: Date;
}

// In-memory data store for manifests (for demonstration purposes)
const manifests: Manifest[] = [];
const bookingService = new BookingService();

// Service for managing passenger manifests
export class ManifestService {
  /**
   * Generates a passenger manifest for a trip.
   * @param tripId - The ID of the trip.
   * @returns The newly generated manifest.
   */
  generateManifest(tripId: string): Manifest {
    if (!tripId) {
      throw new Error('Missing required field: tripId is required.');
    }

    const passengers = bookingService.getBookingsByTripId(tripId);

    const newManifest: Manifest = {
      id: uuidv4(),
      tripId,
      passengers,
      generatedAt: new Date(),
    };

    manifests.push(newManifest);
    return newManifest;
  }

  /**
   * Retrieves the manifest for a trip.
   * @param tripId - The ID of the trip.
   * @returns The manifest for the specified trip, or null if not found.
   */
  getManifestByTripId(tripId: string): Manifest | null {
    const manifest = manifests.find((m) => m.tripId === tripId);
    return manifest || null;
  }

  /**
   * Updates a manifest.
   * @param tripId - The ID of the trip.
   * @param updates - An object containing the fields to update.
   * @returns The updated manifest, or null if not found.
   */
  updateManifest(tripId: string, updates: Partial<Manifest>): Manifest | null {
    const manifestIndex = manifests.findIndex((m) => m.tripId === tripId);

    if (manifestIndex === -1) {
      return null;
    }

    manifests[manifestIndex] = { ...manifests[manifestIndex], ...updates };
    return manifests[manifestIndex];
  }
}

