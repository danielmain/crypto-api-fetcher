#!/usr/bin/env bash
set -euo pipefail

CHANGE_ID="${1:-}"
if [[ -z "$CHANGE_ID" ]]; then
  echo "Usage: $0 <change-id>" >&2
  exit 1
fi

openspec archive "$CHANGE_ID" --yes

git add openspec/specs openspec/changes/archive

git commit -m "chore(openspec): archive ${CHANGE_ID}"
