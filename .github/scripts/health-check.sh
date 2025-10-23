#!/bin/bash
set -e

cd /opt/tawsyla

echo "Waiting for services to start..."
sleep 10

echo "Checking container status:"
docker compose ps

echo "Recent logs:"
docker compose logs --tail=50
