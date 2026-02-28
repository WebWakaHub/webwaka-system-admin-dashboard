import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK',
}

export enum PaymentGateway {
  PAYSTACK = 'PAYSTACK',
  FLUTTERWAVE = 'FLUTTERWAVE',
  INTERSWITCH = 'INTERSWITCH',
  MANUAL = 'MANUAL',
}

export enum DonationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('donations')
@Index(['churchId'])
@Index(['donorId'])
@Index(['transactionId'])
@Index(['campaignId'])
@Index(['createdAt'])
@Index(['status'])
export class Donation {
  @PrimaryGeneratedColumn('uuid', { name: 'donation_id' })
  donationId!: string;

  @Column({ name: 'church_id', type: 'uuid' })
  churchId!: string;

  @Column({ name: 'donor_id', type: 'uuid' })
  donorId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'NGN' })
  currency!: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod!: PaymentMethod;

  @Column({
    name: 'payment_gateway',
    type: 'enum',
    enum: PaymentGateway,
    nullable: true,
  })
  paymentGateway?: PaymentGateway;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, unique: true, nullable: true })
  transactionId?: string;

  @Column({
    type: 'enum',
    enum: DonationStatus,
    default: DonationStatus.PENDING,
  })
  status!: DonationStatus;

  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId?: string;

  @Column({ type: 'text', nullable: true })
  purpose?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'receipt_number', type: 'varchar', length: 50, unique: true })
  receiptNumber!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
