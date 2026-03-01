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
import { Role } from './role.entity';

/**
 * User Entity
 *
 * Represents an actor in the WebWaka identity system.
 * All queries are tenant-scoped via RLS (except Super Admin).
 *
 * Supports the 5-level actor hierarchy:
 *   Super Admin → Partner → Tenant Admin → Vendor → End User
 *
 * Nigeria-First: Default locale en-NG, timezone Africa/Lagos
 * Offline-First: Includes syncStatus for offline operation tracking
 */
@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
@Index(['tenantId', 'actorType'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: ActorType,
    default: ActorType.END_USER,
  })
  actorType: ActorType;

  /**
   * Tenant ID for multi-tenant isolation.
   * NULL for Super Admin (cross-tenant authority).
   * All other actor types MUST have a tenant ID.
   */
  @Column({ type: 'uuid', nullable: true })
  @Index()
  tenantId: string | null;

  /**
   * Partner ID for partner-scoped actors.
   * Only applicable to Partner, Tenant Admin, Vendor, End User.
   */
  @Column({ type: 'uuid', nullable: true })
  partnerId: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  /**
   * Nigeria-First: Default locale for the user.
   * Defaults to en-NG per WEBWAKA_CANONICAL_MASTER_CONTEXT §2A.5
   */
  @Column({ type: 'varchar', length: 10, default: 'en-NG' })
  locale: string;

  /**
   * Africa-First: Default timezone.
   * Defaults to Africa/Lagos per Nigeria-First doctrine.
   */
  @Column({ type: 'varchar', length: 50, default: 'Africa/Lagos' })
  timezone: string;

  /**
   * Offline-First: Track sync status for offline operations.
   * 'synced' = fully synchronized with server
   * 'pending' = local changes not yet synced
   * 'conflict' = sync conflict detected, needs resolution
   */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'synced',
  })
  syncStatus: 'synced' | 'pending' | 'conflict';

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string | null;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
