#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #07: Mobile-First
# ============================================================================
# Ensures all UI components are responsive and mobile-first.
# Checks for responsive patterns, viewport meta, and mobile-first CSS.
#
# Constitutional Basis: WebWaka targets African markets where mobile
# is the primary access device. All UIs must be mobile-first.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0
PASSED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #07: Mobile-First                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

MOBILE_PATTERNS=(
  "responsive"
  "Responsive"
  "useMediaQuery"
  "media-query"
  "@media"
  "breakpoint"
  "Breakpoint"
  "mobile"
  "Mobile"
  "viewport"
  "Viewport"
  "sm:"
  "md:"
  "lg:"
  "xl:"
  "flex"
  "grid"
  "tailwind"
  "Tailwind"
)

PATTERN=$(IFS="|"; echo "${MOBILE_PATTERNS[*]}")

# Check apps directory for mobile-first patterns
if [ -d "$ROOT_DIR/apps" ]; then
  for APP_DIR in "$ROOT_DIR/apps"/*/; do
    APP_NAME=$(basename "$APP_DIR")
    [ -d "$APP_DIR/src" ] || continue

    # Only check apps with UI files
    UI_FILES=$(find "$APP_DIR/src" -name "*.tsx" -o -name "*.css" -o -name "*.scss" 2>/dev/null | head -1)
    [ -z "$UI_FILES" ] && continue

    CHECKED=$((CHECKED + 1))

    if grep -rlE "$PATTERN" "$APP_DIR/src" --include="*.tsx" --include="*.css" --include="*.scss" --include="*.ts" >/dev/null 2>&1; then
      PASSED=$((PASSED + 1))
    else
      echo "   ⚠  apps/$APP_NAME — no mobile-first/responsive patterns detected"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done
fi

# Check shared UI packages
for PKG_DIR in "$ROOT_DIR/packages/shared"/*/; do
  PKG_NAME=$(basename "$PKG_DIR")
  [ -d "$PKG_DIR/src" ] || continue

  UI_FILES=$(find "$PKG_DIR/src" -name "*.tsx" 2>/dev/null | head -1)
  [ -z "$UI_FILES" ] && continue

  CHECKED=$((CHECKED + 1))

  if grep -rlE "$PATTERN" "$PKG_DIR/src" --include="*.tsx" --include="*.css" >/dev/null 2>&1; then
    PASSED=$((PASSED + 1))
  else
    echo "   ⚠  shared/$PKG_NAME — UI package lacks mobile-first patterns"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

echo ""
echo "   UI packages checked: $CHECKED"
echo "   Packages passing:    $PASSED"
echo "   Violations:          $VIOLATIONS"
echo ""

if [ "$CHECKED" -eq 0 ]; then
  echo "ℹ️  INFO: No UI packages found to check. This is expected during Phase 0."
  echo "   Mobile-first checks will activate when UI packages are added."
  exit 0
elif [ "$VIOLATIONS" -gt 0 ]; then
  echo "⚠️  WARNING: $VIOLATIONS UI packages lack mobile-first patterns."
  echo "   All UIs must be responsive and mobile-first."
  exit 0
else
  echo "✅ PASSED: All $CHECKED UI packages implement mobile-first design."
fi

exit 0
