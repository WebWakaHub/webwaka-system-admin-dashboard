export class SitesFunnelsSalesFunnelBuilder {
  async initialize() { console.log('Sites & Funnels Sales Funnel Builder initialized'); }
  async createFunnel(data: any) { return { id: 'funnel-1', ...data }; }
  async addStep(funnelId: string, step: any) { return { id: 'step-1', funnelId, ...step }; }
}
