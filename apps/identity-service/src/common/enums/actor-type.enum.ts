/**
 * WebWaka 5-Level Actor Hierarchy
 *
 * Defines the canonical actor types in the platform's identity system.
 * This hierarchy is constitutionally mandated and must not be altered
 * without a Founder Decision.
 *
 * Hierarchy (highest to lowest authority):
 *   Super Admin → Partner → Tenant Admin → Vendor → End User
 *
 * @see WEBWAKA_CORE_PLATFORM_ARCHITECTURE.md §4.1
 */
export enum ActorType {
  /** Platform-level administrator with cross-tenant authority */
  SUPER_ADMIN = 'SUPER_ADMIN',

  /** Partner organization administrator */
  PARTNER = 'PARTNER',

  /** Tenant-scoped administrator */
  TENANT_ADMIN = 'TENANT_ADMIN',

  /** Vendor operating within a tenant */
  VENDOR = 'VENDOR',

  /** End user / consumer */
  END_USER = 'END_USER',
}

/**
 * Actor hierarchy level mapping.
 * Lower number = higher authority.
 */
export const ACTOR_HIERARCHY_LEVEL: Record<ActorType, number> = {
  [ActorType.SUPER_ADMIN]: 0,
  [ActorType.PARTNER]: 1,
  [ActorType.TENANT_ADMIN]: 2,
  [ActorType.VENDOR]: 3,
  [ActorType.END_USER]: 4,
};

/**
 * Check if an actor type has authority over another.
 * An actor can only manage actors at a lower level in the hierarchy.
 */
export function hasAuthorityOver(
  actor: ActorType,
  target: ActorType,
): boolean {
  return ACTOR_HIERARCHY_LEVEL[actor] < ACTOR_HIERARCHY_LEVEL[target];
}
