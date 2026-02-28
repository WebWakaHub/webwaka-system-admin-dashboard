/**
 * Additional Unit Tests - Module Loader Service
 * 
 * Tests to achieve 100% coverage for uncovered lines
 */

import { ModuleLoaderService } from '../../../src/core/modules/module-loader.service';
import { BaseModule } from '../../../src/core/modules/module.interface';

describe('ModuleLoaderService - Additional Coverage', () => {
  let loader: ModuleLoaderService;

  beforeEach(() => {
    loader = new ModuleLoaderService('/test/modules');
  });

  describe('requireModule error handling', () => {
    it('should handle require errors', async () => {
      const badPath = '/non/existent/module.js';
      
      try {
        await (loader as any).requireModule(badPath);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Failed to require module');
      }
    });
  });

  describe('createModuleInstance error handling', () => {
    it('should handle instantiation errors', () => {
      class BadModule {
        constructor() {
          throw new Error('Constructor failed');
        }
        onLoad() {}
        onUnload() {}
        onStart() {}
        onStop() {}
        getMetadata() {}
      }

      try {
        (loader as any).createModuleInstance(BadModule, '/test/path');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Failed to instantiate module');
      }
    });

    it('should create instance from default export', () => {
      class TestModule extends BaseModule {
        constructor(metadata: any) {
          super(metadata);
        }
      }

      const moduleExport = { default: TestModule };
      const instance = (loader as any).createModuleInstance(moduleExport, '/test/path');
      
      expect(instance).toBeDefined();
    });

    it('should create instance from Module export', () => {
      class TestModule extends BaseModule {
        constructor(metadata: any) {
          super(metadata);
        }
      }

      const moduleExport = { Module: TestModule };
      const instance = (loader as any).createModuleInstance(moduleExport, '/test/path');
      
      expect(instance).toBeDefined();
    });
  });

  describe('index.ts exports', () => {
    it('should export all module system components', () => {
      const moduleSystem = require('../../../src/core/modules/index');
      
      expect(moduleSystem.ModuleStatus).toBeDefined();
      expect(moduleSystem.BaseModule).toBeDefined();
      expect(moduleSystem.ModuleLoaderService).toBeDefined();
      expect(moduleSystem.ModuleRegistryService).toBeDefined();
      expect(moduleSystem.ModuleManagerService).toBeDefined();
    });
  });
});
