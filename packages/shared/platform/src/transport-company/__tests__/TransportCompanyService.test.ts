
import { TransportCompanyService } from "../services/TransportCompanyService";

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

describe("TransportCompanyService", () => {
  let transportCompanyService: TransportCompanyService;

  beforeEach(() => {
    transportCompanyService = new TransportCompanyService();
  });

  it("should create a new transport company", () => {
    const transportCompany = transportCompanyService.createTransportCompany(
      "Test Company",
      "123 Test St",
      "123-456-7890"
    );
    expect(transportCompany).toBeDefined();
    expect(transportCompany.name).toBe("Test Company");
    expect(transportCompany.id).toBe("mock-uuid");
  });

  it("should throw an error if required fields are missing", () => {
    expect(() =>
      transportCompanyService.createTransportCompany("", "", "")
    ).toThrow(
      "Missing required fields: name, address, and contactPhone are required."
    );
  });
});
