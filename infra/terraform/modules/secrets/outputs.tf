output "secret_arns" {
  value = {
    db_credentials = aws_secretsmanager_secret.db_credentials.arn
    api_keys       = aws_secretsmanager_secret.api_keys.arn
    app_secrets    = aws_secretsmanager_secret.app_secrets.arn
  }
}
