import type { Template } from '../types';
export class TemplateService {
  constructor(private db: any) {}
  async getTemplates(): Promise<Template[]> {
    return [{ id: 'tpl-1', name: 'Landing Page', structure: {} }];
  }
}
