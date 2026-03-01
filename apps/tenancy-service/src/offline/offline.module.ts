import { Module } from '@nestjs/common';
import { OfflineQueueService } from './offline-queue.service';

@Module({
  providers: [OfflineQueueService],
  exports: [OfflineQueueService],
})
export class OfflineModule {}
