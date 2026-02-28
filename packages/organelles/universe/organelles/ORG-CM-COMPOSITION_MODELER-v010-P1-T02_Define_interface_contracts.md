# ORG-CM-COMPOSITION_MODELER-v0.1.0 — P1-T02: Define Interface Contracts

## Primary Ports (Driving)
### CompositionManagement Port
- `createComposition(cmd: CreateCompositionCommand): Promise<CompositionSnapshot>`
- `validateComposition(cmd: ValidateCompositionCommand): Promise<ValidationResult>`
- `deployComposition(cmd: DeployCompositionCommand): Promise<CompositionSnapshot>`
- `archiveComposition(cmd: ArchiveCompositionCommand): Promise<void>`
- `addOrganelle(cmd: AddOrganelleCommand): Promise<CompositionSnapshot>`
- `removeOrganelle(cmd: RemoveOrganelleCommand): Promise<CompositionSnapshot>`
- `connectPorts(cmd: ConnectPortsCommand): Promise<CompositionSnapshot>`

### CompositionQuery Port
- `getComposition(compositionId: string): Promise<CompositionSnapshot>`
- `diffCompositions(cmd: DiffCompositionsCommand): Promise<CompositionDiff>`
- `resolveDependencies(compositionId: string): Promise<DependencyGraph>`
- `listCompositions(query: CompositionQuery): Promise<CompositionListResult>`

## Secondary Ports (Driven)
### ICompositionStoragePort
- `save(composition: CompositionEntity): Promise<void>`
- `findById(id: string): Promise<CompositionEntity | null>`
- `findByQuery(query: CompositionQuery): Promise<CompositionEntity[]>`
- `delete(id: string): Promise<void>`

### ICompositionEventPort
- `emit(event: CompositionEvent): Promise<void>`
- `emitBatch(events: CompositionEvent[]): Promise<void>`

### ICompositionObservabilityPort
- `recordMetric(metric: MetricEntry): void`
- `recordTrace(span: TraceSpan): void`
- `recordLog(entry: LogEntry): void`
