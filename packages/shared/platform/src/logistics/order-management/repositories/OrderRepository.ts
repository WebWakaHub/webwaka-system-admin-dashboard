/**
 * Order Repository
 * 
 * Data access layer for Order entity with multi-tenant isolation.
 * All queries automatically filter by tenant_id.
 */

import { DataSource, Repository, FindOptionsWhere } from 'typeorm';
import { Order } from '../models/Order';
import { OrderStatus, PaymentStatus, OrderFilterDTO } from '../types';

export class OrderRepository {
  private repository: Repository<Order>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(Order);
  }

  /**
   * Create a new order
   */
  async create(order: Partial<Order>): Promise<Order> {
    const newOrder = this.repository.create(order);
    return await this.repository.save(newOrder);
  }

  /**
   * Find order by ID with tenant isolation
   */
  async findById(id: string, tenant_id: string): Promise<Order | null> {
    return await this.repository.findOne({
      where: { id, tenant_id } as FindOptionsWhere<Order>,
      relations: ['items']
    });
  }

  /**
   * Find order by order number with tenant isolation
   */
  async findByOrderNumber(order_number: string, tenant_id: string): Promise<Order | null> {
    return await this.repository.findOne({
      where: { order_number, tenant_id } as FindOptionsWhere<Order>,
      relations: ['items']
    });
  }

  /**
   * Find orders by customer with tenant isolation
   */
  async findByCustomer(customer_id: string, tenant_id: string, page = 1, limit = 20): Promise<[Order[], number]> {
    const skip = (page - 1) * limit;
    
    return await this.repository.findAndCount({
      where: { customer_id, tenant_id } as FindOptionsWhere<Order>,
      relations: ['items'],
      order: { order_date: 'DESC' },
      skip,
      take: limit
    });
  }

  /**
   * Find orders with filters
   */
  async findWithFilters(filters: OrderFilterDTO): Promise<[Order[], number]> {
    const { tenant_id, customer_id, status, payment_status, from_date, to_date, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Order> = { tenant_id } as FindOptionsWhere<Order>;

    if (customer_id) {
      (where as any).customer_id = customer_id;
    }

    if (status) {
      (where as any).status = status;
    }

    if (payment_status) {
      (where as any).payment_status = payment_status;
    }

    const queryBuilder = this.repository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where(where);

    if (from_date) {
      queryBuilder.andWhere('order.order_date >= :from_date', { from_date });
    }

    if (to_date) {
      queryBuilder.andWhere('order.order_date <= :to_date', { to_date });
    }

    queryBuilder
      .orderBy('order.order_date', 'DESC')
      .skip(skip)
      .take(limit);

    return await queryBuilder.getManyAndCount();
  }

  /**
   * Update order
   */
  async update(id: string, tenant_id: string, updates: Partial<Order>): Promise<Order | null> {
    const order = await this.findById(id, tenant_id);
    if (!order) {
      return null;
    }

    Object.assign(order, updates);
    return await this.repository.save(order);
  }

  /**
   * Save order (create or update)
   */
  async save(order: Order): Promise<Order> {
    return await this.repository.save(order);
  }

  /**
   * Delete order (soft delete by setting status to cancelled)
   */
  async delete(id: string, tenant_id: string): Promise<boolean> {
    const order = await this.findById(id, tenant_id);
    if (!order) {
      return false;
    }

    order.status = OrderStatus.CANCELLED;
    await this.repository.save(order);
    return true;
  }

  /**
   * Count orders by status for a tenant
   */
  async countByStatus(tenant_id: string, status: OrderStatus): Promise<number> {
    return await this.repository.count({
      where: { tenant_id, status } as FindOptionsWhere<Order>
    });
  }

  /**
   * Get order statistics for a tenant
   */
  async getStatistics(tenant_id: string, from_date?: Date, to_date?: Date): Promise<{
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
  }> {
    const queryBuilder = this.repository.createQueryBuilder('order')
      .where('order.tenant_id = :tenant_id', { tenant_id })
      .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED });

    if (from_date) {
      queryBuilder.andWhere('order.order_date >= :from_date', { from_date });
    }

    if (to_date) {
      queryBuilder.andWhere('order.order_date <= :to_date', { to_date });
    }

    const result = await queryBuilder
      .select('COUNT(order.id)', 'total_orders')
      .addSelect('SUM(order.total)', 'total_revenue')
      .addSelect('AVG(order.total)', 'average_order_value')
      .getRawOne();

    return {
      total_orders: parseInt(result.total_orders) || 0,
      total_revenue: parseFloat(result.total_revenue) || 0,
      average_order_value: parseFloat(result.average_order_value) || 0
    };
  }
}
