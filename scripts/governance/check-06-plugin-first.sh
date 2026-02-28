#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #06: Plugin-First
# ============================================================================
# Ensures all domain logic is extensible via plugin architecture.
# Packages must use interfaces/ports for extensibility, not hard-coded logic.
#
# Constitutional Basis: WebWaka's partner ecosystem requires all domain
# logic to be customizable via plugins without modifying core code.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0
PASSED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #06: Plugin-First                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

PLUGIN_PATTERNS=(
  "interface"
  "Interface"
  "Plugin"
  "plugin"
  "Extension"
  "extension"
  "Adapter"
  "adapter"
  "Port"
  "port"
  "Strategy"
  "strategy"
  "Provider"
  "provider"
  "Hook"
  "hook"
  "Middleware"
  "middleware"
  "Injectable"
  "injectable"
  "abstract class"
  "implements"
)

PATTERN=$(IFS="|"; echo "${PLUGIN_PATTERNS[*]}")

# Check all layers for extensibility patterns
for LAYER in organelles cells tissues organs systems; do
  LAYER_DIR="$ROOT_DIR/packages/$LAYER"
  [ -d "$LAYER_DIR" ] || continue

  for PKG_DIR in "$LAYER_DIR"/*/; do
    PKG_NAME=$(basename "$PKG_DIR")
    [ "$PKG_NAME" = "universe" ] && continue
    [ -d "$PKG_DIR/src" ] || continue

    CHECKED=$((CHECKED + 1))

    if grep -rlE "$PATTERN" "$PKG_DIR/src" --include="*.ts" >/dev/null 2>&1; then
      PASSED=$((PASSED + 1))
    else
      echo "   ⚠  $LAYER/$PKG_NAME — no extensibility patterns (interface/plugin/adapter)"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done
done

echo ""
echo "   Packages checked: $CHECKED"
echo "   Packages passing: $PASSED"
echo "   Violations:       $VIOLATIONS"
echo ""

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "⚠️  WARNING: $VIOLATIONS packages lack plugin-first extensibility."
  echo "   All domain logic must use interfaces/ports for extensibility."
  echo "   This check is advisory during Phase 0 — will become blocking in Phase 1."
  exit 0
else
  echo "✅ PASSED: All $CHECKED packages implement plugin-first architecture."
fi

exit 0
