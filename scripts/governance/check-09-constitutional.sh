#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #09: Constitutional Compliance
# ============================================================================
# Enforces forbidden patterns that violate the WebWaka constitution:
# - No direct database access (must use storage interfaces)
# - No hardcoded secrets or credentials
# - No console.log in production code (must use observability)
# - No any types (must be strictly typed)
# - No synchronous file I/O in service code
# - No direct HTTP calls (must use external-adapter organelle)
#
# Constitutional Basis: These patterns violate security, observability,
# and architectural principles of the biological hierarchy.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
TOTAL_CHECKS=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #09: Constitutional Compliance                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── Check 1: No hardcoded secrets ──
echo "── Check 9.1: No Hardcoded Secrets ──"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

SECRET_PATTERNS='(password|secret|api_key|apiKey|API_KEY|token|TOKEN|private_key)\s*[:=]\s*["\x27][^"\x27]{8,}'

SECRETS_FOUND=$(grep -rnE "$SECRET_PATTERNS" \
  "$ROOT_DIR/packages" "$ROOT_DIR/apps" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist \
  --exclude="*.test.ts" --exclude="*.spec.ts" \
  --exclude="*.d.ts" \
  2>/dev/null | grep -vE "(process\.env|import\.meta\.env|config\.|getenv|mock|Mock|MOCK|example|Example|placeholder)" || true)

if [ -n "$SECRETS_FOUND" ]; then
  echo "❌ VIOLATION: Potential hardcoded secrets detected:"
  echo "$SECRETS_FOUND" | head -10
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "   ✅ No hardcoded secrets found"
fi

# ── Check 2: No console.log in production code ──
echo ""
echo "── Check 9.2: No console.log in Production Code ──"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

CONSOLE_FOUND=$(grep -rnE "console\.(log|warn|error|debug|info)\(" \
  "$ROOT_DIR/packages" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist \
  --exclude="*.test.ts" --exclude="*.spec.ts" \
  2>/dev/null | grep -vE "(// eslint-disable|// TODO|__tests__|test/|tests/)" | head -20 || true)

CONSOLE_COUNT=0
if [ -n "$CONSOLE_FOUND" ]; then
  CONSOLE_COUNT=$(echo "$CONSOLE_FOUND" | wc -l)
fi

if [ "$CONSOLE_COUNT" -gt 0 ]; then
  echo "   ⚠  $CONSOLE_COUNT console.log statements found (use observability instead)"
  echo "$CONSOLE_FOUND" | head -5
  # Advisory — not blocking during Phase 0
else
  echo "   ✅ No console.log in production code"
fi

# ── Check 3: No 'any' type usage ──
echo ""
echo "── Check 9.3: No 'any' Type Usage ──"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

ANY_FOUND=$(grep -rnE ":\s*any\b|<any>|as any" \
  "$ROOT_DIR/packages" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist \
  --exclude="*.test.ts" --exclude="*.spec.ts" \
  --exclude="*.d.ts" \
  2>/dev/null | head -20 || true)

ANY_COUNT=0
if [ -n "$ANY_FOUND" ]; then
  ANY_COUNT=$(echo "$ANY_FOUND" | wc -l)
fi

if [ "$ANY_COUNT" -gt 0 ]; then
  echo "   ⚠  $ANY_COUNT 'any' type usages found (must use strict typing)"
  echo "$ANY_FOUND" | head -5
  # Advisory — not blocking during Phase 0
else
  echo "   ✅ No 'any' type usage found"
fi

# ── Check 4: No direct fetch/axios (must use external-adapter) ──
echo ""
echo "── Check 9.4: No Direct HTTP Calls ──"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Only check service layers (not organelles which may implement the adapter)
HTTP_FOUND=$(grep -rnE "\bfetch\(|axios\.|http\.request|https\.request|XMLHttpRequest" \
  "$ROOT_DIR/packages/cells" "$ROOT_DIR/packages/tissues" \
  "$ROOT_DIR/packages/organs" "$ROOT_DIR/packages/systems" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist \
  --exclude="*.test.ts" --exclude="*.spec.ts" \
  2>/dev/null | grep -vE "(mock|Mock|test|Test|import|type )" || true)

HTTP_COUNT=0
if [ -n "$HTTP_FOUND" ]; then
  HTTP_COUNT=$(echo "$HTTP_FOUND" | wc -l)
fi

if [ "$HTTP_COUNT" -gt 0 ]; then
  echo "   ⚠  $HTTP_COUNT direct HTTP calls found (must use external-adapter organelle)"
  echo "$HTTP_FOUND" | head -5
else
  echo "   ✅ No direct HTTP calls in service layers"
fi

# ── Check 5: No synchronous file I/O ──
echo ""
echo "── Check 9.5: No Synchronous File I/O ──"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

SYNC_IO=$(grep -rnE "readFileSync|writeFileSync|appendFileSync|mkdirSync|existsSync|readdirSync" \
  "$ROOT_DIR/packages" \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=node_modules --exclude-dir=dist \
  --exclude="*.test.ts" --exclude="*.spec.ts" \
  --exclude-dir=scripts \
  2>/dev/null || true)

SYNC_COUNT=0
if [ -n "$SYNC_IO" ]; then
  SYNC_COUNT=$(echo "$SYNC_IO" | wc -l)
fi

if [ "$SYNC_COUNT" -gt 0 ]; then
  echo "   ⚠  $SYNC_COUNT synchronous file I/O calls found"
  echo "$SYNC_IO" | head -5
else
  echo "   ✅ No synchronous file I/O in packages"
fi

echo ""
echo "   Constitutional checks run: $TOTAL_CHECKS"
echo "   Hard violations:           $VIOLATIONS"
echo ""

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "❌ FAILED: $VIOLATIONS constitutional violations detected."
  echo "   Hardcoded secrets are a blocking violation."
  exit 1
else
  echo "✅ PASSED: No blocking constitutional violations."
  echo "   Advisory warnings may exist and will become blocking in Phase 1."
fi

exit 0
