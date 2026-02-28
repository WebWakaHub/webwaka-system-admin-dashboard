/**
 * Unit Tests for Response Transformer Service
 * 
 * Tests response transformation, error formatting, and pagination.
 */

import { ResponseTransformerService } from '../../response/response-transformer.service';

describe('ResponseTransformerService', () => {
  let transformer: ResponseTransformerService;

  beforeEach(() => {
    transformer = new ResponseTransformerService();
  });

  describe('transformSuccess', () => {
    it('should transform successful response with data', () => {
      const data = { id: '123', name: 'Test' };
      const requestId = 'req-123';
      const result = transformer.transformSuccess(data, requestId);

      expect(result.data).toEqual(data);
      expect(result.meta).toBeDefined();
      expect(result.meta!.requestId).toBe(requestId);
      expect(result.meta!.version).toBe('v1');
      expect(result.meta!.timestamp).toBeDefined();
    });

    it('should include custom version', () => {
      const result = transformer.transformSuccess({}, 'req-123', 'v2');

      expect(result.meta!.version).toBe('v2');
    });

    it('should include pagination metadata when provided', () => {
      const pagination = {
        page: 1,
        pageSize: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrevious: false,
      };

      const result = transformer.transformSuccess({}, 'req-123', 'v1', pagination);

      expect(result.meta!.pagination).toEqual(pagination);
    });
  });

  describe('transformError', () => {
    it('should transform error with code and message', () => {
      const result = transformer.transformError(
        'TEST_ERROR',
        'Test error message',
        'req-123'
      );

      expect(result.statusCode).toBe(500);
      expect(result.body.error.code).toBe('TEST_ERROR');
      expect(result.body.error.message).toBe('Test error message');
      expect(result.body.error.requestId).toBe('req-123');
      expect(result.body.error.timestamp).toBeDefined();
    });

    it('should include error details when provided', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const result = transformer.transformError(
        'VALIDATION_ERROR',
        'Validation failed',
        'req-123',
        details
      );

      expect(result.body.error.details).toEqual(details);
    });

    it('should use custom status code', () => {
      const result = transformer.transformError(
        'NOT_FOUND',
        'Resource not found',
        'req-123',
        undefined,
        404
      );

      expect(result.statusCode).toBe(404);
    });
  });

  describe('transformValidationError', () => {
    it('should transform validation errors', () => {
      const errors = [
        { field: 'email', message: 'Email is required' },
        { field: 'name', message: 'Name must be at least 3 characters' },
      ];

      const result = transformer.transformValidationError(errors, 'req-123');

      expect(result.statusCode).toBe(400);
      expect(result.body.error.code).toBe('VALIDATION_ERROR');
      expect(result.body.error.message).toBe('Request validation failed');
      expect(result.body.error.details.errors).toEqual(errors);
    });
  });

  describe('transformAuthenticationError', () => {
    it('should transform authentication error', () => {
      const result = transformer.transformAuthenticationError(
        'Invalid token',
        'req-123'
      );

      expect(result.statusCode).toBe(401);
      expect(result.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(result.body.error.message).toBe('Invalid token');
    });
  });

  describe('transformAuthorizationError', () => {
    it('should transform authorization error', () => {
      const result = transformer.transformAuthorizationError(
        'Insufficient permissions',
        'req-123'
      );

      expect(result.statusCode).toBe(403);
      expect(result.body.error.code).toBe('AUTHORIZATION_ERROR');
      expect(result.body.error.message).toBe('Insufficient permissions');
    });
  });

  describe('transformRateLimitError', () => {
    it('should transform rate limit error', () => {
      const resetAt = new Date('2026-02-16T13:00:00.000Z');
      const result = transformer.transformRateLimitError(resetAt, 'req-123');

      expect(result.statusCode).toBe(429);
      expect(result.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.body.error.message).toContain('Too many requests');
      expect(result.body.error.details.resetAt).toBe(resetAt.toISOString());
    });
  });

  describe('transformNotFoundError', () => {
    it('should transform not found error', () => {
      const result = transformer.transformNotFoundError('User', 'req-123');

      expect(result.statusCode).toBe(404);
      expect(result.body.error.code).toBe('NOT_FOUND');
      expect(result.body.error.message).toBe('User not found');
    });
  });

  describe('transformInternalError', () => {
    it('should transform internal error without details', () => {
      const result = transformer.transformInternalError(
        'Database connection failed',
        'req-123',
        false
      );

      expect(result.statusCode).toBe(500);
      expect(result.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.body.error.message).toBe('An unexpected error occurred');
      expect(result.body.error.details).toBeUndefined();
    });

    it('should include details in development mode', () => {
      const result = transformer.transformInternalError(
        'Database connection failed',
        'req-123',
        true
      );

      expect(result.body.error.message).toBe('Database connection failed');
      expect(result.body.error.details).toBeDefined();
      expect(result.body.error.details.originalMessage).toBe('Database connection failed');
    });
  });

  describe('transformPaginatedResponse', () => {
    it('should transform paginated response', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const result = transformer.transformPaginatedResponse(
        items,
        100,
        1,
        10,
        'req-123'
      );

      expect(result.data).toEqual(items);
      expect(result.meta!.pagination).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.meta!.pagination?.page).toBe(1);
      expect(result.meta!.pagination?.pageSize).toBe(10);
      expect(result.meta!.pagination?.total).toBe(100);
      expect(result.meta!.pagination?.totalPages).toBe(10);
      expect(result.meta!.pagination?.hasNext).toBe(true);
      expect(result.meta!.pagination?.hasPrevious).toBe(false);
    });

    it('should calculate hasNext and hasPrevious correctly', () => {
      const result = transformer.transformPaginatedResponse(
        [],
        100,
        5,
        10,
        'req-123'
      );

      expect(result.meta).toBeDefined();
      expect(result.meta!.pagination?.hasNext).toBe(true);
      expect(result.meta!.pagination?.hasPrevious).toBe(true);
    });

    it('should handle last page correctly', () => {
      const result = transformer.transformPaginatedResponse(
        [],
        100,
        10,
        10,
        'req-123'
      );

      expect(result.meta).toBeDefined();
      expect(result.meta!.pagination?.hasNext).toBe(false);
      expect(result.meta!.pagination?.hasPrevious).toBe(true);
    });
  });

  describe('sanitizeError', () => {
    it('should sanitize error with message', () => {
      const error = new Error('Database error\n  at connection.ts:45');
      const result = transformer.sanitizeError(error);

      expect(result).toBe('Database error');
    });

    it('should handle error without message', () => {
      const error = {};
      const result = transformer.sanitizeError(error);

      expect(result).toBe('An error occurred');
    });

    it('should handle string errors', () => {
      const result = transformer.sanitizeError('Simple error');

      expect(result).toBe('An error occurred');
    });
  });
});
