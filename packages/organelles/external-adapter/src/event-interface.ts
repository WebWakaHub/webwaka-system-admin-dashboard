import { ExternalAdapterEvent } from "./types";
type EventHandler = (event: ExternalAdapterEvent) => void;

export interface IExternalAdapterEvents {
  emit(event: ExternalAdapterEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class ExternalAdapterEventBus implements IExternalAdapterEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: ExternalAdapterEvent[];
  constructor() { this.handlers = new Set(); this.eventCount = 0; this.eventLog = []; }
  emit(event: ExternalAdapterEvent): void { this.eventCount++; this.eventLog.push(event); for (const h of this.handlers) { try { h(event); } catch (e) { console.error(e); } } }
  subscribe(handler: EventHandler): () => void { this.handlers.add(handler); return () => { this.handlers.delete(handler); }; }
  getEventCount(): number { return this.eventCount; }
  getEventLog(): ReadonlyArray<ExternalAdapterEvent> { return [...this.eventLog]; }
}
