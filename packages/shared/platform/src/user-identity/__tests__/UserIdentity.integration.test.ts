/**
 * Integration tests for User & Identity Management
 */

import { UserIdentity } from '../UserIdentity';

describe('UserIdentity Integration Tests', () => {
  let userIdentity: UserIdentity;
  let mockDb: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    userIdentity = new UserIdentity({
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

  describe('Complete User Flow', () => {
    it('should complete full user registration and login flow', async () => {
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      // Mock database responses
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // Check existing user
        .mockResolvedValueOnce({
          // Create user
          rows: [
            {
              id: 'user-1',
              tenant_id: 'tenant-1',
              email: 'test@example.com',
              password_hash: 'hashed-password',
              first_name: 'John',
              last_name: 'Doe',
              email_verified: false,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({
          // Find user for login
          rows: [
            {
              id: 'user-1',
              tenant_id: 'tenant-1',
              email: 'test@example.com',
              password_hash: 'hashed-password',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ name: 'user' }] }) // Get roles
        .mockResolvedValueOnce({ rows: [] }); // Update last login

      // Register user
      const user = await userIdentity.auth.register('tenant-1', {
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.email).toBe('test@example.com');

      // Login user
      const token = await userIdentity.auth.login('tenant-1', {
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

      expect(token.accessToken).toBeDefined();
    });
  });

  describe('Complete RBAC Flow', () => {
    it('should complete full RBAC setup and permission check', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          // Create role
          rows: [
            {
              id: 'role-1',
              tenant_id: 'tenant-1',
              name: 'editor',
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({
          // Create permission
          rows: [
            {
              id: 'perm-1',
              tenant_id: 'tenant-1',
              name: 'posts.create',
              resource: 'posts',
              action: 'create',
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({
          // Get role for grant
          rows: [{ id: 'role-1', tenant_id: 'tenant-1', name: 'editor' }],
        })
        .mockResolvedValueOnce({
          // Get permission for grant
          rows: [{ id: 'perm-1', tenant_id: 'tenant-1', name: 'posts.create' }],
        })
        .mockResolvedValueOnce({ rows: [] }) // Grant permission
        .mockResolvedValueOnce({
          // Get role for assign
          rows: [{ id: 'role-1', tenant_id: 'tenant-1', name: 'editor' }],
        })
        .mockResolvedValueOnce({ rows: [] }) // Assign role
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }); // Check permission

      // Create role
      const role = await userIdentity.rbac.createRole('tenant-1', 'editor');

      // Create permission
      const permission = await userIdentity.rbac.createPermission(
        'tenant-1',
        'posts.create',
        'posts',
        'create'
      );

      // Grant permission to role
      await userIdentity.rbac.grantPermissionToRole('tenant-1', role.id, permission.id);

      // Assign role to user
      await userIdentity.rbac.assignRoleToUser('tenant-1', 'user-1', role.id);

      // Check permission
      const hasPermission = await userIdentity.rbac.hasPermission(
        'tenant-1',
        'user-1',
        'posts',
        'create'
      );

      expect(hasPermission).toBe(true);
    });
  });
});
