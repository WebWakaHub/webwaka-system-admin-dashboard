# Cloudflare Configuration (Terraform)

provider "cloudflare" {
  email   = "your-email@example.com"
  api_key = "your-api-key"
}

# DNS Record for Production
resource "cloudflare_record" "production" {
  zone_id = "your-zone-id"
  name    = "webwaka.com"
  value   = "your-aws-load-balancer-dns"
  type    = "CNAME"
  proxied = true
}

# CDN Settings
resource "cloudflare_zone_settings_override" "production" {
  zone_id = "your-zone-id"
  settings {
    ssl                             = "full"
    always_use_https                = "on"
    automatic_https_rewrites        = "on"
    min_tls_version                 = "1.2"
    security_level                  = "medium"
    brotli                          = "on"
    minify {
      css = "on"
      js  = "on"
      html = "on"
    }
    cache_level                     = "aggressive"
    browser_cache_ttl               = 14400
    always_online                   = "on"
    development_mode                = "off"
    rocket_loader                   = "off"
    email_obfuscation               = "on"
    server_side_exclude             = "on"
    hotlink_protection              = "off"
    ip_geolocation                  = "on"
    ipv6                            = "on"
    websockets                      = "on"
    pseudo_ipv4                     = "off"
    opportunistic_encryption        = "on"
    opportunistic_onion             = "on"
    automatic_platform_optimization = {
      enabled = true
    }
  }
}
