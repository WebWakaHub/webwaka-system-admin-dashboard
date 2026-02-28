# WebWaka Deployment Infrastructure Enhancement - GitHub, AWS, Cloudflare, webwaka.com

**Document Type:** Canonical Specification  
**Department:** Infrastructure & DevOps + Release, Operations & Support  
**Owning Agents:** webwakaagent6 (Infrastructure), webwakaagent9 (Release & Operations)  
**Status:** ACTIVATED  
**Authority:** FD-2026-001, FD-2026-002, WEBWAKA_CANONICAL_MASTER_CONTEXT.md  
**Related Documents:** CLOUD_INFRASTRUCTURE_STRATEGY.md, WEBWAKA_MODULAR_DESIGN_ARCHITECTURE_INVARIANTS.md  
**Version:** 1.0  
**Last Updated:** 2026-02-09  
**Precedence Level:** 2 (Constitutional Documents)  
**Immutability:** RATIFIED AND LOCKED

---

## ZERO-BASED GOVERNANCE CONTEXT

This document exists within the WebWakaHub governance universe initiated under a true zero-based restart per FD-2026-001.

This document defines the **complete deployment infrastructure architecture** for WebWaka, specifying:
- GitHub as primary development and deployment platform
- AWS as primary cloud infrastructure provider
- Cloudflare as global edge network and security layer
- webwaka.com domain configuration and management
- Complete CI/CD pipeline architecture
- Infrastructure as Code (IaC) specifications

---

## 1. Purpose

This document defines the **deployment infrastructure architecture** for WebWaka, ensuring that all infrastructure is:

1. **GitHub-Centric:** GitHub as single source of truth for code, configuration, and deployment
2. **AWS-Powered:** AWS as primary cloud provider for compute, storage, and managed services
3. **Cloudflare-Protected:** Cloudflare as global CDN, DDoS protection, and edge network
4. **Domain-Managed:** webwaka.com as primary domain with proper DNS, SSL, and routing
5. **Automated:** Complete CI/CD automation from commit to production
6. **Auditable:** Full audit trails for all infrastructure changes

This architecture ensures WebWaka is **scalable**, **secure**, **cost-optimized**, and **globally distributed** while maintaining **Nigerian-first** and **Africa-first** principles.

---

## 2. Architectural Principles

### 2.1. GitHub as Single Source of Truth

**Principle:** All code, configuration, infrastructure definitions, and documentation live in GitHub.

**Enforcement:**
- All application code in GitHub repositories
- Infrastructure as Code (IaC) in GitHub repositories
- CI/CD pipelines defined in GitHub Actions
- Documentation in GitHub (Markdown)
- Issue tracking in GitHub Issues
- Project management in GitHub Projects
- Security scanning in GitHub Advanced Security

**No Exceptions:** Nothing is deployed that isn't in GitHub.

### 2.2. AWS as Primary Cloud Provider

**Principle:** AWS provides the core infrastructure for compute, storage, databases, and managed services.

**Enforcement:**
- **Compute:** ECS (Elastic Container Service) for containerized workloads
- **Storage:** S3 for object storage, EBS for block storage
- **Databases:** RDS (PostgreSQL) for relational data, DynamoDB for NoSQL
- **Networking:** VPC, Route 53, CloudFront (CDN)
- **Security:** IAM, KMS, Secrets Manager, WAF
- **Monitoring:** CloudWatch, X-Ray
- **Serverless:** Lambda for event-driven functions

### 2.3. Cloudflare as Global Edge Network

**Principle:** Cloudflare sits in front of all public-facing services for performance, security, and reliability.

**Enforcement:**
- **DNS:** Cloudflare manages all DNS for webwaka.com
- **CDN:** Cloudflare caches static assets globally
- **DDoS Protection:** Cloudflare protects against DDoS attacks
- **WAF:** Cloudflare Web Application Firewall filters malicious traffic
- **SSL/TLS:** Cloudflare manages SSL certificates
- **Edge Workers:** Cloudflare Workers for edge computing
- **Load Balancing:** Cloudflare Load Balancing for multi-region failover

### 2.4. Infrastructure as Code (IaC)

**Principle:** All infrastructure is defined as code, versioned in GitHub, and deployed via automation.

**Enforcement:**
- **Terraform:** Primary IaC tool for AWS resources
- **CloudFormation:** Secondary IaC tool for AWS-specific resources
- **GitHub Actions:** CI/CD automation
- **Helm Charts:** Kubernetes application definitions
- **Docker Compose:** Local development environment

---

## 3. GitHub Architecture

### 3.1. Repository Structure

**Organization:** `WebWakaHub`

**Repositories:**

```
WebWakaHub/
├── webwaka-governance/          # Governance documents (this repo)
├── webwaka-platform/            # Core platform (monorepo)
│   ├── apps/
│   │   ├── api/                 # API Gateway
│   │   ├── web/                 # Web application (PWA)
│   │   └── admin/               # Admin dashboard
│   ├── packages/
│   │   ├── kernel/              # Minimal Kernel
│   │   ├── plugins/             # Plugin System
│   │   ├── events/              # Event System
│   │   ├── modules/             # Module System
│   │   ├── permissions/         # Permission System (WEEG)
│   │   ├── mlas/                # Economic Engine (MLAS)
│   │   └── shared/              # Shared utilities
│   ├── infrastructure/
│   │   ├── terraform/           # Terraform configurations
│   │   ├── cloudformation/      # CloudFormation templates
│   │   ├── kubernetes/          # Kubernetes manifests
│   │   └── docker/              # Dockerfiles
│   └── docs/                    # Technical documentation
├── webwaka-commerce/            # Commerce Suite
│   ├── pos/                     # Point of Sale
│   ├── svm/                     # Single Vendor Marketplace
│   ├── mvm/                     # Multi-Vendor Marketplace
│   └── inventory/               # Inventory Synchronization
├── webwaka-transportation/      # Transportation Suite
│   ├── transport-company/       # Transport Company Platform
│   ├── motor-park/              # Motor Park Platform
│   ├── staff-agent-sales/       # Staff & Agent Sales
│   └── seat-inventory/          # Seat Inventory Synchronization
├── webwaka-mobile/              # Mobile applications
│   ├── ios/                     # iOS app
│   └── android/                 # Android app
└── webwaka-infrastructure/      # Shared infrastructure
    ├── terraform-modules/       # Reusable Terraform modules
    ├── github-actions/          # Reusable GitHub Actions
    └── scripts/                 # Deployment scripts
```

### 3.2. Branch Strategy

**Main Branches:**
- `main`: Production-ready code (protected)
- `staging`: Staging environment code (protected)
- `develop`: Development environment code (protected)

**Feature Branches:**
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Production hotfixes

**Branch Protection Rules:**
- Require pull request reviews (2 approvers)
- Require status checks to pass
- Require branches to be up to date
- Require signed commits
- Restrict who can push to matching branches

### 3.3. GitHub Actions CI/CD Pipeline

**Pipeline Stages:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
      - name: Security scan
        run: npm audit
      - name: Code coverage
        run: npm run coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: docker build -t webwaka-api:${{ github.sha }} .
      - name: Push to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker push $ECR_REGISTRY/webwaka-api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster webwaka-prod --service webwaka-api --force-new-deployment
      - name: Invalidate Cloudflare cache
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'
      - name: Notify Slack
        run: |
          curl -X POST $SLACK_WEBHOOK_URL \
            -H 'Content-Type: application/json' \
            -d '{"text":"Deployed to production: ${{ github.sha }}"}'
```

### 3.4. GitHub Secrets Management

**Secrets Stored in GitHub:**
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token
- `CLOUDFLARE_ZONE_ID`: Cloudflare zone ID for webwaka.com
- `ECR_REGISTRY`: AWS ECR registry URL
- `SLACK_WEBHOOK_URL`: Slack webhook for notifications
- `DATABASE_URL`: Production database connection string (encrypted)
- `OPENROUTER_API_KEY`: Platform OpenRouter API key

**Secret Rotation:**
- Rotate all secrets every 90 days
- Automated rotation via GitHub Actions
- Audit trail for all secret access

---

## 4. AWS Infrastructure Architecture

### 4.1. AWS Account Structure

**Multi-Account Strategy:**

```
WebWaka AWS Organization
├── Management Account (root)
├── Production Account
│   ├── us-east-1 (Primary Region - N. Virginia)
│   ├── eu-west-1 (Secondary Region - Ireland)
│   └── af-south-1 (African Region - Cape Town)
├── Staging Account
│   └── us-east-1
├── Development Account
│   └── us-east-1
└── Security Account (Audit & Compliance)
    └── us-east-1
```

**Account Isolation:**
- Production workloads isolated from dev/staging
- Cross-account access via IAM roles
- Centralized billing and cost allocation
- Consolidated CloudTrail logs in Security Account

### 4.2. AWS Regional Architecture

**Primary Region: us-east-1 (N. Virginia)**
- **Reason:** Lowest latency to Cloudflare edge, most AWS services available
- **Services:** ECS, RDS, S3, CloudFront, Lambda, DynamoDB
- **Availability Zones:** Multi-AZ deployment (us-east-1a, us-east-1b, us-east-1c)

**Secondary Region: eu-west-1 (Ireland)**
- **Reason:** GDPR compliance, European user latency
- **Services:** ECS, RDS (read replica), S3 (replication)
- **Failover:** Automatic failover via Route 53

**African Region: af-south-1 (Cape Town)**
- **Reason:** Nigerian-first, Africa-first principles
- **Services:** S3 (Nigerian user data), CloudFront edge locations
- **Future:** Full ECS deployment when demand justifies

### 4.3. AWS VPC Architecture

**VPC Configuration:**

```
VPC: webwaka-prod-vpc (10.0.0.0/16)
├── Public Subnets (Internet-facing)
│   ├── 10.0.1.0/24 (us-east-1a) - Load Balancers
│   ├── 10.0.2.0/24 (us-east-1b) - Load Balancers
│   └── 10.0.3.0/24 (us-east-1c) - Load Balancers
├── Private Subnets (Application)
│   ├── 10.0.11.0/24 (us-east-1a) - ECS Tasks
│   ├── 10.0.12.0/24 (us-east-1b) - ECS Tasks
│   └── 10.0.13.0/24 (us-east-1c) - ECS Tasks
└── Database Subnets (Isolated)
    ├── 10.0.21.0/24 (us-east-1a) - RDS
    ├── 10.0.22.0/24 (us-east-1b) - RDS
    └── 10.0.23.0/24 (us-east-1c) - RDS
```

**Security Groups:**
- `webwaka-alb-sg`: Allow HTTPS (443) from Cloudflare IPs only
- `webwaka-ecs-sg`: Allow traffic from ALB only
- `webwaka-rds-sg`: Allow PostgreSQL (5432) from ECS only

**Network ACLs:**
- Public subnets: Allow all outbound, restrict inbound to HTTPS
- Private subnets: Allow all traffic within VPC
- Database subnets: Deny all traffic except from private subnets

### 4.4. AWS Compute Architecture (ECS)

**ECS Cluster Configuration:**

```
Cluster: webwaka-prod-cluster
├── Service: webwaka-api
│   ├── Task Definition: webwaka-api:latest
│   ├── Desired Count: 3 (auto-scaling 3-10)
│   ├── Launch Type: FARGATE
│   ├── CPU: 1 vCPU
│   ├── Memory: 2 GB
│   └── Health Check: /health endpoint
├── Service: webwaka-web
│   ├── Task Definition: webwaka-web:latest
│   ├── Desired Count: 2 (auto-scaling 2-5)
│   ├── Launch Type: FARGATE
│   ├── CPU: 0.5 vCPU
│   ├── Memory: 1 GB
│   └── Health Check: /health endpoint
└── Service: webwaka-workers
    ├── Task Definition: webwaka-workers:latest
    ├── Desired Count: 2 (auto-scaling 2-10)
    ├── Launch Type: FARGATE
    ├── CPU: 2 vCPU
    ├── Memory: 4 GB
    └── Health Check: N/A (background workers)
```

**Auto-Scaling Configuration:**
- **Target Tracking:** CPU utilization 70%, Memory utilization 80%
- **Scale-Out:** Add 1 task when threshold exceeded for 2 minutes
- **Scale-In:** Remove 1 task when below threshold for 5 minutes
- **Cooldown:** 60 seconds between scaling actions

### 4.5. AWS Database Architecture (RDS)

**RDS PostgreSQL Configuration:**

```
Instance: webwaka-prod-db
├── Engine: PostgreSQL 15.4
├── Instance Class: db.r6g.xlarge (4 vCPU, 32 GB RAM)
├── Storage: 500 GB gp3 (auto-scaling to 1 TB)
├── Multi-AZ: Enabled (synchronous replication)
├── Read Replicas: 2 (us-east-1b, us-east-1c)
├── Backup: Automated daily backups (7-day retention)
├── Encryption: Enabled (AWS KMS)
└── Monitoring: Enhanced monitoring (1-minute intervals)
```

**Database Connection Pooling:**
- **PgBouncer:** Connection pooler between ECS and RDS
- **Max Connections:** 1000 (RDS limit)
- **Pool Size:** 20 connections per ECS task
- **Connection Timeout:** 30 seconds

### 4.6. AWS Storage Architecture (S3)

**S3 Bucket Structure:**

```
webwaka-prod-assets
├── /static/                     # Static assets (CSS, JS, images)
├── /uploads/                    # User uploads (invoices, receipts)
├── /backups/                    # Database backups
└── /logs/                       # Application logs

webwaka-prod-data
├── /tenant-data/                # Tenant-specific data
├── /analytics/                  # Analytics data (Parquet files)
└── /ml-models/                  # AI/ML models

webwaka-prod-cdn
├── /images/                     # Optimized images
├── /videos/                     # Video content
└── /documents/                  # PDF documents
```

**S3 Lifecycle Policies:**
- **Hot Data:** Standard storage (0-30 days)
- **Warm Data:** Standard-IA storage (31-90 days)
- **Cold Data:** Glacier storage (91-365 days)
- **Archive Data:** Glacier Deep Archive (365+ days)

**S3 Replication:**
- **Cross-Region Replication:** us-east-1 → eu-west-1 (GDPR compliance)
- **Cross-Region Replication:** us-east-1 → af-south-1 (Nigerian data)

### 4.7. AWS CDN Architecture (CloudFront)

**CloudFront Distribution:**

```
Distribution: webwaka-prod-cdn
├── Origin: webwaka-prod-cdn.s3.amazonaws.com
├── Alternate Domain: cdn.webwaka.com
├── SSL Certificate: *.webwaka.com (ACM)
├── Price Class: All Edge Locations
├── Geo Restriction: None
├── Compression: Enabled (gzip, brotli)
└── Cache Behaviors:
    ├── /images/*: Cache 1 year
    ├── /videos/*: Cache 1 month
    ├── /documents/*: Cache 1 week
    └── /static/*: Cache 1 year
```

**Cache Invalidation:**
- Automatic invalidation on deployment
- Manual invalidation via GitHub Actions
- Wildcard invalidation for major updates

---

## 5. Cloudflare Architecture

### 5.1. Cloudflare DNS Configuration

**Domain:** webwaka.com

**DNS Records:**

```
webwaka.com
├── A      @               → Cloudflare Proxy (Orange Cloud) → AWS ALB
├── AAAA   @               → Cloudflare Proxy (Orange Cloud) → AWS ALB
├── CNAME  www             → webwaka.com
├── CNAME  api             → Cloudflare Proxy → AWS ALB (API)
├── CNAME  cdn             → CloudFront Distribution
├── CNAME  admin           → Cloudflare Proxy → AWS ALB (Admin)
├── CNAME  staging         → Cloudflare Proxy → AWS ALB (Staging)
├── TXT    @               → "v=spf1 include:_spf.google.com ~all"
├── TXT    _dmarc          → "v=DMARC1; p=quarantine; rua=mailto:dmarc@webwaka.com"
└── MX     @               → Google Workspace (email)
```

**DNS Settings:**
- **Proxy Status:** Proxied (Orange Cloud) for all public-facing domains
- **SSL/TLS Mode:** Full (Strict) - Cloudflare ↔ AWS encrypted
- **DNSSEC:** Enabled
- **CAA Records:** Enabled (restrict SSL issuance to Cloudflare, AWS)

### 5.2. Cloudflare SSL/TLS Configuration

**SSL Certificates:**
- **Edge Certificate:** Cloudflare Universal SSL (*.webwaka.com)
- **Origin Certificate:** Cloudflare Origin CA (15-year validity)
- **Client Certificate:** Cloudflare Authenticated Origin Pulls

**TLS Settings:**
- **Minimum TLS Version:** TLS 1.2
- **TLS 1.3:** Enabled
- **Automatic HTTPS Rewrites:** Enabled
- **Always Use HTTPS:** Enabled
- **HSTS:** Enabled (max-age=31536000, includeSubDomains, preload)

### 5.3. Cloudflare WAF (Web Application Firewall)

**WAF Rules:**

```
Cloudflare WAF
├── Managed Rulesets
│   ├── Cloudflare Managed Ruleset (OWASP Core Ruleset)
│   ├── Cloudflare OWASP ModSecurity Core Ruleset
│   └── Cloudflare Exposed Credentials Check
├── Custom Rules
│   ├── Block known malicious IPs
│   ├── Rate limit API endpoints (100 req/min per IP)
│   ├── Block requests without User-Agent
│   ├── Block SQL injection attempts
│   └── Block XSS attempts
└── Firewall Rules
    ├── Allow Nigerian IPs (priority)
    ├── Challenge suspicious traffic
    └── Block traffic from sanctioned countries
```

**Rate Limiting:**
- **API Endpoints:** 100 requests/minute per IP
- **Login Endpoints:** 5 requests/minute per IP
- **Registration:** 3 requests/hour per IP
- **Password Reset:** 3 requests/hour per IP

### 5.4. Cloudflare DDoS Protection

**DDoS Mitigation:**
- **HTTP DDoS Attack Protection:** Enabled (automatic mitigation)
- **Network-layer DDoS Attack Protection:** Enabled
- **Advanced TCP Protection:** Enabled
- **Challenge Passage:** 30 seconds (for suspicious traffic)

**Attack Modes:**
- **Normal:** Standard security (default)
- **Under Attack:** Maximum security (manual activation during attack)
- **I'm Under Attack:** Aggressive challenge for all visitors

### 5.5. Cloudflare Caching

**Cache Configuration:**

```
Cloudflare Cache
├── Cache Level: Standard
├── Browser Cache TTL: Respect Existing Headers
├── Crawler Hints: Enabled
├── Cache by Device Type: Enabled (Mobile, Desktop, Tablet)
└── Cache Rules:
    ├── /api/*: Bypass cache
    ├── /static/*: Cache 1 year
    ├── /images/*: Cache 1 month
    ├── /videos/*: Cache 1 week
    └── /*.html: Cache 1 hour
```

**Cache Purge:**
- **Automatic:** On deployment (via GitHub Actions)
- **Manual:** Via Cloudflare API
- **Selective:** Purge by URL, tag, or prefix

### 5.6. Cloudflare Workers (Edge Computing)

**Worker Use Cases:**

```javascript
// Worker: Nigerian User Routing
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const country = request.cf.country
  
  // Route Nigerian users to African edge
  if (country === 'NG') {
    const url = new URL(request.url)
    url.hostname = 'af-south-1.webwaka.com'
    return fetch(url, request)
  }
  
  // Route other users to nearest edge
  return fetch(request)
}
```

**Worker Deployments:**
- **Nigerian User Routing:** Route Nigerian users to African edge locations
- **API Gateway:** Pre-process API requests (auth, rate limiting)
- **A/B Testing:** Route users to different versions
- **Bot Detection:** Detect and block malicious bots

### 5.7. Cloudflare Load Balancing

**Load Balancer Configuration:**

```
Load Balancer: api.webwaka.com
├── Pool: us-east-1 (Primary)
│   ├── Origin: us-east-1-alb.webwaka.com
│   ├── Weight: 100
│   └── Health Check: /health (every 60s)
├── Pool: eu-west-1 (Failover)
│   ├── Origin: eu-west-1-alb.webwaka.com
│   ├── Weight: 0 (failover only)
│   └── Health Check: /health (every 60s)
└── Steering Policy: Geo Steering
    ├── Nigeria → us-east-1 (via Cloudflare Africa edge)
    ├── Europe → eu-west-1
    └── Default → us-east-1
```

**Failover Logic:**
- If us-east-1 health check fails → Route to eu-west-1
- If both fail → Return 503 Service Unavailable
- Automatic recovery when health checks pass

---

## 6. webwaka.com Domain Management

### 6.1. Domain Registrar

**Registrar:** Cloudflare Registrar (at-cost pricing, no markup)

**Domain:** webwaka.com
- **Registration Date:** [To be set]
- **Expiration Date:** Auto-renew enabled
- **Registrar Lock:** Enabled
- **WHOIS Privacy:** Enabled
- **Transfer Lock:** Enabled

### 6.2. Subdomain Strategy

**Subdomains:**

```
webwaka.com (Root Domain)
├── www.webwaka.com          → Main website (PWA)
├── api.webwaka.com          → API Gateway
├── cdn.webwaka.com          → CloudFront CDN
├── admin.webwaka.com        → Admin dashboard
├── staging.webwaka.com      → Staging environment
├── dev.webwaka.com          → Development environment
├── docs.webwaka.com         → Documentation
├── status.webwaka.com       → Status page
├── blog.webwaka.com         → Blog
└── app.webwaka.com          → Mobile app deep links
```

**Wildcard Subdomains:**
- `*.tenant.webwaka.com`: Tenant-specific subdomains (e.g., `acme.tenant.webwaka.com`)

### 6.3. Email Configuration

**Email Provider:** Google Workspace

**MX Records:**
```
webwaka.com
├── MX 1  → aspmx.l.google.com
├── MX 5  → alt1.aspmx.l.google.com
├── MX 5  → alt2.aspmx.l.google.com
├── MX 10 → alt3.aspmx.l.google.com
└── MX 10 → alt4.aspmx.l.google.com
```

**Email Addresses:**
- `hello@webwaka.com`: General inquiries
- `support@webwaka.com`: Customer support
- `security@webwaka.com`: Security reports
- `dmarc@webwaka.com`: DMARC reports
- `no-reply@webwaka.com`: Transactional emails

### 6.4. SSL Certificate Management

**Certificate Provider:** Cloudflare (Edge) + AWS ACM (Origin)

**Certificates:**
- **Cloudflare Edge:** `*.webwaka.com` (Universal SSL, auto-renew)
- **AWS ACM:** `*.webwaka.com` (Origin certificate, auto-renew)
- **Validity:** Cloudflare (90 days, auto-renew), AWS ACM (13 months, auto-renew)

**Certificate Transparency:**
- All certificates logged to CT logs
- Monitoring via crt.sh for unauthorized certificates

---

## 7. Complete CI/CD Pipeline

### 7.1. Pipeline Overview

```
Developer Commit → GitHub → GitHub Actions → Build → Test → Deploy → Cloudflare Purge → Notify
```

### 7.2. Detailed Pipeline Stages

**Stage 1: Code Quality Checks**
- Linting (ESLint, Prettier)
- Type checking (TypeScript)
- Security scanning (npm audit, Snyk)
- Dependency checks (Dependabot)

**Stage 2: Testing**
- Unit tests (Jest)
- Integration tests (Supertest)
- E2E tests (Playwright)
- Performance tests (k6)
- Code coverage (Codecov)

**Stage 3: Build**
- Docker image build
- Multi-stage builds for optimization
- Image scanning (Trivy)
- Push to AWS ECR

**Stage 4: Infrastructure Provisioning**
- Terraform plan
- Terraform apply (if changes detected)
- CloudFormation stack update

**Stage 5: Deployment**
- ECS service update
- Blue-green deployment
- Health check validation
- Rollback on failure

**Stage 6: Post-Deployment**
- Cloudflare cache purge
- CloudFront invalidation
- Smoke tests
- Slack notification

### 7.3. Deployment Environments

**Development:**
- **Trigger:** Push to `develop` branch
- **Deployment:** Automatic
- **Infrastructure:** Shared ECS cluster (dev account)
- **Database:** Shared RDS instance (dev account)
- **Domain:** dev.webwaka.com

**Staging:**
- **Trigger:** Push to `staging` branch
- **Deployment:** Automatic
- **Infrastructure:** Dedicated ECS cluster (staging account)
- **Database:** Dedicated RDS instance (staging account)
- **Domain:** staging.webwaka.com

**Production:**
- **Trigger:** Push to `main` branch
- **Deployment:** Manual approval required
- **Infrastructure:** Dedicated ECS cluster (prod account)
- **Database:** Multi-AZ RDS instance (prod account)
- **Domain:** webwaka.com, www.webwaka.com, api.webwaka.com

---

## 8. Infrastructure as Code (IaC)

### 8.1. Terraform Configuration

**Terraform Modules:**

```
infrastructure/terraform/
├── modules/
│   ├── vpc/                     # VPC, subnets, security groups
│   ├── ecs/                     # ECS cluster, services, tasks
│   ├── rds/                     # RDS instances, read replicas
│   ├── s3/                      # S3 buckets, lifecycle policies
│   ├── cloudfront/              # CloudFront distributions
│   ├── route53/                 # Route 53 hosted zones
│   └── iam/                     # IAM roles, policies
├── environments/
│   ├── dev/                     # Development environment
│   ├── staging/                 # Staging environment
│   └── prod/                    # Production environment
└── backend.tf                   # Terraform state backend (S3)
```

**Terraform State Management:**
- **Backend:** S3 bucket (`webwaka-terraform-state`)
- **State Locking:** DynamoDB table (`webwaka-terraform-locks`)
- **Encryption:** Enabled (AWS KMS)
- **Versioning:** Enabled

### 8.2. Terraform Workflow

```bash
# Initialize Terraform
terraform init

# Plan changes
terraform plan -out=tfplan

# Apply changes (requires approval)
terraform apply tfplan

# Destroy resources (requires approval)
terraform destroy
```

**Terraform CI/CD:**
- Automated `terraform plan` on pull requests
- Manual approval required for `terraform apply`
- Automated `terraform destroy` for dev/staging (scheduled)

---

## 9. Nigerian-First, Mobile-First, PWA-First, Africa-First Compliance

### 9.1. Nigerian Edge Locations

**Cloudflare Edge Locations in Nigeria:**
- Lagos (LOS) - Primary edge location
- Abuja (ABV) - Secondary edge location

**AWS Edge Locations in Africa:**
- Cape Town (CPT) - CloudFront edge location
- Johannesburg (JNB) - CloudFront edge location

**Latency Optimization:**
- Nigerian users routed to Lagos/Abuja Cloudflare edge
- Static assets cached at African edge locations
- API requests routed to us-east-1 via optimized routes

### 9.2. Offline-First Infrastructure

**Service Worker Deployment:**
- Service worker hosted on Cloudflare Workers
- Aggressive caching of static assets
- Background sync for offline requests
- IndexedDB for local data storage

**PWA Manifest:**
- Hosted at `https://webwaka.com/manifest.json`
- Cached by Cloudflare (1 year TTL)
- Icons optimized for Nigerian devices

### 9.3. Mobile-First Infrastructure

**Responsive Images:**
- CloudFront automatic image optimization
- WebP format for modern browsers
- JPEG fallback for older browsers
- Lazy loading for below-the-fold images

**Mobile API Optimization:**
- Compressed API responses (gzip, brotli)
- Pagination for large datasets
- GraphQL for flexible queries
- Reduced payload sizes

---

## 10. Security and Compliance

### 10.1. AWS Security

**IAM Best Practices:**
- Least privilege access
- Multi-factor authentication (MFA) required
- Role-based access control (RBAC)
- Regular access reviews

**Encryption:**
- **At Rest:** All data encrypted (S3, RDS, EBS)
- **In Transit:** TLS 1.2+ for all connections
- **Key Management:** AWS KMS for encryption keys

**Audit Logging:**
- **CloudTrail:** All API calls logged
- **VPC Flow Logs:** All network traffic logged
- **RDS Logs:** All database queries logged
- **S3 Access Logs:** All object access logged

### 10.2. Cloudflare Security

**DDoS Protection:**
- Automatic mitigation for HTTP DDoS
- Network-layer DDoS protection
- Rate limiting for API endpoints

**WAF Protection:**
- OWASP Core Ruleset
- Custom rules for Nigerian threats
- Bot detection and mitigation

### 10.3. Compliance

**GDPR Compliance:**
- Data residency in EU (eu-west-1)
- Right to be forgotten (data deletion)
- Data portability (export APIs)
- Consent management

**NDPR Compliance (Nigeria):**
- Data residency in Nigeria (af-south-1)
- Data protection impact assessments
- Breach notification procedures

---

## 11. Monitoring and Observability

### 11.1. AWS Monitoring

**CloudWatch Metrics:**
- ECS task CPU, memory, network
- RDS CPU, memory, disk, connections
- S3 bucket size, requests
- CloudFront requests, errors, cache hit rate

**CloudWatch Alarms:**
- ECS task failures → PagerDuty
- RDS high CPU → Slack
- S3 bucket size > 1 TB → Email
- CloudFront error rate > 5% → PagerDuty

### 11.2. Cloudflare Analytics

**Analytics Metrics:**
- Requests per second
- Bandwidth usage
- Cache hit rate
- Threat detection (WAF blocks, DDoS mitigations)

**Cloudflare Logs:**
- HTTP request logs (Logpush to S3)
- Firewall events
- DDoS events

### 11.3. Application Performance Monitoring

**APM Tool:** AWS X-Ray + Datadog

**Metrics:**
- API response times (p50, p95, p99)
- Database query times
- External API call times (OpenRouter, payment gateways)
- Error rates

---

## 12. Disaster Recovery and Business Continuity

### 12.1. Backup Strategy

**RDS Backups:**
- Automated daily backups (7-day retention)
- Manual snapshots before major changes
- Cross-region replication to eu-west-1

**S3 Backups:**
- Versioning enabled (90-day retention)
- Cross-region replication to eu-west-1
- Lifecycle policies for archival

**ECS Backups:**
- Docker images versioned in ECR
- Task definitions versioned
- Infrastructure as Code in GitHub

### 12.2. Disaster Recovery Plan

**RTO (Recovery Time Objective):** 1 hour  
**RPO (Recovery Point Objective):** 15 minutes

**Failover Procedure:**
1. Detect outage (CloudWatch alarms)
2. Notify on-call engineer (PagerDuty)
3. Activate failover (Route 53 DNS change)
4. Validate failover (smoke tests)
5. Notify stakeholders (Slack, email)

**Failover Scenarios:**
- **us-east-1 outage:** Failover to eu-west-1
- **AWS outage:** Failover to Cloudflare Workers (static site)
- **Database outage:** Promote read replica to primary

---

## 13. Cost Optimization

### 13.1. AWS Cost Optimization

**Reserved Instances:**
- RDS: 1-year reserved instance (30% savings)
- ECS: Fargate Savings Plan (20% savings)

**Spot Instances:**
- ECS workers: 70% spot instances (70% savings)
- Non-critical workloads: 100% spot instances

**S3 Lifecycle Policies:**
- Standard → Standard-IA (30 days)
- Standard-IA → Glacier (90 days)
- Glacier → Deep Archive (365 days)

**CloudFront Cost Optimization:**
- Price Class: All Edge Locations (best performance)
- Compression: Enabled (reduce data transfer)

### 13.2. Cloudflare Cost Optimization

**Cloudflare Plan:** Pro ($20/month)
- WAF included
- DDoS protection included
- Page Rules: 20 included
- Workers: 10 million requests/month included

**Cloudflare Workers:**
- Free tier: 100,000 requests/day
- Paid tier: $5/month for 10 million requests

---

## 14. Success Criteria

**Deployment infrastructure is successful when:**

1. ✅ All code and infrastructure in GitHub
2. ✅ CI/CD pipeline fully automated
3. ✅ AWS infrastructure provisioned via Terraform
4. ✅ Cloudflare protecting all public-facing services
5. ✅ webwaka.com domain configured and operational
6. ✅ SSL/TLS certificates auto-renewing
7. ✅ Multi-region deployment (us-east-1, eu-west-1, af-south-1)
8. ✅ Nigerian users routed to African edge locations
9. ✅ Disaster recovery plan tested and validated
10. ✅ Monitoring and alerting operational

---

## 15. References

**Related Governance Documents:**
- CLOUD_INFRASTRUCTURE_STRATEGY.md
- WEBWAKA_MODULAR_DESIGN_ARCHITECTURE_INVARIANTS.md
- WEBWAKA_AI_NATIVE_ARCHITECTURE.md
- FD-2026-001: Governance Foundation & Authority Model
- FD-2026-002: Mandatory Agent Checklist & Execution Visibility Rule

---

**END OF DOCUMENT**

**Document Created:** 2026-02-09  
**Authors:** webwakaagent1 (Chief of Staff), webwakaagent6 (Infrastructure), webwakaagent9 (Release & Operations)  
**Status:** ACTIVATED AND LOCKED  
**Precedence Level:** 2 (Constitutional Documents)
