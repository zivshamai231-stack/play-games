#!/usr/bin/env bash
# Puts one party online at its own address: https://party-<id>.<your-account>.workers.dev
# Usage: scripts/deploy-event.sh <event-id> [admin-key]
#   event-id   a content file in src/content/<event-id>.ts (and its pictures in events/<event-id>/public)
#   admin-key  the host's code for this party; needed the first time only (it is stored as a Cloudflare secret)
set -euo pipefail
id="${1:?usage: scripts/deploy-event.sh <event-id> [admin-key]}"
[ -f "src/content/$id.ts" ] || { echo "no src/content/$id.ts"; exit 1; }
[ -d "events/$id/public" ] || { echo "no events/$id/public"; exit 1; }
name="party-$id"
EVENT="$id" npx vite build
npx wrangler deploy --name "$name"
if [ -n "${2:-}" ]; then
  printf '%s' "$2" | npx wrangler secret put ADMIN_KEY --name "$name"
fi
echo "deployed $name — the host screen is /admin#key=<the admin key>"
