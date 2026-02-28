#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #11: Test Coverage Minimum (80%)
# ============================================================================
# Ensures all packages maintain at least 80% line coverage.
# During Phase 0, this check verifies test files exist.
# In Phase 1+, this will run actual coverage reports.
#
# Constitutional Basis: Quality assurance requires comprehensive testing
# to maintain platform reliability across all biological layers.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0
PASSED=0
HAS_TESTS=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #11: Test Coverage Minimum (80%)                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Phase 0: Check that test files exist for each package
for LAYER in organelles cells tissues organs systems; do
  LAYER_DIR="$ROOT_DIR/packages/$LAYER"
  [ -d "$LAYER_DIR" ] || continue

  for PKG_DIR in "$LAYER_DIR"/*/; do
    PKG_NAME=$(basename "$PKG_DIR")
    [ "$PKG_NAME" = "universe" ] && continue
    [ -d "$PKG_DIR/src" ] || continue

    CHECKED=$((CHECKED + 1))

    # Count source files
    SRC_COUNT=$(find "$PKG_DIR/src" -name "*.ts" -not -name "*.test.ts" -not -name "*.spec.ts" -not -name "*.d.ts" -not -path "*__tests__*" 2>/dev/null | wc -l)

    # Count test files
    TEST_COUNT=$(find "$PKG_DIR" -name "*.test.ts" -o -name "*.spec.ts" -o -path "*__tests__/*.ts" 2>/dev/null | wc -l)

    if [ "$TEST_COUNT" -gt 0 ]; then
      HAS_TESTS=$((HAS_TESTS + 1))
      RATIO=$(echo "scale=0; $TEST_COUNT * 100 / $SRC_COUNT" | bc 2>/dev/null || echo "0")
      PASSED=$((PASSED + 1))
    else
      if [ "$SRC_COUNT" -gt 0 ]; then
        echo "   ⚠  $LAYER/$PKG_NAME — $SRC_COUNT source files, 0 test files"
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
    fi
  done
done

echo ""
echo "   Packages checked:    $CHECKED"
echo "   Packages with tests: $HAS_TESTS"
echo "   Packages passing:    $PASSED"
echo "   Missing tests:       $VIOLATIONS"
echo ""

# Phase 0: Advisory mode
COVERAGE_PERCENT=0
if [ "$CHECKED" -gt 0 ]; then
  COVERAGE_PERCENT=$(echo "scale=0; $HAS_TESTS * 100 / $CHECKED" | bc 2>/dev/null || echo "0")
fi

echo "   Test file coverage: ${COVERAGE_PERCENT}% of packages have test files"
echo ""

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "⚠️  WARNING: $VIOLATIONS packages lack test files."
  echo "   Target: 80% line coverage per package."
  echo "   This check is advisory during Phase 0 — will run actual coverage in Phase 1."
  # Advisory — not blocking during Phase 0
  exit 0
else
  echo "✅ PASSED: All $CHECKED packages have test files."
fi

exit 0
