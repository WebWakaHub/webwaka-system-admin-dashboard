
import { InventorySyncService } from "../services/InventorySyncService";

jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => {
    return {
      smembers: jest.fn().mockResolvedValue(["A1", "A2"]),
      srem: jest.fn().mockResolvedValue(1),
      sadd: jest.fn().mockResolvedValue(1),
    };
  });
});

describe("InventorySyncService", () => {
  let inventorySyncService: InventorySyncService;

  beforeEach(() => {
    inventorySyncService = new InventorySyncService();
  });

  it("should get available seats", async () => {
    const seats = await inventorySyncService.getAvailableSeats("trip-1");
    expect(seats).toEqual(["A1", "A2"]);
  });

  it("should lock a seat", async () => {
    const result = await inventorySyncService.lockSeat("trip-1", "A1");
    expect(result).toBe(true);
  });

  it("should release a seat", async () => {
    const result = await inventorySyncService.releaseSeat("trip-1", "A1");
    expect(result).toBe(true);
  });
});
