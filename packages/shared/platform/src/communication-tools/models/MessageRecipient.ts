import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum RecipientStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

@Entity('message_recipients')
@Index(['messageId', 'memberId'])
@Index(['messageId', 'status'])
export class MessageRecipient {
  @PrimaryColumn('uuid')
  recipientId!: string;

  @Column('uuid')
  @Index()
  churchId!: string;

  @Column('uuid')
  @Index()
  messageId!: string;

  @Column('uuid')
  @Index()
  memberId!: string;

  @Column('varchar', { length: 50 })
  channel!: string;

  @Column({
    type: 'enum',
    enum: RecipientStatus,
    default: RecipientStatus.PENDING,
  })
  status!: RecipientStatus;

  @Column('timestamp', { nullable: true })
  deliveredAt?: Date;

  @Column('timestamp', { nullable: true })
  readAt?: Date;

  @Column('text', { nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
