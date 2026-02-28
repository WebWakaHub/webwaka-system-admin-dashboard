import { MemberService } from '../../../../src/member-management/services/MemberService';
import { MemberRepository } from '../../../../src/member-management/repositories/MemberRepository';
import { MemberEventPublisher } from '../../../../src/member-management/events/MemberEventPublisher';
import { MemberAuditLogger } from '../../../../src/member-management/utils/MemberAuditLogger';
import { Member } from '../../../../src/member-management/models/Member';
import { CreateMemberDto } from '../../../../src/member-management/dto/CreateMemberDto';
import { UpdateMemberDto } from '../../../../src/member-management/dto/UpdateMemberDto';

describe('MemberService', () => {
  let memberService: MemberService;
  let memberRepository: jest.Mocked<MemberRepository>;
  let eventPublisher: jest.Mocked<MemberEventPublisher>;
  let auditLogger: jest.Mocked<MemberAuditLogger>;

  const mockTenantId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';
  const mockMemberId = '123e4567-e89b-12d3-a456-426614174002';

  beforeEach(() => {
    memberRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPhone: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      search: jest.fn(),
      findAll: jest.fn(),
      countByStatus: jest.fn(),
    } as any;

    eventPublisher = {
      publishMemberCreated: jest.fn(),
      publishMemberUpdated: jest.fn(),
      publishMemberDeleted: jest.fn(),
      publishMemberStatusChanged: jest.fn(),
      publishFamilyUpdated: jest.fn(),
    } as any;

    auditLogger = {
      logCreate: jest.fn(),
      logUpdate: jest.fn(),
      logDelete: jest.fn(),
      logStatusChange: jest.fn(),
      getAuditLogs: jest.fn(),
    } as any;

    memberService = new MemberService(memberRepository, eventPublisher, auditLogger);
  });

  describe('createMember', () => {
    const createDto: CreateMemberDto = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
      email: 'john.doe@example.com',
      status: 'visitor',
    };

    const mockMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      ...createDto,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a member with valid data', async () => {
      memberRepository.findByPhone.mockResolvedValue(null);
      memberRepository.findByEmail.mockResolvedValue(null);
      memberRepository.create.mockResolvedValue(mockMember as Member);

      const result = await memberService.createMember(mockTenantId, mockUserId, createDto);

      expect(memberRepository.findByPhone).toHaveBeenCalledWith(mockTenantId, createDto.phone);
      expect(memberRepository.findByEmail).toHaveBeenCalledWith(mockTenantId, createDto.email);
      expect(memberRepository.create).toHaveBeenCalledWith(
        mockTenantId,
        { ...createDto, status: 'visitor' },
        mockUserId
      );
      expect(auditLogger.logCreate).toHaveBeenCalledWith(
        mockTenantId,
        mockMemberId,
        mockMember,
        mockUserId
      );
      expect(eventPublisher.publishMemberCreated).toHaveBeenCalledWith(mockTenantId, mockMember);
      expect(result).toEqual(mockMember);
    });

    it('should throw error with duplicate phone number', async () => {
      memberRepository.findByPhone.mockResolvedValue(mockMember as Member);

      await expect(
        memberService.createMember(mockTenantId, mockUserId, createDto)
      ).rejects.toThrow('Member with this phone number already exists');

      expect(memberRepository.create).not.toHaveBeenCalled();
      expect(auditLogger.logCreate).not.toHaveBeenCalled();
      expect(eventPublisher.publishMemberCreated).not.toHaveBeenCalled();
    });

    it('should throw error with duplicate email', async () => {
      memberRepository.findByPhone.mockResolvedValue(null);
      memberRepository.findByEmail.mockResolvedValue(mockMember as Member);

      await expect(
        memberService.createMember(mockTenantId, mockUserId, createDto)
      ).rejects.toThrow('Member with this email already exists');

      expect(memberRepository.create).not.toHaveBeenCalled();
      expect(auditLogger.logCreate).not.toHaveBeenCalled();
      expect(eventPublisher.publishMemberCreated).not.toHaveBeenCalled();
    });

    it('should create member without email', async () => {
      const dtoWithoutEmail = { ...createDto, email: undefined };
      memberRepository.findByPhone.mockResolvedValue(null);
      memberRepository.create.mockResolvedValue(mockMember as Member);

      const result = await memberService.createMember(mockTenantId, mockUserId, dtoWithoutEmail);

      expect(memberRepository.findByEmail).not.toHaveBeenCalled();
      expect(result).toEqual(mockMember);
    });

    it('should emit member.created event', async () => {
      memberRepository.findByPhone.mockResolvedValue(null);
      memberRepository.findByEmail.mockResolvedValue(null);
      memberRepository.create.mockResolvedValue(mockMember as Member);

      await memberService.createMember(mockTenantId, mockUserId, createDto);

      expect(eventPublisher.publishMemberCreated).toHaveBeenCalledWith(mockTenantId, mockMember);
    });
  });

  describe('getMemberById', () => {
    const mockMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
    };

    it('should return member when found', async () => {
      memberRepository.findById.mockResolvedValue(mockMember as Member);

      const result = await memberService.getMemberById(mockTenantId, mockMemberId);

      expect(memberRepository.findById).toHaveBeenCalledWith(mockTenantId, mockMemberId);
      expect(result).toEqual(mockMember);
    });

    it('should throw error when member not found', async () => {
      memberRepository.findById.mockResolvedValue(null);

      await expect(
        memberService.getMemberById(mockTenantId, mockMemberId)
      ).rejects.toThrow('Member not found');
    });

    it('should enforce tenant isolation', async () => {
      const differentTenantId = '123e4567-e89b-12d3-a456-426614174099';
      memberRepository.findById.mockResolvedValue(null);

      await expect(
        memberService.getMemberById(differentTenantId, mockMemberId)
      ).rejects.toThrow('Member not found');

      expect(memberRepository.findById).toHaveBeenCalledWith(differentTenantId, mockMemberId);
    });
  });

  describe('updateMember', () => {
    const updateDto: UpdateMemberDto = {
      firstName: 'Jane',
      version: 1,
    };

    const oldMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
      version: 1,
    };

    const updatedMember: Partial<Member> = {
      ...oldMember,
      firstName: 'Jane',
      version: 2,
    };

    it('should update member with valid data', async () => {
      memberRepository.findById.mockResolvedValue(oldMember as Member);
      memberRepository.update.mockResolvedValue(updatedMember as Member);

      const result = await memberService.updateMember(
        mockTenantId,
        mockUserId,
        mockMemberId,
        updateDto
      );

      expect(memberRepository.findById).toHaveBeenCalledWith(mockTenantId, mockMemberId);
      expect(memberRepository.update).toHaveBeenCalledWith(
        mockTenantId,
        mockMemberId,
        { firstName: 'Jane' },
        1,
        mockUserId
      );
      expect(auditLogger.logUpdate).toHaveBeenCalledWith(
        mockTenantId,
        mockMemberId,
        oldMember,
        updatedMember,
        mockUserId
      );
      expect(eventPublisher.publishMemberUpdated).toHaveBeenCalledWith(
        mockTenantId,
        updatedMember
      );
      expect(result).toEqual(updatedMember);
    });

    it('should throw error on optimistic locking conflict', async () => {
      memberRepository.findById.mockResolvedValue(oldMember as Member);
      memberRepository.update.mockRejectedValue(
        new Error('Optimistic locking conflict: Member was modified by another user')
      );

      await expect(
        memberService.updateMember(mockTenantId, mockUserId, mockMemberId, updateDto)
      ).rejects.toThrow('Optimistic locking conflict');
    });

    it('should check for duplicate phone when phone is changed', async () => {
      const updateWithPhone: UpdateMemberDto = {
        phone: '+2348087654321',
        version: 1,
      };

      memberRepository.findById.mockResolvedValue(oldMember as Member);
      memberRepository.findByPhone.mockResolvedValue(null);
      memberRepository.update.mockResolvedValue(updatedMember as Member);

      await memberService.updateMember(
        mockTenantId,
        mockUserId,
        mockMemberId,
        updateWithPhone
      );

      expect(memberRepository.findByPhone).toHaveBeenCalledWith(mockTenantId, '+2348087654321');
    });

    it('should throw error with duplicate phone', async () => {
      const updateWithPhone: UpdateMemberDto = {
        phone: '+2348087654321',
        version: 1,
      };

      const existingMember: Partial<Member> = {
        id: '123e4567-e89b-12d3-a456-426614174099',
        phone: '+2348087654321',
      };

      memberRepository.findById.mockResolvedValue(oldMember as Member);
      memberRepository.findByPhone.mockResolvedValue(existingMember as Member);

      await expect(
        memberService.updateMember(mockTenantId, mockUserId, mockMemberId, updateWithPhone)
      ).rejects.toThrow('Member with this phone number already exists');
    });

    it('should emit member.updated event', async () => {
      memberRepository.findById.mockResolvedValue(oldMember as Member);
      memberRepository.update.mockResolvedValue(updatedMember as Member);

      await memberService.updateMember(mockTenantId, mockUserId, mockMemberId, updateDto);

      expect(eventPublisher.publishMemberUpdated).toHaveBeenCalledWith(
        mockTenantId,
        updatedMember
      );
    });
  });

  describe('deleteMember', () => {
    const mockMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should soft delete member', async () => {
      memberRepository.findById.mockResolvedValue(mockMember as Member);
      memberRepository.softDelete.mockResolvedValue(undefined);

      await memberService.deleteMember(mockTenantId, mockUserId, mockMemberId);

      expect(memberRepository.findById).toHaveBeenCalledWith(mockTenantId, mockMemberId);
      expect(memberRepository.softDelete).toHaveBeenCalledWith(
        mockTenantId,
        mockMemberId,
        mockUserId
      );
      expect(auditLogger.logDelete).toHaveBeenCalledWith(
        mockTenantId,
        mockMemberId,
        mockMember,
        mockUserId
      );
      expect(eventPublisher.publishMemberDeleted).toHaveBeenCalledWith(mockTenantId, mockMember);
    });

    it('should throw error when member not found', async () => {
      memberRepository.findById.mockResolvedValue(null);

      await expect(
        memberService.deleteMember(mockTenantId, mockUserId, mockMemberId)
      ).rejects.toThrow('Member not found');

      expect(memberRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should emit member.deleted event', async () => {
      memberRepository.findById.mockResolvedValue(mockMember as Member);
      memberRepository.softDelete.mockResolvedValue(undefined);

      await memberService.deleteMember(mockTenantId, mockUserId, mockMemberId);

      expect(eventPublisher.publishMemberDeleted).toHaveBeenCalledWith(mockTenantId, mockMember);
    });
  });

  describe('changeMemberStatus', () => {
    const oldMember: Partial<Member> = {
      id: mockMemberId,
      tenantId: mockTenantId,
      firstName: 'John',
      lastName: 'Doe',
      status: 'visitor',
      version: 1,
    };

    const updatedMember: Partial<Member> = {
      ...oldMember,
      status: 'member',
      version: 2,
    };

    it('should change member status', async () => {
      memberRepository.findById.mockResolvedValue(oldMember as Member);
      memberRepository.update.mockResolvedValue(updatedMember as Member);

      const result = await memberService.changeMemberStatus(
        mockTenantId,
        mockUserId,
        mockMemberId,
        'member',
        1
      );

      expect(memberRepository.update).toHaveBeenCalledWith(
        mockTenantId,
        mockMemberId,
        { status: 'member' },
        1,
        mockUserId
      );
      expect(auditLogger.logStatusChange).toHaveBeenCalledWith(
        mockTenantId,
        mockMemberId,
        'visitor',
        'member',
        mockUserId
      );
      expect(eventPublisher.publishMemberStatusChanged).toHaveBeenCalledWith(
        mockTenantId,
        updatedMember,
        'visitor',
        'member'
      );
      expect(result).toEqual(updatedMember);
    });

    it('should emit member.status.changed event', async () => {
      memberRepository.findById.mockResolvedValue(oldMember as Member);
      memberRepository.update.mockResolvedValue(updatedMember as Member);

      await memberService.changeMemberStatus(
        mockTenantId,
        mockUserId,
        mockMemberId,
        'member',
        1
      );

      expect(eventPublisher.publishMemberStatusChanged).toHaveBeenCalledWith(
        mockTenantId,
        updatedMember,
        'visitor',
        'member'
      );
    });
  });

  describe('searchMembers', () => {
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

    it('should search members with filters', async () => {
      memberRepository.search.mockResolvedValue({
        members: mockMembers as Member[],
        total: 1,
      });

      const result = await memberService.searchMembers(mockTenantId, {
        query: 'John',
        status: 'member',
        page: 1,
        limit: 20,
      });

      expect(memberRepository.search).toHaveBeenCalledWith(mockTenantId, {
        query: 'John',
        status: 'member',
        page: 1,
        limit: 20,
      });
      expect(result).toEqual({
        members: mockMembers,
        total: 1,
        page: 1,
        limit: 20,
      });
    });

    it('should search members with default pagination', async () => {
      memberRepository.search.mockResolvedValue({
        members: mockMembers as Member[],
        total: 1,
      });

      const result = await memberService.searchMembers(mockTenantId, {});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter members by status', async () => {
      memberRepository.search.mockResolvedValue({
        members: mockMembers as Member[],
        total: 1,
      });

      await memberService.searchMembers(mockTenantId, { status: 'member' });

      expect(memberRepository.search).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({ status: 'member' })
      );
    });

    it('should filter members by tags', async () => {
      memberRepository.search.mockResolvedValue({
        members: mockMembers as Member[],
        total: 1,
      });

      await memberService.searchMembers(mockTenantId, { tags: ['choir', 'youth'] });

      expect(memberRepository.search).toHaveBeenCalledWith(
        mockTenantId,
        expect.objectContaining({ tags: ['choir', 'youth'] })
      );
    });

    it('should paginate results correctly', async () => {
      memberRepository.search.mockResolvedValue({
        members: mockMembers as Member[],
        total: 100,
      });

      const result = await memberService.searchMembers(mockTenantId, {
        page: 2,
        limit: 10,
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(100);
    });
  });

  describe('exportMembers', () => {
    const mockMembers: Partial<Member>[] = [
      {
        id: mockMemberId,
        tenantId: mockTenantId,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348012345678',
      },
    ];

    it('should export all members for tenant', async () => {
      memberRepository.findAll.mockResolvedValue(mockMembers as Member[]);

      const result = await memberService.exportMembers(mockTenantId);

      expect(memberRepository.findAll).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockMembers);
    });
  });

  describe('getMemberStatistics', () => {
    it('should return member statistics', async () => {
      memberRepository.countByStatus.mockImplementation((tenantId, status) => {
        if (status === '') return Promise.resolve(100);
        if (status === 'visitor') return Promise.resolve(30);
        if (status === 'member') return Promise.resolve(50);
        if (status === 'inactive') return Promise.resolve(20);
        return Promise.resolve(0);
      });

      const result = await memberService.getMemberStatistics(mockTenantId);

      expect(result).toEqual({
        total: 100,
        visitors: 30,
        members: 50,
        inactive: 20,
      });
    });
  });
});
