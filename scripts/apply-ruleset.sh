#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
if [ -z "$REPO" ]; then
  echo "Usage: ./scripts/apply-ruleset.sh <owner/repo>"
  echo "Example: ./scripts/apply-ruleset.sh rickcedwhat/my-app"
  exit 1
fi

RULESET_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.github/rulesets/main-protection.json"

echo "Applying standard ruleset to $REPO..."
gh api --method POST "/repos/$REPO/rulesets" --input "$RULESET_FILE"
echo "Ruleset applied successfully!"
