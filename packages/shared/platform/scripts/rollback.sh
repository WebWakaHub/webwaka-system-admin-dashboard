#!/bin/bash

set -e

# Rollback script for WebWaka Platform
# Usage: ./scripts/rollback.sh [environment]

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
    echo "Usage: ./scripts/rollback.sh [dev|staging|prod]"
    exit 1
fi

log_info "Rolling back WebWaka Platform in $ENVIRONMENT environment"

# Determine ECS cluster and service based on environment
case $ENVIRONMENT in
    prod)
        ECS_CLUSTER="webwaka-prod-cluster"
        ECS_SERVICE="webwaka-prod"
        ;;
    staging)
        ECS_CLUSTER="webwaka-staging-cluster"
        ECS_SERVICE="webwaka-staging"
        ;;
    dev)
        ECS_CLUSTER="webwaka-dev-cluster"
        ECS_SERVICE="webwaka-dev"
        ;;
esac

# Step 1: Get current task definition
log_info "Getting current task definition..."
CURRENT_TASK_DEF=$(aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].taskDefinition' \
    --output text)

log_info "Current task definition: $CURRENT_TASK_DEF"

# Step 2: Get previous task definition
log_info "Getting previous task definition..."
TASK_FAMILY=$(echo $CURRENT_TASK_DEF | cut -d: -f6 | cut -d/ -f2)
CURRENT_REVISION=$(echo $CURRENT_TASK_DEF | cut -d: -f7)
PREVIOUS_REVISION=$((CURRENT_REVISION - 1))

if [ $PREVIOUS_REVISION -lt 1 ]; then
    log_error "No previous task definition available"
    exit 1
fi

PREVIOUS_TASK_DEF="${TASK_FAMILY}:${PREVIOUS_REVISION}"

log_info "Previous task definition: $PREVIOUS_TASK_DEF"

# Step 3: Verify previous task definition exists
log_info "Verifying previous task definition..."
aws ecs describe-task-definition \
    --task-definition $PREVIOUS_TASK_DEF \
    --region $AWS_REGION > /dev/null

if [ $? -ne 0 ]; then
    log_error "Previous task definition not found"
    exit 1
fi

log_info "Previous task definition verified"

# Step 4: Update ECS service with previous task definition
log_info "Rolling back to previous task definition..."
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --task-definition $PREVIOUS_TASK_DEF \
    --region $AWS_REGION \
    --force-new-deployment

if [ $? -ne 0 ]; then
    log_error "Failed to rollback ECS service"
    exit 1
fi

log_info "ECS service rollback initiated"

# Step 5: Wait for rollback to stabilize
log_info "Waiting for rollback to stabilize..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION

if [ $? -ne 0 ]; then
    log_warn "Rollback did not stabilize within timeout"
else
    log_info "Rollback stabilized successfully"
fi

# Step 6: Verify rollback
log_info "Verifying rollback..."
RUNNING_COUNT=$(aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].runningCount' \
    --output text)

DESIRED_COUNT=$(aws ecs describe-services \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION \
    --query 'services[0].desiredCount' \
    --output text)

log_info "Running tasks: $RUNNING_COUNT / $DESIRED_COUNT"

if [ "$RUNNING_COUNT" -eq "$DESIRED_COUNT" ]; then
    log_info "Rollback completed successfully!"
    exit 0
else
    log_warn "Rollback in progress. Running tasks: $RUNNING_COUNT / $DESIRED_COUNT"
    exit 0
fi
