
import { DriverService } from "../driver";

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

describe("DriverService", () => {
  let driverService: DriverService;

  beforeEach(() => {
    driverService = new DriverService();
    // Clear the drivers array before each test
    (driverService as any).getAllDrivers().length = 0;
  });

  it("should add a new driver", () => {
    const driver = driverService.addDriver(
      "John",
      "Doe",
      "D12345",
      "1234567890"
    );
    expect(driver).toBeDefined();
    expect(driver.firstName).toBe("John");
    expect(driver.id).toBe("mock-uuid");
  });

  it("should throw an error if required fields are missing", () => {
    expect(() => driverService.addDriver("", "", "", "")).toThrow(
      "Missing required fields: firstName, lastName, licenseNumber, and phoneNumber are required."
    );
  });

  it("should get all drivers", () => {
    driverService.addDriver("John", "Doe", "D12345", "1234567890");
    const drivers = driverService.getAllDrivers();
    expect(drivers.length).toBe(1);
  });

  it("should get a driver by ID", () => {
    const newDriver = driverService.addDriver(
      "John",
      "Doe",
      "D12345",
      "1234567890"
    );
    const driver = driverService.getDriverById(newDriver.id);
    expect(driver).toBeDefined();
    expect(driver?.id).toBe(newDriver.id);
  });

  it("should return null when getting a driver by an invalid ID", () => {
    const driver = driverService.getDriverById("invalid-id");
    expect(driver).toBeNull();
  });

  it("should update a driver", () => {
    const newDriver = driverService.addDriver(
      "John",
      "Doe",
      "D12345",
      "1234567890"
    );
    const updatedDriver = driverService.updateDriver(newDriver.id, {
      lastName: "Smith",
    });
    expect(updatedDriver).toBeDefined();
    expect(updatedDriver?.lastName).toBe("Smith");
  });

  it("should return null when updating a driver with an invalid ID", () => {
    const updatedDriver = driverService.updateDriver("invalid-id", {
      lastName: "Smith",
    });
    expect(updatedDriver).toBeNull();
  });

  it("should deactivate a driver", () => {
    const newDriver = driverService.addDriver(
      "John",
      "Doe",
      "D12345",
      "1234567890"
    );
    const deactivatedDriver = driverService.deactivateDriver(newDriver.id);
    expect(deactivatedDriver).toBeDefined();
    expect(deactivatedDriver?.isActive).toBe(false);
  });

  it("should return null when deactivating a driver with an invalid ID", () => {
    const deactivatedDriver = driverService.deactivateDriver("invalid-id");
    expect(deactivatedDriver).toBeNull();
  });
});
