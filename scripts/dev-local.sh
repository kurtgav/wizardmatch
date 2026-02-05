#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

command -v npm >/dev/null 2>&1 || {
  echo "npm is required but not found"
  exit 1
}

command -v go >/dev/null 2>&1 || {
  echo "Go is required but not found"
  exit 1
}

echo "Starting Wizard Match locally"

if [ ! -f "${ROOT_DIR}/backend-go/.env" ]; then
  echo "Missing backend-go/.env. Copy backend-go/.env.example or create one."
  exit 1
fi

if [ ! -f "${ROOT_DIR}/frontend/.env.local" ]; then
  echo "Missing frontend/.env.local. Copy frontend/.env.local.example or create one."
  exit 1
fi

echo "Installing frontend dependencies"
cd "${ROOT_DIR}/frontend"
npm install

echo "Installing backend-go dependencies"
cd "${ROOT_DIR}/backend-go"
go mod download

echo "Running database migrations (goose)"
if ! command -v goose >/dev/null 2>&1; then
  echo "goose not found. Install with: go install github.com/pressly/goose/v3/cmd/goose@latest"
  exit 1
fi

DATABASE_URL="$(grep -E '^DATABASE_URL=' "${ROOT_DIR}/backend-go/.env" | sed 's/^DATABASE_URL=//')"
if [ -z "${DATABASE_URL}" ]; then
  echo "DATABASE_URL is missing in backend-go/.env"
  exit 1
fi

cd "${ROOT_DIR}/backend-go"
GOOSE_DRIVER=postgres GOOSE_DBSTRING="${DATABASE_URL}" goose -dir migrations up

echo "Seeding database"
go run ./cmd/seed

echo "Starting backend-go + frontend dev servers"
cd "${ROOT_DIR}"
if ! npm list --depth=0 concurrently >/dev/null 2>&1; then
  npm install
fi

npm run dev:frontend &
FRONTEND_PID=$!

cd "${ROOT_DIR}/backend-go"
ENV_FILE="${ROOT_DIR}/backend-go/.env" go run ./cmd/api &
BACKEND_PID=$!

trap 'echo "Shutting down..."; kill ${FRONTEND_PID} ${BACKEND_PID}' INT TERM
wait
