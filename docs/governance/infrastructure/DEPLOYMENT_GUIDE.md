# Deployment Infrastructure Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the WebWaka platform deployment infrastructure, including AWS resources, GitHub Actions workflows, and Cloudflare configuration.

## Architecture Overview

The deployment infrastructure consists of:

1. **GitHub:** Source control, CI/CD workflows, release management
2. **AWS:** Cloud infrastructure (VPC, EC2, RDS, S3, CloudFront)
3. **Cloudflare:** DNS, DDoS protection, WAF, CDN, SSL/TLS

## Prerequisites

### Required Tools

- AWS CLI (v2.x)
- Terraform (v1.0+)
- Git (v2.x)
- Docker (for local testing)
- kubectl (for Kubernetes, if applicable)

### Required Credentials

- AWS Account with appropriate IAM permissions
- GitHub Personal Access Token (PAT)
- Cloudflare API token
- Slack webhook URL (for notifications)

### AWS IAM Permissions

Minimum IAM permissions required:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "rds:*",
        "s3:*",
        "cloudfront:*",
        "cloudwatch:*",
        "logs:*",
        "sns:*",
        "iam:*",
        "acm:*",
        "elasticloadbalancing:*",
        "autoscaling:*",
        "secretsmanager:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## Implementation Steps

### Phase 1: Preparation (Week 44)

#### 1.1 Setup AWS Account

```bash
# Configure AWS CLI
aws configure

# Verify AWS credentials
aws sts get-caller-identity

# Create S3 bucket for Terraform state
aws s3 mb s3://webwaka-terraform-state --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket webwaka-terraform-state \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket webwaka-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table for Terraform locks
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

#### 1.2 Setup GitHub Repository

```bash
# Clone repository
git clone https://github.com/WebWakaHub/webwaka-platform.git
cd webwaka-platform

# Create GitHub Actions secrets
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ROLE_TO_ASSUME --body "arn:aws:iam::123456789012:role/GitHubActionsRole"
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/services/..."
gh secret set SONAR_TOKEN --body "sonar-token-here"
gh secret set SNYK_TOKEN --body "snyk-token-here"
```

#### 1.3 Setup Cloudflare

```bash
# Get Cloudflare API token and Zone ID
# Store in environment variables or Terraform variables file

export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ZONE_ID="your-zone-id"
```

### Phase 2: AWS Infrastructure Setup (Week 45)

#### 2.1 Initialize Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive
```

#### 2.2 Plan Infrastructure

```bash
# Plan for production environment
terraform plan -var-file=prod.tfvars -out=tfplan.prod

# Review plan
terraform show tfplan.prod

# Plan for staging environment
terraform plan -var-file=staging.tfvars -out=tfplan.staging

# Plan for development environment
terraform plan -var-file=dev.tfvars -out=tfplan.dev
```

#### 2.3 Deploy Infrastructure

```bash
# Deploy production infrastructure
terraform apply tfplan.prod

# Deploy staging infrastructure
terraform apply tfplan.staging

# Deploy development infrastructure
terraform apply tfplan.dev

# Save outputs
terraform output > outputs.json
```

#### 2.4 Verify AWS Resources

```bash
# Check VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=webwaka-vpc"

# Check EC2 instances
aws ec2 describe-instances --filters "Name=tag:Name,Values=webwaka-instance"

# Check RDS instance
aws rds describe-db-instances --db-instance-identifier webwaka-db

# Check ALB
aws elbv2 describe-load-balancers --names webwaka-alb

# Check S3 buckets
aws s3 ls | grep webwaka
```

### Phase 3: Cloudflare Configuration (Week 46)

#### 3.1 Deploy Cloudflare Configuration

```bash
cd infrastructure/terraform

# Create Cloudflare variables file
cat > cloudflare.tfvars << EOF
cloudflare_api_token = "$CLOUDFLARE_API_TOKEN"
cloudflare_zone_id   = "$CLOUDFLARE_ZONE_ID"
domain_name          = "webwaka.com"
EOF

# Plan Cloudflare configuration
terraform plan -var-file=cloudflare.tfvars -out=tfplan.cloudflare

# Apply Cloudflare configuration
terraform apply tfplan.cloudflare
```

#### 3.2 Update DNS Nameservers

1. Log in to domain registrar
2. Update nameservers to Cloudflare nameservers
3. Wait for DNS propagation (24-48 hours)

#### 3.3 Verify Cloudflare Configuration

```bash
# Check DNS resolution
nslookup api.webwaka.com
nslookup cdn.webwaka.com

# Test HTTPS
curl -I https://api.webwaka.com/health

# Check WAF is active
curl -I https://api.webwaka.com/api/test?id=1' OR '1'='1
```

### Phase 4: GitHub Actions Setup (Week 46)

#### 4.1 Configure GitHub Actions Secrets

```bash
# AWS credentials for GitHub Actions
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set AWS_ROLE_TO_ASSUME --body "arn:aws:iam::123456789012:role/GitHubActionsRole"

# Slack webhook for notifications
gh secret set SLACK_WEBHOOK --body "https://hooks.slack.com/services/..."

# Security scanning tokens
gh secret set SONAR_TOKEN --body "sonar-token-here"
gh secret set SNYK_TOKEN --body "snyk-token-here"

# Container registry credentials
gh secret set ECR_REGISTRY --body "123456789012.dkr.ecr.us-east-1.amazonaws.com"
```

#### 4.2 Create GitHub Actions IAM Role

```bash
# Create IAM role for GitHub Actions
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:WebWakaHub/webwaka-platform:*"
        }
      }
    }]
  }'

# Attach policies to role
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
```

#### 4.3 Test GitHub Actions Workflows

```bash
# Push to feature branch to trigger CI
git checkout -b feature/test-ci
git push origin feature/test-ci

# Create pull request
gh pr create --title "Test CI workflow" --body "Testing GitHub Actions CI workflow"

# Monitor workflow
gh run list --workflow=ci.yml

# View workflow logs
gh run view <run-id> --log
```

### Phase 5: End-to-End Testing (Week 47)

#### 5.1 Test Deployment Pipeline

```bash
# Deploy to staging
git push origin staging

# Monitor deployment
gh run list --workflow=cd.yml

# Test API endpoint
curl -I https://staging-api.webwaka.com/health

# Run smoke tests
./tests/smoke-tests.sh https://staging-api.webwaka.com
```

#### 5.2 Test Disaster Recovery

```bash
# Backup database
aws rds create-db-snapshot \
  --db-instance-identifier webwaka-db \
  --db-snapshot-identifier webwaka-db-backup-$(date +%Y%m%d)

# Test restore
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier webwaka-db-restore \
  --db-snapshot-identifier webwaka-db-backup-20240210

# Verify restored database
aws rds describe-db-instances --db-instance-identifier webwaka-db-restore
```

#### 5.3 Test Failover

```bash
# Simulate AZ failure
# Monitor ALB target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/webwaka-tg/...

# Verify traffic switches to healthy instances
curl -I https://api.webwaka.com/health
```

#### 5.4 Performance Testing

```bash
# Run k6 load test
k6 run tests/performance/load-test.js

# Monitor CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --start-time 2024-02-10T00:00:00Z \
  --end-time 2024-02-10T01:00:00Z \
  --period 300 \
  --statistics Average
```

## Monitoring & Maintenance

### Daily Tasks

- Check CloudWatch dashboards
- Review CloudFront cache hit rates
- Monitor API response times
- Check security alerts

### Weekly Tasks

- Review CloudWatch logs
- Analyze performance metrics
- Review security events
- Check backup status

### Monthly Tasks

- Disaster recovery testing
- Security audit
- Cost optimization review
- Capacity planning

## Troubleshooting

### Common Issues

**Issue: Terraform state lock**
```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

**Issue: ALB unhealthy targets**
```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>

# Check EC2 instance logs
aws ec2 get-console-output --instance-id <instance-id>
```

**Issue: RDS connection failures**
```bash
# Check security group
aws ec2 describe-security-groups \
  --group-ids <security-group-id>

# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier webwaka-db
```

## Cost Optimization

1. Use Reserved Instances for production
2. Implement auto-scaling based on metrics
3. Use S3 Intelligent-Tiering for storage
4. Enable CloudFront caching
5. Monitor and optimize database queries

## Security Hardening

1. Enable VPC Flow Logs
2. Use Secrets Manager for credentials
3. Enable CloudTrail for audit logging
4. Implement least privilege IAM policies
5. Enable MFA for AWS console access

## References

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Cloudflare API Reference](https://api.cloudflare.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
