# PatientManagement Organ — Domain Boundary Constraints
## Organ ID: ORGX-HLT-PATIENT_MANAGEMENT

### Boundary Definition
The PatientManagement organ operates within a strictly defined domain boundary that encapsulates all healthcare and clinical business logic.

### Invariants
1. No PatientManagement operation may depend on external organ state
2. All PatientManagement events are scoped to the HLT domain
3. Cross-organ communication MUST use the organ interface contract
4. PatientManagement state MUST be self-contained and independently persistable
5. Offline operations MUST NOT require cross-organ coordination

### Interface Contract
- Input: PatientManagementCommand (typed, validated, idempotent)
- Output: PatientManagementEvent (immutable, timestamped, traceable)
- Query: PatientManagementQuery (read-only, cacheable, offline-capable)

_Boundary Hash: d94d097d_
