import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DefaultModuleLoader } from '../../src/module-system/loader/module-loader';
import { ModuleLoadRequest } from '../../src/module-system/types';
import { ModuleLoadError, InvalidModuleError } from '../../src/module-system/errors';

describe('Module Loader', () => {
  let loader: DefaultModuleLoader;

  beforeEach(() => {
    loader = new DefaultModuleLoader();
  });

  describe('load', () => {
    it('should load a valid module', async () => {
      const request: ModuleLoadRequest = {
        name: 'test-module',
        version: '1.0.0',
        path: '/home/ubuntu/webwaka-platform',
      };

      const module = await loader.load(request);
      expect(module.name).toBe('test-module');
      expect(module.version).toBe('1.0.0');
      expect(module.status).toBe('unloaded');
    });

    it('should throw error for non-existent module path', async () => {
      const request: ModuleLoadRequest = {
        name: 'test-module',
        version: '1.0.0',
        path: '/non/existent/path',
      };

      await expect(loader.load(request)).rejects.toThrow(ModuleLoadError);
    });

    it('should include dependencies in loaded module', async () => {
      const request: ModuleLoadRequest = {
        name: 'test-module',
        version: '1.0.0',
        path: '/home/ubuntu/webwaka-platform',
        dependencies: { 'dep1': '1.0.0' },
      };

      const module = await loader.load(request);
      expect(module.dependencies).toEqual({ 'dep1': '1.0.0' });
    });
  });

  describe('unload', () => {
    it('should unload a module', async () => {
      await expect(loader.unload('test-module')).resolves.not.toThrow();
    });
  });
});
