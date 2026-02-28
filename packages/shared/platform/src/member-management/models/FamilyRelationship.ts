import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Family } from './Family';
import { Member } from './Member';

/**
 * FamilyRelationship Entity
 * Represents the relationship between a member and a family.
 */
@Entity('family_relationships')
@Index(['family_id', 'member_id'], { unique: true })
export class FamilyRelationship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'family_id' })
  familyId!: string;

  @ManyToOne(() => Family)
  @JoinColumn({ name: 'family_id' })
  family!: Family;

  @Column({ type: 'uuid', name: 'member_id' })
  memberId!: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member!: Member;

  @Column({ type: 'varchar', length: 50, name: 'relationship_type' })
  relationshipType!: 'head' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy?: string;
}
