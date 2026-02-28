import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Check,
} from 'typeorm';

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('campaigns')
@Index(['churchId'])
@Index(['status'])
@Index(['endDate'])
@Check(`"end_date" >= "start_date"`)
export class Campaign {
  @PrimaryGeneratedColumn('uuid', { name: 'campaign_id' })
  campaignId!: string;

  @Column({ name: 'church_id', type: 'uuid' })
  churchId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'goal_amount', type: 'decimal', precision: 12, scale: 2 })
  goalAmount!: number;

  @Column({ name: 'amount_raised', type: 'decimal', precision: 12, scale: 2, default: 0 })
  amountRaised!: number;

  @Column({ name: 'donor_count', type: 'int', default: 0 })
  donorCount!: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: Date;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status!: CampaignStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
