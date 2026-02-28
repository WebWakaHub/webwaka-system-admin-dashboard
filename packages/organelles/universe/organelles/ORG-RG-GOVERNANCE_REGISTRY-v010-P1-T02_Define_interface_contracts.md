# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P1-T02: Define Interface Contracts

## Primary Ports
### GovernanceManagement Port
- `registerRule(cmd: RegisterRuleCommand): Promise<GovernanceRule>`
- `activateRule(cmd: ActivateRuleCommand): Promise<GovernanceRule>`
- `deprecateRule(cmd: DeprecateRuleCommand): Promise<GovernanceRule>`
- `archiveRule(cmd: ArchiveRuleCommand): Promise<void>`
- `amendConstitution(cmd: AmendConstitutionCommand): Promise<AmendmentResult>`
- `bindPolicy(cmd: BindPolicyCommand): Promise<ComplianceBinding>`

### GovernanceQuery Port
- `getRule(ruleId: string): Promise<GovernanceRule>`
- `queryCompliance(cmd: QueryComplianceCommand): Promise<ComplianceReport>`
- `getRuleHistory(ruleId: string): Promise<GovernanceRule[]>`
- `listRules(query: RuleQuery): Promise<GovernanceRule[]>`

## Secondary Ports
### IGovernanceStoragePort
- `save(rule: RuleEntity): Promise<void>`
- `findById(ruleId: string): Promise<RuleEntity | null>`
- `findByQuery(query: RuleQuery): Promise<RuleEntity[]>`

### IGovernanceEventPort
- `emit(event: GovernanceEvent): Promise<void>`

### IGovernanceObservabilityPort
- `recordMetric(metric: MetricEntry): void`
- `recordTrace(span: TraceSpan): void`
- `recordLog(entry: LogEntry): void`
