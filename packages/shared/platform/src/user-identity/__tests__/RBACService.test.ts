/**
 * Unit tests for RBACService
 */

import { RBACService } from '../services/RBACService';
import { RoleNotFoundError, PermissionDeniedError } from '../errors';

describe('RBACService', () => {
  let rbacService: RBACService;
  let mockDb: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockDb = {
      query: jest.fn(),
    };

    mockEventBus = {
      emit: jest.fn(),
    };

    rbacService = new RBACService({
      database: mockDb,
      eventBus: mockEventBus,
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'role-1',
            tenant_id: 'tenant-1',
            name: 'admin',
            description: 'Administrator',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const role = await rbacService.createRole('tenant-1', 'admin', 'Administrator');

      expect(role.name).toBe('admin');
      expect(mockEventBus.emit).toHaveBeenCalledWith('role.created', expect.any(Object));
    });
  });

  describe('getRoleById', () => {
    it('should get a role by ID', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: 'role-1',
            tenant_id: 'tenant-1',
            name: 'admin',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const role = await rbacService.getRoleById('tenant-1', 'role-1');

      expect(role.id).toBe('role-1');
    });

    it('should throw error if role not found', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(rbacService.getRoleById('tenant-1', 'nonexistent')).rejects.toThrow(
        RoleNotFoundError
      );
    });
  });

  describe('createPermission', () => {
    it('should create a new permission', async () => {
      mockDb.query.mockResolvedValueOnce({
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
      });

      const permission = await rbacService.createPermission(
        'tenant-1',
        'posts.create',
        'posts',
        'create'
      );

      expect(permission.name).toBe('posts.create');
      expect(mockEventBus.emit).toHaveBeenCalledWith('permission.created', expect.any(Object));
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign a role to a user', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{ id: 'role-1', tenant_id: 'tenant-1', name: 'admin' }],
        })
        .mockResolvedValueOnce({ rows: [] });

      await rbacService.assignRoleToUser('tenant-1', 'user-1', 'role-1');

      expect(mockEventBus.emit).toHaveBeenCalledWith('user.role.assigned', expect.any(Object));
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '1' }],
      });

      const hasPermission = await rbacService.hasPermission(
        'tenant-1',
        'user-1',
        'posts',
        'create'
      );

      expect(hasPermission).toBe(true);
    });

    it('should return false if user does not have permission', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '0' }],
      });

      const hasPermission = await rbacService.hasPermission(
        'tenant-1',
        'user-1',
        'posts',
        'delete'
      );

      expect(hasPermission).toBe(false);
    });
  });

  describe('enforcePermission', () => {
    it('should not throw if user has permission', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '1' }],
      });

      await expect(
        rbacService.enforcePermission('tenant-1', 'user-1', 'posts', 'create')
      ).resolves.not.toThrow();
    });

    it('should throw if user does not have permission', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ count: '0' }],
      });

      await expect(
        rbacService.enforcePermission('tenant-1', 'user-1', 'posts', 'delete')
      ).rejects.toThrow(PermissionDeniedError);
    });
  });
});
