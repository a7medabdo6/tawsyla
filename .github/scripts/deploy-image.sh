#!/bin/bash
set -e

cd /opt/tawsyla

echo "Loading Docker image..."
docker load < tawsyla-backend.tar.gz

echo "Stopping existing containers..."
docker compose down || true

echo "Removing old images..."
docker image prune -af

echo "Starting containers with new image..."
docker compose up -d

echo "Cleaning up tar file..."
rm -f tawsyla-backend.tar.gz

echo "Running containers:"
docker compose ps

echo "Recent logs:"
docker compose logs --tail=30 nestjs
