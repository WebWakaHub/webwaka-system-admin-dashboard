#!/usr/bin/env bash
# ============================================================================
# GOVERNANCE INVARIANT #01: TypeScript-Only
# ============================================================================
# Ensures no JavaScript files (.js, .jsx, .mjs, .cjs) exist in source
# directories. Configuration files (jest.config.js, etc.) are exempted.
#
# Constitutional Basis: All platform code must be TypeScript to ensure
# type safety, maintainability, and constitutional compliance.
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

VIOLATIONS=0
EXEMPTIONS=(
  "jest.config.js"
  "jest.preset.js"
  "babel.config.js"
  "metro.config.js"
  "tailwind.config.js"
  "postcss.config.js"
  "vite.config.js"
  "next.config.js"
  "commitlint.config.js"
  ".eslintrc.js"
  "prettier.config.js"
  "jest.integration.config.js"
  "jest.setup.js"
  "setupTests.js"
)

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  INVARIANT #01: TypeScript-Only Enforcement                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Build exemption pattern for find
EXEMPTION_ARGS=""
for exempt in "${EXEMPTIONS[@]}"; do
  EXEMPTION_ARGS="$EXEMPTION_ARGS -not -name $exempt"
done

# Search for JavaScript files in packages/ and apps/ directories
JS_FILES=$(find "$ROOT_DIR/packages" "$ROOT_DIR/apps" \
  -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.mjs" -o -name "*.cjs" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/.next/*" \
  $EXEMPTION_ARGS \
  2>/dev/null || true)

if [ -n "$JS_FILES" ]; then
  echo "❌ VIOLATION: JavaScript files detected in source directories:"
  echo ""
  echo "$JS_FILES" | while read -r file; do
    echo "   ⚠  $file"
    VIOLATIONS=$((VIOLATIONS + 1))
  done
  echo ""
  echo "All source code must be TypeScript (.ts, .tsx)."
  echo "Configuration files (jest.config.js, etc.) are exempted."
  exit 1
else
  echo "✅ PASSED: No JavaScript files found in source directories."
  echo "   All source code is TypeScript-compliant."
fi

exit 0
