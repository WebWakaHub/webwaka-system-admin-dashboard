import { Repository, DataSource } from 'typeorm';
import { PaymentGatewayConfig, Gateway } from '../models/PaymentGatewayConfig';

export class PaymentGatewayConfigRepository {
  private repository: Repository<PaymentGatewayConfig>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(PaymentGatewayConfig);
  }

  async create(config: Partial<PaymentGatewayConfig>): Promise<PaymentGatewayConfig> {
    const newConfig = this.repository.create(config);
    return await this.repository.save(newConfig);
  }

  async findByChurchId(churchId: string): Promise<PaymentGatewayConfig[]> {
    return await this.repository.find({
      where: { churchId },
      order: { priority: 'ASC' },
    });
  }

  async findActiveByChurchId(churchId: string): Promise<PaymentGatewayConfig[]> {
    return await this.repository.find({
      where: { churchId, isActive: true },
      order: { priority: 'ASC' },
    });
  }

  async findByChurchAndGateway(churchId: string, gateway: Gateway): Promise<PaymentGatewayConfig | null> {
    return await this.repository.findOne({
      where: { churchId, gateway },
    });
  }

  async update(configId: string, updates: Partial<PaymentGatewayConfig>): Promise<PaymentGatewayConfig | null> {
    await this.repository.update({ configId }, updates);
    return await this.repository.findOne({ where: { configId } });
  }
}
