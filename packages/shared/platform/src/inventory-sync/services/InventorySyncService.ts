
import { Redis } from "ioredis";
import { Nats, connect } from "nats";

// Service for synchronizing seat inventory
export class InventorySyncService {
  private redisClient: Redis;
  private natsClient: Nats;

  constructor() {
    this.redisClient = new Redis();
    // this.natsClient = await connect({ servers: "nats://localhost:4222" });
  }

  /**
   * Gets the available seats for a trip.
   * @param tripId - The ID of the trip.
   * @returns A promise that resolves to an array of available seat numbers.
   */
  async getAvailableSeats(tripId: string): Promise<string[]> {
    const seats = await this.redisClient.smembers(`trip:${tripId}:available_seats`);
    return seats;
  }

  /**
   * Locks a seat for a trip.
   * @param tripId - The ID of the trip.
   * @param seatNumber - The seat number to lock.
   * @returns A promise that resolves to true if the seat was locked, false otherwise.
   */
  async lockSeat(tripId: string, seatNumber: string): Promise<boolean> {
    const result = await this.redisClient.srem(`trip:${tripId}:available_seats`, seatNumber);
    if (result === 1) {
      // await this.natsClient.publish(`trip.${tripId}.seat_locked`, { seatNumber });
      return true;
    }
    return false;
  }

  /**
   * Releases a locked seat for a trip.
   * @param tripId - The ID of the trip.
   * @param seatNumber - The seat number to release.
   * @returns A promise that resolves to true if the seat was released, false otherwise.
   */
  async releaseSeat(tripId: string, seatNumber: string): Promise<boolean> {
    const result = await this.redisClient.sadd(`trip:${tripId}:available_seats`, seatNumber);
    if (result === 1) {
      // await this.natsClient.publish(`trip.${tripId}.seat_released`, { seatNumber });
      return true;
    }
    return false;
  }
}
