#!/usr/bin/env bash
# ==============================================================================
# PassVault Automated Deployment Script (CD)
# Executed on remote server via GitHub Actions or manual execution
# ==============================================================================
set -euo pipefail

echo "=========================================================="
echo "🚀 PassVault Deployment Started: $(date -u)"
echo "=========================================================="

APP_DIR="${DEPLOY_PATH:-$(pwd)}"
echo "📂 Working directory: $APP_DIR"
cd "$APP_DIR"

# 1. Pull latest changes
echo "📥 Step 1: Fetching latest code from origin/main..."
git fetch origin main
git reset --hard origin/main

# 2. Check for production environment file
echo "⚙️ Step 2: Checking environment configuration..."
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "⚠️ .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "ℹ️ Please configure production secrets in .env!"
  else
    echo "❌ Error: Neither .env nor .env.example found."
    exit 1
  fi
else
  echo "✔ .env file exists."
fi

# 3. Pull external base images and rebuild application containers
echo "🐳 Step 3: Building and starting Docker containers..."
docker compose pull --ignore-pull-failures || true
docker compose up -d --build --remove-orphans

# 4. Clean up dangling images to prevent disk exhaustion on VPS
echo "🧹 Step 4: Cleaning up unused images..."
docker image prune -f

# 5. Check health and running status
echo "📊 Step 5: Container Status:"
docker compose ps

echo "=========================================================="
echo "✅ PassVault Deployment Successfully Completed: $(date -u)"
echo "=========================================================="
