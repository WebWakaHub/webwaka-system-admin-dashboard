# PortfolioAnalysis Organ — Tissue Composition Requirements
## Organ ID: ORGX-FIN-PORTFOLIO_ANALYSIS

### Constituent Tissues
The PortfolioAnalysis organ is composed of the following tissue types:
1. **Command Coordination Tissue** — Orchestrates portfolio analysis commands
2. **State Store Tissue** — Manages PortfolioAnalysis domain state with offline persistence
3. **Event Mesh Tissue** — Handles domain events within portfolio analysis boundary
4. **Validation Tissue** — Enforces PortfolioAnalysis business rules

### Composition Rules
- All tissues MUST operate within the PortfolioAnalysis domain boundary
- Cross-tissue communication MUST use the organ's internal event mesh
- State mutations MUST be coordinated through the command tissue
- Offline state MUST be synchronized through the state store tissue

### Nigeria-First Tissue Configuration
- All tissue timeouts: 30,000ms (30s) for Nigerian network conditions
- Locale: en-NG with NGN currency formatting
- Offline queue capacity: 1000 operations per tissue
- Sync strategy: Exponential backoff starting at 5s, max 300s

_Composition Hash: 352a822f_
