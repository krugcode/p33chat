#!/bin/sh
set -e

echo "=== PocketBase Startup Script ==="

# default credentials (udpate in env)
ADMIN_EMAIL=${POCKETBASE_SU_EMAIL:-"admin@p33chat.com"}
ADMIN_PASSWORD=${POCKETBASE_SU_PASSWORD:-"p33chatisverycool"}

echo "Admin email will be: $ADMIN_EMAIL"

if [ ! -f /app/pb_data/data.db ]; then
    echo "=== FIRST RUN DETECTED ==="
    
    pocketbase serve --http 0.0.0.0:8090 &
    PB_PID=$!
    sleep 3
    
    # create admin user
    echo "Creating admin user: $ADMIN_EMAIL"
    pocketbase superuser upsert "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
    
    kill $PB_PID
    wait $PB_PID 2>/dev/null || true
    
    echo "=== SETUP COMPLETE ==="
fi

echo "Starting PocketBase server..."
pocketbase serve --http 0.0.0.0:8090
