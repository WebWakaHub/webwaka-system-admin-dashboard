# InvestmentSystem — Requirements Specification
## System ID: SYS-FIN-INVESTMENT

### Functional Requirements
- FR-1: Portfolio composition management
- FR-2: Order execution engine
- FR-3: Risk assessment and monitoring
- FR-4: Real-time market data integration
- FR-5: Investment performance reporting

### Non-Functional Requirements
- NFR-1: Offline operation for all critical paths (NON-NEGOTIABLE)
- NFR-2: Response time < 200ms on 3G networks in Lagos
- NFR-3: PWA installable with service worker caching
- NFR-4: Mobile-first responsive layout
- NFR-5: Data sync conflict resolution with last-write-wins + merge
- NFR-6: Naira (NGN) as default currency where applicable
- NFR-7: WAT (UTC+1) as default timezone
- NFR-8: Vendor-neutral AI provider abstraction
