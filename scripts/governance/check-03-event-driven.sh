#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #03: Event-Driven Architecture
# ============================================================================
# Ensures all state changes emit events. Every organelle must have an
# event-interface, and every entity/orchestrator must reference event emission.
#
# Constitutional Basis: The biological architecture requires all state
# transitions to be observable via events for system-wide coordination.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0
PASSED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #03: Event-Driven Architecture                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

EVENT_PATTERNS=(
  "event-interface"
  "EventInterface"
  "eventEmitter"
  "EventEmitter"
  "emit("
  "publish("
  "dispatch("
  "DomainEvent"
  "domainEvent"
  "EventBus"
  "eventBus"
  "onEvent"
  "addEventListener"
  "EventHandler"
  "eventHandler"
)

PATTERN=$(IFS="|"; echo "${EVENT_PATTERNS[*]}")

# Check organelles — must have event-interface
echo "── Organelle Layer (strict: must have event-interface) ──"
for PKG_DIR in "$ROOT_DIR/packages/organelles"/*/; do
  PKG_NAME=$(basename "$PKG_DIR")
  [ "$PKG_NAME" = "universe" ] && continue
  [ -d "$PKG_DIR/src" ] || continue

  CHECKED=$((CHECKED + 1))

  # Check for event-interface file
  if [ -f "$PKG_DIR/src/event-interface.ts" ] || [ -f "$PKG_DIR/src/events.ts" ] || [ -f "$PKG_DIR/src/ports.ts" ]; then
    # Also verify event emission in entity/orchestrator
    if grep -rlE "$PATTERN" "$PKG_DIR/src" --include="*.ts" >/dev/null 2>&1; then
      PASSED=$((PASSED + 1))
    else
      echo "   ⚠  organelles/$PKG_NAME — has event-interface but no event emission in code"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  else
    echo "   ⚠  organelles/$PKG_NAME — missing event-interface.ts, events.ts, or ports.ts"
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

# Check cells, tissues, organs, systems — must reference events
echo ""
echo "── Service Layers (must reference event patterns) ──"
for LAYER in cells tissues organs systems; do
  LAYER_DIR="$ROOT_DIR/packages/$LAYER"
  [ -d "$LAYER_DIR" ] || continue

  for PKG_DIR in "$LAYER_DIR"/*/; do
    PKG_NAME=$(basename "$PKG_DIR")
    [ "$PKG_NAME" = "universe" ] && continue
    [ -d "$PKG_DIR/src" ] || continue

    CHECKED=$((CHECKED + 1))

    if grep -rlE "$PATTERN" "$PKG_DIR/src" --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
      PASSED=$((PASSED + 1))
    else
      echo "   ⚠  $LAYER/$PKG_NAME — no event emission patterns detected"
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
  echo "⚠️  WARNING: $VIOLATIONS packages lack event-driven patterns."
  echo "   All state changes must emit domain events."
  echo "   This check is advisory during Phase 0 — will become blocking in Phase 1."
  exit 0
else
  echo "✅ PASSED: All $CHECKED packages implement event-driven architecture."
fi

exit 0
