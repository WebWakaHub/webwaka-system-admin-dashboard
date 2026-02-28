/**
 * Constituency Management Module - Unit Tests
 */

import { EventEmitter } from 'events';
import { ConstituencyService } from '../services/constituency.service';
import { VoterRegistrationService } from '../services/voter-registration.service';
import { RepresentativeService } from '../services/representative.service';
import { Constituency } from '../models/constituency';
import { Voter } from '../models/voter';
import { Representative } from '../models/representative';

describe('Constituency Management - Unit Tests', () => {
  let constituencyService: ConstituencyService;
  let voterService: VoterRegistrationService;
  let representativeService: RepresentativeService;
  let mockRepository: any;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByTenant: jest.fn(),
      findByConstituency: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      getVoterCount: jest.fn().mockResolvedValue(0),
      getVoterHistory: jest.fn().mockResolvedValue([]),
      getHistory: jest.fn().mockResolvedValue([]),
    };
    eventEmitter = new EventEmitter();
    constituencyService = new ConstituencyService(mockRepository, eventEmitter);
    voterService = new VoterRegistrationService(mockRepository, eventEmitter);
    representativeService = new RepresentativeService(mockRepository, eventEmitter);
  });

  describe('ConstituencyService', () => {
    describe('createConstituency', () => {
      it('should create a new constituency', async () => {
        const data = {
          tenantId: 'tenant-1',
          name: 'Lagos Central',
          code: 'LAG-CENT-001',
          type: 'federal',
          state: 'Lagos',
          population: 500000,
          registeredVoters: 300000,
          urbanRural: 'urban',
        };

        const constituency = await constituencyService.createConstituency(data, 'user-1');

        expect(constituency).toBeInstanceOf(Constituency);
        expect(constituency.name).toBe('Lagos Central');
        expect(constituency.type).toBe('federal');
        expect(mockRepository.create).toHaveBeenCalled();
      });

      it('should emit constituency.created event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('constituency.created', eventSpy);

        await constituencyService.createConstituency({
          tenantId: 'tenant-1',
          name: 'Test Constituency',
          code: 'TEST-001',
          type: 'state',
          state: 'Lagos',
          population: 100000,
          registeredVoters: 50000,
          urbanRural: 'urban',
        }, 'user-1');

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantId: 'tenant-1',
            name: 'Test Constituency',
            type: 'state',
            createdBy: 'user-1',
          })
        );
      });
    });

    describe('updateConstituency', () => {
      it('should update constituency', async () => {
        const existing = new Constituency({
          id: 'const-1',
          tenantId: 'tenant-1',
          name: 'Old Name',
          code: 'TEST-001',
          type: 'federal',
          state: 'Lagos',
          population: 100000,
          registeredVoters: 50000,
          urbanRural: 'urban',
        });

        mockRepository.findById.mockResolvedValue(existing);

        const updated = await constituencyService.updateConstituency(
          'const-1',
          'tenant-1',
          { name: 'New Name' },
          'user-1'
        );

        expect(updated.name).toBe('New Name');
        expect(mockRepository.update).toHaveBeenCalled();
      });

      it('should emit constituency.updated event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('constituency.updated', eventSpy);

        const existing = new Constituency({
          id: 'const-1',
          tenantId: 'tenant-1',
          name: 'Test',
          code: 'TEST-001',
          type: 'federal',
          state: 'Lagos',
          population: 100000,
          registeredVoters: 50000,
          urbanRural: 'urban',
        });

        mockRepository.findById.mockResolvedValue(existing);

        await constituencyService.updateConstituency('const-1', 'tenant-1', { name: 'Updated' }, 'user-1');

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            constituencyId: 'const-1',
            updatedBy: 'user-1',
          })
        );
      });
    });

    describe('getConstituencyAnalytics', () => {
      it('should calculate registration rate', async () => {
        const constituency = new Constituency({
          id: 'const-1',
          tenantId: 'tenant-1',
          name: 'Lagos Central',
          code: 'LAG-001',
          type: 'federal',
          state: 'Lagos',
          population: 500000,
          registeredVoters: 300000,
          urbanRural: 'urban',
        });

        mockRepository.findById.mockResolvedValue(constituency);
        mockRepository.getVoterCount.mockResolvedValue(300000);

        const analytics = await constituencyService.getConstituencyAnalytics('const-1', 'tenant-1');

        expect(analytics.registrationRate).toBe(60);
        expect(analytics.population).toBe(500000);
        expect(analytics.registeredVoters).toBe(300000);
      });

      it('should handle zero population', async () => {
        const constituency = new Constituency({
          id: 'const-1',
          tenantId: 'tenant-1',
          name: 'New Constituency',
          code: 'NEW-001',
          type: 'ward',
          state: 'Lagos',
          population: 0,
          registeredVoters: 0,
          urbanRural: 'rural',
        });

        mockRepository.findById.mockResolvedValue(constituency);
        mockRepository.getVoterCount.mockResolvedValue(0);

        const analytics = await constituencyService.getConstituencyAnalytics('const-1', 'tenant-1');

        expect(analytics.registrationRate).toBe(0);
      });
    });
  });

  describe('VoterRegistrationService', () => {
    describe('registerVoter', () => {
      it('should register a new voter', async () => {
        const data = {
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          address: '123 Main St, Lagos',
          voterIdNumber: 'VIN-12345',
        };

        const voter = await voterService.registerVoter(data);

        expect(voter).toBeInstanceOf(Voter);
        expect(voter.firstName).toBe('John');
        expect(voter.status).toBe('active');
        expect(mockRepository.create).toHaveBeenCalled();
      });

      it('should emit voter.registered event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('voter.registered', eventSpy);

        await voterService.registerVoter({
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: new Date('1995-05-15'),
          gender: 'female',
          address: '456 Oak Ave, Abuja',
          voterIdNumber: 'VIN-67890',
        });

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            constituencyId: 'const-1',
            tenantId: 'tenant-1',
            voterIdNumber: 'VIN-67890',
          })
        );
      });
    });

    describe('transferVoter', () => {
      it('should transfer voter to new constituency', async () => {
        const voter = new Voter({
          id: 'voter-1',
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          address: '123 Main St',
          status: 'active',
          voterIdNumber: 'VIN-12345',
        });

        mockRepository.findById.mockResolvedValue(voter);

        const transferred = await voterService.transferVoter('voter-1', 'const-2', 'tenant-1');

        expect(transferred.constituencyId).toBe('const-2');
        expect(mockRepository.update).toHaveBeenCalled();
      });

      it('should emit voter.transferred event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('voter.transferred', eventSpy);

        const voter = new Voter({
          id: 'voter-1',
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          address: '123 Main St',
          status: 'active',
          voterIdNumber: 'VIN-12345',
        });

        mockRepository.findById.mockResolvedValue(voter);

        await voterService.transferVoter('voter-1', 'const-2', 'tenant-1');

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            voterId: 'voter-1',
            fromConstituencyId: 'const-1',
            toConstituencyId: 'const-2',
          })
        );
      });
    });

    describe('suspendVoter', () => {
      it('should suspend a voter', async () => {
        const voter = new Voter({
          id: 'voter-1',
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
          address: '123 Main St',
          status: 'active',
          voterIdNumber: 'VIN-12345',
        });

        mockRepository.findById.mockResolvedValue(voter);

        const suspended = await voterService.suspendVoter('voter-1', 'tenant-1');

        expect(suspended.status).toBe('suspended');
        expect(mockRepository.update).toHaveBeenCalled();
      });
    });
  });

  describe('RepresentativeService', () => {
    describe('assignRepresentative', () => {
      it('should assign a representative', async () => {
        const data = {
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'Hon',
          lastName: 'Representative',
          party: 'APC',
          position: 'Member of Parliament',
          termStart: new Date('2023-01-01'),
        };

        const representative = await representativeService.assignRepresentative(data);

        expect(representative).toBeInstanceOf(Representative);
        expect(representative.firstName).toBe('Hon');
        expect(representative.status).toBe('active');
        expect(mockRepository.create).toHaveBeenCalled();
      });

      it('should emit representative.assigned event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('representative.assigned', eventSpy);

        await representativeService.assignRepresentative({
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'Test',
          lastName: 'Rep',
          position: 'Councilor',
          termStart: new Date(),
        });

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            constituencyId: 'const-1',
            position: 'Councilor',
          })
        );
      });
    });

    describe('endTerm', () => {
      it('should end representative term', async () => {
        const representative = new Representative({
          id: 'rep-1',
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'Hon',
          lastName: 'Rep',
          position: 'MP',
          termStart: new Date('2019-01-01'),
          status: 'active',
        });

        mockRepository.findById.mockResolvedValue(representative);

        const ended = await representativeService.endTerm('rep-1', 'tenant-1');

        expect(ended.status).toBe('inactive');
        expect(ended.termEnd).toBeDefined();
        expect(mockRepository.update).toHaveBeenCalled();
      });

      it('should emit representative.term_ended event', async () => {
        const eventSpy = jest.fn();
        eventEmitter.on('representative.term_ended', eventSpy);

        const representative = new Representative({
          id: 'rep-1',
          tenantId: 'tenant-1',
          constituencyId: 'const-1',
          firstName: 'Hon',
          lastName: 'Rep',
          position: 'MP',
          termStart: new Date('2019-01-01'),
          status: 'active',
        });

        mockRepository.findById.mockResolvedValue(representative);

        await representativeService.endTerm('rep-1', 'tenant-1');

        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            representativeId: 'rep-1',
            constituencyId: 'const-1',
          })
        );
      });
    });
  });
});
