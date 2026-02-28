/**
 * Request Router Service
 * 
 * Routes API requests to appropriate downstream modules based on path and method.
 * Supports API versioning and dynamic route configuration.
 */

import { ApiRouteConfig } from '../types';

export class RequestRouterService {
  private routes: Map<string, ApiRouteConfig>;

  constructor() {
    this.routes = new Map();
    this.initializeDefaultRoutes();
  }

  /**
   * Initialize default routes
   * In production, routes would be loaded from configuration or database
   */
  private initializeDefaultRoutes(): void {
    // Example routes (to be expanded based on actual modules)
    const defaultRoutes: ApiRouteConfig[] = [
      {
        path: '/api/v1/health',
        method: 'GET',
        module: 'health',
        version: 'v1',
        requiresAuth: false,
      },
      {
        path: '/api/v1/tenants',
        method: 'GET',
        module: 'tenant-management',
        version: 'v1',
        requiresAuth: true,
        requiredPermission: 'tenant:read',
      },
      {
        path: '/api/v1/tenants',
        method: 'POST',
        module: 'tenant-management',
        version: 'v1',
        requiresAuth: true,
        requiredPermission: 'tenant:create',
      },
      {
        path: '/api/v1/users',
        method: 'GET',
        module: 'user-management',
        version: 'v1',
        requiresAuth: true,
        requiredPermission: 'user:read',
      },
      {
        path: '/api/v1/permissions',
        method: 'GET',
        module: 'weeg',
        version: 'v1',
        requiresAuth: true,
        requiredPermission: 'permission:read',
      },
    ];

    // Register default routes
    defaultRoutes.forEach(route => this.registerRoute(route));
  }

  /**
   * Register a new route
   * 
   * @param route - Route configuration
   */
  registerRoute(route: ApiRouteConfig): void {
    const key = this.getRouteKey(route.path, route.method);
    this.routes.set(key, route);
  }

  /**
   * Find route configuration for a request
   * 
   * @param path - Request path
   * @param method - HTTP method
   * @returns Route configuration or null if not found
   */
  findRoute(path: string, method: string): ApiRouteConfig | null {
    // Exact match
    const exactKey = this.getRouteKey(path, method);
    const exactRoute = this.routes.get(exactKey);
    if (exactRoute) {
      return exactRoute;
    }

    // Pattern matching (for dynamic routes like /api/v1/users/:id)
    for (const [key, route] of this.routes.entries()) {
      if (this.matchRoute(route.path, path) && route.method === method.toUpperCase()) {
        return route;
      }
    }

    return null;
  }

  /**
   * Match a route pattern against a request path
   * 
   * @param pattern - Route pattern (e.g., /api/v1/users/:id)
   * @param path - Request path (e.g., /api/v1/users/123)
   * @returns True if path matches pattern
   */
  private matchRoute(pattern: string, path: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)') // Replace :param with capture group
      .replace(/\//g, '\\/'); // Escape slashes

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Extract path parameters from a request path
   * 
   * @param pattern - Route pattern (e.g., /api/v1/users/:id)
   * @param path - Request path (e.g., /api/v1/users/123)
   * @returns Object with parameter names and values
   */
  extractPathParams(pattern: string, path: string): Record<string, string> {
    const params: Record<string, string> = {};

    // Extract parameter names from pattern
    const paramNames = (pattern.match(/:[^/]+/g) || []).map(name => name.slice(1));

    // Extract parameter values from path
    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)')
      .replace(/\//g, '\\/');
    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (match && paramNames.length > 0) {
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
    }

    return params;
  }

  /**
   * Get all registered routes
   * 
   * @returns Array of route configurations
   */
  getAllRoutes(): ApiRouteConfig[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get routes for a specific module
   * 
   * @param moduleName - Module name
   * @returns Array of route configurations
   */
  getModuleRoutes(moduleName: string): ApiRouteConfig[] {
    return Array.from(this.routes.values()).filter(
      route => route.module === moduleName
    );
  }

  /**
   * Get routes for a specific API version
   * 
   * @param version - API version (e.g., 'v1')
   * @returns Array of route configurations
   */
  getVersionRoutes(version: string): ApiRouteConfig[] {
    return Array.from(this.routes.values()).filter(
      route => route.version === version
    );
  }

  /**
   * Unregister a route
   * 
   * @param path - Route path
   * @param method - HTTP method
   */
  unregisterRoute(path: string, method: string): void {
    const key = this.getRouteKey(path, method);
    this.routes.delete(key);
  }

  /**
   * Clear all routes
   */
  clearRoutes(): void {
    this.routes.clear();
  }

  /**
   * Generate route key for Map storage
   * 
   * @param path - Route path
   * @param method - HTTP method
   * @returns Route key
   */
  private getRouteKey(path: string, method: string): string {
    return `${method.toUpperCase()}:${path}`;
  }

  /**
   * Check if a route exists
   * 
   * @param path - Route path
   * @param method - HTTP method
   * @returns True if route exists
   */
  hasRoute(path: string, method: string): boolean {
    return this.findRoute(path, method) !== null;
  }
}
