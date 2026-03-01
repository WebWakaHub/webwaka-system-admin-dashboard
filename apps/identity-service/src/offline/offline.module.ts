import { Module, Global } from '@nestjs/common';
import { OfflineQueueService } from './offline-queue.service';

/**
 * Offline Module
 *
 * Global module providing offline queue functionality
 * across the identity service.
 *
 * Offline-First: This module is the foundation of the
 * identity system's offline capability. All services
 * that need to queue failed operations can inject
 * OfflineQueueService.
 */
@Global()
@Module({
  providers: [OfflineQueueService],
  exports: [OfflineQueueService],
})
export class OfflineModule {}
