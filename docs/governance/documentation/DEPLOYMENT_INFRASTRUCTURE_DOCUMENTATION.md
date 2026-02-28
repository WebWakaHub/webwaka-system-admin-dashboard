# Deployment Infrastructure Documentation

**Module:** Deployment Infrastructure (Module 15)  
**Version:** 1.0  
**Last Updated:** February 10, 2026  
**Author:** webwakaagent4 (Backend Engineering Lead)  
**Status:** COMPLETE

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Initial Setup](#initial-setup)
5. [Deployment Procedures](#deployment-procedures)
6. [Monitoring and Alerts](#monitoring-and-alerts)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)
9. [Disaster Recovery](#disaster-recovery)
10. [Security Best Practices](#security-best-practices)
11. [Performance Optimization](#performance-optimization)
12. [Maintenance](#maintenance)
13. [FAQ](#faq)

---

## Overview

The WebWaka Platform Deployment Infrastructure is a comprehensive, production-ready system designed to support continuous integration, continuous deployment, and operational excellence. The infrastructure leverages GitHub Actions for CI/CD, AWS for cloud infrastructure, and Cloudflare for content delivery and security.

### Key Features

**Continuous Integration & Deployment**
- Automated testing on every commit
- Multi-environment deployment (dev, staging, production)
- Blue-green and canary deployment strategies
- Automatic rollback on failure

**Infrastructure Management**
- Infrastructure as Code (Terraform)
- Multi-AZ deployment for high availability
- Auto-scaling based on demand
- Comprehensive monitoring and alerting

**Security**
- OIDC authentication for AWS (no long-lived credentials)
- Secrets Manager for credential management
- Encryption at rest and in transit
- WAF and DDoS protection via Cloudflare

**Reliability**
- 99.9% uptime SLA
- Automated backups and disaster recovery
- Health checks and automatic recovery
- Comprehensive logging and audit trails

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                       │
│  (Code, Tests, Workflows, Infrastructure as Code)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions CI/CD Pipeline                  │
│  (Lint, Build, Test, Security Scan, Deploy)               │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
    ┌────────┐  ┌────────┐  ┌────────┐
    │   Dev  │  │Staging │  │  Prod  │
    │  Env   │  │  Env   │  │  Env   │
    └────────┘  └────────┘  └────────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
        ┌─────────────────────────────┐
        │   AWS Infrastructure        │
        │  (VPC, EC2, RDS, S3, etc)  │
        └─────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │   Cloudflare CDN & WAF      │
        │  (DNS, Security, Caching)   │
        └─────────────────────────────┘
```

### Component Breakdown

**GitHub Actions Workflows:**
- CI (Continuous Integration): Lint, build, test
- CD (Continuous Deployment): Build, push, deploy
- Security: SAST, dependency scanning, secret scanning
- Performance: Load testing, baseline comparison

**AWS Infrastructure:**
- VPC: Network isolation and security
- EC2: Application servers with auto-scaling
- RDS: PostgreSQL database with Multi-AZ
- S3: Static assets and logs
- CloudFront: CDN for content delivery
- CloudWatch: Monitoring, logging, alerting
- Secrets Manager: Credential management

**Cloudflare:**
- DNS management
- WAF (Web Application Firewall)
- DDoS protection
- SSL/TLS encryption
- Caching and performance optimization

---

## Prerequisites

### Required Tools

1. **Git** - Version control
   ```bash
   git --version  # Should be 2.30+
   ```

2. **Terraform** - Infrastructure as Code
   ```bash
   terraform version  # Should be 1.0+
   ```

3. **AWS CLI** - AWS command-line interface
   ```bash
   aws --version  # Should be 2.0+
   ```

4. **Docker** - Container runtime
   ```bash
   docker --version  # Should be 20.10+
   ```

5. **kubectl** - Kubernetes CLI (for ECS)
   ```bash
   kubectl version  # Should be 1.20+
   ```

### Required Accounts & Access

1. **GitHub Account**
   - Access to WebWakaHub organization
   - Permissions to create and manage repositories
   - Permissions to configure GitHub Actions

2. **AWS Account**
   - IAM user with appropriate permissions
   - Access to EC2, RDS, S3, CloudWatch, Secrets Manager
   - Ability to create VPCs and security groups

3. **Cloudflare Account**
   - Domain registration or transfer
   - API token for programmatic access
   - Access to DNS, WAF, and SSL settings

### Environment Variables

Create a `.env` file with the following variables:

```bash
# AWS Configuration
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=123456789012
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key

# GitHub Configuration
export GITHUB_TOKEN=[REDACTED-PAT-PLACEHOLDER]
export GITHUB_OWNER=WebWakaHub
export GITHUB_REPO=webwaka-platform

# Cloudflare Configuration
export CLOUDFLARE_API_TOKEN=your_api_token
export CLOUDFLARE_ZONE_ID=your_zone_id
export DOMAIN_NAME=webwaka.com

# Application Configuration
export NODE_ENV=production
export LOG_LEVEL=info
export PORT=3000
```

---

## Initial Setup

### Step 1: Clone Repositories

```bash
# Clone governance repository (infrastructure as code)
git clone https://github.com/WebWakaHub/webwaka-governance.git
cd webwaka-governance

# Clone platform repository (application code)
git clone https://github.com/WebWakaHub/webwaka-platform.git
cd webwaka-platform
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure

# Verify credentials
aws sts get-caller-identity
```

### Step 3: Initialize Terraform

```bash
cd webwaka-governance/infrastructure/terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan infrastructure
terraform plan -var-file=prod.tfvars -out=tfplan
```

### Step 4: Review and Apply Terraform

```bash
# Review the plan carefully
terraform show tfplan

# Apply infrastructure (this will create AWS resources)
terraform apply tfplan

# Save outputs
terraform output > outputs.json
```

### Step 5: Configure GitHub Secrets

```bash
# Set AWS credentials in GitHub secrets
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ACCESS_KEY_ID --body "your_access_key"
gh secret set AWS_SECRET_ACCESS_KEY --body "your_secret_key"

# Set Cloudflare credentials
gh secret set CLOUDFLARE_API_TOKEN --body "your_api_token"
gh secret set CLOUDFLARE_ZONE_ID --body "your_zone_id"

# Set Slack webhook for notifications
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/..."
```

### Step 6: Configure Cloudflare

```bash
# Update DNS records in Cloudflare
# Point domain to ALB endpoint from Terraform outputs

# Configure WAF rules
# - Enable DDoS protection
# - Configure rate limiting
# - Set up security rules

# Configure SSL/TLS
# - Set to Full (strict)
# - Enable HSTS
# - Enable OCSP stapling
```

### Step 7: Verify Deployment

```bash
# Test health endpoint
curl https://api.webwaka.com/health

# Check CloudWatch logs
aws logs tail /ecs/webwaka-app --follow

# Verify DNS resolution
nslookup api.webwaka.com

# Check Cloudflare cache
curl -I https://api.webwaka.com
```

---

## Deployment Procedures

### Development Environment Deployment

**Trigger:** Push to `develop` branch

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push to develop branch
git push origin develop

# 4. GitHub Actions automatically:
#    - Runs CI tests
#    - Builds Docker image
#    - Pushes to ECR
#    - Deploys to ECS (dev)
#    - Runs smoke tests
```

**Verification:**
```bash
# Check deployment status
aws ecs describe-services \
  --cluster webwaka-dev-cluster \
  --services webwaka-dev

# Check application logs
aws logs tail /ecs/webwaka-app --follow

# Test health endpoint
curl http://dev-api.webwaka.com/health
```

### Staging Environment Deployment

**Trigger:** Push to `staging` branch

```bash
# 1. Create release branch
git checkout -b release/v1.0.0

# 2. Update version and changelog
# - Update package.json version
# - Update CHANGELOG.md
# - Commit changes

# 3. Push to staging branch
git push origin staging

# 4. GitHub Actions automatically:
#    - Runs full CI/CD pipeline
#    - Deploys to staging environment
#    - Runs comprehensive tests
#    - Sends Slack notification
```

**Pre-Deployment Checklist:**
- [ ] All tests passing
- [ ] Code review approved
- [ ] Security scan passed
- [ ] Performance tests passed
- [ ] Changelog updated
- [ ] Version bumped

**Verification:**
```bash
# Check ECS service
aws ecs describe-services \
  --cluster webwaka-staging-cluster \
  --services webwaka-staging

# Run smoke tests
./scripts/smoke-tests.sh staging

# Check metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=webwaka-staging
```

### Production Environment Deployment

**Trigger:** Push to `main` branch (requires approval)

```bash
# 1. Create hotfix or release branch
git checkout -b hotfix/critical-fix

# 2. Make changes and test thoroughly
git add .
git commit -m "fix: critical issue"

# 3. Create pull request to main
git push origin hotfix/critical-fix

# 4. Request code review and approval

# 5. Merge to main branch
git checkout main
git pull origin main
git merge hotfix/critical-fix
git push origin main

# 6. GitHub Actions automatically:
#    - Runs full CI/CD pipeline
#    - Performs blue-green deployment
#    - Monitors deployment progress
#    - Automatic rollback on failure
#    - Sends Slack notification
```

**Production Deployment Checklist:**
- [ ] Code reviewed and approved
- [ ] All tests passing (100%)
- [ ] Security scan passed (0 critical/high)
- [ ] Performance tests passed
- [ ] Staging deployment successful
- [ ] Runbook reviewed
- [ ] On-call engineer notified
- [ ] Monitoring dashboards ready

**Deployment Monitoring:**
```bash
# Watch deployment progress
aws ecs describe-services \
  --cluster webwaka-prod-cluster \
  --services webwaka-prod \
  --query 'services[0].deployments'

# Monitor CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=webwaka-prod \
  --start-time 2026-02-10T00:00:00Z \
  --end-time 2026-02-10T01:00:00Z \
  --period 300 \
  --statistics Average

# Check error rates
aws logs insights query \
  --log-group-name /ecs/webwaka-app \
  --query 'fields @timestamp, @message | filter @message like /ERROR/ | stats count() by bin(5m)'

# Verify health
curl -H "Authorization: Bearer $API_KEY" https://api.webwaka.com/health
```

---

## Monitoring and Alerts

### CloudWatch Dashboards

Access the main dashboard:
```bash
aws cloudwatch list-dashboards --query 'DashboardEntries[?DashboardName==`WebWaka-Main`]'
```

**Dashboard Metrics:**
- ALB Response Time (p50, p95, p99)
- ALB Error Rate (4XX, 5XX)
- ECS CPU and Memory Utilization
- RDS CPU and Connections
- S3 Request Count
- Cloudflare Cache Hit Ratio

### CloudWatch Alarms

**Critical Alarms:**
- ALB 5XX errors > 10 in 5 minutes
- ECS CPU > 80% for 10 minutes
- RDS CPU > 80% for 10 minutes
- RDS Storage > 80% capacity

**Warning Alarms:**
- ALB response time > 500ms
- ECS memory > 70%
- RDS connections > 80% max

**Receiving Alerts:**
```bash
# SNS topic for alerts
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:webwaka-alerts

# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:webwaka-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

### Custom Metrics

Create custom metrics for application-specific monitoring:

```bash
# Example: Track API response time
aws cloudwatch put-metric-data \
  --namespace WebWaka \
  --metric-name APIResponseTime \
  --value 150 \
  --unit Milliseconds \
  --dimensions Service=api,Endpoint=/health
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Deployment Fails with "Task Definition Error"

**Symptoms:**
- ECS deployment fails
- Error message: "Invalid task definition"

**Solution:**
```bash
# 1. Check task definition syntax
aws ecs describe-task-definition \
  --task-definition webwaka-app

# 2. Validate JSON
jq . task-definition.json

# 3. Check IAM roles
aws iam get-role --role-name ecsTaskExecutionRole

# 4. Verify Secrets Manager access
aws secretsmanager list-secrets \
  --filters Key=name,Values=webwaka
```

#### Issue 2: Application Not Responding

**Symptoms:**
- Health checks failing
- ALB returning 503 errors

**Solution:**
```bash
# 1. Check ECS task status
aws ecs list-tasks \
  --cluster webwaka-prod-cluster \
  --service-name webwaka-prod

# 2. Check task logs
aws logs tail /ecs/webwaka-app --follow

# 3. Check security groups
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxxx

# 4. Test connectivity
curl -v http://TASK_IP:3000/health

# 5. Restart task if needed
aws ecs update-service \
  --cluster webwaka-prod-cluster \
  --service webwaka-prod \
  --force-new-deployment
```

#### Issue 3: High Memory Usage

**Symptoms:**
- ECS memory utilization > 80%
- Tasks being killed due to OOM

**Solution:**
```bash
# 1. Check current memory allocation
aws ecs describe-task-definition \
  --task-definition webwaka-app \
  --query 'taskDefinition.memory'

# 2. Increase memory in task definition
# Edit task-definition.json and increase memory field

# 3. Register new task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json

# 4. Update service to use new task definition
aws ecs update-service \
  --cluster webwaka-prod-cluster \
  --service webwaka-prod \
  --task-definition webwaka-app:2 \
  --force-new-deployment
```

#### Issue 4: Database Connection Errors

**Symptoms:**
- Application unable to connect to RDS
- Error: "Connection refused"

**Solution:**
```bash
# 1. Check RDS instance status
aws rds describe-db-instances \
  --db-instance-identifier webwaka-db

# 2. Check security group rules
aws ec2 describe-security-groups \
  --group-ids sg-xxxxxxxxx

# 3. Verify database credentials
aws secretsmanager get-secret-value \
  --secret-id webwaka/db-password

# 4. Test connectivity
psql -h webwaka-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U admin \
     -d webwaka

# 5. Check RDS logs
aws rds describe-db-log-files \
  --db-instance-identifier webwaka-db
```

#### Issue 5: Cloudflare DNS Not Resolving

**Symptoms:**
- DNS resolution failing
- Error: "NXDOMAIN"

**Solution:**
```bash
# 1. Check DNS records in Cloudflare
nslookup api.webwaka.com 1.1.1.1

# 2. Verify CNAME record points to ALB
dig api.webwaka.com

# 3. Check Cloudflare DNS settings
# - Log in to Cloudflare dashboard
# - Verify DNS records
# - Check nameserver configuration

# 4. Flush DNS cache
sudo systemctl restart systemd-resolved

# 5. Test from different DNS server
nslookup api.webwaka.com 8.8.8.8
```

---

## Rollback Procedures

### Automatic Rollback

The deployment pipeline automatically rolls back on failure:

```bash
# Automatic rollback triggers:
# - Health check failure
# - Smoke test failure
# - High error rate (>5% 5XX errors)
# - Service instability
```

### Manual Rollback

If automatic rollback doesn't work or manual intervention is needed:

```bash
# 1. Identify previous stable task definition
aws ecs describe-services \
  --cluster webwaka-prod-cluster \
  --services webwaka-prod \
  --query 'services[0].taskDefinition'

# 2. Get previous task definition version
aws ecs describe-task-definition \
  --task-definition webwaka-app:PREVIOUS_VERSION

# 3. Update service to use previous version
aws ecs update-service \
  --cluster webwaka-prod-cluster \
  --service webwaka-prod \
  --task-definition webwaka-app:PREVIOUS_VERSION \
  --force-new-deployment

# 4. Monitor rollback progress
aws ecs describe-services \
  --cluster webwaka-prod-cluster \
  --services webwaka-prod \
  --query 'services[0].deployments'

# 5. Verify application is healthy
curl https://api.webwaka.com/health

# 6. Notify team
# Send message to #deployments Slack channel
```

### Rollback Script

Use the provided rollback script:

```bash
./scripts/rollback.sh production

# Script will:
# - Identify previous stable version
# - Perform rollback
# - Monitor health checks
# - Send notifications
# - Log rollback details
```

---

## Disaster Recovery

### Backup Strategy

**Database Backups:**
- Automated daily backups (30-day retention)
- Multi-AZ replication
- Point-in-time recovery (35 days)

```bash
# List available backups
aws rds describe-db-snapshots \
  --db-instance-identifier webwaka-db

# Create manual backup
aws rds create-db-snapshot \
  --db-instance-identifier webwaka-db \
  --db-snapshot-identifier webwaka-backup-$(date +%Y%m%d)
```

**S3 Backups:**
- Versioning enabled
- Cross-region replication
- Lifecycle policies for cost optimization

```bash
# List S3 versions
aws s3api list-object-versions \
  --bucket webwaka-assets

# Restore from version
aws s3api get-object \
  --bucket webwaka-assets \
  --key path/to/file \
  --version-id VERSION_ID \
  restored-file
```

### Disaster Recovery Procedures

**Database Failure:**
```bash
# 1. Detect failure
# CloudWatch alarm triggers

# 2. Failover to replica
aws rds promote-read-replica \
  --db-instance-identifier webwaka-db-replica

# 3. Update application connection string
# Update Secrets Manager with new endpoint

# 4. Verify application connectivity
curl https://api.webwaka.com/health

# 5. Restore from backup if needed
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier webwaka-db-restored \
  --db-snapshot-identifier webwaka-backup-20260210
```

**Application Failure:**
```bash
# 1. Detect failure
# Health checks fail

# 2. Trigger automatic recovery
# ECS replaces failed tasks

# 3. Monitor recovery
aws ecs describe-services \
  --cluster webwaka-prod-cluster \
  --services webwaka-prod

# 4. Manual recovery if needed
aws ecs update-service \
  --cluster webwaka-prod-cluster \
  --service webwaka-prod \
  --desired-count 3 \
  --force-new-deployment
```

**Regional Failure:**
```bash
# 1. Detect regional failure
# Multiple services down

# 2. Failover to secondary region (if configured)
# Update Cloudflare to point to secondary region

# 3. Restore from backups in secondary region
# Restore RDS from snapshot
# Restore S3 from replication

# 4. Verify services in secondary region
curl https://api.webwaka.com/health

# 5. Update DNS to secondary region
# Update Cloudflare DNS records
```

---

## Security Best Practices

### Access Control

**IAM Roles:**
```bash
# Use least privilege principle
# Create specific roles for each service

# Example: ECS task role
aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name ecsTaskRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

**Secrets Management:**
```bash
# Store all secrets in Secrets Manager
aws secretsmanager create-secret \
  --name webwaka/db-password \
  --secret-string "your-secure-password"

# Rotate secrets regularly
aws secretsmanager rotate-secret \
  --secret-id webwaka/db-password \
  --rotation-rules AutomaticallyAfterDays=30
```

### Network Security

**Security Groups:**
```bash
# Restrict inbound traffic
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 3000 \
  --source-security-group-id sg-alb

# Restrict outbound traffic
aws ec2 authorize-security-group-egress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

**VPC Configuration:**
```bash
# Use private subnets for application servers
# Use NAT Gateway for outbound traffic
# Enable VPC Flow Logs for monitoring

aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-xxxxxxxxx \
  --traffic-type ALL \
  --log-destination-type cloud-watch-logs \
  --log-group-name /aws/vpc/flowlogs
```

### Encryption

**At Rest:**
```bash
# Enable RDS encryption
aws rds modify-db-instance \
  --db-instance-identifier webwaka-db \
  --storage-encrypted \
  --kms-key-id arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID

# Enable S3 encryption
aws s3api put-bucket-encryption \
  --bucket webwaka-assets \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

**In Transit:**
```bash
# Enable HTTPS/TLS
# Configure Cloudflare SSL/TLS to "Full (strict)"
# Enable HSTS headers

# Test SSL configuration
openssl s_client -connect api.webwaka.com:443
```

---

## Performance Optimization

### Caching Strategy

**CloudFront Caching:**
```bash
# Configure cache behavior
aws cloudfront create-distribution \
  --distribution-config file://distribution-config.json

# Set cache headers
# Cache-Control: public, max-age=3600
# ETag for cache validation
```

**Application Caching:**
```bash
# Use Redis for session caching
# Cache database queries
# Cache API responses

# Example: Cache health check response
GET /health
Cache-Control: public, max-age=60
```

### Database Optimization

**Query Optimization:**
```bash
# Enable query logging
aws rds modify-db-instance \
  --db-instance-identifier webwaka-db \
  --enable-cloudwatch-logs-exports postgresql

# Analyze slow queries
aws logs insights query \
  --log-group-name /aws/rds/webwaka-db \
  --query 'fields @timestamp, @message | filter @message like /slow/ | stats count() by @message'
```

**Connection Pooling:**
```bash
# Use connection pooling to reduce overhead
# Configure max connections in RDS
aws rds modify-db-parameter-group \
  --db-parameter-group-name webwaka-params \
  --parameters ParameterName=max_connections,ParameterValue=100,ApplyMethod=immediate
```

### Load Testing

```bash
# Run load tests before deployment
k6 run load-test.js

# Monitor performance metrics
# - Response time
# - Throughput
# - Error rate
# - Resource utilization
```

---

## Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor CloudWatch dashboards
- Check alert notifications
- Review error logs

**Weekly:**
- Review deployment history
- Check security scan results
- Analyze performance metrics

**Monthly:**
- Update dependencies
- Review and update documentation
- Test disaster recovery procedures
- Rotate credentials

**Quarterly:**
- Security audit
- Performance optimization review
- Capacity planning
- Cost optimization

### Patching and Updates

**Application Updates:**
```bash
# Update dependencies
npm update
pnpm update

# Test updates
npm test

# Deploy to staging first
git push origin staging

# After staging validation, deploy to production
git push origin main
```

**Infrastructure Updates:**
```bash
# Update Terraform modules
terraform get -update

# Plan changes
terraform plan -var-file=prod.tfvars

# Apply changes
terraform apply -var-file=prod.tfvars
```

**Security Patches:**
```bash
# Apply security patches immediately
# Update Docker base images
# Update dependencies with security vulnerabilities
# Deploy to production with priority
```

---

## FAQ

### Q: How do I deploy a hotfix to production?

**A:** Create a hotfix branch, make changes, create a PR, get approval, and merge to main:
```bash
git checkout -b hotfix/issue-name
# Make changes
git push origin hotfix/issue-name
# Create PR and get approval
git checkout main
git merge hotfix/issue-name
git push origin main
```

### Q: How do I rollback a failed deployment?

**A:** Use the rollback script or manually update the ECS service:
```bash
./scripts/rollback.sh production
# or manually
aws ecs update-service \
  --cluster webwaka-prod-cluster \
  --service webwaka-prod \
  --task-definition webwaka-app:PREVIOUS_VERSION \
  --force-new-deployment
```

### Q: How do I access application logs?

**A:** Use CloudWatch Logs:
```bash
aws logs tail /ecs/webwaka-app --follow
```

### Q: How do I scale the application?

**A:** Update the Auto Scaling Group:
```bash
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name webwaka-asg \
  --desired-capacity 5
```

### Q: How do I update secrets?

**A:** Use Secrets Manager:
```bash
aws secretsmanager update-secret \
  --secret-id webwaka/db-password \
  --secret-string "new-password"
```

### Q: How do I monitor deployments?

**A:** Use CloudWatch and ECS:
```bash
aws ecs describe-services \
  --cluster webwaka-prod-cluster \
  --services webwaka-prod

aws logs tail /ecs/webwaka-app --follow
```

### Q: What should I do if I see high error rates?

**A:** 
1. Check CloudWatch alarms
2. Review application logs
3. Check infrastructure metrics
4. Consider rollback if recent deployment
5. Contact on-call engineer

### Q: How often are backups taken?

**A:** Database backups are taken daily and retained for 30 days. Point-in-time recovery is available for 35 days.

### Q: How do I test a deployment without affecting production?

**A:** Deploy to the staging environment first:
```bash
git push origin staging
# Test thoroughly
# Then deploy to production
git push origin main
```

---

## Additional Resources

- [Deployment Infrastructure Specification](../specifications/DEPLOYMENT_INFRASTRUCTURE_SPECIFICATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Cloudflare Setup Guide](./CLOUDFLARE_SETUP.md)
- [Terraform Documentation](./terraform/)
- [GitHub Actions Workflows](../.github/workflows/)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Terraform Documentation](https://www.terraform.io/docs/)

---

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Author:** webwakaagent4 (Backend Engineering Lead)  
**Status:** COMPLETE AND APPROVED

