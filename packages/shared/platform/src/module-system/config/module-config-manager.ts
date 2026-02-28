import { Module } from '../types';

/**
 * Module Configuration Manager
 * Manages module configurations and settings
 */
export interface IModuleConfigManager {
  /**
   * Load configuration for a module
   */
  loadConfig(moduleName: string, configPath: string): Promise<any>;

  /**
   * Save configuration for a module
   */
  saveConfig(moduleName: string, config: any): Promise<void>;

  /**
   * Get configuration value
   */
  getConfigValue(moduleName: string, key: string): any;

  /**
   * Set configuration value
   */
  setConfigValue(moduleName: string, key: string, value: any): void;

  /**
   * Validate configuration
   */
  validateConfig(moduleName: string, config: any): boolean;
}

export class DefaultModuleConfigManager implements IModuleConfigManager {
  private configs: Map<string, any> = new Map();

  async loadConfig(moduleName: string, configPath: string): Promise<any> {
    // In a real implementation, this would load from file system
    const config = {};
    this.configs.set(moduleName, config);
    return config;
  }

  async saveConfig(moduleName: string, config: any): Promise<void> {
    this.configs.set(moduleName, config);
    // In a real implementation, this would save to file system
  }

  getConfigValue(moduleName: string, key: string): any {
    const config = this.configs.get(moduleName);
    if (!config) return undefined;
    return config[key];
  }

  setConfigValue(moduleName: string, key: string, value: any): void {
    let config = this.configs.get(moduleName);
    if (!config) {
      config = {};
      this.configs.set(moduleName, config);
    }
    config[key] = value;
  }

  validateConfig(moduleName: string, config: any): boolean {
    // Basic validation - can be extended
    if (!config || typeof config !== 'object') {
      return false;
    }
    return true;
  }
}
