#!/bin/bash

# Register ECS Task Definitions
# This script registers the API and Worker task definitions with AWS ECS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${YELLOW}Registering ECS Task Definitions${NC}"
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"
echo ""

# Function to register task definition
register_task_definition() {
  local task_def_file=$1
  local task_def_name=$2
  
  echo -e "${YELLOW}Registering: $task_def_name${NC}"
  
  # Replace ACCOUNT_ID placeholder with actual AWS account ID
  sed "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" "$task_def_file" > "/tmp/$task_def_name-temp.json"
  
  # Register the task definition
  aws ecs register-task-definition \
    --cli-input-json file:///tmp/$task_def_name-temp.json \
    --region "$AWS_REGION" > /dev/null
  
  # Clean up temp file
  rm "/tmp/$task_def_name-temp.json"
  
  echo -e "${GREEN}✓ Registered: $task_def_name${NC}"
}

# Register task definitions
register_task_definition "task-definition-api.json" "webwaka-production-api"
register_task_definition "task-definition-worker.json" "webwaka-production-worker"

echo ""
echo -e "${GREEN}All task definitions registered successfully!${NC}"
