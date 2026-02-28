/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * Query Types — Type-safe abstract query system
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

import { BaseEntity } from './entities';

/**
 * Type-safe where clause using field names from entity.
 */
export type WhereClause<T extends BaseEntity> = {
  [K in keyof T]?: FieldFilter<T[K]>;
} & {
  AND?: WhereClause<T>[];
  OR?: WhereClause<T>[];
  NOT?: WhereClause<T>;
};

/**
 * Filter operators for a single field.
 */
export type FieldFilter<V> =
  | V
  | { eq: V }
  | { neq: V }
  | { gt: V }
  | { gte: V }
  | { lt: V }
  | { lte: V }
  | { in: V[] }
  | { notIn: V[] }
  | { contains: string }
  | { startsWith: string }
  | { isNull: boolean };

/**
 * Order by clause.
 */
export interface OrderByClause<T extends BaseEntity> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Pagination input — cursor-based preferred for performance.
 */
export type PaginationInput =
  | { type: 'cursor'; cursor?: string; limit: number }
  | { type: 'offset'; offset: number; limit: number };

/**
 * Paginated result with metadata.
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Abstract query for finding multiple entities.
 */
export interface FindManyQuery<T extends BaseEntity> {
  where?: WhereClause<T>;
  orderBy?: OrderByClause<T>[];
  pagination?: PaginationInput;
}

/**
 * Abstract query for finding a single entity.
 */
export interface FindOneQuery<T extends BaseEntity> {
  where: WhereClause<T>;
}

/**
 * Abstract query for counting entities.
 */
export interface CountQuery<T extends BaseEntity> {
  where?: WhereClause<T>;
}
