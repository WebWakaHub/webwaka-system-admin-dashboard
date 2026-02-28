/**
 * Unit tests for ComponentRenderer
 */

import { ComponentRenderer } from '../renderer/ComponentRenderer';
import {
  ComponentType,
  ComponentDefinition,
  ApplicationDefinition,
  DeploymentStatus,
} from '../types';

describe('ComponentRenderer', () => {
  describe('generateApplicationHTML', () => {
    it('should generate HTML for all pages in an application', () => {
      const app: ApplicationDefinition = {
        id: 'app-1',
        tenantId: 'tenant-1',
        createdBy: 'user-1',
        name: 'Test App',
        pages: [
          {
            id: 'page-1',
            name: 'Home',
            path: '/',
            components: [],
          },
          {
            id: 'page-2',
            name: 'About',
            path: '/about',
            components: [],
          },
        ],
        globalStyles: {},
        deploymentStatus: DeploymentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = ComponentRenderer.generateApplicationHTML(app);

      expect(result.size).toBe(2);
      expect(result.has('/')).toBe(true);
      expect(result.has('/about')).toBe(true);
    });
  });

  describe('renderComponent', () => {
    it('should render a TEXT component', () => {
      const component: ComponentDefinition = {
        id: 'text-1',
        type: ComponentType.TEXT,
        properties: {
          content: 'Hello World',
          style: { fontSize: '24px' },
        },
      };

      const result = ComponentRenderer.renderComponent(component);

      expect(result).toContain('Hello World');
      expect(result).toContain('font-size: 24px');
    });

    it('should render an IMAGE component', () => {
      const component: ComponentDefinition = {
        id: 'image-1',
        type: ComponentType.IMAGE,
        properties: {
          src: 'https://example.com/image.jpg',
          alt: 'Test Image',
        },
      };

      const result = ComponentRenderer.renderComponent(component);

      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/image.jpg"');
      expect(result).toContain('alt="Test Image"');
    });

    it('should render a BUTTON component', () => {
      const component: ComponentDefinition = {
        id: 'button-1',
        type: ComponentType.BUTTON,
        properties: {
          label: 'Click Me',
        },
      };

      const result = ComponentRenderer.renderComponent(component);

      expect(result).toContain('<button');
      expect(result).toContain('Click Me');
    });

    it('should render a CONTAINER component with children', () => {
      const component: ComponentDefinition = {
        id: 'container-1',
        type: ComponentType.CONTAINER,
        properties: {},
        children: [
          {
            id: 'text-1',
            type: ComponentType.TEXT,
            properties: { content: 'Child Text' },
          },
        ],
      };

      const result = ComponentRenderer.renderComponent(component);

      expect(result).toContain('<div');
      expect(result).toContain('Child Text');
    });

    it('should render a FORM component', () => {
      const component: ComponentDefinition = {
        id: 'form-1',
        type: ComponentType.FORM,
        properties: {},
        children: [],
      };

      const result = ComponentRenderer.renderComponent(component);

      expect(result).toContain('<form');
    });

    it('should render an INPUT component', () => {
      const component: ComponentDefinition = {
        id: 'input-1',
        type: ComponentType.INPUT,
        properties: {
          type: 'email',
          placeholder: 'Enter your email',
          name: 'email',
        },
      };

      const result = ComponentRenderer.renderComponent(component);

      expect(result).toContain('<input');
      expect(result).toContain('type="email"');
      expect(result).toContain('placeholder="Enter your email"');
    });

    it('should render a REPEATER component with data binding', () => {
      const component: ComponentDefinition = {
        id: 'repeater-1',
        type: ComponentType.REPEATER,
        properties: {},
        dataBinding: {
          source: 'cms',
          modelPluralName: 'blog_posts',
        },
      };

      const result = ComponentRenderer.renderComponent(component);

      expect(result).toContain('class="repeater"');
      expect(result).toContain('data-binding');
    });
  });
});
