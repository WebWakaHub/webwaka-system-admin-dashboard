import { describe, it, expect } from '@jest/globals';
import {
  ModuleSystemError,
  ModuleNotFoundError,
  ModuleAlreadyLoadedError,
  ModuleLoadError,
  ModuleUnloadError,
  DependencyResolutionError,
  ModuleSandboxError,
  InvalidModuleError,
  ModuleStateError,
} from '../../src/module-system/errors';

describe('Module System Errors', () => {
  describe('ModuleSystemError', () => {
    it('should create error with message', () => {
      const error = new ModuleSystemError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ModuleSystemError');
    });
  });

  describe('ModuleNotFoundError', () => {
    it('should create error with module name', () => {
      const error = new ModuleNotFoundError('test-module');
      expect(error.message).toContain('test-module');
      expect(error.name).toBe('ModuleNotFoundError');
    });
  });

  describe('ModuleAlreadyLoadedError', () => {
    it('should create error with module name', () => {
      const error = new ModuleAlreadyLoadedError('test-module');
      expect(error.message).toContain('test-module');
      expect(error.name).toBe('ModuleAlreadyLoadedError');
    });
  });

  describe('ModuleLoadError', () => {
    it('should create error with module name and reason', () => {
      const error = new ModuleLoadError('test-module', 'File not found');
      expect(error.message).toContain('test-module');
      expect(error.message).toContain('File not found');
      expect(error.name).toBe('ModuleLoadError');
    });
  });

  describe('ModuleUnloadError', () => {
    it('should create error with module name and reason', () => {
      const error = new ModuleUnloadError('test-module', 'Cleanup failed');
      expect(error.message).toContain('test-module');
      expect(error.message).toContain('Cleanup failed');
      expect(error.name).toBe('ModuleUnloadError');
    });
  });

  describe('DependencyResolutionError', () => {
    it('should create error with module and dependency names', () => {
      const error = new DependencyResolutionError('test-module', 'missing-dep');
      expect(error.message).toContain('test-module');
      expect(error.message).toContain('missing-dep');
      expect(error.name).toBe('DependencyResolutionError');
    });
  });

  describe('ModuleSandboxError', () => {
    it('should create error with module name and reason', () => {
      const error = new ModuleSandboxError('test-module', 'Execution failed');
      expect(error.message).toContain('test-module');
      expect(error.message).toContain('Execution failed');
      expect(error.name).toBe('ModuleSandboxError');
    });
  });

  describe('InvalidModuleError', () => {
    it('should create error with module name and reason', () => {
      const error = new InvalidModuleError('test-module', 'Missing name');
      expect(error.message).toContain('test-module');
      expect(error.message).toContain('Missing name');
      expect(error.name).toBe('InvalidModuleError');
    });
  });

  describe('ModuleStateError', () => {
    it('should create error with module name and states', () => {
      const error = new ModuleStateError('test-module', 'unloaded', 'loaded');
      expect(error.message).toContain('test-module');
      expect(error.message).toContain('unloaded');
      expect(error.message).toContain('loaded');
      expect(error.name).toBe('ModuleStateError');
    });
  });
});
