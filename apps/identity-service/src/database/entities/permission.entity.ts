import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Role } from './role.entity';

/**
 * Permission Entity
 *
 * Defines a granular permission that can be assigned to roles.
 * Permissions follow the WEEG model: Roles → Capabilities → Permissions → Pricing.
 *
 * Permissions use a resource:action format (e.g., 'users:create', 'orders:read').
 * This enables fine-grained access control across all domains.
 *
 * Build Once, Use Infinitely: Permissions are canonical primitives
 * shared across all tenants and domains.
 */
@Entity('permissions')
@Index(['resource', 'action'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The resource this permission applies to.
   * E.g., 'users', 'orders', 'products', 'tenants'
   */
  @Column({ type: 'varchar', length: 100 })
  resource: string;

  /**
   * The action permitted on the resource.
   * E.g., 'create', 'read', 'update', 'delete', 'manage'
   */
  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  /**
   * The domain this permission belongs to.
   * E.g., 'identity', 'commerce', 'logistics'
   * NULL for cross-domain permissions.
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  domain: string | null;

  /**
   * Whether this is a system-defined permission (immutable).
   */
  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  /**
   * Computed permission string in resource:action format.
   */
  get permissionString(): string {
    return `${this.resource}:${this.action}`;
  }
}
