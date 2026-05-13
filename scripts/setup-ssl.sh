#!/bin/bash
# Usage: ./scripts/setup-ssl.sh your-subdomain.duckdns.org your@email.com
# Run this ONCE on the Azure VM after DuckDNS points to the server IP.

set -e

DOMAIN="${1:?Usage: $0 <domain> <email>}"
EMAIL="${2:?Usage: $0 <domain> <email>}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Setting up SSL for $DOMAIN ==="

# 1. Get certificate via webroot challenge
echo "[1/4] Obtaining Let's Encrypt certificate..."
sudo docker compose -f "$PROJECT_DIR/docker-compose.yml" run --rm certbot \
  certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN"

# 2. Replace nginx.conf with the HTTPS version
echo "[2/4] Activating HTTPS nginx config..."
sed "s/__DOMAIN__/$DOMAIN/g" \
  "$PROJECT_DIR/frontend/gg/nginx-ssl.conf" \
  > "$PROJECT_DIR/frontend/gg/nginx.conf"

# 3. Update ALLOWED_ORIGINS in .env
echo "[3/4] Updating ALLOWED_ORIGINS in .env..."
sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=[\"https://$DOMAIN\",\"http://$DOMAIN\"]|" \
  "$PROJECT_DIR/.env"

# 4. Rebuild frontend with new nginx.conf and restart
echo "[4/4] Rebuilding and restarting containers..."
sudo docker compose -f "$PROJECT_DIR/docker-compose.yml" up --build -d

echo ""
echo "=== Done! ==="
echo "Site is now available at: https://$DOMAIN"
echo "Certificate auto-renews every 12 hours via the certbot container."
