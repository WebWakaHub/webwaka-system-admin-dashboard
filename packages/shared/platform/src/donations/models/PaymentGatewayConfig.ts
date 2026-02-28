import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

export enum Gateway {
  PAYSTACK = 'PAYSTACK',
  FLUTTERWAVE = 'FLUTTERWAVE',
  INTERSWITCH = 'INTERSWITCH',
}

@Entity('payment_gateway_config')
@Index(['churchId'])
@Unique(['churchId', 'gateway'])
export class PaymentGatewayConfig {
  @PrimaryGeneratedColumn('uuid', { name: 'config_id' })
  configId!: string;

  @Column({ name: 'church_id', type: 'uuid' })
  churchId!: string;

  @Column({
    type: 'enum',
    enum: Gateway,
  })
  gateway!: Gateway;

  @Column({ name: 'public_key', type: 'text' })
  publicKey!: string;

  @Column({ name: 'secret_key', type: 'text' })
  secretKey!: string;

  @Column({ name: 'webhook_secret', type: 'text' })
  webhookSecret!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 1 })
  priority!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
