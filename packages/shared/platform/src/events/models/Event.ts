import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EventType {
  SERVICE = 'SERVICE',
  CONFERENCE = 'CONFERENCE',
  RETREAT = 'RETREAT',
  WORKSHOP = 'WORKSHOP',
  MEETING = 'MEETING',
  SOCIAL = 'SOCIAL',
  OUTREACH = 'OUTREACH',
  OTHER = 'OTHER',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum RecurringPattern {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('events')
@Index(['churchId', 'startDate'])
@Index(['churchId', 'status'])
@Index(['churchId', 'eventType'])
export class Event {
  @PrimaryColumn('uuid')
  eventId!: string;

  @Column('uuid')
  @Index()
  churchId!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.OTHER,
  })
  eventType!: EventType;

  @Column('timestamp')
  startDate!: Date;

  @Column('timestamp')
  endDate!: Date;

  @Column('varchar', { length: 500, nullable: true })
  location?: string;

  @Column('int', { nullable: true })
  capacity?: number;

  @Column('int', { default: 0 })
  registeredCount!: number;

  @Column('int', { default: 0 })
  attendedCount!: number;

  @Column('boolean', { default: false })
  registrationRequired!: boolean;

  @Column('timestamp', { nullable: true })
  registrationDeadline?: Date;

  @Column('boolean', { default: false })
  isRecurring!: boolean;

  @Column({
    type: 'enum',
    enum: RecurringPattern,
    default: RecurringPattern.NONE,
  })
  recurringPattern!: RecurringPattern;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status!: EventStatus;

  @Column('uuid', { nullable: true })
  createdBy?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
