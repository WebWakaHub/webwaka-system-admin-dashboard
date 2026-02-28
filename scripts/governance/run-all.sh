#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE CI — Run All 12 Invariant Checks Locally
# ============================================================================
# Usage: bash scripts/governance/run-all.sh
#
# Runs all 12 architectural invariant checks and reports results.
# Blocking checks (1, 9, 10) will cause a non-zero exit code on failure.
# Advisory checks (2-8, 11-12) report warnings but don't block.
# ============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BLOCKING_FAILED=0
ADVISORY_WARNINGS=0
TOTAL=12
PASSED=0

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  WEBWAKA GOVERNANCE CI — ALL 12 INVARIANT CHECKS            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

run_check() {
  local num="$1"
  local name="$2"
  local blocking="$3"
  local script="$SCRIPT_DIR/check-${num}-${name}.sh"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  if bash "$script" 2>&1; then
    PASSED=$((PASSED + 1))
  else
    if [ "$blocking" = "true" ]; then
      BLOCKING_FAILED=$((BLOCKING_FAILED + 1))
    else
      ADVISORY_WARNINGS=$((ADVISORY_WARNINGS + 1))
      PASSED=$((PASSED + 1))  # Advisory warnings still count as pass
    fi
  fi
  echo ""
}

# Blocking invariants
run_check "01" "typescript-only"      "true"
run_check "09" "constitutional"       "true"
run_check "10" "biological-hierarchy" "true"

# Advisory invariants
run_check "02" "offline-first"        "false"
run_check "03" "event-driven"         "false"
run_check "04" "multi-tenant"         "false"
run_check "05" "api-first"            "false"
run_check "06" "plugin-first"         "false"
run_check "07" "mobile-first"         "false"
run_check "08" "pwa-compliance"       "false"
run_check "11" "test-coverage"        "false"
run_check "12" "documentation"        "false"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  GOVERNANCE CI — FINAL REPORT                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "   Total checks:        $TOTAL"
echo "   Passed:              $PASSED"
echo "   Blocking failures:   $BLOCKING_FAILED"
echo "   Advisory warnings:   $ADVISORY_WARNINGS"
echo ""

if [ "$BLOCKING_FAILED" -gt 0 ]; then
  echo "❌ GOVERNANCE GATE: FAILED ($BLOCKING_FAILED blocking violations)"
  exit 1
else
  echo "✅ GOVERNANCE GATE: PASSED (all blocking invariants satisfied)"
  exit 0
fi
