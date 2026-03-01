import {
  ActorType,
  ACTOR_HIERARCHY_LEVEL,
  hasAuthorityOver,
} from '../src/common/enums/actor-type.enum';

describe('ActorType Enum', () => {
  it('should define all 5 actor types', () => {
    expect(Object.keys(ActorType)).toHaveLength(5);
    expect(ActorType.SUPER_ADMIN).toBe('SUPER_ADMIN');
    expect(ActorType.PARTNER).toBe('PARTNER');
    expect(ActorType.TENANT_ADMIN).toBe('TENANT_ADMIN');
    expect(ActorType.VENDOR).toBe('VENDOR');
    expect(ActorType.END_USER).toBe('END_USER');
  });

  it('should define correct hierarchy levels', () => {
    expect(ACTOR_HIERARCHY_LEVEL[ActorType.SUPER_ADMIN]).toBe(0);
    expect(ACTOR_HIERARCHY_LEVEL[ActorType.PARTNER]).toBe(1);
    expect(ACTOR_HIERARCHY_LEVEL[ActorType.TENANT_ADMIN]).toBe(2);
    expect(ACTOR_HIERARCHY_LEVEL[ActorType.VENDOR]).toBe(3);
    expect(ACTOR_HIERARCHY_LEVEL[ActorType.END_USER]).toBe(4);
  });
});

describe('hasAuthorityOver', () => {
  it('should return true when actor has higher authority', () => {
    expect(hasAuthorityOver(ActorType.SUPER_ADMIN, ActorType.PARTNER)).toBe(true);
    expect(hasAuthorityOver(ActorType.SUPER_ADMIN, ActorType.END_USER)).toBe(true);
    expect(hasAuthorityOver(ActorType.PARTNER, ActorType.TENANT_ADMIN)).toBe(true);
    expect(hasAuthorityOver(ActorType.TENANT_ADMIN, ActorType.VENDOR)).toBe(true);
    expect(hasAuthorityOver(ActorType.VENDOR, ActorType.END_USER)).toBe(true);
  });

  it('should return false when actor has same level', () => {
    expect(hasAuthorityOver(ActorType.SUPER_ADMIN, ActorType.SUPER_ADMIN)).toBe(false);
    expect(hasAuthorityOver(ActorType.PARTNER, ActorType.PARTNER)).toBe(false);
    expect(hasAuthorityOver(ActorType.TENANT_ADMIN, ActorType.TENANT_ADMIN)).toBe(false);
    expect(hasAuthorityOver(ActorType.VENDOR, ActorType.VENDOR)).toBe(false);
    expect(hasAuthorityOver(ActorType.END_USER, ActorType.END_USER)).toBe(false);
  });

  it('should return false when actor has lower authority', () => {
    expect(hasAuthorityOver(ActorType.END_USER, ActorType.SUPER_ADMIN)).toBe(false);
    expect(hasAuthorityOver(ActorType.VENDOR, ActorType.TENANT_ADMIN)).toBe(false);
    expect(hasAuthorityOver(ActorType.TENANT_ADMIN, ActorType.PARTNER)).toBe(false);
    expect(hasAuthorityOver(ActorType.PARTNER, ActorType.SUPER_ADMIN)).toBe(false);
  });
});
