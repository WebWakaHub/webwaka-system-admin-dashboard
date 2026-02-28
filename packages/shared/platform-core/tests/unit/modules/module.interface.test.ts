/**
 * Unit Tests - Module Interface
 * 
 * Tests for the Module interface and BaseModule implementation
 */

import { BaseModule, ModuleStatus, ModuleMetadata } from '../../../src/core/modules/module.interface';

describe('Module Interface', () => {
  describe('ModuleStatus Enum', () => {
    it('should have all required status values', () => {
      expect(ModuleStatus.UNLOADED).toBe('unloaded');
      expect(ModuleStatus.LOADED).toBe('loaded');
      expect(ModuleStatus.RUNNING).toBe('running');
      expect(ModuleStatus.STOPPED).toBe('stopped');
      expect(ModuleStatus.FAILED).toBe('failed');
    });
  });

  describe('BaseModule', () => {
    class TestModule extends BaseModule {
      constructor(metadata: Partial<ModuleMetadata>) {
        super(metadata);
      }
    }

    describe('constructor', () => {
      it('should create a module with full metadata', () => {
        const metadata = {
          name: 'test-module',
          version: '1.0.0',
          description: 'Test module',
          author: 'Test Author',
          dependencies: { 'dep1': '1.0.0' },
          path: '/path/to/module'
        };

        const module = new TestModule(metadata);
        const result = module.getMetadata();

        expect(result.name).toBe('test-module');
        expect(result.version).toBe('1.0.0');
        expect(result.description).toBe('Test module');
        expect(result.author).toBe('Test Author');
        expect(result.dependencies).toEqual({ 'dep1': '1.0.0' });
        expect(result.path).toBe('/path/to/module');
        expect(result.status).toBe(ModuleStatus.UNLOADED);
      });

      it('should create a module with minimal metadata', () => {
        const module = new TestModule({});
        const result = module.getMetadata();

        expect(result.name).toBe('unknown');
        expect(result.version).toBe('0.0.0');
        expect(result.dependencies).toEqual({});
        expect(result.path).toBe('');
        expect(result.status).toBe(ModuleStatus.UNLOADED);
      });

      it('should create a module with partial metadata', () => {
        const module = new TestModule({
          name: 'partial-module',
          version: '2.0.0'
        });
        const result = module.getMetadata();

        expect(result.name).toBe('partial-module');
        expect(result.version).toBe('2.0.0');
        expect(result.dependencies).toEqual({});
      });
    });

    describe('getMetadata', () => {
      it('should return a copy of metadata', () => {
        const module = new TestModule({ name: 'test' });
        const metadata1 = module.getMetadata();
        const metadata2 = module.getMetadata();

        expect(metadata1).toEqual(metadata2);
        expect(metadata1).not.toBe(metadata2); // Different objects
      });

      it('should not allow external modification of metadata', () => {
        const module = new TestModule({ name: 'test' });
        const metadata = module.getMetadata();
        
        metadata.name = 'modified';
        
        const freshMetadata = module.getMetadata();
        expect(freshMetadata.name).toBe('test');
      });
    });

    describe('onLoad', () => {
      it('should change status to LOADED', async () => {
        const module = new TestModule({ name: 'test' });
        
        await module.onLoad();
        
        const metadata = module.getMetadata();
        expect(metadata.status).toBe(ModuleStatus.LOADED);
      });

      it('should set loadedAt timestamp', async () => {
        const module = new TestModule({ name: 'test' });
        const beforeLoad = new Date();
        
        await module.onLoad();
        
        const metadata = module.getMetadata();
        expect(metadata.loadedAt).toBeDefined();
        expect(metadata.loadedAt!.getTime()).toBeGreaterThanOrEqual(beforeLoad.getTime());
      });
    });

    describe('onUnload', () => {
      it('should change status to UNLOADED', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        
        await module.onUnload();
        
        const metadata = module.getMetadata();
        expect(metadata.status).toBe(ModuleStatus.UNLOADED);
      });

      it('should clear loadedAt timestamp', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        
        await module.onUnload();
        
        const metadata = module.getMetadata();
        expect(metadata.loadedAt).toBeUndefined();
      });

      it('should clear startedAt timestamp', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        await module.onStart();
        
        await module.onUnload();
        
        const metadata = module.getMetadata();
        expect(metadata.startedAt).toBeUndefined();
      });
    });

    describe('onStart', () => {
      it('should change status to RUNNING', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        
        await module.onStart();
        
        const metadata = module.getMetadata();
        expect(metadata.status).toBe(ModuleStatus.RUNNING);
      });

      it('should set startedAt timestamp', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        const beforeStart = new Date();
        
        await module.onStart();
        
        const metadata = module.getMetadata();
        expect(metadata.startedAt).toBeDefined();
        expect(metadata.startedAt!.getTime()).toBeGreaterThanOrEqual(beforeStart.getTime());
      });
    });

    describe('onStop', () => {
      it('should change status to STOPPED', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        await module.onStart();
        
        await module.onStop();
        
        const metadata = module.getMetadata();
        expect(metadata.status).toBe(ModuleStatus.STOPPED);
      });

      it('should clear startedAt timestamp', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        await module.onStart();
        
        await module.onStop();
        
        const metadata = module.getMetadata();
        expect(metadata.startedAt).toBeUndefined();
      });
    });

    describe('healthCheck', () => {
      it('should return true when module is RUNNING', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        await module.onStart();
        
        const result = await module.healthCheck();
        
        expect(result).toBe(true);
      });

      it('should return false when module is LOADED', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        
        const result = await module.healthCheck();
        
        expect(result).toBe(false);
      });

      it('should return false when module is UNLOADED', async () => {
        const module = new TestModule({ name: 'test' });
        
        const result = await module.healthCheck();
        
        expect(result).toBe(false);
      });

      it('should return false when module is STOPPED', async () => {
        const module = new TestModule({ name: 'test' });
        await module.onLoad();
        await module.onStart();
        await module.onStop();
        
        const result = await module.healthCheck();
        
        expect(result).toBe(false);
      });
    });

    describe('lifecycle flow', () => {
      it('should handle complete lifecycle: load -> start -> stop -> unload', async () => {
        const module = new TestModule({ name: 'test' });
        
        // Initial state
        expect(module.getMetadata().status).toBe(ModuleStatus.UNLOADED);
        
        // Load
        await module.onLoad();
        expect(module.getMetadata().status).toBe(ModuleStatus.LOADED);
        expect(module.getMetadata().loadedAt).toBeDefined();
        
        // Start
        await module.onStart();
        expect(module.getMetadata().status).toBe(ModuleStatus.RUNNING);
        expect(module.getMetadata().startedAt).toBeDefined();
        
        // Stop
        await module.onStop();
        expect(module.getMetadata().status).toBe(ModuleStatus.STOPPED);
        expect(module.getMetadata().startedAt).toBeUndefined();
        
        // Unload
        await module.onUnload();
        expect(module.getMetadata().status).toBe(ModuleStatus.UNLOADED);
        expect(module.getMetadata().loadedAt).toBeUndefined();
      });
    });
  });
});
