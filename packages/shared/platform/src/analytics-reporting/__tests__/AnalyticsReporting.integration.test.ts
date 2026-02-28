/**
 * Integration tests for Analytics & Reporting
 */

import { AnalyticsReporting } from '../AnalyticsReporting';

describe('AnalyticsReporting Integration', () => {
  let analytics: AnalyticsReporting;
  let mockEventBus: any;
  let mockDatabase: any;

  beforeEach(() => {
    mockEventBus = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };

    mockDatabase = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };

    analytics = new AnalyticsReporting({
      database: mockDatabase,
      eventBus: mockEventBus,
      clickHouseHost: 'localhost',
      clickHousePort: 8123,
      clickHouseDatabase: 'analytics',
      clickHouseUsername: 'default',
      clickHousePassword: '',
    });
  });

  afterEach(async () => {
    await analytics.shutdown();
  });

  it('should initialize successfully', async () => {
    await analytics.initialize();

    expect(mockEventBus.on).toHaveBeenCalledWith('analytics.pageView', expect.any(Function));
    expect(mockEventBus.on).toHaveBeenCalledWith('analytics.click', expect.any(Function));
    expect(mockEventBus.on).toHaveBeenCalledWith('analytics.formSubmission', expect.any(Function));
  });

  it('should get analytics summary', async () => {
    const summary = await analytics.getSummary('tenant-1', {
      startDate: '2026-02-01',
      endDate: '2026-02-12',
    });

    expect(summary).toHaveProperty('totalUsers');
    expect(summary).toHaveProperty('pageViews');
    expect(summary).toHaveProperty('bounceRate');
  });

  it('should get top pages', async () => {
    const topPages = await analytics.getTopPages('tenant-1', {
      startDate: '2026-02-01',
      endDate: '2026-02-12',
      limit: 10,
    });

    expect(Array.isArray(topPages)).toBe(true);
  });

  it('should get top referrers', async () => {
    const topReferrers = await analytics.getTopReferrers('tenant-1', {
      startDate: '2026-02-01',
      endDate: '2026-02-12',
      limit: 10,
    });

    expect(Array.isArray(topReferrers)).toBe(true);
  });

  it('should get page views over time', async () => {
    const pageViewsOverTime = await analytics.getPageViewsOverTime('tenant-1', {
      startDate: '2026-02-01',
      endDate: '2026-02-12',
    });

    expect(Array.isArray(pageViewsOverTime)).toBe(true);
  });
});
