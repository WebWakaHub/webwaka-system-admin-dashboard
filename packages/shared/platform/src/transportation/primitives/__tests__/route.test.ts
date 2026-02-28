
import { RouteService, Waypoint } from '../route';

jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));

describe('RouteService', () => {
  let routeService: RouteService;

  beforeEach(() => {
    routeService = new RouteService();
  });

  it('should create a new route', () => {
    const waypoint: Waypoint = { id: '1', name: 'Stop 1', location: { latitude: 1, longitude: 1 } };
    const route = routeService.createRoute('Test Route', 'A route for testing', [waypoint]);
    expect(route).toBeDefined();
    expect(route.name).toBe('Test Route');
    expect(route.id).toBe('mock-uuid');
  });

  it('should throw an error if required fields are missing', () => {
    expect(() => routeService.createRoute('', '', [])).toThrow('Missing required fields: name, description, and at least one waypoint are required.');
  });

  it('should get all routes', () => {
    const waypoint: Waypoint = { id: '1', name: 'Stop 1', location: { latitude: 1, longitude: 1 } };
    routeService.createRoute('Test Route', 'A route for testing', [waypoint]);
    const routes = routeService.getAllRoutes();
    expect(routes.length).toBe(1);
  });

  it('should get a route by ID', () => {
    const waypoint: Waypoint = { id: '1', name: 'Stop 1', location: { latitude: 1, longitude: 1 } };
    const newRoute = routeService.createRoute('Test Route', 'A route for testing', [waypoint]);
    const route = routeService.getRouteById(newRoute.id);
    expect(route).toBeDefined();
    expect(route?.id).toBe(newRoute.id);
  });

  it('should return null when getting a route by an invalid ID', () => {
    const route = routeService.getRouteById('invalid-id');
    expect(route).toBeNull();
  });

  it('should update a route', () => {
    const waypoint: Waypoint = { id: '1', name: 'Stop 1', location: { latitude: 1, longitude: 1 } };
    const newRoute = routeService.createRoute('Test Route', 'A route for testing', [waypoint]);
    const updatedRoute = routeService.updateRoute(newRoute.id, { name: 'Updated Route' });
    expect(updatedRoute).toBeDefined();
    expect(updatedRoute?.name).toBe('Updated Route');
  });

  it('should return null when updating a route with an invalid ID', () => {
    const updatedRoute = routeService.updateRoute('invalid-id', { name: 'Updated Route' });
    expect(updatedRoute).toBeNull();
  });

  it('should delete a route', () => {
    const waypoint: Waypoint = { id: '1', name: 'Stop 1', location: { latitude: 1, longitude: 1 } };
    const newRoute = routeService.createRoute('Test Route', 'A route for testing', [waypoint]);
    const result = routeService.deleteRoute(newRoute.id);
    expect(result).toBe(true);
    const routes = routeService.getAllRoutes();
    expect(routes.length).toBe(0);
  });

  it('should return false when deleting a route with an invalid ID', () => {
    const result = routeService.deleteRoute('invalid-id');
    expect(result).toBe(false);
  });
});
