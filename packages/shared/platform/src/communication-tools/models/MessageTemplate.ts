import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('message_templates')
@Index(['churchId', 'category'])
export class MessageTemplate {
  @PrimaryColumn('uuid')
  templateId!: string;

  @Column('uuid')
  @Index()
  churchId!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  @Column('varchar', { length: 255, nullable: true })
  subject?: string;

  @Column('text')
  body!: string;

  @Column('varchar', { length: 50 })
  channel!: string;

  @Column('jsonb', { nullable: true })
  variables?: string[];

  @Column('varchar', { length: 100, nullable: true })
  category?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
