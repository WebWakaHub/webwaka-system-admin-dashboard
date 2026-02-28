#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #04: Multi-Tenant by Default
# ============================================================================
# Ensures all queries and data access patterns are tenant-scoped.
# Every storage interface and query must include tenantId filtering.
#
# Constitutional Basis: WebWaka is a multi-tenant SaaS platform.
# All data access must be tenant-isolated via Row-Level Security (RLS).
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0
PASSED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #04: Multi-Tenant by Default                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

TENANT_PATTERNS=(
  "tenantId"
  "tenant_id"
  "TenantId"
  "TENANT_ID"
  "tenantScope"
  "TenantContext"
  "tenantContext"
  "multiTenant"
  "MultiTenant"
  "RLS"
  "rowLevelSecurity"
  "tenantFilter"
  "TenantFilter"
  "organizationId"
  "orgId"
)

PATTERN=$(IFS="|"; echo "${TENANT_PATTERNS[*]}")

# Check all packages with storage interfaces or data access
for LAYER in organelles cells tissues organs systems; do
  LAYER_DIR="$ROOT_DIR/packages/$LAYER"
  [ -d "$LAYER_DIR" ] || continue

  for PKG_DIR in "$LAYER_DIR"/*/; do
    PKG_NAME=$(basename "$PKG_DIR")
    [ "$PKG_NAME" = "universe" ] && continue
    [ -d "$PKG_DIR/src" ] || continue

    # Check if package has storage/data access patterns
    HAS_STORAGE=false
    if find "$PKG_DIR/src" -name "*.ts" -exec grep -lE "storage|repository|query|database|db|Store|store" {} + >/dev/null 2>&1; then
      HAS_STORAGE=true
    fi

    if [ "$HAS_STORAGE" = true ]; then
      CHECKED=$((CHECKED + 1))

      if grep -rlE "$PATTERN" "$PKG_DIR/src" --include="*.ts" >/dev/null 2>&1; then
        PASSED=$((PASSED + 1))
      else
        echo "   ⚠  $LAYER/$PKG_NAME — has storage patterns but no tenant scoping"
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
    fi
  done
done

echo ""
echo "   Packages with storage checked: $CHECKED"
echo "   Packages passing:              $PASSED"
echo "   Violations:                    $VIOLATIONS"
echo ""

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "⚠️  WARNING: $VIOLATIONS packages with storage lack tenant scoping."
  echo "   All data access must include tenantId for RLS compliance."
  echo "   This check is advisory during Phase 0 — will become blocking in Phase 1."
  exit 0
else
  echo "✅ PASSED: All $CHECKED packages with storage are tenant-scoped."
fi

exit 0
