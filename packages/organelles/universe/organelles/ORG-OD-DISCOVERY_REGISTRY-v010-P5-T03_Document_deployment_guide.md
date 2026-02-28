# ORG-OD-DISCOVERY_REGISTRY-v010-P5-T03: Document Deployment Guide

**Acting under Canonical Role: Lead Software Engineer**
**Agent: webwakaagent4 — Engineering & Delivery**
**Phase: 5 (Documentation) | Task: T03**

---

## Deployment Architecture

### Storage Backend Options

| Backend | Use Case | Offline Support |
|---------|----------|----------------|
| IndexedDB | Client-side PWA | Full offline |
| PostgreSQL | Server-side | Server-only |
| In-Memory | Testing | N/A |

### Database Schema (PostgreSQL)

```sql
CREATE TABLE discovery_service_entries (
  service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  endpoint_protocol VARCHAR(10) NOT NULL,
  endpoint_host VARCHAR(255) NOT NULL,
  endpoint_port INTEGER NOT NULL,
  endpoint_path VARCHAR(255),
  ttl_seconds INTEGER NOT NULL DEFAULT 300,
  health_status VARCHAR(20) NOT NULL DEFAULT 'HEALTHY',
  state VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
  region VARCHAR(50),
  zone VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE discovery_capabilities (
  capability_id VARCHAR(255) NOT NULL,
  service_id UUID NOT NULL REFERENCES discovery_service_entries(service_id) ON DELETE CASCADE,
  capability_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  scope VARCHAR(100) NOT NULL,
  PRIMARY KEY (capability_id, service_id)
);

CREATE INDEX idx_capabilities_lookup ON discovery_capabilities(capability_id, version);
CREATE INDEX idx_service_health ON discovery_service_entries(health_status, state);
CREATE INDEX idx_service_expiry ON discovery_service_entries(expires_at);
CREATE INDEX idx_service_region ON discovery_service_entries(region, zone);
```

## Cross-Agent Handoff Note

**Handoff to: webwaka007 (Phase 6 — Ratification)**

Phase 5 Documentation is complete. Full API reference, 5 usage examples, and deployment guide with database schema provided. The ratification phase may proceed.
