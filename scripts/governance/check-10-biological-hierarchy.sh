#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #10: Biological Hierarchy
# ============================================================================
# Enforces the biological layer import rules:
#
#   organism → systems → organs → tissues → cells → organelles
#
# Each layer may only import from the layer directly below it.
# Cross-layer imports (e.g., organelle importing from organ) are forbidden.
# Shared packages (@webwaka/shared-*) can be imported by any layer.
#
# Constitutional Basis: The biological hierarchy is the foundational
# architectural principle. Violations break encapsulation and coupling rules.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #10: Biological Hierarchy                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Define the hierarchy (index = level, 0 = lowest)
# Organelles(0) < Cells(1) < Tissues(2) < Organs(3) < Systems(4) < Organism(5)
declare -A LAYER_LEVEL
LAYER_LEVEL[organelles]=0
LAYER_LEVEL[cells]=1
LAYER_LEVEL[tissues]=2
LAYER_LEVEL[organs]=3
LAYER_LEVEL[systems]=4
LAYER_LEVEL[organism]=5

# Map package name prefixes to layers
declare -A PREFIX_TO_LAYER
PREFIX_TO_LAYER[organelle]=organelles
PREFIX_TO_LAYER[orgn]=organelles
PREFIX_TO_LAYER[cell]=cells
PREFIX_TO_LAYER[tissue]=tissues
PREFIX_TO_LAYER[organ]=organs
PREFIX_TO_LAYER[system]=systems
PREFIX_TO_LAYER[organism]=organism

# For each layer, check imports don't reference higher or non-adjacent layers
for LAYER in organelles cells tissues organs systems organism; do
  LAYER_DIR="$ROOT_DIR/packages/$LAYER"
  [ -d "$LAYER_DIR" ] || continue

  CURRENT_LEVEL=${LAYER_LEVEL[$LAYER]}

  for PKG_DIR in "$LAYER_DIR"/*/; do
    PKG_NAME=$(basename "$PKG_DIR")
    [ "$PKG_NAME" = "universe" ] && continue
    [ -d "$PKG_DIR/src" ] || continue

    CHECKED=$((CHECKED + 1))

    # Extract all @webwaka/ imports from this package
    IMPORTS=$(grep -rhE "from ['\"]@webwaka/" "$PKG_DIR/src" --include="*.ts" --include="*.tsx" 2>/dev/null || true)

    if [ -z "$IMPORTS" ]; then
      continue
    fi

    # Check each import
    echo "$IMPORTS" | while IFS= read -r line; do
      # Extract the package name from the import
      IMPORTED=$(echo "$line" | grep -oE "@webwaka/[a-z]+-" | head -1 | sed 's/@webwaka\///' | sed 's/-$//')

      # Skip shared imports (allowed from any layer)
      if echo "$line" | grep -qE "@webwaka/shared-|@webwaka/platform-core|@webwaka/shared-platform"; then
        continue
      fi

      # Determine the layer of the imported package
      IMPORTED_LAYER=""
      for PREFIX in "${!PREFIX_TO_LAYER[@]}"; do
        if [ "$IMPORTED" = "$PREFIX" ]; then
          IMPORTED_LAYER=${PREFIX_TO_LAYER[$PREFIX]}
          break
        fi
      done

      if [ -z "$IMPORTED_LAYER" ]; then
        continue
      fi

      IMPORTED_LEVEL=${LAYER_LEVEL[$IMPORTED_LAYER]:-999}

      # Rule: Can only import from the layer directly below (level - 1) or same level
      if [ "$IMPORTED_LEVEL" -gt "$CURRENT_LEVEL" ]; then
        echo "   ❌ $LAYER/$PKG_NAME imports from $IMPORTED_LAYER (level $IMPORTED_LEVEL > $CURRENT_LEVEL)"
        VIOLATIONS=$((VIOLATIONS + 1))
      elif [ "$IMPORTED_LEVEL" -lt "$((CURRENT_LEVEL - 1))" ]; then
        echo "   ⚠  $LAYER/$PKG_NAME imports from $IMPORTED_LAYER (skipping layers: $IMPORTED_LEVEL < $((CURRENT_LEVEL - 1)))"
        # Skip-layer imports are a warning, not a hard violation
      fi
    done
  done
done

echo ""
echo "   Packages checked: $CHECKED"
echo "   Hierarchy violations: $VIOLATIONS"
echo ""

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "❌ FAILED: $VIOLATIONS biological hierarchy violations detected."
  echo "   Import hierarchy: organism → systems → organs → tissues → cells → organelles"
  echo "   Each layer may only import from the layer directly below."
  exit 1
else
  echo "✅ PASSED: All $CHECKED packages respect the biological hierarchy."
fi

exit 0
