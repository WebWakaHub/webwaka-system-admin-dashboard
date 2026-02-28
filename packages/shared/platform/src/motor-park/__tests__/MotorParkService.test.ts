
import { MotorParkService } from "../services/MotorParkService";
import { TransportCompany } from "../../transport-company/services/TransportCompanyService";

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

describe("MotorParkService", () => {
  let motorParkService: MotorParkService;

  beforeEach(() => {
    motorParkService = new MotorParkService();
  });

  it("should create a new motor park", () => {
    const motorPark = motorParkService.createMotorPark(
      "Test Park",
      "123 Test St",
      "123-456-7890"
    );
    expect(motorPark).toBeDefined();
    expect(motorPark.name).toBe("Test Park");
    expect(motorPark.id).toBe("mock-uuid");
  });

  it("should throw an error if required fields are missing", () => {
    expect(() => motorParkService.createMotorPark("", "", "")).toThrow(
      "Missing required fields: name, address, and contactPhone are required."
    );
  });

  it("should add a transport company to a motor park", () => {
    const motorPark = motorParkService.createMotorPark(
      "Test Park",
      "123 Test St",
      "123-456-7890"
    );
    const transportCompany: TransportCompany = {
      id: "company-1",
      name: "Test Company",
      address: "456 Test St",
      contactPhone: "987-654-3210",
    };
    const updatedMotorPark = motorParkService.addTransportCompanyToMotorPark(
      motorPark.id,
      transportCompany
    );
    expect(updatedMotorPark).toBeDefined();
    expect(updatedMotorPark?.transportCompanies.length).toBe(1);
  });

  it("should return null when adding a transport company to a non-existent motor park", () => {
    const transportCompany: TransportCompany = {
      id: "company-1",
      name: "Test Company",
      address: "456 Test St",
      contactPhone: "987-654-3210",
    };
    const updatedMotorPark = motorParkService.addTransportCompanyToMotorPark(
      "invalid-id",
      transportCompany
    );
    expect(updatedMotorPark).toBeNull();
  });
});
