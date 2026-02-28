# AssetPlatformSystem — Data Model Design
## System ID: SYS-RES-ASSETPLATFORM

### Core Entities
- `AssetRegistryEntity`: Primary entity for asset registry organ
- `LifecycleManagerEntity`: Primary entity for lifecycle manager organ
- `MaintenanceSchedulerEntity`: Primary entity for maintenance scheduler organ
- `DepreciationCalculatorEntity`: Primary entity for depreciation calculator organ
- `AuditTrailEntity`: Primary entity for audit trail organ

### Nigeria-First Data Patterns
- All monetary fields use `NairaAmount` type (kobo precision)
- All timestamps use WAT (UTC+1) with ISO 8601 format
- All phone numbers use Nigerian format (+234)
- All addresses support Nigerian address hierarchy (State → LGA → Ward)
