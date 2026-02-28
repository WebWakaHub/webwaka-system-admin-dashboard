# BankingSystem — Data Model Design
## System ID: SYS-FIN-BANKING

### Core Entities
- `AccountManagerEntity`: Primary entity for account manager organ
- `TransactionEngineEntity`: Primary entity for transaction engine organ
- `ComplianceMonitorEntity`: Primary entity for compliance monitor organ
- `StatementGeneratorEntity`: Primary entity for statement generator organ
- `InterestCalculatorEntity`: Primary entity for interest calculator organ

### Nigeria-First Data Patterns
- All monetary fields use `NairaAmount` type (kobo precision)
- All timestamps use WAT (UTC+1) with ISO 8601 format
- All phone numbers use Nigerian format (+234)
- All addresses support Nigerian address hierarchy (State → LGA → Ward)
