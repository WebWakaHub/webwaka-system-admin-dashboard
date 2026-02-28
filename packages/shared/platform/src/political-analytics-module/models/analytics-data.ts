export class AnalyticsData {
  id: string;
  campaignId: string;
  metric: string;
  value: number;
  timestamp: Date = new Date();
  dimensions: Record<string, any> = {};

  constructor(data: Partial<AnalyticsData>) {
    Object.assign(this, data);
  }
}
