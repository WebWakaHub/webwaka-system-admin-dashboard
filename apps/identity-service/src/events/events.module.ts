import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventsService } from './events.service';

/**
 * Events Module
 *
 * Global module providing event emission and subscription
 * for all identity domain events.
 *
 * Uses NestJS EventEmitter2 for in-process event handling.
 * Can be extended to use external event buses (e.g., RabbitMQ, Redis)
 * for cross-service communication.
 *
 * Build Once, Use Infinitely: The EventsService interface
 * is transport-agnostic — switching from in-process to
 * distributed event bus requires no code changes in consumers.
 */
@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
