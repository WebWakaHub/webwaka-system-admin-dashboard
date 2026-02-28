# SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P5-T01: System Operations Manual

**Document ID:** SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P5-T01  
**Phase:** 5 (Documentation) | **Task:** 1  
**Executing Agent:** webwakaagent8 | **Issue:** [#23](https://github.com/WebWakaHub/webwaka-system-universe/issues/23)

---

## I. SYSTEM OVERVIEW

The **Analytics Platform System** (SYS-ANA-ANALYTICSPLATFORM-v0.1.0) is a two-organ system comprising:

- **DRM Organ** — Data & Records Management: data ingestion, pipeline management, data catalog, quality monitoring
- **IOP Organ** — Intelligence & Optimization Platform: analytical models, report generation, recommendations

---

## II. DEPLOYMENT

### A. Prerequisites

| Requirement | Version |
|-------------|---------|
| Kubernetes | 1.28+ |
| Terraform | 1.6+ |
| Node.js | 22+ |
| MySQL | 8.0+ |
| pnpm | 10+ |

### B. Infrastructure Provisioning

```bash
cd infra/terraform/systems/SYS-ANA-ANALYTICSPLATFORM-v0.1.0-P3-T01-INFRASTRUCTURE
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### C. Application Deployment

```bash
# Build the application
pnpm install && pnpm build

# Apply database migrations
pnpm drizzle-kit generate && pnpm drizzle-kit migrate

# Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/drm-organ-deployment.yaml
kubectl apply -f k8s/iop-organ-deployment.yaml
```

---

## III. CONFIGURATION

### A. Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | ✅ |
| `JWT_SECRET` | Session signing secret | ✅ |
| `VITE_APP_ID` | OAuth application ID | ✅ |
| `OAUTH_SERVER_URL` | OAuth backend URL | ✅ |
| `BUILT_IN_FORGE_API_KEY` | Forge API bearer token | ✅ |

### B. Role Management

To promote a user to admin:
```sql
UPDATE users SET role = 'admin' WHERE openId = '<user-open-id>';
```

---

## IV. MONITORING & HEALTH CHECKS

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Application health check |
| `GET /api/trpc/qualityMetrics.summary` | Data quality overview |
| `GET /api/trpc/monitoring.runs` | Pipeline run status |

---

## V. BACKUP & RECOVERY

- **Database:** Daily automated snapshots via cloud provider RDS snapshot policy
- **File Storage:** S3 versioning enabled on all buckets
- **Recovery RTO:** < 4 hours | **RPO:** < 24 hours

---

**Executing Agent:** webwakaagent8 | **Authority:** AGENT_EXECUTION_CONTEXT_MASTER_CONSTITUTION_v1.0.0
