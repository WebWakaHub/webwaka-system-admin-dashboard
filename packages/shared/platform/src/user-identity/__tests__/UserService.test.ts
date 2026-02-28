/**
 * Unit tests for UserService
 */

import { UserService } from '../services/UserService';
import { UserNotFoundError } from '../errors';

describe('UserService', () => {
  let userService: UserService;
  let mockDb: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    userService = new UserService({
      database: mockDb,
      eventBus: mockEventBus,
      bcryptRounds: 10,
    });
  });

  describe('getUserById', () => {
    it('should get a user by ID', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'user-1',
            tenant_id: 'tenant-1',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            email_verified: true,
            created_at: new Date(),
          },
        ],
      });

      const user = await userService.getUserById('tenant-1', 'user-1');

      expect(user.id).toBe('user-1');
      expect(user.email).toBe('test@example.com');
    });

    it('should throw error if user not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(userService.getUserById('tenant-1', 'nonexistent')).rejects.toThrow(
        UserNotFoundError
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'user-1',
            tenant_id: 'tenant-1',
            email: 'test@example.com',
            first_name: 'Jane',
            last_name: 'Smith',
            created_at: new Date(),
          },
        ],
      });

      const user = await userService.updateProfile('tenant-1', 'user-1', {
        firstName: 'Jane',
        lastName: 'Smith',
      });

      expect(user.firstName).toBe('Jane');
      expect(mockEventBus.emit).toHaveBeenCalledWith('user.updated', expect.any(Object));
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed-password');

      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'user-1',
              tenant_id: 'tenant-1',
              password_hash: 'old-hashed-password',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      await userService.changePassword('tenant-1', 'user-1', 'oldpassword', 'newpassword');

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'user.password.changed',
        expect.any(Object)
      );
    });
  });

  describe('initiatePasswordReset', () => {
    it('should initiate password reset', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'user-1',
              tenant_id: 'tenant-1',
              email: 'test@example.com',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      await userService.initiatePasswordReset('tenant-1', 'test@example.com');

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'user.password.reset.requested',
        expect.any(Object)
      );
    });
  });

  describe('completePasswordReset', () => {
    it('should complete password reset', async () => {
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed-password');

      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'user-1',
              tenant_id: 'tenant-1',
              email: 'test@example.com',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      await userService.completePasswordReset('tenant-1', 'reset-token', 'newpassword');

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'user.password.reset.completed',
        expect.any(Object)
      );
    });
  });
});
