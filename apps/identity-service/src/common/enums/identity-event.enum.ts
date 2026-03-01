/**
 * Identity Domain Event Types
 *
 * All state changes in the identity system MUST emit an event.
 * This is a constitutional requirement per the Event-Driven Architecture spec.
 *
 * @see WEBWAKA_EVENT_DRIVEN_ARCHITECTURE_SPECIFICATION.md
 */
export enum IdentityEvent {
  // User lifecycle events
  USER_CREATED = 'identity.user.created',
  USER_UPDATED = 'identity.user.updated',
  USER_DEACTIVATED = 'identity.user.deactivated',
  USER_REACTIVATED = 'identity.user.reactivated',
  USER_DELETED = 'identity.user.deleted',

  // Authentication events
  AUTH_LOGIN_SUCCESS = 'identity.auth.login.success',
  AUTH_LOGIN_FAILED = 'identity.auth.login.failed',
  AUTH_LOGOUT = 'identity.auth.logout',
  AUTH_TOKEN_REFRESHED = 'identity.auth.token.refreshed',
  AUTH_TOKEN_REVOKED = 'identity.auth.token.revoked',
  AUTH_PASSWORD_CHANGED = 'identity.auth.password.changed',
  AUTH_PASSWORD_RESET_REQUESTED = 'identity.auth.password.reset.requested',

  // Role & permission events
  ROLE_ASSIGNED = 'identity.role.assigned',
  ROLE_REVOKED = 'identity.role.revoked',
  PERMISSION_GRANTED = 'identity.permission.granted',
  PERMISSION_REVOKED = 'identity.permission.revoked',

  // Offline sync events
  OFFLINE_QUEUE_ENTRY_ADDED = 'identity.offline.queue.entry.added',
  OFFLINE_QUEUE_SYNCED = 'identity.offline.queue.synced',
  OFFLINE_QUEUE_SYNC_FAILED = 'identity.offline.queue.sync.failed',

  // Tenant events
  TENANT_CONTEXT_SWITCHED = 'identity.tenant.context.switched',
}
