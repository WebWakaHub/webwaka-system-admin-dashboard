# Cloudflare Configuration Guide

## Overview

This document describes the Cloudflare configuration for the WebWaka platform deployment infrastructure. Cloudflare provides DNS management, DDoS protection, WAF (Web Application Firewall), SSL/TLS encryption, and CDN services.

## Prerequisites

1. Cloudflare account with a registered domain
2. Cloudflare API token with appropriate permissions
3. Zone ID for your domain
4. AWS infrastructure deployed (ALB, CloudFront)

## Configuration Components

### 1. DNS Records

**API Endpoint:**
- Name: `api.webwaka.com`
- Type: CNAME
- Value: ALB DNS name (from AWS)
- Proxied: Yes (Cloudflare proxy enabled)
- Purpose: Routes API traffic through Cloudflare for DDoS protection and WAF

**Staging API Endpoint:**
- Name: `staging-api.webwaka.com`
- Type: CNAME
- Value: Staging ALB DNS name
- Proxied: Yes
- Purpose: Routes staging API traffic through Cloudflare

**CDN Endpoint:**
- Name: `cdn.webwaka.com`
- Type: CNAME
- Value: CloudFront domain name
- Proxied: No (DNS only)
- Purpose: Routes static assets through CloudFront CDN

### 2. Caching Rules

**API Caching:**
- Target: `api.webwaka.com/api/*`
- Cache Level: Cache Everything
- Edge Cache TTL: 300 seconds (5 minutes)
- Browser Cache TTL: 0 (no caching)
- Purpose: Cache API responses at Cloudflare edge for performance

**Static Assets Caching:**
- Target: `cdn.webwaka.com/*`
- Cache Level: Cache Everything
- Edge Cache TTL: 31536000 seconds (1 year)
- Browser Cache TTL: 31536000 seconds (1 year)
- Purpose: Cache static assets for long periods

### 3. Web Application Firewall (WAF)

**OWASP ModSecurity Core Rule Set:**
- Mode: Challenge
- Purpose: Protects against common web attacks (OWASP Top 10)

**SQL Injection Protection:**
- Mode: Block
- Purpose: Blocks SQL injection attempts

**XSS (Cross-Site Scripting) Protection:**
- Mode: Block
- Purpose: Blocks XSS attacks

### 4. Rate Limiting

**API Rate Limiting:**
- Target: `api.webwaka.com/api/*`
- Threshold: 100 requests per 60 seconds
- Action: Challenge (CAPTCHA)
- Purpose: Prevents abuse and brute force attacks

### 5. DDoS Protection

**DDoS Protection Rule:**
- Condition: Threat score > 50
- Action: Challenge (CAPTCHA)
- Purpose: Protects against DDoS attacks

### 6. SSL/TLS Configuration

**SSL Mode:** Full (Strict)
- Encrypts traffic between client and Cloudflare
- Encrypts traffic between Cloudflare and origin (ALB)

**Minimum TLS Version:** 1.2
- Ensures secure connections

**TLS 1.3:** Enabled
- Latest TLS protocol for enhanced security

**Automatic HTTPS Rewrites:** Enabled
- Automatically rewrites HTTP to HTTPS

**Always Use HTTPS:** Enabled
- Forces all connections to use HTTPS

### 7. Security Settings

**Security Level:** High
- Increased protection against threats

**Challenge TTL:** 1800 seconds (30 minutes)
- How long a visitor is remembered after passing a challenge

**Browser Check:** Enabled
- Checks if visitor's browser is supported

**Hotlink Protection:** Enabled
- Prevents direct linking to images and other resources

### 8. Performance Settings

**Minification:**
- CSS: Enabled
- HTML: Enabled
- JavaScript: Enabled
- Purpose: Reduces file sizes for faster loading

**Rocket Loader:** Enabled
- Optimizes JavaScript loading for better performance

**Brotli Compression:** Enabled
- Modern compression algorithm for better compression than gzip

**Image Resizing:** Enabled
- Automatically resizes images for different devices

### 9. Caching Settings

**Cache Level:** Aggressive
- Caches more content at Cloudflare edge

**Browser Cache TTL:** 1800 seconds (30 minutes)
- How long browsers cache content

**Cache on Cookie:** session_id
- Caches content based on session_id cookie

## Setup Instructions

### Step 1: Create Cloudflare API Token

1. Log in to Cloudflare dashboard
2. Go to Account Settings → API Tokens
3. Click "Create Token"
4. Select "Custom token" template
5. Grant permissions:
   - Zone.Zone (Read)
   - Zone.DNS (Edit)
   - Zone.Firewall (Edit)
   - Zone.Page Rules (Edit)
   - Zone.WAF (Edit)
6. Select your zone
7. Create token and save securely

### Step 2: Get Zone ID

1. Log in to Cloudflare dashboard
2. Select your domain
3. Copy Zone ID from the right sidebar

### Step 3: Configure Terraform Variables

Create a `cloudflare.tfvars` file:

```hcl
cloudflare_api_token = "your-api-token"
cloudflare_zone_id   = "your-zone-id"
domain_name          = "webwaka.com"
```

### Step 4: Deploy Cloudflare Configuration

```bash
cd infrastructure/terraform
terraform apply -var-file=cloudflare.tfvars
```

### Step 5: Update DNS Nameservers

1. Go to your domain registrar
2. Update nameservers to Cloudflare nameservers:
   - ns1.cloudflare.com
   - ns2.cloudflare.com
   - ns3.cloudflare.com
   - ns4.cloudflare.com

3. Wait for DNS propagation (typically 24-48 hours)

### Step 6: Verify Configuration

```bash
# Check DNS resolution
nslookup api.webwaka.com
nslookup cdn.webwaka.com

# Test HTTPS
curl -I https://api.webwaka.com/health

# Check WAF is active
curl -I https://api.webwaka.com/api/test?id=1' OR '1'='1
```

## Monitoring

### Cloudflare Analytics

1. Log in to Cloudflare dashboard
2. Select your domain
3. View analytics for:
   - Requests and bandwidth
   - Cache performance
   - Security events
   - DDoS attacks blocked
   - WAF events

### CloudWatch Integration

Monitor Cloudflare metrics in CloudWatch:
- API response times
- Cache hit rates
- Security events
- DDoS attack frequency

## Troubleshooting

### DNS Not Resolving

- Check nameservers are correctly configured
- Wait for DNS propagation (up to 48 hours)
- Use `dig` or `nslookup` to verify

### HTTPS Certificate Issues

- Ensure SSL mode is set to "Full" or "Full (Strict)"
- Check ACM certificate is valid in AWS
- Verify certificate covers your domain

### Performance Issues

- Check cache hit rate in Cloudflare analytics
- Verify page rules are configured correctly
- Review minification and compression settings

### WAF False Positives

- Review WAF events in Cloudflare dashboard
- Whitelist legitimate traffic if needed
- Adjust WAF sensitivity if necessary

## Best Practices

1. **Regular Monitoring:** Check Cloudflare analytics daily
2. **Security Updates:** Keep WAF rules up to date
3. **Cache Invalidation:** Manually purge cache when deploying
4. **SSL/TLS:** Always use Full (Strict) mode
5. **Rate Limiting:** Adjust thresholds based on traffic patterns
6. **DDoS Response:** Have incident response plan ready
7. **Backup:** Keep backup DNS records in case of Cloudflare issues

## Cost Optimization

1. **Cache Aggressively:** Increase TTLs for static content
2. **Minify Content:** Enable minification for all file types
3. **Image Optimization:** Use Cloudflare's image resizing
4. **Rate Limiting:** Prevent abuse and reduce origin load

## Security Hardening

1. **Enable WAF:** Protect against OWASP Top 10
2. **Rate Limiting:** Prevent brute force attacks
3. **DDoS Protection:** Automatic mitigation
4. **SSL/TLS:** Use Full (Strict) mode
5. **Security Headers:** Add security headers in origin

## References

- [Cloudflare Documentation](https://developers.cloudflare.com/)
- [Cloudflare API Reference](https://api.cloudflare.com/)
- [Terraform Cloudflare Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
