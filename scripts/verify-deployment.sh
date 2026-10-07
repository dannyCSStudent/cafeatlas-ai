#!/usr/bin/env sh
set -eu

API_URL=${1:-}
WEB_URL=${2:-}

if [ -z "$API_URL" ] || [ -z "$WEB_URL" ]; then
  printf '%s\n' "Usage: scripts/verify-deployment.sh https://api.example.com https://app.example.com" >&2
  exit 2
fi

case "$API_URL" in
  https://*) ;;
  *) printf '%s\n' "API_URL must use HTTPS" >&2; exit 2 ;;
esac

case "$WEB_URL" in
  https://*) ;;
  *) printf '%s\n' "WEB_URL must use HTTPS" >&2; exit 2 ;;
esac

printf '%s\n' "Checking API liveness..."
curl --fail --silent --show-error "$API_URL/api/v1/health" >/dev/null

printf '%s\n' "Checking database readiness..."
curl --fail --silent --show-error "$API_URL/api/v1/health/ready" >/dev/null

printf '%s\n' "Checking API version..."
curl --fail --silent --show-error "$API_URL/api/v1/version" >/dev/null

printf '%s\n' "Checking web app..."
curl --fail --silent --show-error "$WEB_URL" >/dev/null

printf '%s\n' "Checking production CORS..."
curl --fail --silent --show-error \
  -H "Origin: $WEB_URL" \
  -D - \
  -o /dev/null \
  "$API_URL/api/v1/health" \
  | tr -d '\r' \
  | grep -F "access-control-allow-origin: $WEB_URL" >/dev/null

printf '%s\n' "Deployment smoke checks passed."
