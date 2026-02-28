import { EventPublisher, EventSubscriber } from '../../event-system';

/**
 * Module Communication Manager
 * Enables inter-module communication via Event System
 */
export interface IModuleCommunicationManager {
  /**
   * Send message from one module to another
   */
  sendMessage(fromModule: string, toModule: string, message: any): Promise<void>;

  /**
   * Subscribe to messages from a specific module
   */
  subscribeToModule(moduleName: string, handler: (message: any) => Promise<void>): Promise<void>;

  /**
   * Broadcast message to all modules
   */
  broadcast(fromModule: string, message: any): Promise<void>;

  /**
   * Unsubscribe from module messages
   */
  unsubscribe(moduleName: string): Promise<void>;
}

export class DefaultModuleCommunicationManager implements IModuleCommunicationManager {
  constructor(
    private publisher: EventPublisher,
    private subscriber: EventSubscriber
  ) {}

  async sendMessage(fromModule: string, toModule: string, message: any): Promise<void> {
    await this.publisher.publish({
      eventType: `module:${toModule}:message`,
      data: {
        from: fromModule,
        payload: message,
      },
    });
  }

  async subscribeToModule(moduleName: string, handler: (message: any) => Promise<void>): Promise<void> {
    await this.subscriber.subscribe({
      eventType: `module:${moduleName}:message`,
      handler: async (event) => {
        await handler(event.data.payload);
      },
    });
  }

  async broadcast(fromModule: string, message: any): Promise<void> {
    await this.publisher.publish({
      eventType: 'module:broadcast',
      data: {
        from: fromModule,
        payload: message,
      },
    });
  }

  async unsubscribe(moduleName: string): Promise<void> {
    // Unsubscribe logic would be implemented here
  }
}
