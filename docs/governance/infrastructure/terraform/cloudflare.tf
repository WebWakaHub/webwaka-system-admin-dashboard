# Cloudflare Configuration

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Variables for Cloudflare
variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "webwaka.com"
}

# DNS Record for ALB
resource "cloudflare_record" "alb" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  type    = "CNAME"
  value   = aws_lb.main.dns_name
  ttl     = 1  # Auto
  proxied = true

  comment = "API endpoint pointing to ALB"
}

# DNS Record for staging ALB
resource "cloudflare_record" "alb_staging" {
  zone_id = var.cloudflare_zone_id
  name    = "staging-api"
  type    = "CNAME"
  value   = "staging-alb.webwaka.com"  # Placeholder
  ttl     = 1  # Auto
  proxied = true

  comment = "Staging API endpoint"
}

# DNS Record for CloudFront
resource "cloudflare_record" "cdn" {
  zone_id = var.cloudflare_zone_id
  name    = "cdn"
  type    = "CNAME"
  value   = aws_cloudfront_distribution.assets.domain_name
  ttl     = 1  # Auto
  proxied = false

  comment = "CDN endpoint pointing to CloudFront"
}

# Page Rule for API caching
resource "cloudflare_page_rule" "api_cache" {
  zone_id = var.cloudflare_zone_id
  target  = "api.webwaka.com/api/*"
  priority = 1

  actions {
    cache_level = "Cache Everything"
    edge_cache_ttl = 300
    browser_cache_ttl = 0
  }
}

# Page Rule for static assets caching
resource "cloudflare_page_rule" "static_cache" {
  zone_id = var.cloudflare_zone_id
  target  = "cdn.webwaka.com/*"
  priority = 2

  actions {
    cache_level = "Cache Everything"
    edge_cache_ttl = 31536000  # 1 year
    browser_cache_ttl = 31536000
  }
}

# WAF Rule - Block common attacks
resource "cloudflare_waf_rule" "owasp_crs" {
  zone_id  = var.cloudflare_zone_id
  group_id = "62d9e8996d4981a27d0da954"  # OWASP ModSecurity Core Rule Set
  mode     = "challenge"
}

# WAF Rule - Block SQL injection
resource "cloudflare_waf_rule" "sql_injection" {
  zone_id  = var.cloudflare_zone_id
  group_id = "62d9e8996d4981a27d0da955"  # SQL Injection
  mode     = "block"
}

# WAF Rule - Block XSS
resource "cloudflare_waf_rule" "xss" {
  zone_id  = var.cloudflare_zone_id
  group_id = "62d9e8996d4981a27d0da956"  # XSS
  mode     = "block"
}

# Rate Limiting Rule
resource "cloudflare_rate_limit" "api_limit" {
  zone_id = var.cloudflare_zone_id
  disabled = false
  threshold = 100
  period = 60
  match {
    request {
      url {
        path {
          matches = "api/*"
        }
      }
    }
  }
  action {
    mode = "challenge"
  }
  description = "Rate limit for API endpoints"
}

# DDoS Protection Rule
resource "cloudflare_firewall_rule" "ddos_protection" {
  zone_id = var.cloudflare_zone_id
  description = "DDoS protection rule"
  filter_id = cloudflare_firewall_filter.ddos.id
  action = "challenge"
}

resource "cloudflare_firewall_filter" "ddos" {
  zone_id = var.cloudflare_zone_id
  description = "DDoS filter"
  expression = "(cf.threat_score > 50)"
}

# SSL/TLS Settings
resource "cloudflare_zone_settings_override" "ssl" {
  zone_id = var.cloudflare_zone_id

  settings {
    ssl = "full"
    min_tls_version = "1.2"
    tls_1_3 = "on"
    automatic_https_rewrites = "on"
    always_use_https = "on"
  }
}

# Security Settings
resource "cloudflare_zone_settings_override" "security" {
  zone_id = var.cloudflare_zone_id

  settings {
    security_level = "high"
    challenge_ttl = 1800
    browser_check = "on"
    hotlink_protection = "on"
  }
}

# Performance Settings
resource "cloudflare_zone_settings_override" "performance" {
  zone_id = var.cloudflare_zone_id

  settings {
    minify {
      css = "on"
      html = "on"
      js = "on"
    }
    rocket_loader = "on"
    brotli = "on"
    image_resizing = "on"
  }
}

# Caching Settings
resource "cloudflare_zone_settings_override" "caching" {
  zone_id = var.cloudflare_zone_id

  settings {
    cache_level = "aggressive"
    browser_cache_ttl = 1800
    cache_on_cookie = "session_id"
  }
}

# Outputs
output "cloudflare_nameservers" {
  value       = cloudflare_record.alb.*.name
  description = "Cloudflare nameservers"
}

output "api_endpoint" {
  value       = "https://${cloudflare_record.alb.name}.${var.domain_name}"
  description = "API endpoint URL"
}

output "cdn_endpoint" {
  value       = "https://${cloudflare_record.cdn.name}.${var.domain_name}"
  description = "CDN endpoint URL"
}
