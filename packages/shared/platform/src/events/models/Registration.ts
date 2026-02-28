import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  WAITLIST = 'WAITLIST',
}

export enum TicketType {
  FREE = 'FREE',
  PAID = 'PAID',
  VIP = 'VIP',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export enum PaymentStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('event_registrations')
@Index(['eventId', 'memberId'], { unique: true })
@Index(['eventId', 'status'])
@Index(['churchId', 'memberId'])
export class Registration {
  @PrimaryColumn('uuid')
  registrationId!: string;

  @Column('uuid')
  @Index()
  churchId!: string;

  @Column('uuid')
  @Index()
  eventId!: string;

  @Column('uuid')
  @Index()
  memberId!: string;

  @Column('timestamp')
  registrationDate!: Date;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status!: RegistrationStatus;

  @Column({
    type: 'enum',
    enum: TicketType,
    default: TicketType.FREE,
  })
  ticketType!: TicketType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.NOT_REQUIRED,
  })
  paymentStatus!: PaymentStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  paymentAmount?: number;

  @Column('varchar', { length: 255, unique: true })
  qrCode!: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
