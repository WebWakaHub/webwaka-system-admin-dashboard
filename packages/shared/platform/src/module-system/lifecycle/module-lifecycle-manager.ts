import { Module, ModuleStatus } from '../types';
import { ModuleStateError } from '../errors';

/**
 * Advanced Module Lifecycle Manager
 * Handles complex state transitions and lifecycle hooks
 */
export interface IModuleLifecycleManager {
  /**
   * Transition module to target state
   */
  transitionTo(module: Module, targetState: ModuleStatus): Promise<void>;

  /**
   * Get valid next states for current state
   */
  getValidNextStates(currentState: ModuleStatus): ModuleStatus[];

  /**
   * Check if transition is valid
   */
  isValidTransition(fromState: ModuleStatus, toState: ModuleStatus): boolean;

  /**
   * Register state change listener
   */
  onStateChange(module: Module, listener: (oldState: ModuleStatus, newState: ModuleStatus) => void): void;
}

export class DefaultModuleLifecycleManager implements IModuleLifecycleManager {
  private stateListeners: Map<string, ((oldState: ModuleStatus, newState: ModuleStatus) => void)[]> = new Map();

  private validTransitions: Map<ModuleStatus, ModuleStatus[]> = new Map([
    ['unloaded', ['loaded', 'error']],
    ['loaded', ['running', 'unloaded', 'error']],
    ['running', ['stopped', 'error']],
    ['stopped', ['running', 'unloaded', 'error']],
    ['error', ['unloaded', 'loaded']],
  ]);

  async transitionTo(module: Module, targetState: ModuleStatus): Promise<void> {
    if (!this.isValidTransition(module.status as ModuleStatus, targetState)) {
      throw new ModuleStateError(module.name, module.status as ModuleStatus, targetState);
    }

    const oldState = module.status as ModuleStatus;
    module.status = targetState;

    // Notify listeners
    const listeners = this.stateListeners.get(module.name) || [];
    listeners.forEach(listener => listener(oldState, targetState));
  }

  getValidNextStates(currentState: ModuleStatus): ModuleStatus[] {
    return this.validTransitions.get(currentState) || [];
  }

  isValidTransition(fromState: ModuleStatus, toState: ModuleStatus): boolean {
    const validStates = this.validTransitions.get(fromState);
    return validStates ? validStates.includes(toState) : false;
  }

  onStateChange(module: Module, listener: (oldState: ModuleStatus, newState: ModuleStatus) => void): void {
    if (!this.stateListeners.has(module.name)) {
      this.stateListeners.set(module.name, []);
    }
    this.stateListeners.get(module.name)!.push(listener);
  }
}
