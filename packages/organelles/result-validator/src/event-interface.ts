import { ResultValidatorEvent } from "./types";
type EventHandler = (event: ResultValidatorEvent) => void;

export interface IResultValidatorEvents {
  emit(event: ResultValidatorEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class ResultValidatorEventBus implements IResultValidatorEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: ResultValidatorEvent[];
  constructor() { this.handlers = new Set(); this.eventCount = 0; this.eventLog = []; }
  emit(event: ResultValidatorEvent): void { this.eventCount++; this.eventLog.push(event); for (const h of this.handlers) { try { h(event); } catch (e) { console.error(e); } } }
  subscribe(handler: EventHandler): () => void { this.handlers.add(handler); return () => { this.handlers.delete(handler); }; }
  getEventCount(): number { return this.eventCount; }
  getEventLog(): ReadonlyArray<ResultValidatorEvent> { return [...this.eventLog]; }
}
