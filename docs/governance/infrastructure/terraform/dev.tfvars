# Development Environment Variables

environment         = "dev"
aws_region          = "us-east-1"
project_name        = "webwaka"
vpc_cidr            = "10.2.0.0/16"
availability_zones  = ["us-east-1a"]

instance_type       = "t3.small"
min_instances       = 1
max_instances       = 2

db_instance_class   = "db.t3.micro"
db_allocated_storage = 20
db_backup_retention_days = 1
enable_multi_az     = false

tags = {
  Environment = "development"
  Project     = "WebWaka"
  ManagedBy   = "Terraform"
  CostCenter  = "Engineering"
}
