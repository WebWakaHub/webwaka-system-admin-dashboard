import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DonationFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

export enum RecurringDonationStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('recurring_donations')
@Index(['churchId'])
@Index(['donorId'])
@Index(['nextPaymentDate'])
@Index(['status'])
export class RecurringDonation {
  @PrimaryGeneratedColumn('uuid', { name: 'schedule_id' })
  scheduleId!: string;

  @Column({ name: 'church_id', type: 'uuid' })
  churchId!: string;

  @Column({ name: 'donor_id', type: 'uuid' })
  donorId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: DonationFrequency,
  })
  frequency!: DonationFrequency;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 20,
  })
  paymentMethod!: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({ name: 'next_payment_date', type: 'date' })
  nextPaymentDate!: Date;

  @Column({
    type: 'enum',
    enum: RecurringDonationStatus,
    default: RecurringDonationStatus.ACTIVE,
  })
  status!: RecurringDonationStatus;

  @Column({ name: 'failed_attempts', type: 'int', default: 0 })
  failedAttempts!: number;

  @Column({ name: 'last_payment_date', type: 'date', nullable: true })
  lastPaymentDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
