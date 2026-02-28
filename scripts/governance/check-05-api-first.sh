#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #05: API-First
# ============================================================================
# Ensures all functionality is exposed via REST/GraphQL APIs.
# Service-layer packages (organs, systems) must define API contracts.
#
# Constitutional Basis: All platform capabilities must be accessible
# programmatically to enable integrations, partner APIs, and white-labelling.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
CHECKED=0
PASSED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #05: API-First                                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

API_PATTERNS=(
  "Controller"
  "controller"
  "Router"
  "router"
  "endpoint"
  "Endpoint"
  "@Get"
  "@Post"
  "@Put"
  "@Delete"
  "@Patch"
  "app.get"
  "app.post"
  "express"
  "fastify"
  "GraphQL"
  "graphql"
  "resolver"
  "Resolver"
  "Query"
  "Mutation"
  "REST"
  "openapi"
  "swagger"
  "apiRoute"
  "ApiRoute"
)

PATTERN=$(IFS="|"; echo "${API_PATTERNS[*]}")

# Check organs and systems — must expose APIs
for LAYER in organs systems; do
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
      # Check docs for API specification
      if find "$PKG_DIR" -name "*.md" -exec grep -lE "API|endpoint|route|REST|GraphQL" {} + >/dev/null 2>&1; then
        PASSED=$((PASSED + 1))
      else
        echo "   ⚠  $LAYER/$PKG_NAME — no API contract or endpoint patterns detected"
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
    fi
  done
done

echo ""
echo "   Service packages checked: $CHECKED"
echo "   Packages passing:         $PASSED"
echo "   Violations:               $VIOLATIONS"
echo ""

if [ "$VIOLATIONS" -gt 0 ]; then
  echo "⚠️  WARNING: $VIOLATIONS service packages lack API-first patterns."
  echo "   All functionality must be exposed via REST or GraphQL APIs."
  echo "   This check is advisory during Phase 0 — will become blocking in Phase 1."
  exit 0
else
  echo "✅ PASSED: All $CHECKED service packages expose API contracts."
fi

exit 0
