import { WebsiteBuilder } from '../WebsiteBuilder';
describe('WebsiteBuilder', () => {
  it('should create page', async () => {
    const builder = new WebsiteBuilder({ database: {}, eventBus: { emit: jest.fn() } });
    const page = await builder.pageService.createPage('site-1', { title: 'Home', slug: 'home' });
    expect(page.title).toBe('Home');
  });
});
