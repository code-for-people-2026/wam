#!/usr/bin/env bash

set -euo pipefail

echo "Preparing production database..."

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is missing. Install it with: pnpm add -g vercel"
  exit 1
fi

vercel env pull .env.production --environment production --yes

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
export PAYLOAD_ALLOW_DESTRUCTIVE_PUSH=true
export ADMIN_EMAIL="${ADMIN_EMAIL:-miyinderick@qq.com}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
export ADMIN_DISPLAY_NAME="${ADMIN_DISPLAY_NAME:-现场审核管理员}"

if [[ -z "${PAYLOAD_DATABASE_URL:-}" ]]; then
  echo "Missing PAYLOAD_DATABASE_URL or DATABASE_URL in Vercel env."
  rm -f .env.production
  exit 1
fi

pnpm exec payload run scripts/seed-admin.ts

rm -f .env.production

echo "Production database is initialized."
