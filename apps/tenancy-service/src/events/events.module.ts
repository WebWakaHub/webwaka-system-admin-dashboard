import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';
import { OfflineModule } from '../offline/offline.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    OfflineModule,
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
