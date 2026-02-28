#!/bin/bash

set -e

# Deployment script for WebWaka Platform
# Usage: ./scripts/deploy.sh [environment] [version]

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
ECR_REPOSITORY="webwaka-platform"

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
    echo "Usage: ./scripts/deploy.sh [dev|staging|prod] [version]"
    exit 1
fi

log_info "Deploying WebWaka Platform to $ENVIRONMENT environment"
log_info "Version: $VERSION"
log_info "AWS Account: $AWS_ACCOUNT_ID"
log_info "AWS Region: $AWS_REGION"

# Step 1: Build Docker image
log_info "Building Docker image..."
docker build -t "${ECR_REGISTRY}/${ECR_REPOSITORY}:${VERSION}" \
             -t "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest" .

if [ $? -ne 0 ]; then
    log_error "Docker build failed"
    exit 1
fi

log_info "Docker image built successfully"

# Step 2: Login to ECR
log_info "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY

if [ $? -ne 0 ]; then
    log_error "ECR login failed"
    exit 1
fi

log_info "ECR login successful"

# Step 3: Push image to ECR
log_info "Pushing Docker image to ECR..."
docker push "${ECR_REGISTRY}/${ECR_REPOSITORY}:${VERSION}"
docker push "${ECR_REGISTRY}/${ECR_REPOSITORY}:latest"

if [ $? -ne 0 ]; then
    log_error "Docker push failed"
    exit 1
fi

log_info "Docker image pushed successfully"

# Step 4: Update ECS task definition
log_info "Updating ECS task definition..."

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

# Get current task definition
TASK_DEF=$(aws ecs describe-task-definition \
    --task-definition webwaka-app \
    --region $AWS_REGION \
    --query 'taskDefinition' \
    --output json)

# Update image in task definition
UPDATED_TASK_DEF=$(echo $TASK_DEF | \
    jq ".containerDefinitions[0].image = \"${ECR_REGISTRY}/${ECR_REPOSITORY}:${VERSION}\"" | \
    jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

# Register new task definition
NEW_TASK_DEF=$(aws ecs register-task-definition \
    --cli-input-json "$(echo $UPDATED_TASK_DEF)" \
    --region $AWS_REGION \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

if [ -z "$NEW_TASK_DEF" ]; then
    log_error "Failed to register new task definition"
    exit 1
fi

log_info "New task definition registered: $NEW_TASK_DEF"

# Step 5: Update ECS service
log_info "Updating ECS service..."
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --task-definition $NEW_TASK_DEF \
    --region $AWS_REGION \
    --force-new-deployment

if [ $? -ne 0 ]; then
    log_error "Failed to update ECS service"
    exit 1
fi

log_info "ECS service updated successfully"

# Step 6: Wait for deployment to stabilize
log_info "Waiting for deployment to stabilize..."
aws ecs wait services-stable \
    --cluster $ECS_CLUSTER \
    --services $ECS_SERVICE \
    --region $AWS_REGION

if [ $? -ne 0 ]; then
    log_warn "Deployment did not stabilize within timeout"
else
    log_info "Deployment stabilized successfully"
fi

# Step 7: Verify deployment
log_info "Verifying deployment..."
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
    log_info "Deployment completed successfully!"
    exit 0
else
    log_warn "Deployment in progress. Running tasks: $RUNNING_COUNT / $DESIRED_COUNT"
    exit 0
fi
