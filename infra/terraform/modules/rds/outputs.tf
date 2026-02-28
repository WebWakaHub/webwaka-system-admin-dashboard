output "db_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "db_password" {
  value     = random_password.db_password.result
  sensitive = true
}

output "db_instance_id" {
  value = aws_db_instance.main.identifier
}
