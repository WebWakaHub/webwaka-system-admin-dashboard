#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #12: Documentation
# ============================================================================
# Ensures all public APIs have JSDoc documentation.
# Checks that exported functions, classes, and interfaces have doc comments.
#
# Constitutional Basis: All platform APIs must be documented for
# partner integration, agent collaboration, and maintainability.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0
PASSED=0
UNDOCUMENTED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #12: Documentation (JSDoc)                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check each package's index.ts (public API surface)
for LAYER in organelles cells tissues organs systems; do
  LAYER_DIR="$ROOT_DIR/packages/$LAYER"
  [ -d "$LAYER_DIR" ] || continue

  for PKG_DIR in "$LAYER_DIR"/*/; do
    PKG_NAME=$(basename "$PKG_DIR")
    [ "$PKG_NAME" = "universe" ] && continue

    INDEX_FILE="$PKG_DIR/src/index.ts"
    [ -f "$INDEX_FILE" ] || continue

    CHECKED=$((CHECKED + 1))

    # Count exported declarations
    EXPORTS=$(grep -cE "^export (function|class|interface|type|const|enum|abstract)" "$INDEX_FILE" 2>/dev/null || echo "0")

    if [ "$EXPORTS" -eq 0 ]; then
      # Check for re-exports
      REEXPORTS=$(grep -cE "^export \{|^export \*" "$INDEX_FILE" 2>/dev/null || echo "0")
      if [ "$REEXPORTS" -gt 0 ]; then
        PASSED=$((PASSED + 1))
        continue
      fi
    fi

    # Count JSDoc comments (/** ... */) before exports
    JSDOC_COUNT=$(grep -cE "^\s*/\*\*" "$INDEX_FILE" 2>/dev/null || echo "0")

    # Also check all .ts files in src for JSDoc on exported items
    ALL_EXPORTS=$(find "$PKG_DIR/src" -name "*.ts" -not -name "*.test.ts" -not -name "*.spec.ts" -not -name "*.d.ts" -exec grep -cE "^export (function|class|interface|abstract)" {} + 2>/dev/null | awk -F: '{sum += $NF} END {print sum}')
    ALL_EXPORTS=${ALL_EXPORTS:-0}

    ALL_JSDOC=$(find "$PKG_DIR/src" -name "*.ts" -not -name "*.test.ts" -not -name "*.spec.ts" -not -name "*.d.ts" -exec grep -cE "^\s*/\*\*" {} + 2>/dev/null | awk -F: '{sum += $NF} END {print sum}')
    ALL_JSDOC=${ALL_JSDOC:-0}

    if [ "$ALL_EXPORTS" -gt 0 ] && [ "$ALL_JSDOC" -gt 0 ]; then
      DOC_RATIO=$(echo "scale=0; $ALL_JSDOC * 100 / $ALL_EXPORTS" | bc 2>/dev/null || echo "0")
      if [ "$DOC_RATIO" -ge 50 ]; then
        PASSED=$((PASSED + 1))
      else
        echo "   ⚠  $LAYER/$PKG_NAME — $ALL_JSDOC JSDoc / $ALL_EXPORTS exports (${DOC_RATIO}%)"
        UNDOCUMENTED=$((UNDOCUMENTED + 1))
      fi
    elif [ "$ALL_EXPORTS" -eq 0 ]; then
      PASSED=$((PASSED + 1))
    else
      echo "   ⚠  $LAYER/$PKG_NAME — $ALL_EXPORTS exports, 0 JSDoc comments"
      UNDOCUMENTED=$((UNDOCUMENTED + 1))
    fi
  done
done

# Check for README in each package
echo ""
echo "── README Check ──"
README_CHECKED=0
README_FOUND=0
for LAYER in organelles cells tissues organs systems; do
  LAYER_DIR="$ROOT_DIR/packages/$LAYER"
  [ -d "$LAYER_DIR" ] || continue

  for PKG_DIR in "$LAYER_DIR"/*/; do
    PKG_NAME=$(basename "$PKG_DIR")
    [ "$PKG_NAME" = "universe" ] && continue
    [ -d "$PKG_DIR/src" ] || continue

    README_CHECKED=$((README_CHECKED + 1))
    if [ -f "$PKG_DIR/README.md" ]; then
      README_FOUND=$((README_FOUND + 1))
    fi
  done
done

echo "   Packages with README: $README_FOUND / $README_CHECKED"

echo ""
echo "   Packages checked:      $CHECKED"
echo "   Packages documented:   $PASSED"
echo "   Underdocumented:       $UNDOCUMENTED"
echo ""

if [ "$UNDOCUMENTED" -gt 0 ]; then
  echo "⚠️  WARNING: $UNDOCUMENTED packages have insufficient JSDoc documentation."
  echo "   All public APIs must have JSDoc comments."
  echo "   This check is advisory during Phase 0 — will become blocking in Phase 1."
  exit 0
else
  echo "✅ PASSED: All $CHECKED packages have adequate documentation."
fi

exit 0
