import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum CheckInMethod {
  QR_CODE = 'QR_CODE',
  MANUAL = 'MANUAL',
  SELF_CHECK_IN = 'SELF_CHECK_IN',
  MOBILE_APP = 'MOBILE_APP',
}

@Entity('event_attendance')
@Index(['eventId', 'memberId'], { unique: true })
@Index(['eventId', 'checkInTime'])
@Index(['churchId', 'memberId'])
export class Attendance {
  @PrimaryColumn('uuid')
  attendanceId!: string;

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
  checkInTime!: Date;

  @Column({
    type: 'enum',
    enum: CheckInMethod,
    default: CheckInMethod.MANUAL,
  })
  checkInMethod!: CheckInMethod;

  @Column('uuid', { nullable: true })
  checkedInBy?: string;

  @Column('varchar', { length: 255, nullable: true })
  qrCodeUsed?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;
}
