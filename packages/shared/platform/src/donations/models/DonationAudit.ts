import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  REFUNDED = 'REFUNDED',
  DELETED = 'DELETED',
}

@Entity('donation_audit')
@Index(['donationId'])
@Index(['timestamp'])
export class DonationAudit {
  @PrimaryGeneratedColumn('uuid', { name: 'audit_id' })
  auditId!: string;

  @Column({ name: 'donation_id', type: 'uuid' })
  donationId!: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action!: AuditAction;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, any>;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp!: Date;
}
