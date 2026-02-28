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
 * MemberNote Entity
 * Represents pastoral care notes and observations about a member.
 * Supports visibility controls (private, leaders_only, public).
 */
@Entity('member_notes')
export class MemberNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'member_id' })
  @Index()
  memberId!: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member!: Member;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title?: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 20, default: 'private' })
  visibility!: 'private' | 'leaders_only' | 'public';

  @Column({ type: 'varchar', length: 50, name: 'note_type', nullable: true })
  noteType?: 'pastoral_care' | 'follow_up' | 'prayer_request' | 'general';

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  @Index()
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy!: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy?: string;
}
