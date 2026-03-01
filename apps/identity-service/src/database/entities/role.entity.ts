import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ActorType } from '../../common/enums/actor-type.enum';
import { Permission } from './permission.entity';
import { User } from './user.entity';

/**
 * Role Entity
 *
 * Defines a named role that can be assigned to users.
 * Roles are tenant-scoped (except system-level roles for Super Admin).
 * Each role is associated with a specific actor type level.
 *
 * Build Once, Use Infinitely: Roles are canonical primitives
 * that can be composed across tenants and domains.
 */
@Entity('roles')
@Index(['tenantId', 'name'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  /**
   * The actor type level this role is associated with.
   * A role can only be assigned to users at or below this level.
   */
  @Column({
    type: 'enum',
    enum: ActorType,
  })
  actorType: ActorType;

  /**
   * Tenant ID for multi-tenant isolation.
   * NULL for system-level roles (available to all tenants).
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  tenantId: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Whether this is a system-defined role (immutable by tenants).
   */
  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
