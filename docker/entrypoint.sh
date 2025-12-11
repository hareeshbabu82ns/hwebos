#!/bin/bash
set -e

# Ensure data dir exists (handled by MongoDB container)
mkdir -p /data/db || true

# Start the application
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting in development mode..."
  exec pnpm dev
else
  echo "Starting in production mode..."
  exec pnpm start
fi
