/**
 * Unit Tests for Authentication Service
 * 
 * Tests JWT validation, token extraction, and request context creation.
 */

import { AuthenticationService } from '../../auth/authentication.service';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  const jwtSecret = 'test-secret';

  beforeEach(() => {
    authService = new AuthenticationService(jwtSecret);
  });

  describe('authenticate', () => {
    it('should return error when Authorization header is missing', async () => {
      const result = await authService.authenticate(undefined);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing Authorization header');
      expect(result.context).toBeUndefined();
    });

    it('should return error when Authorization header has invalid format', async () => {
      const result = await authService.authenticate('InvalidFormat');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Authorization header format');
      expect(result.context).toBeUndefined();
    });

    it('should return error when Authorization header is not Bearer token', async () => {
      const result = await authService.authenticate('Basic token123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Authorization header format');
      expect(result.context).toBeUndefined();
    });

    it('should return error when JWT token is malformed', async () => {
      const result = await authService.authenticate('Bearer invalid.token');

      expect(result.success).toBe(false);
      expect(result.error).toContain('JWT validation failed');
      expect(result.context).toBeUndefined();
    });

    it('should return error when JWT token is missing required fields', async () => {
      // Create a JWT-like token without tenantId
      const payload = { sub: 'user123' };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const token = `header.${encodedPayload}.signature`;

      const result = await authService.authenticate(`Bearer ${token}`);

      expect(result.success).toBe(false);
      expect(result.error).toContain('missing required fields');
    });

    it('should successfully authenticate valid JWT token', async () => {
      // Create a valid JWT-like token
      const payload = {
        sub: 'user-123',
        tenantId: 'tenant-456',
        email: 'test@example.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const token = `header.${encodedPayload}.signature`;

      const result = await authService.authenticate(`Bearer ${token}`, '192.168.1.1', 'TestAgent/1.0');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.context).toBeDefined();
      expect(result.context?.tenantId).toBe('tenant-456');
      expect(result.context?.userId).toBe('user-123');
      expect(result.context?.ipAddress).toBe('192.168.1.1');
      expect(result.context?.userAgent).toBe('TestAgent/1.0');
      expect(result.context?.requestId).toBeDefined();
      expect(result.context?.timestamp).toBeInstanceOf(Date);
    });

    it('should return error when JWT token is expired', async () => {
      // Create an expired JWT token
      const payload = {
        sub: 'user-123',
        tenantId: 'tenant-456',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const token = `header.${encodedPayload}.signature`;

      const result = await authService.authenticate(`Bearer ${token}`);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Token expired');
    });

    it('should create unique request IDs for each authentication', async () => {
      const payload = {
        sub: 'user-123',
        tenantId: 'tenant-456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const token = `header.${encodedPayload}.signature`;

      const result1 = await authService.authenticate(`Bearer ${token}`);
      const result2 = await authService.authenticate(`Bearer ${token}`);

      expect(result1.context?.requestId).toBeDefined();
      expect(result2.context?.requestId).toBeDefined();
      expect(result1.context?.requestId).not.toBe(result2.context?.requestId);
    });
  });

  describe('extractTenantId', () => {
    it('should return null when Authorization header is missing', () => {
      const tenantId = authService.extractTenantId(undefined);
      expect(tenantId).toBeNull();
    });

    it('should return null when Authorization header has invalid format', () => {
      const tenantId = authService.extractTenantId('InvalidFormat');
      expect(tenantId).toBeNull();
    });

    it('should return null when JWT token is malformed', () => {
      const tenantId = authService.extractTenantId('Bearer invalid.token');
      expect(tenantId).toBeNull();
    });

    it('should extract tenantId from valid JWT token', () => {
      const payload = {
        sub: 'user-123',
        tenantId: 'tenant-456',
      };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const token = `header.${encodedPayload}.signature`;

      const tenantId = authService.extractTenantId(`Bearer ${token}`);
      expect(tenantId).toBe('tenant-456');
    });

    it('should return null when tenantId is missing from token', () => {
      const payload = {
        sub: 'user-123',
      };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const token = `header.${encodedPayload}.signature`;

      const tenantId = authService.extractTenantId(`Bearer ${token}`);
      expect(tenantId).toBeNull();
    });
  });
});
