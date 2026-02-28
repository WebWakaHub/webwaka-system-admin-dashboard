import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * MemberAuditLog Entity
 * Tracks all changes to member records for compliance and debugging.
 */
@Entity('member_audit_logs')
export class MemberAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'member_id' })
  @Index()
  memberId!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: 'create' | 'update' | 'delete' | 'status_change';

  @Column({ type: 'jsonb', name: 'old_values', nullable: true })
  oldValues?: Record<string, any>;

  @Column({ type: 'jsonb', name: 'new_values', nullable: true })
  newValues?: Record<string, any>;

  @Column({ type: 'uuid', name: 'changed_by' })
  changedBy!: string;

  @Column({ type: 'varchar', length: 50, name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', name: 'user_agent', nullable: true })
  userAgent?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  @Index()
  createdAt!: Date;
}
