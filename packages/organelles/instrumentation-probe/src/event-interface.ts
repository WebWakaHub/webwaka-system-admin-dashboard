import { InstrumentationProbeEvent } from "./types";
type EventHandler = (event: InstrumentationProbeEvent) => void;

export interface IInstrumentationProbeEvents {
  emit(event: InstrumentationProbeEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class InstrumentationProbeEventBus implements IInstrumentationProbeEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: InstrumentationProbeEvent[];
  constructor() { this.handlers = new Set(); this.eventCount = 0; this.eventLog = []; }
  emit(event: InstrumentationProbeEvent): void { this.eventCount++; this.eventLog.push(event); for (const h of this.handlers) { try { h(event); } catch (e) { console.error(e); } } }
  subscribe(handler: EventHandler): () => void { this.handlers.add(handler); return () => { this.handlers.delete(handler); }; }
  getEventCount(): number { return this.eventCount; }
  getEventLog(): ReadonlyArray<InstrumentationProbeEvent> { return [...this.eventLog]; }
}
