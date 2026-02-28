/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * Core Entity Types
 *
 * Acting under Canonical Role: Release Management Agent (webwakaagent6)
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

/**
 * All database entities extend this base.
 * System columns are automatically managed by the adapter.
 */
export interface BaseEntity {
  readonly id: string;
  readonly tenant_id: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
  readonly version: number;
  readonly created_by: string;
  readonly updated_by: string;
}

/**
 * Entity type descriptor — runtime type information.
 */
export interface EntityType<T extends BaseEntity> {
  readonly name: string;
  readonly tableName: string;
  readonly schema: EntitySchema<T>;
}

/**
 * Schema definition for compile-time and runtime validation.
 */
export type EntitySchema<T extends BaseEntity> = {
  [K in keyof Omit<T, keyof BaseEntity>]: FieldDefinition;
};

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'json' | 'decimal' | 'timestamp';
  nullable: boolean;
  indexed: boolean;
  unique: boolean;
  maxLength?: number;
  precision?: [number, number];
}

/**
 * Input type for creating entities.
 * Excludes system-managed fields.
 */
export type CreateInput<T extends BaseEntity> = Omit<
  T,
  'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'version' | 'created_by' | 'updated_by'
>;

/**
 * Input type for updating entities.
 * All fields optional except version (optimistic concurrency).
 */
export type UpdateInput<T extends BaseEntity> = Partial<CreateInput<T>> & {
  version: number;
};
