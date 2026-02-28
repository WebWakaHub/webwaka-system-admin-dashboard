import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from './Member';

/**
 * Family Entity
 * Represents a family unit with a primary contact and address.
 */
@Entity('families')
export class Family {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'varchar', length: 200, name: 'family_name' })
  familyName!: string;

  @Column({ type: 'uuid', name: 'primary_contact_id' })
  primaryContactId!: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'primary_contact_id' })
  primaryContact!: Member;

  @Column({ type: 'text', name: 'family_address', nullable: true })
  familyAddress?: string;

  @Column({ type: 'varchar', length: 100, name: 'family_city', nullable: true })
  familyCity?: string;

  @Column({ type: 'varchar', length: 100, name: 'family_state', nullable: true })
  familyState?: string;

  @Column({ type: 'varchar', length: 20, name: 'family_country', nullable: true })
  familyCountry?: string;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  @Index()
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy?: string;
}
