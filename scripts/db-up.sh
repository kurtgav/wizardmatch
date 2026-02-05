#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/backend-go/.env"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Missing backend-go/.env. Create it before running migrations."
  exit 1
fi

if ! command -v goose >/dev/null 2>&1; then
  echo "goose not found. Install with: go install github.com/pressly/goose/v3/cmd/goose@latest"
  exit 1
fi

DATABASE_URL="$(grep -E '^DATABASE_URL=' "${ENV_FILE}" | sed 's/^DATABASE_URL=//')"
if [ -z "${DATABASE_URL}" ]; then
  echo "DATABASE_URL is missing in backend-go/.env"
  exit 1
fi

cd "${ROOT_DIR}/backend-go"
GOOSE_DRIVER=postgres GOOSE_DBSTRING="${DATABASE_URL}" goose -dir migrations up
