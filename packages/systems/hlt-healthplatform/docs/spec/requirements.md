# HealthPlatformSystem — Requirements Specification
## System ID: SYS-HLT-HEALTHPLATFORM

### Functional Requirements
- FR-1: Patient registration and management
- FR-2: Electronic health record management
- FR-3: Appointment scheduling with SMS reminders
- FR-4: Prescription tracking
- FR-5: Health outcome analytics

### Non-Functional Requirements
- NFR-1: Offline operation for all critical paths (NON-NEGOTIABLE)
- NFR-2: Response time < 200ms on 3G networks in Lagos
- NFR-3: PWA installable with service worker caching
- NFR-4: Mobile-first responsive layout
- NFR-5: Data sync conflict resolution with last-write-wins + merge
- NFR-6: Naira (NGN) as default currency where applicable
- NFR-7: WAT (UTC+1) as default timezone
- NFR-8: Vendor-neutral AI provider abstraction
