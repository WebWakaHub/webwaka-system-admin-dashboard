/**
 * Audit System
 * Main entry point for the Audit System module
 */

import { AuditEventConsumer } from './consumer/AuditEventConsumer';
import { AuditDataStore } from './store/AuditDataStore';
import { AuditQueryAPI, PermissionChecker } from './api/AuditQueryAPI';
import { EventEmitter, globalEventEmitter } from './utils/EventEmitter';
import { AuditEvent } from './types/AuditLog';

/**
 * AuditSystem class
 * Main class that orchestrates all components of the Audit System
 */
export class AuditSystem {
  private consumer: AuditEventConsumer;
  private dataStore: AuditDataStore;
  private queryAPI: AuditQueryAPI;
  private eventEmitter: EventEmitter;

  constructor(permissionChecker: PermissionChecker) {
    // Initialize components
    this.dataStore = new AuditDataStore();
    this.consumer = new AuditEventConsumer(this.dataStore);
    this.queryAPI = new AuditQueryAPI(this.dataStore, permissionChecker);
    this.eventEmitter = globalEventEmitter;

    // Subscribe the consumer to events
    this.eventEmitter.subscribe((event: AuditEvent) => this.consumer.processEvent(event));
  }

  /**
   * Start the Audit System
   */
  public async start(): Promise<void> {
    console.log('Starting Audit System...');
    await this.consumer.start();
    console.log('Audit System started');
  }

  /**
   * Stop the Audit System
   */
  public async stop(): Promise<void> {
    console.log('Stopping Audit System...');
    await this.consumer.stop();
    console.log('Audit System stopped');
  }

  /**
   * Get the query API
   */
  public getQueryAPI(): AuditQueryAPI {
    return this.queryAPI;
  }

  /**
   * Get the event emitter
   */
  public getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * Get the data store
   */
  public getDataStore(): AuditDataStore {
    return this.dataStore;
  }

  /**
   * Get the consumer
   */
  public getConsumer(): AuditEventConsumer {
    return this.consumer;
  }

  /**
   * Get system statistics
   */
  public async getStatistics(): Promise<{
    totalLogs: number;
    isRunning: boolean;
    queuedEvents: number;
  }> {
    return {
      totalLogs: await this.dataStore.getTotalAuditLogCount(),
      isRunning: this.consumer.isConsumerRunning(),
      queuedEvents: this.consumer.getQueueSize(),
    };
  }
}

// Export all public types and classes
export { AuditEvent, AuditLog, AuditLogQuery, AuditLogQueryResult, Actor, Action, ChangeDetails } from './types/AuditLog';
export { AuditSystemError, InvalidAuditEventError, AuditLogStorageError, AuditLogQueryError, UnauthorizedAuditAccessError } from './errors/AuditSystemError';
export { AuditEventConsumer } from './consumer/AuditEventConsumer';
export { LogProcessor } from './processor/LogProcessor';
export { AuditDataStore } from './store/AuditDataStore';
export { AuditQueryAPI, PermissionChecker } from './api/AuditQueryAPI';
export { EventEmitter, globalEventEmitter } from './utils/EventEmitter';
