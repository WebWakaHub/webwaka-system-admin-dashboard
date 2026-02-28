# ============================================================================
# Cloudflare Configuration — DNS, WAF, R2, Pages
# ============================================================================

# ── DNS Zone ─────────────────────────────────────────────────────────────────

resource "cloudflare_zone" "main" {
  account_id = var.cloudflare_account_id
  zone       = var.domain_name
  plan       = "free"
}

# ── DNS Records ──────────────────────────────────────────────────────────────

# API subdomain → ALB (proxied through Cloudflare)
resource "cloudflare_record" "api" {
  zone_id = cloudflare_zone.main.id
  name    = "api"
  type    = "CNAME"
  content = module.alb.alb_dns_name
  proxied = true
  ttl     = 1  # Auto when proxied
}

# Root domain → Cloudflare Pages (for SAD frontend)
resource "cloudflare_record" "root" {
  zone_id = cloudflare_zone.main.id
  name    = "@"
  type    = "CNAME"
  content = "${var.project_name}-sad.pages.dev"
  proxied = true
  ttl     = 1
}

# WWW redirect to root
resource "cloudflare_record" "www" {
  zone_id = cloudflare_zone.main.id
  name    = "www"
  type    = "CNAME"
  content = var.domain_name
  proxied = true
  ttl     = 1
}

# ── SSL/TLS Settings ────────────────────────────────────────────────────────

resource "cloudflare_zone_settings_override" "main" {
  zone_id = cloudflare_zone.main.id

  settings {
    ssl                      = "full"
    always_use_https         = "on"
    min_tls_version          = "1.2"
    automatic_https_rewrites = "on"
    security_level           = "medium"
    browser_check            = "on"
    challenge_ttl            = 1800
    opportunistic_encryption = "on"
  }
}

# ── R2 Bucket ────────────────────────────────────────────────────────────────

resource "cloudflare_r2_bucket" "storage" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-storage"
  location   = "ENAM"  # Eastern North America (closest to us-east-1)
}

resource "cloudflare_r2_bucket" "backups" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-backups"
  location   = "ENAM"
}

# ── Cloudflare Pages Project ────────────────────────────────────────────────

resource "cloudflare_pages_project" "sad" {
  account_id        = var.cloudflare_account_id
  name              = "${var.project_name}-sad"
  production_branch = "main"

  build_config {
    build_command   = "pnpm build"
    destination_dir = "dist"
    root_dir        = "apps/sad"
  }

  deployment_configs {
    production {
      environment_variables = {
        NODE_VERSION = "22"
        PNPM_VERSION = "9"
      }
    }
    preview {
      environment_variables = {
        NODE_VERSION = "22"
        PNPM_VERSION = "9"
      }
    }
  }
}

# ── Outputs ──────────────────────────────────────────────────────────────────

output "cloudflare_zone_id" {
  description = "Cloudflare zone ID for webwaka.site"
  value       = cloudflare_zone.main.id
}

output "cloudflare_nameservers" {
  description = "Cloudflare nameservers (must be set at Namesilo)"
  value       = cloudflare_zone.main.name_servers
}

output "r2_storage_bucket" {
  description = "R2 storage bucket name"
  value       = cloudflare_r2_bucket.storage.name
}

output "pages_project_url" {
  description = "Cloudflare Pages project URL"
  value       = "${var.project_name}-sad.pages.dev"
}
