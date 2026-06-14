#!/usr/bin/env bash

set -euo pipefail

echo "Preparing production database..."

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is missing. Install it with: pnpm add -g vercel"
  exit 1
fi

vercel env pull .env.production --environment production --yes
trap 'rm -f .env.production' EXIT

if [[ ! -f .env.production ]]; then
  echo "Could not pull Vercel env vars. Run: vercel login"
  exit 1
fi

set -a
source .env.production
set +a

export DATABASE_URL="${DATABASE_URL:-${PAYLOAD_DATABASE_URL:-}}"
export DATABASE_URL_UNPOOLED="${DATABASE_URL_UNPOOLED:-${DATABASE_URL:-}}"
export PAYLOAD_DATABASE_URL="${PAYLOAD_DATABASE_URL:-${DATABASE_URL:-}}"
export PAYLOAD_DATABASE_SCHEMA="${PAYLOAD_DATABASE_SCHEMA:-wam_interactive}"
export PAYLOAD_DB_PUSH=true
export ADMIN_DISPLAY_NAME="${ADMIN_DISPLAY_NAME:-现场审核管理员}"

if [[ -z "${PAYLOAD_DATABASE_URL:-}" ]]; then
  echo "Missing PAYLOAD_DATABASE_URL or DATABASE_URL in Vercel env."
  exit 1
fi

if [[ -z "${PAYLOAD_SECRET:-}" ]]; then
  echo "Missing PAYLOAD_SECRET in Vercel env."
  exit 1
fi

if [[ -z "${ADMIN_EMAIL:-}" || -z "${ADMIN_PASSWORD:-}" ]]; then
  echo "Missing ADMIN_EMAIL or ADMIN_PASSWORD in Vercel env."
  exit 1
fi

pnpm exec payload run scripts/seed-admin.ts

echo "Production database is initialized."
