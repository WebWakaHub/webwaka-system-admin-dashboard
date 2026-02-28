# ============================================================================
# WebWaka Terraform Outputs
# ============================================================================

# ── VPC ──────────────────────────────────────────────────────────────────────

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

# ── ECS ──────────────────────────────────────────────────────────────────────

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.ecs.cluster_arn
}

# ── RDS ──────────────────────────────────────────────────────────────────────

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}

# ── ALB ──────────────────────────────────────────────────────────────────────

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.alb.alb_zone_id
}

# ── ECR ──────────────────────────────────────────────────────────────────────

output "ecr_repository_urls" {
  description = "URLs of the ECR repositories"
  value       = module.ecr.repository_urls
}

# ── EventBridge ──────────────────────────────────────────────────────────────

output "eventbridge_bus_arn" {
  description = "ARN of the EventBridge event bus"
  value       = module.eventbridge.event_bus_arn
}

# ── SQS ──────────────────────────────────────────────────────────────────────

output "sqs_queue_urls" {
  description = "URLs of the SQS queues"
  value       = module.sqs.queue_urls
}

# ── Secrets ──────────────────────────────────────────────────────────────────

output "secrets_arns" {
  description = "ARNs of the Secrets Manager secrets"
  value       = module.secrets.secret_arns
  sensitive   = true
}
