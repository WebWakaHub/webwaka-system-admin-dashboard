#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #08: PWA Compliance
# ============================================================================
# Ensures Progressive Web App requirements are met:
# - Service worker registration
# - Web app manifest
# - Offline shell capability
#
# Constitutional Basis: WebWaka must be installable as a PWA for
# offline access in low-connectivity African markets.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #08: PWA Compliance                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check each app for PWA requirements
if [ -d "$ROOT_DIR/apps" ]; then
  for APP_DIR in "$ROOT_DIR/apps"/*/; do
    APP_NAME=$(basename "$APP_DIR")

    # Only check web apps (those with index.html or similar)
    HAS_WEB=$(find "$APP_DIR" -maxdepth 3 -name "index.html" -o -name "index.tsx" -o -name "App.tsx" 2>/dev/null | head -1)
    [ -z "$HAS_WEB" ] && continue

    CHECKED=$((CHECKED + 1))
    APP_VIOLATIONS=0

    echo "   Checking apps/$APP_NAME..."

    # Check 1: Service Worker
    SW_FOUND=false
    if find "$APP_DIR" -name "service-worker*" -o -name "sw.*" -o -name "serviceWorker*" 2>/dev/null | grep -q .; then
      SW_FOUND=true
    elif grep -rlE "serviceWorker|ServiceWorker|workbox|navigator.serviceWorker" "$APP_DIR" --include="*.ts" --include="*.tsx" --include="*.js" >/dev/null 2>&1; then
      SW_FOUND=true
    fi

    if [ "$SW_FOUND" = true ]; then
      echo "      ✓ Service worker detected"
    else
      echo "      ✗ No service worker found"
      APP_VIOLATIONS=$((APP_VIOLATIONS + 1))
    fi

    # Check 2: Web App Manifest
    MANIFEST_FOUND=false
    if find "$APP_DIR" -name "manifest.json" -o -name "manifest.webmanifest" -o -name "site.webmanifest" 2>/dev/null | grep -q .; then
      MANIFEST_FOUND=true
    elif grep -rlE "manifest" "$APP_DIR/public" --include="*.html" >/dev/null 2>&1; then
      MANIFEST_FOUND=true
    fi

    if [ "$MANIFEST_FOUND" = true ]; then
      echo "      ✓ Web app manifest detected"
    else
      echo "      ✗ No web app manifest found"
      APP_VIOLATIONS=$((APP_VIOLATIONS + 1))
    fi

    # Check 3: Offline shell / cache strategy
    OFFLINE_FOUND=false
    if grep -rlE "cacheFirst|networkFirst|staleWhileRevalidate|CacheStorage|cache.addAll|offlineShell|offline" "$APP_DIR" --include="*.ts" --include="*.tsx" --include="*.js" >/dev/null 2>&1; then
      OFFLINE_FOUND=true
    fi

    if [ "$OFFLINE_FOUND" = true ]; then
      echo "      ✓ Offline caching strategy detected"
    else
      echo "      ✗ No offline caching strategy found"
      APP_VIOLATIONS=$((APP_VIOLATIONS + 1))
    fi

    if [ "$APP_VIOLATIONS" -gt 0 ]; then
      VIOLATIONS=$((VIOLATIONS + APP_VIOLATIONS))
    fi
  done
fi

echo ""
echo "   Web apps checked: $CHECKED"
echo "   Violations:       $VIOLATIONS"
echo ""

if [ "$CHECKED" -eq 0 ]; then
  echo "ℹ️  INFO: No web apps found to check PWA compliance."
  echo "   PWA checks will activate when web apps are added (CPA-05)."
  exit 0
elif [ "$VIOLATIONS" -gt 0 ]; then
  echo "⚠️  WARNING: $VIOLATIONS PWA requirements not met."
  echo "   Each web app needs: service worker, manifest, offline shell."
  echo "   This check is advisory during Phase 0 — will become blocking in Phase 1."
  exit 0
else
  echo "✅ PASSED: All $CHECKED web apps meet PWA compliance."
fi

exit 0
