#!/bin/sh
set -e

echo "=== PocketBase Startup Script ==="


ADMIN_EMAIL=${POCKETBASE_SU_EMAIL:-"admin@p33chat.com"}
ADMIN_PASSWORD=${POCKETBASE_SU_PASSWORD:-"p33chatisverycool"}

echo "Admin email will be: $ADMIN_EMAIL"
# fix perms issue
mkdir -p /app/pb_data
chmod 755 /app/pb_data

if [ ! -f /app/pb_data/data.db ]; then
    echo "=== FIRST RUN DETECTED ==="
    echo "Creating admin user: $ADMIN_EMAIL"
    pocketbase superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASSWORD" || {
        echo "Admin user might already exist or creation failed, continuing..."
    } 
    echo "=== SETUP COMPLETE ==="
else
    echo "=== EXISTING DATABASE FOUND ==="
fi

echo "Starting pocketbase server..."
exec pocketbase serve --http 0.0.0.0:8090
