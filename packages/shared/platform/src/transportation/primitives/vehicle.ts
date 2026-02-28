import { v4 as uuidv4 } from 'uuid';

// Interface for a vehicle
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  registrationNumber: string;
}

// In-memory data store for vehicles (for demonstration purposes)
const vehicles: Vehicle[] = [];

// Service for managing vehicles
export class VehicleService {
  /**
   * Adds a new vehicle to the fleet.
   * @param make - The make of the vehicle.
   * @param model - The model of the vehicle.
   * @param year - The year of the vehicle.
   * @param capacity - The passenger capacity of the vehicle.
   * @param registrationNumber - The registration number of the vehicle.
   * @returns The newly added vehicle.
   */
  addVehicle(make: string, model: string, year: number, capacity: number, registrationNumber: string): Vehicle {
    if (!make || !model || !year || !capacity || !registrationNumber) {
      throw new Error('Missing required fields: make, model, year, capacity, and registrationNumber are required.');
    }

    const newVehicle: Vehicle = {
      id: uuidv4(),
      make,
      model,
      year,
      capacity,
      registrationNumber,
    };

    vehicles.push(newVehicle);
    return newVehicle;
  }

  /**
   * Retrieves all vehicles.
   * @returns An array of all vehicles.
   */
  getAllVehicles(): Vehicle[] {
    return vehicles;
  }

  /**
   * Retrieves a single vehicle by its ID.
   * @param id - The ID of the vehicle to retrieve.
   * @returns The vehicle with the specified ID, or null if not found.
   */
  getVehicleById(id: string): Vehicle | null {
    const vehicle = vehicles.find((v) => v.id === id);
    return vehicle || null;
  }

  /**
   * Updates an existing vehicle.
   * @param id - The ID of the vehicle to update.
   * @param updates - An object containing the fields to update.
   * @returns The updated vehicle, or null if not found.
   */
  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return null;
    }

    vehicles[vehicleIndex] = { ...vehicles[vehicleIndex], ...updates };
    return vehicles[vehicleIndex];
  }

  /**
   * Decommissions a vehicle.
   * @param id - The ID of the vehicle to decommission.
   * @returns True if the vehicle was decommissioned, false otherwise.
   */
  decommissionVehicle(id: string): boolean {
    const vehicleIndex = vehicles.findIndex((v) => v.id === id);

    if (vehicleIndex === -1) {
      return false;
    }

    vehicles.splice(vehicleIndex, 1);
    return true;
  }
}
