#!/bin/sh
set -e

# Fix storage & bootstrap/cache permissions on every startup.
# Needed because docker-compose mounts ./backend as a volume which
# overrides the chown done at image build time.
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
chmod -R 775 /var/www/storage /var/www/bootstrap/cache

exec "$@"
