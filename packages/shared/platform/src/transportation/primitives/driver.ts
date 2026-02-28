
import { v4 as uuidv4 } from 'uuid';

// Interface for a driver
export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  isActive: boolean;
}

// In-memory data store for drivers (for demonstration purposes)
const drivers: Driver[] = [];

// Service for managing drivers
export class DriverService {
  /**
   * Adds a new driver.
   * @param firstName - The first name of the driver.
   * @param lastName - The last name of the driver.
   * @param licenseNumber - The driver's license number.
   * @param phoneNumber - The driver's phone number.
   * @returns The newly added driver.
   */
  addDriver(firstName: string, lastName: string, licenseNumber: string, phoneNumber: string): Driver {
    if (!firstName || !lastName || !licenseNumber || !phoneNumber) {
      throw new Error('Missing required fields: firstName, lastName, licenseNumber, and phoneNumber are required.');
    }

    const newDriver: Driver = {
      id: uuidv4(),
      firstName,
      lastName,
      licenseNumber,
      phoneNumber,
      isActive: true,
    };

    drivers.push(newDriver);
    return newDriver;
  }

  /**
   * Retrieves all drivers.
   * @returns An array of all drivers.
   */
  getAllDrivers(): Driver[] {
    return drivers;
  }

  /**
   * Retrieves a single driver by their ID.
   * @param id - The ID of the driver to retrieve.
   * @returns The driver with the specified ID, or null if not found.
   */
  getDriverById(id: string): Driver | null {
    const driver = drivers.find((d) => d.id === id);
    return driver || null;
  }

  /**
   * Updates an existing driver.
   * @param id - The ID of the driver to update.
   * @param updates - An object containing the fields to update.
   * @returns The updated driver, or null if not found.
   */
  updateDriver(id: string, updates: Partial<Driver>): Driver | null {
    const driverIndex = drivers.findIndex((d) => d.id === id);

    if (driverIndex === -1) {
      return null;
    }

    drivers[driverIndex] = { ...drivers[driverIndex], ...updates };
    return drivers[driverIndex];
  }

  /**
   * Deactivates a driver's profile.
   * @param id - The ID of the driver to deactivate.
   * @returns The updated driver, or null if not found.
   */
  deactivateDriver(id: string): Driver | null {
    const driverIndex = drivers.findIndex((d) => d.id === id);

    if (driverIndex === -1) {
      return null;
    }

    drivers[driverIndex].isActive = false;
    return drivers[driverIndex];
  }
}

