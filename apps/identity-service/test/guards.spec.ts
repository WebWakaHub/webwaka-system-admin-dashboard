import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ActorTypeGuard } from '../src/guards/actor-type.guard';
import { PermissionsGuard } from '../src/guards/permissions.guard';
import { TenantGuard } from '../src/guards/tenant.guard';
import { ActorType } from '../src/common/enums/actor-type.enum';

function createMockContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as any;
}

describe('ActorTypeGuard', () => {
  let guard: ActorTypeGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ActorTypeGuard(reflector);
  });

  it('should allow access when no actor types are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ actorType: ActorType.END_USER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required actor type', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      ActorType.SUPER_ADMIN,
      ActorType.TENANT_ADMIN,
    ]);
    const context = createMockContext({ actorType: ActorType.TENANT_ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required actor type', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      ActorType.SUPER_ADMIN,
    ]);
    const context = createMockContext({ actorType: ActorType.END_USER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny access when no user in request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      ActorType.SUPER_ADMIN,
    ]);
    const context = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('should allow access when no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ permissions: [] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has all required permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      'users:create',
      'users:read',
    ]);
    const context = createMockContext({
      permissions: ['users:create', 'users:read', 'users:update'],
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
      'users:create',
      'users:delete',
    ]);
    const context = createMockContext({
      permissions: ['users:create', 'users:read'],
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

describe('TenantGuard', () => {
  let guard: TenantGuard;

  beforeEach(() => {
    guard = new TenantGuard();
  });

  it('should allow Super Admin without tenant ID', () => {
    const context = createMockContext({
      actorType: ActorType.SUPER_ADMIN,
      tenantId: null,
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow non-Super Admin with tenant ID', () => {
    const context = createMockContext({
      actorType: ActorType.TENANT_ADMIN,
      tenantId: 'tenant-uuid-1',
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny non-Super Admin without tenant ID', () => {
    const context = createMockContext({
      actorType: ActorType.TENANT_ADMIN,
      tenantId: null,
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should deny unauthenticated requests', () => {
    const context = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
