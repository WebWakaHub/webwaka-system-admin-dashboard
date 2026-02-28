#!/bin/bash

# Health check script for WebWaka Platform
# Usage: ./scripts/health-check.sh [environment]

ENVIRONMENT=${1:-staging}
AWS_REGION=${AWS_REGION:-us-east-1}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: ./scripts/health-check.sh [dev|staging|prod]"
    exit 1
fi

log_info "Checking health of WebWaka Platform in $ENVIRONMENT environment"

# Determine endpoint based on environment
case $ENVIRONMENT in
    prod)
        ENDPOINT="https://api.webwaka.com"
        ECS_CLUSTER="webwaka-prod-cluster"
        ECS_SERVICE="webwaka-prod"
        ;;
    staging)
        ENDPOINT="https://staging-api.webwaka.com"
        ECS_CLUSTER="webwaka-staging-cluster"
        ECS_SERVICE="webwaka-staging"
        ;;
    dev)
        ENDPOINT="http://localhost:3000"
        ECS_CLUSTER="webwaka-dev-cluster"
        ECS_SERVICE="webwaka-dev"
        ;;
esac

# Step 1: Check ECS service health
log_info "Checking ECS service health..."
RUNNING_COUNT=$(aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].runningCount' \
    --output text 2>/dev/null || echo "0")

DESIRED_COUNT=$(aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].desiredCount' \
    --output text 2>/dev/null || echo "0")

log_info "ECS Service: Running tasks: $RUNNING_COUNT / $DESIRED_COUNT"

if [ "$RUNNING_COUNT" -ne "$DESIRED_COUNT" ]; then
    log_warn "Not all tasks are running"
fi

# Step 2: Check ALB target health
log_info "Checking ALB target health..."
HEALTHY_TARGETS=$(aws elbv2 describe-target-health \
    --target-group-arn "arn:aws:elasticloadbalancing:${AWS_REGION}:$(aws sts get-caller-identity --query Account --output text):targetgroup/webwaka-tg/*" \
    --region $AWS_REGION \
    --query 'TargetHealthDescriptions[?TargetHealth.State==`healthy`] | length(@)' \
    --output text 2>/dev/null || echo "0")

TOTAL_TARGETS=$(aws elbv2 describe-target-health \
    --target-group-arn "arn:aws:elasticloadbalancing:${AWS_REGION}:$(aws sts get-caller-identity --query Account --output text):targetgroup/webwaka-tg/*" \
    --region $AWS_REGION \
    --query 'TargetHealthDescriptions | length(@)' \
    --output text 2>/dev/null || echo "0")

log_info "ALB Targets: Healthy targets: $HEALTHY_TARGETS / $TOTAL_TARGETS"

if [ "$HEALTHY_TARGETS" -eq "0" ]; then
    log_error "No healthy targets"
    exit 1
fi

# Step 3: Check API endpoint
if [ "$ENVIRONMENT" != "dev" ]; then
    log_info "Checking API endpoint: $ENDPOINT/health"
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT/health" 2>/dev/null || echo "000")
    
    if [ "$RESPONSE" = "200" ]; then
        log_info "API endpoint is healthy (HTTP $RESPONSE)"
    else
        log_warn "API endpoint returned HTTP $RESPONSE"
    fi
fi

# Step 4: Check RDS database
log_info "Checking RDS database..."
DB_STATUS=$(aws rds describe-db-instances \
    --db-instance-identifier webwaka-db \
    --region $AWS_REGION \
    --query 'DBInstances[0].DBInstanceStatus' \
    --output text 2>/dev/null || echo "unknown")

log_info "RDS Database Status: $DB_STATUS"

if [ "$DB_STATUS" != "available" ]; then
    log_warn "Database is not available"
fi

# Step 5: Check CloudFront
log_info "Checking CloudFront distribution..."
CF_STATUS=$(aws cloudfront list-distributions \
    --region $AWS_REGION \
    --query 'DistributionList.Items[?Comment==`WebWaka CDN`].Status' \
    --output text 2>/dev/null || echo "unknown")

log_info "CloudFront Status: $CF_STATUS"

# Summary
log_info "Health check completed"
log_info "Summary:"
log_info "  - ECS Service: $RUNNING_COUNT/$DESIRED_COUNT tasks running"
log_info "  - ALB Targets: $HEALTHY_TARGETS/$TOTAL_TARGETS healthy"
log_info "  - RDS Database: $DB_STATUS"
log_info "  - CloudFront: $CF_STATUS"

exit 0
