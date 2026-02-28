/**
 * Unit tests for AuthService
 */

import { AuthService } from '../services/AuthService';
import { UserAlreadyExistsError, InvalidCredentialsError, PasswordPolicyError } from '../errors';

describe('AuthService', () => {
  let authService: AuthService;
  let mockDb: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    authService = new AuthService({
      database: mockDb,
      eventBus: mockEventBus,
      jwtSecret: 'test-secret',
      jwtExpiresIn: '7d',
      bcryptRounds: 10,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'user-1',
              tenant_id: 'tenant-1',
              email: 'test@example.com',
              password_hash: 'hashed',
              first_name: 'John',
              last_name: 'Doe',
              email_verified: false,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        }); // Insert user

      const user = await authService.register('tenant-1', {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.email).toBe('test@example.com');
      expect(mockEventBus.emit).toHaveBeenCalledWith('user.created', expect.any(Object));
    });

    it('should throw error if user already exists', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: 'existing-user' }],
      });

      await expect(
        authService.register('tenant-1', {
          email: 'existing@example.com',
          password: 'SecurePass123!',
        })
      ).rejects.toThrow(UserAlreadyExistsError);
    });

    it('should throw error if password does not meet policy', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        authService.register('tenant-1', {
          email: 'test@example.com',
          password: 'weak',
        })
      ).rejects.toThrow(PasswordPolicyError);
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'user-1',
              tenant_id: 'tenant-1',
              email: 'test@example.com',
              password_hash: 'hashed',
            },
          ],
        }) // Find user
        .mockResolvedValueOnce({ rows: [{ name: 'admin' }] }) // Get roles
        .mockResolvedValueOnce({ rows: [] }); // Update last login

      const token = await authService.login('tenant-1', {
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

      expect(token.accessToken).toBeDefined();
      expect(token.tokenType).toBe('Bearer');
      expect(mockEventBus.emit).toHaveBeenCalledWith('user.login', expect.any(Object));
    });

    it('should throw error if user not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        authService.login('tenant-1', {
          email: 'nonexistent@example.com',
          password: 'password',
        })
      ).rejects.toThrow(InvalidCredentialsError);
    });

    it('should throw error if password is incorrect', async () => {
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'user-1',
            tenant_id: 'tenant-1',
            email: 'test@example.com',
            password_hash: 'hashed',
          },
        ],
      });

      await expect(
        authService.login('tenant-1', {
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'user-1', tenantId: 'tenant-1', email: 'test@example.com', roles: [] },
        'test-secret'
      );

      const payload = await authService.verifyToken(token);

      expect(payload.userId).toBe('user-1');
      expect(payload.tenantId).toBe('tenant-1');
    });
  });
});
