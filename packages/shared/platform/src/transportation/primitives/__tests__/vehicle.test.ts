
import { VehicleService } from "../vehicle";

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

describe("VehicleService", () => {
  let vehicleService: VehicleService;

  beforeEach(() => {
    vehicleService = new VehicleService();
  });

  it("should add a new vehicle", () => {
    const vehicle = vehicleService.addVehicle(
      "Toyota",
      "Corolla",
      2022,
      5,
      "ABC-123"
    );
    expect(vehicle).toBeDefined();
    expect(vehicle.make).toBe("Toyota");
    expect(vehicle.id).toBe("mock-uuid");
  });

  it("should throw an error if required fields are missing", () => {
    expect(() => vehicleService.addVehicle("", "", 0, 0, "")).toThrow(
      "Missing required fields: make, model, year, capacity, and registrationNumber are required."
    );
  });

  it("should get all vehicles", () => {
    vehicleService.addVehicle("Toyota", "Corolla", 2022, 5, "ABC-123");
    const vehicles = vehicleService.getAllVehicles();
    expect(vehicles.length).toBe(1);
  });

  it("should get a vehicle by ID", () => {
    const newVehicle = vehicleService.addVehicle(
      "Toyota",
      "Corolla",
      2022,
      5,
      "ABC-123"
    );
    const vehicle = vehicleService.getVehicleById(newVehicle.id);
    expect(vehicle).toBeDefined();
    expect(vehicle?.id).toBe(newVehicle.id);
  });

  it("should return null when getting a vehicle by an invalid ID", () => {
    const vehicle = vehicleService.getVehicleById("invalid-id");
    expect(vehicle).toBeNull();
  });

  it("should update a vehicle", () => {
    const newVehicle = vehicleService.addVehicle(
      "Toyota",
      "Corolla",
      2022,
      5,
      "ABC-123"
    );
    const updatedVehicle = vehicleService.updateVehicle(newVehicle.id, {
      year: 2023,
    });
    expect(updatedVehicle).toBeDefined();
    expect(updatedVehicle?.year).toBe(2023);
  });

  it("should return null when updating a vehicle with an invalid ID", () => {
    const updatedVehicle = vehicleService.updateVehicle("invalid-id", {
      year: 2023,
    });
    expect(updatedVehicle).toBeNull();
  });

  it("should decommission a vehicle", () => {
    const newVehicle = vehicleService.addVehicle(
      "Toyota",
      "Corolla",
      2022,
      5,
      "ABC-123"
    );
    const result = vehicleService.decommissionVehicle(newVehicle.id);
    expect(result).toBe(true);
    const vehicles = vehicleService.getAllVehicles();
    expect(vehicles.length).toBe(0);
  });

  it("should return false when decommissioning a vehicle with an invalid ID", () => {
    const result = vehicleService.decommissionVehicle("invalid-id");
    expect(result).toBe(false);
  });
});
