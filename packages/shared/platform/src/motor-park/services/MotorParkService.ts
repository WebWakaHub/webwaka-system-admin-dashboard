
import { v4 as uuidv4 } from 'uuid';
import { TransportCompany } from '../../transport-company/services/TransportCompanyService';

// Interface for a motor park
export interface MotorPark {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  transportCompanies: TransportCompany[];
}

// In-memory data store for motor parks (for demonstration purposes)
const motorParks: MotorPark[] = [];

// Service for managing motor parks
export class MotorParkService {
  /**
   * Creates a new motor park.
   * @param name - The name of the motor park.
   * @param address - The address of the motor park.
   * @param contactPhone - The contact phone number of the motor park.
   * @returns The newly created motor park.
   */
  createMotorPark(name: string, address: string, contactPhone: string): MotorPark {
    if (!name || !address || !contactPhone) {
      throw new Error('Missing required fields: name, address, and contactPhone are required.');
    }

    const newMotorPark: MotorPark = {
      id: uuidv4(),
      name,
      address,
      contactPhone,
      transportCompanies: [],
    };

    motorParks.push(newMotorPark);
    return newMotorPark;
  }

  /**
   * Adds a transport company to a motor park.
   * @param motorParkId - The ID of the motor park.
   * @param transportCompany - The transport company to add.
   * @returns The updated motor park, or null if not found.
   */
  addTransportCompanyToMotorPark(motorParkId: string, transportCompany: TransportCompany): MotorPark | null {
    const motorParkIndex = motorParks.findIndex((mp) => mp.id === motorParkId);

    if (motorParkIndex === -1) {
      return null;
    }

    motorParks[motorParkIndex].transportCompanies.push(transportCompany);
    return motorParks[motorParkIndex];
  }
}
