# HealthPlatformSystem — Data Model Design
## System ID: SYS-HLT-HEALTHPLATFORM

### Core Entities
- `PatientRegistryEntity`: Primary entity for patient registry organ
- `ClinicalRecordEntity`: Primary entity for clinical record organ
- `AppointmentSchedulerEntity`: Primary entity for appointment scheduler organ
- `PrescriptionManagerEntity`: Primary entity for prescription manager organ
- `HealthAnalyticsEntity`: Primary entity for health analytics organ

### Nigeria-First Data Patterns
- All monetary fields use `NairaAmount` type (kobo precision)
- All timestamps use WAT (UTC+1) with ISO 8601 format
- All phone numbers use Nigerian format (+234)
- All addresses support Nigerian address hierarchy (State → LGA → Ward)
