# ORG-WEBWAKA-PLATFORM — System Integration Guide

## How to Integrate a System with the Organism

### Step 1: Implement System Health Endpoint
Your system MUST expose a health endpoint conforming to the SystemHealth interface.

### Step 2: Register with the Organism
Call `organism.registerSystem()` with your system's registry entry.

### Step 3: Subscribe to Cross-System Events
Register event handlers for events your system needs to receive.

### Step 4: Implement Offline Support
Your system MUST support offline operation. All operations must be queueable.

### Step 5: Pass Constitutional Audit
Your system must pass `organism.auditSystemCompliance()` before going live.

### Nigeria-First Checklist
- [ ] Default locale set to en-NG
- [ ] Timezone set to Africa/Lagos (WAT)
- [ ] Currency set to NGN
- [ ] Network timeout set to 30s
- [ ] Offline queue implemented
- [ ] Sync retry with exponential backoff
