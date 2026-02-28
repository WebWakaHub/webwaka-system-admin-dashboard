/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * IDatabasePort — Primary Database Contract
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

import {
  BaseEntity,
  EntityType,
  CreateInput,
  UpdateInput,
} from '../types/entities';
import {
  FindManyQuery,
  FindOneQuery,
  CountQuery,
  PaginatedResult,
} from '../types/queries';
import { ExecutionContext, DatabaseHealthStatus } from '../types/context';

/**
 * Transaction scope — subset of IDatabasePort available within transactions.
 */
export interface ITransactionScope {
  findMany<T extends BaseEntity>(
    query: FindManyQuery<T>,
    context: ExecutionContext,
  ): Promise<PaginatedResult<T>>;

  findById<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    context: ExecutionContext,
  ): Promise<T>;

  create<T extends BaseEntity>(
    entityType: EntityType<T>,
    data: CreateInput<T>,
    context: ExecutionContext,
  ): Promise<T>;

  createMany<T extends BaseEntity>(
    entityType: EntityType<T>,
    data: CreateInput<T>[],
    context: ExecutionContext,
  ): Promise<T[]>;

  update<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    data: UpdateInput<T>,
    context: ExecutionContext,
  ): Promise<T>;

  softDelete<T extends BaseEntity>(
    entityType: EntityType<T>,
    id: string,
    context: ExecutionContext,
  ): Promise<void>;
}

/**
 * Primary database port interface.
 * All capability layers interact with the database exclusively through this port.
 */
export interface IDatabasePort extends ITransactionScope {
  /**
   * Find a single entity matching criteria, or null.
   */
  findOne<T extends BaseEntity>(
    query: FindOneQuery<T>,
    context: ExecutionContext,
  ): Promise<T | null>;

  /**
   * Execute a counted query (for pagination metadata).
   */
  count<T extends BaseEntity>(
    query: CountQuery<T>,
    context: ExecutionContext,
  ): Promise<number>;

  /**
   * Execute operations within a transaction.
   * Automatically rolls back on error.
   */
  transaction<R>(
    fn: (tx: ITransactionScope) => Promise<R>,
    context: ExecutionContext,
  ): Promise<R>;

  /**
   * Check database health.
   */
  healthCheck(): Promise<DatabaseHealthStatus>;
}
