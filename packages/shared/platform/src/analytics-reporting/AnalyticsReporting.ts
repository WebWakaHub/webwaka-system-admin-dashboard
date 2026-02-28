/**
 * Analytics & Reporting Module
 * Main class for the Analytics & Reporting module
 */

import type {
  AnalyticsReportingConfig,
  AnalyticsSummary,
  AnalyticsQuery,
  TopPagesData,
  ReferrerData,
} from './types';
import { EventProcessor } from './services/EventProcessor';
import { QueryService } from './services/QueryService';

export class AnalyticsReporting {
  private config: AnalyticsReportingConfig;
  public eventProcessor: EventProcessor;
  public queryService: QueryService;
  private clickHouseClient: any;

  constructor(config: AnalyticsReportingConfig) {
    this.config = config;

    // Initialize ClickHouse client (mock for now)
    this.clickHouseClient = {
      query: async (sql: string, params?: any[]) => {
        // Mock implementation
        return { rows: [] };
      },
    };

    // Initialize services
    this.eventProcessor = new EventProcessor(config.eventBus, this.clickHouseClient);
    this.queryService = new QueryService(this.clickHouseClient);
  }

  /**
   * Initialize the Analytics & Reporting module
   */
  async initialize(): Promise<void> {
    await this.eventProcessor.initialize();
  }

  /**
   * Get analytics summary
   */
  async getSummary(tenantId: string, query: AnalyticsQuery): Promise<AnalyticsSummary> {
    return this.queryService.getSummary(tenantId, query);
  }

  /**
   * Get top pages
   */
  async getTopPages(tenantId: string, query: AnalyticsQuery): Promise<TopPagesData[]> {
    return this.queryService.getTopPages(tenantId, query);
  }

  /**
   * Get top referrers
   */
  async getTopReferrers(tenantId: string, query: AnalyticsQuery): Promise<ReferrerData[]> {
    return this.queryService.getTopReferrers(tenantId, query);
  }

  /**
   * Get page views over time
   */
  async getPageViewsOverTime(
    tenantId: string,
    query: AnalyticsQuery
  ): Promise<Array<{ date: string; views: number }>> {
    return this.queryService.getPageViewsOverTime(tenantId, query);
  }

  /**
   * Shutdown the Analytics & Reporting module
   */
  async shutdown(): Promise<void> {
    await this.eventProcessor.shutdown();
  }
}
