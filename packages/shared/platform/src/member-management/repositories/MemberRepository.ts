import { Repository, DataSource, FindOptionsWhere, ILike } from 'typeorm';
import { Member } from '../models/Member';

/**
 * MemberRepository
 * Handles database operations for Member entity with tenant isolation.
 */
export class MemberRepository {
  private repository: Repository<Member>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(Member);
  }

  /**
   * Create a new member
   */
  async create(tenantId: string, memberData: Partial<Member>, userId: string): Promise<Member> {
    const member = this.repository.create({
      ...memberData,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
    });
    return await this.repository.save(member);
  }

  /**
   * Find member by ID with tenant isolation
   */
  async findById(tenantId: string, id: string): Promise<Member | null> {
    return await this.repository.findOne({
      where: { id, tenantId, deletedAt: null } as FindOptionsWhere<Member>,
    });
  }

  /**
   * Find member by phone with tenant isolation
   */
  async findByPhone(tenantId: string, phone: string): Promise<Member | null> {
    return await this.repository.findOne({
      where: { phone, tenantId, deletedAt: null } as FindOptionsWhere<Member>,
    });
  }

  /**
   * Find member by email with tenant isolation
   */
  async findByEmail(tenantId: string, email: string): Promise<Member | null> {
    return await this.repository.findOne({
      where: { email, tenantId, deletedAt: null } as FindOptionsWhere<Member>,
    });
  }

  /**
   * Update member with optimistic locking
   */
  async update(
    tenantId: string,
    id: string,
    memberData: Partial<Member>,
    expectedVersion: number,
    userId: string
  ): Promise<Member> {
    const member = await this.findById(tenantId, id);
    if (!member) {
      throw new Error('Member not found');
    }

    if (member.version !== expectedVersion) {
      throw new Error('Optimistic locking conflict: Member was modified by another user');
    }

    Object.assign(member, memberData, { updatedBy: userId });
    return await this.repository.save(member);
  }

  /**
   * Soft delete member
   */
  async softDelete(tenantId: string, id: string, userId: string): Promise<void> {
    const member = await this.findById(tenantId, id);
    if (!member) {
      throw new Error('Member not found');
    }

    member.deletedAt = new Date();
    member.updatedBy = userId;
    await this.repository.save(member);
  }

  /**
   * Search members with filters and pagination
   */
  async search(
    tenantId: string,
    filters: {
      query?: string;
      status?: string;
      tags?: string[];
      page?: number;
      limit?: number;
    }
  ): Promise<{ members: Member[]; total: number }> {
    const { query, status, tags, page = 1, limit = 20 } = filters;

    const queryBuilder = this.repository
      .createQueryBuilder('member')
      .where('member.tenantId = :tenantId', { tenantId })
      .andWhere('member.deletedAt IS NULL');

    if (query) {
      queryBuilder.andWhere(
        '(member.firstName ILIKE :query OR member.lastName ILIKE :query OR member.phone ILIKE :query OR member.email ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('member.status = :status', { status });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('member.tags && :tags', { tags });
    }

    const [members, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('member.createdAt', 'DESC')
      .getManyAndCount();

    return { members, total };
  }

  /**
   * Get all members for a tenant (for export)
   */
  async findAll(tenantId: string): Promise<Member[]> {
    return await this.repository.find({
      where: { tenantId, deletedAt: null } as FindOptionsWhere<Member>,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Count members by status
   */
  async countByStatus(tenantId: string, status: string): Promise<number> {
    return await this.repository.count({
      where: { tenantId, status, deletedAt: null } as FindOptionsWhere<Member>,
    });
  }
}
