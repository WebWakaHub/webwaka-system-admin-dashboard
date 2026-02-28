# ============================================================================
# Secrets Manager Module — Centralized Secret Storage
# ============================================================================

# ── Database Credentials ─────────────────────────────────────────────────────

resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.project_name}/${var.environment}/db-credentials"
  description = "RDS PostgreSQL credentials for ${var.project_name}"

  tags = {
    Name = "${var.project_name}-${var.environment}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    host     = var.db_endpoint
    port     = 5432
    dbname   = var.db_name
    username = var.db_username
    password = var.db_password
    url      = "postgresql://${var.db_username}:${var.db_password}@${var.db_endpoint}/${var.db_name}"
  })
}

# ── API Keys (placeholder for future secrets) ───────────────────────────────

resource "aws_secretsmanager_secret" "api_keys" {
  name        = "${var.project_name}/${var.environment}/api-keys"
  description = "External API keys for ${var.project_name}"

  tags = {
    Name = "${var.project_name}-${var.environment}-api-keys"
  }
}

resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    paystack_secret_key    = "placeholder"
    flutterwave_secret_key = "placeholder"
    cloudflare_r2_token    = "placeholder"
  })
}

# ── Application Secrets ──────────────────────────────────────────────────────

resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "${var.project_name}/${var.environment}/app-secrets"
  description = "Application secrets for ${var.project_name}"

  tags = {
    Name = "${var.project_name}-${var.environment}-app-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    jwt_secret     = "placeholder-change-before-production"
    session_secret = "placeholder-change-before-production"
  })
}
