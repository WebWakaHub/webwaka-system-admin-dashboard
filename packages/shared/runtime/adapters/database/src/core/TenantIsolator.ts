/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * TenantIsolator — Enforces tenant boundary on every operation
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

import { BaseEntity } from '../types/entities';
import { WhereClause, FindManyQuery, FindOneQuery, CountQuery } from '../types/queries';
import { ExecutionContext } from '../types/context';
import { DatabaseError, DatabaseErrorCode } from '../types/errors';

export class TenantIsolator {
  /**
   * Validate that execution context has a tenant ID.
   * @throws DatabaseError with TENANT_VIOLATION if missing
   */
  static validateContext(context: ExecutionContext): void {
    if (!context.tenantId || context.tenantId.trim() === '') {
      throw new DatabaseError(
        DatabaseErrorCode.TENANT_VIOLATION,
        'Execution context must include a non-empty tenantId. This is a mandatory security requirement.',
        undefined,
        {
          correlationId: context.correlationId,
          actorId: context.actorId,
          severity: 'CRITICAL',
          agveLevel: 4,
        },
      );
    }
  }

  /**
   * Inject tenant_id predicate into a FindManyQuery.
   */
  static isolateFindMany<T extends BaseEntity>(
    query: FindManyQuery<T>,
    context: ExecutionContext,
  ): FindManyQuery<T> {
    TenantIsolator.validateContext(context);

    const tenantPredicate = { tenant_id: context.tenantId } as Partial<WhereClause<T>>;

    if (query.where) {
      return {
        ...query,
        where: {
          AND: [tenantPredicate as WhereClause<T>, query.where],
        } as WhereClause<T>,
      };
    }

    return {
      ...query,
      where: tenantPredicate as WhereClause<T>,
    };
  }

  /**
   * Inject tenant_id predicate into a FindOneQuery.
   */
  static isolateFindOne<T extends BaseEntity>(
    query: FindOneQuery<T>,
    context: ExecutionContext,
  ): FindOneQuery<T> {
    TenantIsolator.validateContext(context);

    const tenantPredicate = { tenant_id: context.tenantId } as Partial<WhereClause<T>>;

    return {
      where: {
        AND: [tenantPredicate as WhereClause<T>, query.where],
      } as WhereClause<T>,
    };
  }

  /**
   * Inject tenant_id predicate into a CountQuery.
   */
  static isolateCount<T extends BaseEntity>(
    query: CountQuery<T>,
    context: ExecutionContext,
  ): CountQuery<T> {
    TenantIsolator.validateContext(context);

    const tenantPredicate = { tenant_id: context.tenantId } as Partial<WhereClause<T>>;

    if (query.where) {
      return {
        where: {
          AND: [tenantPredicate as WhereClause<T>, query.where],
        } as WhereClause<T>,
      };
    }

    return {
      where: tenantPredicate as WhereClause<T>,
    };
  }

  /**
   * Validate that a record belongs to the correct tenant.
   * Used after fetching by ID to prevent cross-tenant access.
   */
  static validateOwnership<T extends BaseEntity>(
    entity: T,
    context: ExecutionContext,
  ): void {
    if (entity.tenant_id !== context.tenantId) {
      throw new DatabaseError(
        DatabaseErrorCode.TENANT_VIOLATION,
        `Cross-tenant access detected. Entity tenant: ${entity.tenant_id}, Request tenant: ${context.tenantId}`,
        undefined,
        {
          entityTenant: entity.tenant_id,
          requestTenant: context.tenantId,
          correlationId: context.correlationId,
          severity: 'CRITICAL',
          agveLevel: 4,
        },
      );
    }
  }
}
