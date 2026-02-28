# ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — P5-T01: API Documentation

## GovernanceManagement Port API

### registerRule(cmd: RegisterRuleCommand): Promise<GovernanceRule>
Registers a new governance rule in DRAFT state.

### activateRule(cmd: ActivateRuleCommand): Promise<GovernanceRule>
Activates a DRAFT rule, making it enforceable.

### deprecateRule(cmd: DeprecateRuleCommand): Promise<GovernanceRule>
Deprecates an ACTIVE rule with a sunset date and reason.

### amendConstitution(cmd: AmendConstitutionCommand): Promise<AmendmentResult>
Processes a constitutional amendment. Requires 51% quorum of authorized signers.

### bindPolicy(cmd: BindPolicyCommand): Promise<ComplianceBinding>
Binds a compliance policy to a target organelle or cell.

### queryCompliance(cmd: QueryComplianceCommand): Promise<ComplianceReport>
Returns all applicable governance rules for a given target context.
