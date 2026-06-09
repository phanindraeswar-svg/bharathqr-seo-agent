#!/usr/bin/env bash
set -euo pipefail

MESSAGE="${VERCEL_GIT_COMMIT_MESSAGE:-}"
AUTHOR="${VERCEL_GIT_COMMIT_AUTHOR_LOGIN:-}"
REF="${VERCEL_GIT_COMMIT_REF:-}"

echo "Vercel ignore check"
echo "Branch: ${REF}"
echo "Author: ${AUTHOR}"
echo "Message: ${MESSAGE}"

# Skip Vercel builds for automated SEO-agent commits. This avoids spending
# Vercel build minutes on routine content/report syncs. Manual/user commits
# still deploy normally.
if [[ "${AUTHOR}" == "github-actions[bot]" ]]; then
  echo "Skipping Vercel build: automated GitHub Actions bot commit."
  exit 0
fi

if [[ "${MESSAGE}" == *"[skip ci]"* || "${MESSAGE}" == *"[ci skip]"* || "${MESSAGE}" == *"[skip vercel]"* ]]; then
  echo "Skipping Vercel build: skip token present in commit message."
  exit 0
fi

echo "Proceeding with Vercel build."
exit 1
