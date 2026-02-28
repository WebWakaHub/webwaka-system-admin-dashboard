# ============================================================================
# WebWaka Terraform Variables
# ============================================================================

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "webwaka"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

# ── VPC ──────────────────────────────────────────────────────────────────────

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ── RDS ──────────────────────────────────────────────────────────────────────

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_name" {
  description = "Name of the default database"
  type        = string
  default     = "webwaka"
}

variable "db_username" {
  description = "Master username for the RDS instance"
  type        = string
  default     = "webwaka_admin"
}

# ── ECR ──────────────────────────────────────────────────────────────────────

variable "ecr_repositories" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default = [
    "api",
    "web",
    "worker",
    "migration"
  ]
}

# ── ACM ──────────────────────────────────────────────────────────────────────

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS (created separately or via Cloudflare)"
  type        = string
  default     = ""
}

# ── Cloudflare ───────────────────────────────────────────────────────────────

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "webwaka.site"
}
