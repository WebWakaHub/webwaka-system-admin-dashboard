import type { Page } from '../types';
export class PageService {
  constructor(private db: any, private eventBus: any) {}
  async createPage(siteId: string, data: Partial<Page>): Promise<Page> {
    const page = { id: 'page-1', siteId, ...data } as Page;
    this.eventBus.emit('page.created', page);
    return page;
  }
  async publishPage(pageId: string): Promise<void> {
    this.eventBus.emit('page.published', { pageId });
  }
}
