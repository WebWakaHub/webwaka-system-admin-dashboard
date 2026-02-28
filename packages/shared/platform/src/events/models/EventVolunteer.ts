import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum VolunteerRole {
  USHER = 'USHER',
  GREETER = 'GREETER',
  TECH = 'TECH',
  WORSHIP = 'WORSHIP',
  CHILDREN = 'CHILDREN',
  SECURITY = 'SECURITY',
  PARKING = 'PARKING',
  HOSPITALITY = 'HOSPITALITY',
  OTHER = 'OTHER',
}

export enum VolunteerStatus {
  INVITED = 'INVITED',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED',
}

@Entity('event_volunteers')
@Index(['eventId', 'memberId', 'role'])
@Index(['eventId', 'status'])
export class EventVolunteer {
  @PrimaryColumn('uuid')
  volunteerId!: string;

  @Column('uuid')
  @Index()
  churchId!: string;

  @Column('uuid')
  @Index()
  eventId!: string;

  @Column('uuid')
  @Index()
  memberId!: string;

  @Column({
    type: 'enum',
    enum: VolunteerRole,
    default: VolunteerRole.OTHER,
  })
  role!: VolunteerRole;

  @Column({
    type: 'enum',
    enum: VolunteerStatus,
    default: VolunteerStatus.INVITED,
  })
  status!: VolunteerStatus;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('uuid', { nullable: true })
  assignedBy?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
