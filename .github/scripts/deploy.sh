#!/bin/bash
set -e

cd /opt/tawsyla

echo "Stopping existing containers..."
docker compose down || true

echo "Removing old images..."
docker image prune -af

echo "Building new images..."
docker compose build 

echo "Starting containers..."
docker compose up -d

echo "Running containers:"
docker compose ps
