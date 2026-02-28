import { AuditEmitterEvent } from "./types";
type EventHandler = (event: AuditEmitterEvent) => void;

export interface IAuditEmitterEvents {
  emit(event: AuditEmitterEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class AuditEmitterEventBus implements IAuditEmitterEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: AuditEmitterEvent[];
  constructor() { this.handlers = new Set(); this.eventCount = 0; this.eventLog = []; }
  emit(event: AuditEmitterEvent): void { this.eventCount++; this.eventLog.push(event); for (const h of this.handlers) { try { h(event); } catch (e) { console.error(e); } } }
  subscribe(handler: EventHandler): () => void { this.handlers.add(handler); return () => { this.handlers.delete(handler); }; }
  getEventCount(): number { return this.eventCount; }
  getEventLog(): ReadonlyArray<AuditEmitterEvent> { return [...this.eventLog]; }
}
