import type { WebsiteConfig } from './types';
import { PageService } from './services/PageService';
import { TemplateService } from './services/TemplateService';
export class WebsiteBuilder {
  public pageService: PageService;
  public templateService: TemplateService;
  constructor(config: WebsiteConfig) {
    this.pageService = new PageService(config.database, config.eventBus);
    this.templateService = new TemplateService(config.database);
  }
  async initialize(): Promise<void> {}
  async shutdown(): Promise<void> {}
}
