#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #02: Offline-First Compliance
# ============================================================================
# Ensures all service packages include offline queue capability.
# Each package at the cell/tissue/organ/system level must reference
# an offline queue, sync mechanism, or explicitly declare offline strategy.
#
# Constitutional Basis: WebWaka targets African markets where connectivity
# is intermittent. All services must function offline-first.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0
PASSED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #02: Offline-First Compliance                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

OFFLINE_PATTERNS=(
  "offlineQueue"
  "OfflineQueue"
  "offline-queue"
  "offline_queue"
  "syncQueue"
  "SyncQueue"
  "offlineBuffer"
  "OfflineBuffer"
  "offline-first"
  "offlineStrategy"
  "IndexedDB"
  "localStorage"
  "ServiceWorker"
  "serviceWorker"
  "cacheFirst"
  "networkFirst"
  "staleWhileRevalidate"
  "offlineStorage"
  "pendingSync"
  "backgroundSync"
)

# Build grep pattern
PATTERN=$(IFS="|"; echo "${OFFLINE_PATTERNS[*]}")

# Check each package in service layers (cells, tissues, organs, systems)
for LAYER in cells tissues organs systems; do
  LAYER_DIR="$ROOT_DIR/packages/$LAYER"
  [ -d "$LAYER_DIR" ] || continue

  for PKG_DIR in "$LAYER_DIR"/*/; do
    PKG_NAME=$(basename "$PKG_DIR")
    [ "$PKG_NAME" = "universe" ] && continue
    [ -d "$PKG_DIR/src" ] || continue

    CHECKED=$((CHECKED + 1))

    # Search for offline patterns in source files
    if grep -rlE "$PATTERN" "$PKG_DIR/src" --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
      PASSED=$((PASSED + 1))
    else
      # Check if package.json references offline dependencies
      if [ -f "$PKG_DIR/package.json" ] && grep -qE "$PATTERN" "$PKG_DIR/package.json" 2>/dev/null; then
        PASSED=$((PASSED + 1))
      else
        # Check for offline strategy in docs
        if find "$PKG_DIR/docs" -name "*.md" -exec grep -lE "$PATTERN" {} + >/dev/null 2>&1; then
          PASSED=$((PASSED + 1))
        else
          echo "   ⚠  $LAYER/$PKG_NAME — no offline queue/strategy detected"
          VIOLATIONS=$((VIOLATIONS + 1))
        fi
      fi
    fi
  done
done

echo ""
echo "   Packages checked: $CHECKED"
echo "   Packages passing: $PASSED"
echo "   Violations:       $VIOLATIONS"
echo ""

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "⚠️  WARNING: $VIOLATIONS packages lack offline-first patterns."
  echo "   Each service must implement offline queue or declare offline strategy."
  echo "   This check is advisory during Phase 0 — will become blocking in Phase 1."
  # Advisory exit (non-blocking during foundation phase)
  exit 0
else
  echo "✅ PASSED: All $CHECKED packages include offline-first capability."
fi

exit 0
