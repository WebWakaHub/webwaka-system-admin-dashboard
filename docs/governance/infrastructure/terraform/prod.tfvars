# Production Environment Variables

environment         = "prod"
aws_region          = "us-east-1"
project_name        = "webwaka"
vpc_cidr            = "10.0.0.0/16"
availability_zones  = ["us-east-1a", "us-east-1b"]

instance_type       = "t3.large"
min_instances       = 2
max_instances       = 10

db_instance_class   = "db.t3.medium"
db_allocated_storage = 100
db_backup_retention_days = 30
enable_multi_az     = true

tags = {
  Environment = "production"
  Project     = "WebWaka"
  ManagedBy   = "Terraform"
  CostCenter  = "Engineering"
}
