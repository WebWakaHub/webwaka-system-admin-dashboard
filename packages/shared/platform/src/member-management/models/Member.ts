import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';

/**
 * Member Entity
 * Represents a church member with personal information, contact details, and membership status.
 * Implements multi-tenancy via tenant_id and soft delete via deleted_at.
 */
@Entity('members')
@Index(['tenant_id', 'phone'], { unique: true })
@Index(['tenant_id', 'email'])
@Index(['tenant_id', 'status'])
@Index(['tenant_id', 'deleted_at'])
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  // Personal Information
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'varchar', length: 100, name: 'middle_name', nullable: true })
  middleName?: string;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: 'male' | 'female' | 'other';

  @Column({ type: 'varchar', length: 20, name: 'marital_status', nullable: true })
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';

  // Contact Information
  @Column({ type: 'varchar', length: 20 })
  @Index()
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  country?: string;

  // Membership Information
  @Column({ type: 'varchar', length: 20, default: 'visitor' })
  @Index()
  status!: 'visitor' | 'member' | 'inactive' | 'transferred' | 'deceased';

  @Column({ type: 'date', name: 'membership_date', nullable: true })
  membershipDate?: Date;

  @Column({ type: 'varchar', length: 50, name: 'membership_type', nullable: true })
  membershipType?: string;

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  // Photo
  @Column({ type: 'text', name: 'photo_url', nullable: true })
  photoUrl?: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Soft Delete
  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  @Index()
  deletedAt?: Date;

  // Optimistic Locking
  @VersionColumn()
  version!: number;

  // Timestamps
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy?: string;
}
