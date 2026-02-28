# ============================================================================
# WebWaka System Admin Dashboard — Main Terraform Configuration
# ============================================================================
# FND-04: Cloud Infrastructure Provisioning
# Provisions: VPC, ECS Fargate, RDS PostgreSQL, ECR, ALB, EventBridge, SQS,
#             Secrets Manager, IAM, CloudWatch
# ============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  # Remote state in S3 (will be created manually first)
  backend "s3" {
    bucket         = "webwaka-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "webwaka-terraform-locks"
  }
}

# ============================================================================
# Providers
# ============================================================================

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "webwaka"
      Environment = var.environment
      ManagedBy   = "terraform"
      Component   = "system-admin-dashboard"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ============================================================================
# Data Sources
# ============================================================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ============================================================================
# Modules
# ============================================================================

module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
}

module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  account_id   = data.aws_caller_identity.current.account_id
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
  repositories = var.ecr_repositories
}

module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  certificate_arn   = var.acm_certificate_arn
}

module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  ecs_security_group = module.ecs.ecs_security_group_id
  instance_class     = var.rds_instance_class
  db_name            = var.db_name
  db_username        = var.db_username
}

module "ecs" {
  source = "./modules/ecs"

  project_name             = var.project_name
  environment              = var.environment
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  alb_security_group_id    = module.alb.alb_security_group_id
  alb_target_group_arn     = module.alb.target_group_arn
  ecs_task_execution_role  = module.iam.ecs_task_execution_role_arn
  ecs_task_role            = module.iam.ecs_task_role_arn
  ecr_repository_url       = module.ecr.repository_urls["api"]
  aws_region               = var.aws_region
}

module "eventbridge" {
  source = "./modules/eventbridge"

  project_name = var.project_name
  environment  = var.environment
}

module "sqs" {
  source = "./modules/sqs"

  project_name = var.project_name
  environment  = var.environment
}

module "secrets" {
  source = "./modules/secrets"

  project_name    = var.project_name
  environment     = var.environment
  db_endpoint     = module.rds.db_endpoint
  db_name         = var.db_name
  db_username     = var.db_username
  db_password     = module.rds.db_password
}
