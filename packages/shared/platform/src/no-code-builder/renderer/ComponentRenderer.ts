/**
 * ComponentRenderer
 * Renders application components based on their definitions
 */

import {
  ComponentDefinition,
  ComponentType,
  ApplicationDefinition,
  Page,
} from '../types';

export class ComponentRenderer {
  /**
   * Generate HTML for an entire application
   */
  static generateApplicationHTML(app: ApplicationDefinition): Map<string, string> {
    const pages = new Map<string, string>();

    for (const page of app.pages) {
      const html = this.generatePageHTML(app, page);
      pages.set(page.path, html);
    }

    return pages;
  }

  /**
   * Generate HTML for a single page
   */
  static generatePageHTML(app: ApplicationDefinition, page: Page): string {
    const componentsHTML = page.components
      .map(component => this.renderComponent(component))
      .join('\n');

    const stylesHTML = this.generateStyles(app.globalStyles || {});

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name} - ${app.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
    }
    ${stylesHTML}
  </style>
</head>
<body>
  <div id="app">
    ${componentsHTML}
  </div>
  <script>
    ${this.generateClientScript(page)}
  </script>
</body>
</html>
    `.trim();
  }

  /**
   * Render a single component
   */
  static renderComponent(component: ComponentDefinition): string {
    switch (component.type) {
      case ComponentType.TEXT:
        return this.renderText(component);
      case ComponentType.IMAGE:
        return this.renderImage(component);
      case ComponentType.BUTTON:
        return this.renderButton(component);
      case ComponentType.CONTAINER:
        return this.renderContainer(component);
      case ComponentType.FORM:
        return this.renderForm(component);
      case ComponentType.INPUT:
        return this.renderInput(component);
      case ComponentType.REPEATER:
        return this.renderRepeater(component);
      default:
        return `<!-- Unknown component type: ${component.type} -->`;
    }
  }

  /**
   * Render TEXT component
   */
  private static renderText(component: ComponentDefinition): string {
    const { content = 'Text', style = {} } = component.properties;
    const styleStr = this.styleToString(style);
    return `<div id="${component.id}" style="${styleStr}">${content}</div>`;
  }

  /**
   * Render IMAGE component
   */
  private static renderImage(component: ComponentDefinition): string {
    const { src = '', alt = 'Image', style = {} } = component.properties;
    const styleStr = this.styleToString(style);
    return `<img id="${component.id}" src="${src}" alt="${alt}" style="${styleStr}" />`;
  }

  /**
   * Render BUTTON component
   */
  private static renderButton(component: ComponentDefinition): string {
    const { label = 'Button', style = {} } = component.properties;
    const styleStr = this.styleToString(style);
    const eventAttr = component.events && component.events.length > 0
      ? `data-events='${JSON.stringify(component.events)}'`
      : '';
    return `<button id="${component.id}" style="${styleStr}" ${eventAttr}>${label}</button>`;
  }

  /**
   * Render CONTAINER component
   */
  private static renderContainer(component: ComponentDefinition): string {
    const { style = {} } = component.properties;
    const styleStr = this.styleToString(style);
    const childrenHTML = (component.children || [])
      .map(child => this.renderComponent(child))
      .join('\n');
    return `<div id="${component.id}" style="${styleStr}">${childrenHTML}</div>`;
  }

  /**
   * Render FORM component
   */
  private static renderForm(component: ComponentDefinition): string {
    const { style = {} } = component.properties;
    const styleStr = this.styleToString(style);
    const childrenHTML = (component.children || [])
      .map(child => this.renderComponent(child))
      .join('\n');
    return `<form id="${component.id}" style="${styleStr}">${childrenHTML}</form>`;
  }

  /**
   * Render INPUT component
   */
  private static renderInput(component: ComponentDefinition): string {
    const { type = 'text', placeholder = '', name = '', style = {} } = component.properties;
    const styleStr = this.styleToString(style);
    return `<input id="${component.id}" type="${type}" placeholder="${placeholder}" name="${name}" style="${styleStr}" />`;
  }

  /**
   * Render REPEATER component
   */
  private static renderRepeater(component: ComponentDefinition): string {
    const { style = {} } = component.properties;
    const styleStr = this.styleToString(style);
    const dataBinding = component.dataBinding
      ? `data-binding='${JSON.stringify(component.dataBinding)}'`
      : '';
    return `<div id="${component.id}" class="repeater" style="${styleStr}" ${dataBinding}></div>`;
  }

  /**
   * Convert style object to CSS string
   */
  private static styleToString(style: Record<string, any>): string {
    return Object.entries(style)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  }

  /**
   * Generate global styles
   */
  private static generateStyles(globalStyles: Record<string, any>): string {
    return Object.entries(globalStyles)
      .map(([selector, styles]) => {
        const styleStr = this.styleToString(styles);
        return `${selector} { ${styleStr} }`;
      })
      .join('\n');
  }

  /**
   * Generate client-side JavaScript for events and data binding
   */
  private static generateClientScript(page: Page): string {
    return `
    // Event handling
    document.addEventListener('DOMContentLoaded', function() {
      // Handle button clicks
      document.querySelectorAll('button[data-events]').forEach(function(button) {
        const events = JSON.parse(button.getAttribute('data-events'));
        events.forEach(function(event) {
          if (event.trigger === 'click') {
            button.addEventListener('click', function() {
              handleAction(event.action, event.parameters);
            });
          }
        });
      });

      // Handle data binding for repeaters
      document.querySelectorAll('.repeater[data-binding]').forEach(function(repeater) {
        const binding = JSON.parse(repeater.getAttribute('data-binding'));
        if (binding.source === 'cms') {
          fetchAndRenderData(repeater, binding);
        }
      });
    });

    function handleAction(action, parameters) {
      if (action === 'show_alert') {
        alert(parameters.message || 'Alert!');
      } else if (action === 'navigate') {
        window.location.href = parameters.url || '/';
      }
    }

    async function fetchAndRenderData(element, binding) {
      try {
        const response = await fetch('/api/v1/content/' + binding.modelPluralName);
        const result = await response.json();
        const items = result.data || [];
        
        element.innerHTML = items.map(function(item) {
          return '<div class="repeater-item">' + JSON.stringify(item.data) + '</div>';
        }).join('');
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    `;
  }
}
