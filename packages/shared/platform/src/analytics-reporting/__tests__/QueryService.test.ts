/**
 * Unit tests for QueryService
 */

import { QueryService } from '../services/QueryService';

describe('QueryService', () => {
  let queryService: QueryService;
  let mockClickHouseClient: any;

  beforeEach(() => {
    mockClickHouseClient = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };

    queryService = new QueryService(mockClickHouseClient);
  });

  describe('getSummary', () => {
    it('should return analytics summary', async () => {
      const summary = await queryService.getSummary('tenant-1', {
        startDate: '2026-02-01',
        endDate: '2026-02-12',
      });

      expect(summary).toHaveProperty('totalUsers');
      expect(summary).toHaveProperty('pageViews');
      expect(summary).toHaveProperty('bounceRate');
      expect(summary).toHaveProperty('avgSessionDuration');
    });
  });

  describe('getTopPages', () => {
    it('should return top pages', async () => {
      const topPages = await queryService.getTopPages('tenant-1', {
        startDate: '2026-02-01',
        endDate: '2026-02-12',
        limit: 10,
      });

      expect(Array.isArray(topPages)).toBe(true);
      expect(topPages.length).toBeGreaterThan(0);
      expect(topPages[0]).toHaveProperty('page');
      expect(topPages[0]).toHaveProperty('views');
      expect(topPages[0]).toHaveProperty('uniqueVisitors');
    });

    it('should respect the limit parameter', async () => {
      const topPages = await queryService.getTopPages('tenant-1', {
        startDate: '2026-02-01',
        endDate: '2026-02-12',
        limit: 2,
      });

      expect(topPages.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getTopReferrers', () => {
    it('should return top referrers', async () => {
      const topReferrers = await queryService.getTopReferrers('tenant-1', {
        startDate: '2026-02-01',
        endDate: '2026-02-12',
        limit: 10,
      });

      expect(Array.isArray(topReferrers)).toBe(true);
      expect(topReferrers.length).toBeGreaterThan(0);
      expect(topReferrers[0]).toHaveProperty('referrer');
      expect(topReferrers[0]).toHaveProperty('visits');
    });
  });

  describe('getPageViewsOverTime', () => {
    it('should return page views over time', async () => {
      const pageViewsOverTime = await queryService.getPageViewsOverTime('tenant-1', {
        startDate: '2026-02-01',
        endDate: '2026-02-12',
      });

      expect(Array.isArray(pageViewsOverTime)).toBe(true);
      expect(pageViewsOverTime.length).toBeGreaterThan(0);
      expect(pageViewsOverTime[0]).toHaveProperty('date');
      expect(pageViewsOverTime[0]).toHaveProperty('views');
    });
  });
});
