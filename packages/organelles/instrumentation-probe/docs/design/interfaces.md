# InstrumentationProbe — Interface Contracts

```typescript
interface IInstrumentationProbe {
  readonly id: string;
  readonly state: InstrumentationProbeState;
  execute(command: InstrumentationProbeCommand): Promise<InstrumentationProbeResult>;
  query(query: InstrumentationProbeQuery): InstrumentationProbeQueryResult;
  reset(): void;
  terminate(): void;
}
```
