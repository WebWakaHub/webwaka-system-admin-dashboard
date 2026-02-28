/**
 * Unit Tests for CORS Middleware
 * 
 * Tests Cross-Origin Resource Sharing configuration and validation.
 */

import { CorsMiddleware } from '../../middleware/cors.middleware';

describe('CorsMiddleware', () => {
  describe('with default configuration', () => {
    let cors: CorsMiddleware;

    beforeEach(() => {
      cors = new CorsMiddleware();
    });

    it('should allow all origins by default', () => {
      expect(cors.isOriginAllowed('https://example.com')).toBe(true);
      expect(cors.isOriginAllowed('http://localhost:3000')).toBe(true);
    });

    it('should return false for undefined origin', () => {
      expect(cors.isOriginAllowed(undefined)).toBe(false);
    });

    it('should generate CORS headers', () => {
      const headers = cors.getCorsHeaders('https://example.com');

      expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Allow-Methods']).toContain('POST');
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
      expect(headers['Access-Control-Allow-Credentials']).toBe('true');
    });
  });

  describe('with custom configuration', () => {
    let cors: CorsMiddleware;

    beforeEach(() => {
      cors = new CorsMiddleware({
        allowedOrigins: ['https://app.webwaka.com', 'https://admin.webwaka.com'],
        allowedMethods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['X-Request-ID'],
        maxAge: 3600,
        credentials: false,
      });
    });

    it('should only allow configured origins', () => {
      expect(cors.isOriginAllowed('https://app.webwaka.com')).toBe(true);
      expect(cors.isOriginAllowed('https://admin.webwaka.com')).toBe(true);
      expect(cors.isOriginAllowed('https://evil.com')).toBe(false);
    });

    it('should include only configured methods', () => {
      const headers = cors.getCorsHeaders('https://app.webwaka.com');

      expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST');
    });

    it('should include only configured headers', () => {
      const headers = cors.getCorsHeaders('https://app.webwaka.com');

      expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type, Authorization');
    });

    it('should include exposed headers', () => {
      const headers = cors.getCorsHeaders('https://app.webwaka.com');

      expect(headers['Access-Control-Expose-Headers']).toBe('X-Request-ID');
    });

    it('should use custom max age', () => {
      const headers = cors.getCorsHeaders('https://app.webwaka.com');

      expect(headers['Access-Control-Max-Age']).toBe('3600');
    });

    it('should not include credentials header when disabled', () => {
      const headers = cors.getCorsHeaders('https://app.webwaka.com');

      expect(headers['Access-Control-Allow-Credentials']).toBeUndefined();
    });
  });

  describe('handlePreflight', () => {
    let cors: CorsMiddleware;

    beforeEach(() => {
      cors = new CorsMiddleware({
        allowedOrigins: ['https://app.webwaka.com'],
      });
    });

    it('should return 204 for allowed origin', () => {
      const response = cors.handlePreflight('https://app.webwaka.com');

      expect(response.statusCode).toBe(204);
      expect(response.body).toBeNull();
      expect(response.headers['Access-Control-Allow-Origin']).toBe('https://app.webwaka.com');
    });

    it('should return 403 for disallowed origin', () => {
      const response = cors.handlePreflight('https://evil.com');

      expect(response.statusCode).toBe(403);
      expect(response.body.error).toBe('Origin not allowed');
    });

    it('should return 403 for undefined origin', () => {
      const response = cors.handlePreflight(undefined);

      expect(response.statusCode).toBe(403);
    });
  });

  describe('addCorsHeaders', () => {
    let cors: CorsMiddleware;

    beforeEach(() => {
      cors = new CorsMiddleware();
    });

    it('should add CORS headers to existing headers', () => {
      const existingHeaders = {
        'Content-Type': 'application/json',
      };

      const headers = cors.addCorsHeaders('https://example.com', existingHeaders);

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
    });

    it('should work with empty headers', () => {
      const headers = cors.addCorsHeaders('https://example.com');

      expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
    });
  });

  describe('validateRequest', () => {
    let cors: CorsMiddleware;

    beforeEach(() => {
      cors = new CorsMiddleware({
        allowedOrigins: ['https://app.webwaka.com'],
        allowedMethods: ['GET', 'POST'],
      });
    });

    it('should validate allowed origin and method', () => {
      const result = cors.validateRequest('https://app.webwaka.com', 'GET');

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject disallowed origin', () => {
      const result = cors.validateRequest('https://evil.com', 'GET');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Origin not allowed');
    });

    it('should reject disallowed method', () => {
      const result = cors.validateRequest('https://app.webwaka.com', 'DELETE');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Method not allowed');
    });

    it('should be case-insensitive for methods', () => {
      const result = cors.validateRequest('https://app.webwaka.com', 'get');

      expect(result.valid).toBe(true);
    });
  });

  describe('wildcard origin', () => {
    let cors: CorsMiddleware;

    beforeEach(() => {
      cors = new CorsMiddleware({
        allowedOrigins: ['*'],
      });
    });

    it('should allow any origin with wildcard', () => {
      expect(cors.isOriginAllowed('https://any-domain.com')).toBe(true);
      expect(cors.isOriginAllowed('http://localhost:3000')).toBe(true);
    });

    it('should return wildcard in headers', () => {
      const headers = cors.getCorsHeaders('https://any-domain.com');

      expect(headers['Access-Control-Allow-Origin']).toBe('https://any-domain.com');
    });
  });
});
