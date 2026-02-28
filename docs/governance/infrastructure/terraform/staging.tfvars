# Staging Environment Variables

environment         = "staging"
aws_region          = "us-east-1"
project_name        = "webwaka"
vpc_cidr            = "10.1.0.0/16"
availability_zones  = ["us-east-1a", "us-east-1b"]

instance_type       = "t3.medium"
min_instances       = 1
max_instances       = 5

db_instance_class   = "db.t3.small"
db_allocated_storage = 50
db_backup_retention_days = 7
enable_multi_az     = false

tags = {
  Environment = "staging"
  Project     = "WebWaka"
  ManagedBy   = "Terraform"
  CostCenter  = "Engineering"
}
