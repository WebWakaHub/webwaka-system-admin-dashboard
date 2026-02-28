/**
 * Audit Event Consumer
 * Consumes audit events from the Event Bus and passes them to the Log Processor
 */

import { AuditEvent } from '../types/AuditLog';
import { LogProcessor } from '../processor/LogProcessor';
import { AuditDataStore } from '../store/AuditDataStore';

/**
 * Callback type for event processing
 */
export type EventProcessingCallback = (event: AuditEvent) => Promise<void>;

/**
 * AuditEventConsumer class
 * Subscribes to the Event Bus and processes incoming audit events
 */
export class AuditEventConsumer {
  private processor: LogProcessor;
  private dataStore: AuditDataStore;
  private isRunning: boolean = false;
  private eventQueue: AuditEvent[] = [];

  constructor(dataStore: AuditDataStore) {
    this.processor = new LogProcessor();
    this.dataStore = dataStore;
  }

  /**
   * Start consuming events
   * In a real implementation, this would subscribe to the Event Bus
   * For now, it initializes the consumer
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Audit Event Consumer is already running');
      return;
    }

    this.isRunning = true;
    console.log('Audit Event Consumer started');

    // Process any queued events
    await this.processQueuedEvents();
  }

  /**
   * Stop consuming events
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
    console.log('Audit Event Consumer stopped');
  }

  /**
   * Process an incoming audit event
   * @param event - The audit event to process
   */
  public async processEvent(event: AuditEvent): Promise<void> {
    if (!this.isRunning) {
      // Queue the event if the consumer is not running
      this.eventQueue.push(event);
      return;
    }

    try {
      // Process the event using the Log Processor
      const auditLog = this.processor.processEvent(event);

      // Calculate the hash for integrity verification
      const hash = this.processor.calculateHash(auditLog);

      // Store the audit log
      await this.dataStore.storeAuditLog(auditLog, hash);

      console.log(`Audit event processed and stored: ${auditLog.logId}`);
    } catch (error) {
      console.error(`Error processing audit event: ${error}`);
      throw error;
    }
  }

  /**
   * Process any queued events
   */
  private async processQueuedEvents(): Promise<void> {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        await this.processEvent(event);
      }
    }
  }

  /**
   * Get the current queue size
   */
  public getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Check if the consumer is running
   */
  public isConsumerRunning(): boolean {
    return this.isRunning;
  }
}
