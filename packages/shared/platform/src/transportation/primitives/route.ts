
import { v4 as uuidv4 } from 'uuid';

// Interface for a single waypoint in a route
export interface Waypoint {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// Interface for a transportation route
export interface Route {
  id: string;
  name: string;
  description: string;
  waypoints: Waypoint[];
}

// In-memory data store for routes (for demonstration purposes)
const routes: Route[] = [];

// Service for managing transportation routes
export class RouteService {
  /**
   * Creates a new route.
   * @param name - The name of the route.
   * @param description - A description of the route.
   * @param waypoints - An array of waypoints that define the route.
   * @returns The newly created route.
   */
  createRoute(name: string, description: string, waypoints: Waypoint[]): Route {
    if (!name || !description || !waypoints || waypoints.length === 0) {
      throw new Error('Missing required fields: name, description, and at least one waypoint are required.');
    }

    const newRoute: Route = {
      id: uuidv4(),
      name,
      description,
      waypoints,
    };

    routes.push(newRoute);
    return newRoute;
  }

  /**
   * Retrieves all routes.
   * @returns An array of all routes.
   */
  getAllRoutes(): Route[] {
    return routes;
  }

  /**
   * Retrieves a single route by its ID.
   * @param id - The ID of the route to retrieve.
   * @returns The route with the specified ID, or null if not found.
   */
  getRouteById(id: string): Route | null {
    const route = routes.find((r) => r.id === id);
    return route || null;
  }

  /**
   * Updates an existing route.
   * @param id - The ID of the route to update.
   * @param updates - An object containing the fields to update.
   * @returns The updated route, or null if not found.
   */
  updateRoute(id: string, updates: Partial<Route>): Route | null {
    const routeIndex = routes.findIndex((r) => r.id === id);

    if (routeIndex === -1) {
      return null;
    }

    routes[routeIndex] = { ...routes[routeIndex], ...updates };
    return routes[routeIndex];
  }

  /**
   * Deletes a route.
   * @param id - The ID of the route to delete.
   * @returns True if the route was deleted, false otherwise.
   */
  deleteRoute(id: string): boolean {
    const routeIndex = routes.findIndex((r) => r.id === id);

    if (routeIndex === -1) {
      return false;
    }

    routes.splice(routeIndex, 1);
    return true;
  }
}
