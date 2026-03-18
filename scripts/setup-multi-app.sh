#!/usr/bin/env bash
#
# Setup and deploy multiple apps to Vercel with custom subdomains.
#
# Usage:
#   ./scripts/setup-multi-app.sh <base-domain> <app1:repo1> [app2:repo2] ...
#
# Example:
#   ./scripts/setup-multi-app.sh aventure-studio.com \
#     facilitator:alfred-KE/Facilitator \
#     synapse:alfred-KE/Synapse \
#     james:alfred-KE/James
#
# This will:
#   1. Clone each repo (if not already local)
#   2. Link each to a Vercel project
#   3. Deploy to production
#   4. Assign <app>.<base-domain> as custom domain
#   5. Print DNS records to configure
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load .env if present
[[ -f "$SCRIPT_DIR/../.env" ]] && set -a && source "$SCRIPT_DIR/../.env" && set +a

# Load GoDaddy DNS helper
source "$SCRIPT_DIR/godaddy-dns.sh"

# ── Validate ────────────────────────────────────────────────────────
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <base-domain> <app:repo> [app:repo] ..."
  echo "Example: $0 aventure-studio.com facilitator:alfred-KE/Facilitator"
  exit 1
fi

BASE_DOMAIN="$1"; shift
TOKEN="${VERCEL_TOKEN:-}"
TEAM="${VERCEL_TEAM:-}"
WORKSPACE="${DEPLOY_WORKSPACE:-$(pwd)/..}"

cmd_base="vercel"
[[ -n "$TOKEN" ]] && cmd_base="$cmd_base --token $TOKEN"
[[ -n "$TEAM"  ]] && cmd_base="$cmd_base --scope $TEAM"

# ── Process each app ────────────────────────────────────────────────
DNS_RECORDS=()

for entry in "$@"; do
  APP="${entry%%:*}"
  REPO="${entry#*:}"
  SUBDOMAIN="${APP}.${BASE_DOMAIN}"
  DIR="${WORKSPACE}/${APP^}"  # Capitalize first letter for dir name

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  App: $APP  →  $SUBDOMAIN"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Clone if needed
  if [[ ! -d "$DIR" ]]; then
    echo "→ Cloning $REPO..."
    git clone "https://github.com/${REPO}.git" "$DIR"
  fi

  pushd "$DIR" > /dev/null

  # Link to Vercel
  if [[ ! -d .vercel ]]; then
    echo "→ Linking to Vercel..."
    $cmd_base link --yes
  fi

  # Deploy to production
  echo "→ Deploying to production..."
  DEPLOY_URL=$($cmd_base --prod --yes 2>&1 | tail -1)
  echo "  Deployed: $DEPLOY_URL"

  # Add custom domain
  echo "→ Adding domain $SUBDOMAIN..."
  $cmd_base domains add "$SUBDOMAIN" --yes 2>/dev/null || true

  # Create DNS record via GoDaddy API
  if godaddy_set_cname "$APP" "$BASE_DOMAIN" "cname.vercel-dns.com"; then
    DNS_RECORDS+=("✓ CNAME  $APP  →  cname.vercel-dns.com  (auto-configured)")
  else
    DNS_RECORDS+=("✗ CNAME  $APP  →  cname.vercel-dns.com  (manual setup needed)")
  fi

  popd > /dev/null
done

# ── Summary ─────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  All apps deployed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "DNS records status:"
echo ""
for record in "${DNS_RECORDS[@]}"; do
  echo "  $record"
done
echo ""
echo "Vercel handles SSL automatically once DNS propagates."
