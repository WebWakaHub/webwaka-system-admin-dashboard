import { DataSource, Repository } from 'typeorm';
import { MemberRepository } from '../../../../src/member-management/repositories/MemberRepository';
import { Member } from '../../../../src/member-management/models/Member';

describe('MemberRepository', () => {
  let memberRepository: MemberRepository;
  let dataSource: jest.Mocked<DataSource>;
  let repository: jest.Mocked<Repository<Member>>;

  const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';
  const mockMemberId = '123e4567-e89b-12d3-a456-426614174002';

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(repository),
    } as any;

    memberRepository = new MemberRepository(dataSource);
  });

  describe('create', () => {
    const memberData: Partial<Member> = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
      email: 'john.doe@example.com',
    };

    const mockMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      ...memberData,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a member', async () => {
      repository.create.mockReturnValue(mockMember as Member);
      repository.save.mockResolvedValue(mockMember as Member);

      const result = await memberRepository.create(mockTenantId, memberData, mockUserId);

      expect(repository.create).toHaveBeenCalledWith({
        ...memberData,
        tenantId: mockTenantId,
        createdBy: mockUserId,
        updatedBy: mockUserId,
      });
      expect(repository.save).toHaveBeenCalledWith(mockMember);
      expect(result).toEqual(mockMember);
    });
  });

  describe('findById', () => {
    const mockMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should find member by ID with tenant isolation', async () => {
      repository.findOne.mockResolvedValue(mockMember as Member);

      const result = await memberRepository.findById(mockTenantId, mockMemberId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockMemberId, tenantId: mockTenantId, deletedAt: null },
      });
      expect(result).toEqual(mockMember);
    });

    it('should return null when member not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await memberRepository.findById(mockTenantId, mockMemberId);

      expect(result).toBeNull();
    });

    it('should enforce tenant isolation', async () => {
      const differentTenantId = '123e4567-e89b-12d3-a456-426614174099';
      repository.findOne.mockResolvedValue(null);

      const result = await memberRepository.findById(differentTenantId, mockMemberId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockMemberId, tenantId: differentTenantId, deletedAt: null },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByPhone', () => {
    const mockMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      phone: '+2348012345678',
    };

    it('should find member by phone with tenant isolation', async () => {
      repository.findOne.mockResolvedValue(mockMember as Member);

      const result = await memberRepository.findByPhone(mockTenantId, '+2348012345678');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { phone: '+2348012345678', tenantId: mockTenantId, deletedAt: null },
      });
      expect(result).toEqual(mockMember);
    });

    it('should return null when member not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await memberRepository.findByPhone(mockTenantId, '+2348012345678');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    const mockMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      email: 'john.doe@example.com',
    };

    it('should find member by email with tenant isolation', async () => {
      repository.findOne.mockResolvedValue(mockMember as Member);

      const result = await memberRepository.findByEmail(mockTenantId, 'john.doe@example.com');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com', tenantId: mockTenantId, deletedAt: null },
      });
      expect(result).toEqual(mockMember);
    });
  });

  describe('update', () => {
    const oldMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      firstName: 'John',
      version: 1,
    };

    const updatedMember: Partial<Member> = {
      ...oldMember,
      firstName: 'Jane',
      version: 2,
    };

    it('should update member with optimistic locking', async () => {
      repository.findOne.mockResolvedValue(oldMember as Member);
      repository.save.mockResolvedValue(updatedMember as Member);

      const result = await memberRepository.update(
        mockTenantId,
        mockMemberId,
        { firstName: 'Jane' },
        1,
        mockUserId
      );

      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Jane');
    });

    it('should throw error when member not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        memberRepository.update(mockTenantId, mockMemberId, { firstName: 'Jane' }, 1, mockUserId)
      ).rejects.toThrow('Member not found');
    });

    it('should throw error on optimistic locking conflict', async () => {
      const memberWithDifferentVersion = { ...oldMember, version: 2 };
      repository.findOne.mockResolvedValue(memberWithDifferentVersion as Member);

      await expect(
        memberRepository.update(mockTenantId, mockMemberId, { firstName: 'Jane' }, 1, mockUserId)
      ).rejects.toThrow('Optimistic locking conflict');
    });
  });

  describe('softDelete', () => {
    const mockMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      firstName: 'John',
    };

    it('should soft delete member', async () => {
      repository.findOne.mockResolvedValue(mockMember as Member);
      repository.save.mockResolvedValue({ ...mockMember, deletedAt: new Date() } as Member);

      await memberRepository.softDelete(mockTenantId, mockMemberId, mockUserId);

      expect(repository.findOne).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw error when member not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        memberRepository.softDelete(mockTenantId, mockMemberId, mockUserId)
      ).rejects.toThrow('Member not found');
    });
  });

  describe('search', () => {
    const mockMembers: Partial<Member>[] = [
      {
        id: mockMemberId,
        tenantId: mockTenantId,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348012345678',
        status: 'member',
      },
    ];

    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockMembers, 1]),
    };

    beforeEach(() => {
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
    });

    it('should search members with query', async () => {
      const result = await memberRepository.search(mockTenantId, {
        query: 'John',
        page: 1,
        limit: 20,
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'member.tenantId = :tenantId',
        { tenantId: mockTenantId }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(member.firstName ILIKE :query OR member.lastName ILIKE :query OR member.phone ILIKE :query OR member.email ILIKE :query)',
        { query: '%John%' }
      );
      expect(result).toEqual({ members: mockMembers, total: 1 });
    });

    it('should filter by status', async () => {
      await memberRepository.search(mockTenantId, {
        status: 'member',
        page: 1,
        limit: 20,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'member.status = :status',
        { status: 'member' }
      );
    });

    it('should filter by tags', async () => {
      await memberRepository.search(mockTenantId, {
        tags: ['choir', 'youth'],
        page: 1,
        limit: 20,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'member.tags && :tags',
        { tags: ['choir', 'youth'] }
      );
    });

    it('should paginate results', async () => {
      await memberRepository.search(mockTenantId, {
        page: 2,
        limit: 10,
      });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should use default pagination', async () => {
      await memberRepository.search(mockTenantId, {});

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });

  describe('findAll', () => {
    const mockMembers: Partial<Member>[] = [
      {
        id: mockMemberId,
        tenantId: mockTenantId,
        firstName: 'John',
      },
    ];

    it('should find all members for tenant', async () => {
      repository.find.mockResolvedValue(mockMembers as Member[]);

      const result = await memberRepository.findAll(mockTenantId);

      expect(repository.find).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId, deletedAt: null },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockMembers);
    });
  });

  describe('countByStatus', () => {
    it('should count members by status', async () => {
      repository.count.mockResolvedValue(50);

      const result = await memberRepository.countByStatus(mockTenantId, 'member');

      expect(repository.count).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId, status: 'member', deletedAt: null },
      });
      expect(result).toBe(50);
    });
  });
});
