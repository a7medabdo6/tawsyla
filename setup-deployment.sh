#!/bin/bash

# Tawsyla Auto-Deployment Setup Script
# This script helps you set up auto-deployment to DigitalOcean

set -e

echo "======================================"
echo "Tawsyla Auto-Deployment Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if SSH key exists
SSH_KEY_PATH="$HOME/.ssh/github_actions_tawsyla"

if [ -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}SSH key already exists at $SSH_KEY_PATH${NC}"
    read -p "Do you want to use the existing key? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        echo "Generating new SSH key..."
        ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$SSH_KEY_PATH"
    fi
else
    echo "Generating SSH key for GitHub Actions..."
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$SSH_KEY_PATH"
fi

echo ""
echo -e "${GREEN}✓ SSH key generated/found${NC}"
echo ""

# Get droplet information
read -p "Enter your DigitalOcean droplet IP address: " DROPLET_IP
read -p "Enter SSH username (default: root): " DROPLET_USER
DROPLET_USER=${DROPLET_USER:-root}

echo ""
echo "======================================"
echo "Step 1: Copy SSH public key to droplet"
echo "======================================"
echo ""
echo "Public key content:"
echo "-------------------"
cat "${SSH_KEY_PATH}.pub"
echo "-------------------"
echo ""
echo "Now copying the public key to your droplet..."
ssh-copy-id -i "${SSH_KEY_PATH}.pub" "${DROPLET_USER}@${DROPLET_IP}"

echo ""
echo -e "${GREEN}✓ SSH key copied to droplet${NC}"
echo ""

# Test connection
echo "Testing SSH connection..."
if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=5 "${DROPLET_USER}@${DROPLET_IP}" "echo 'Connection successful'" &> /dev/null; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}✗ SSH connection failed. Please check your droplet IP and credentials.${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo "Step 2: GitHub Secrets Configuration"
echo "======================================"
echo ""
echo "Add the following secrets to your GitHub repository:"
echo "Go to: https://github.com/a7medabdo6/tawsyla/settings/secrets/actions"
echo ""
echo -e "${YELLOW}Secret Name: DROPLET_HOST${NC}"
echo "Value: $DROPLET_IP"
echo ""
echo -e "${YELLOW}Secret Name: DROPLET_USERNAME${NC}"
echo "Value: $DROPLET_USER"
echo ""
echo -e "${YELLOW}Secret Name: DROPLET_SSH_KEY${NC}"
echo "Value (copy everything below):"
echo "-------------------"
cat "$SSH_KEY_PATH"
echo "-------------------"
echo ""

# Ask if user wants to set up the droplet
read -p "Do you want to set up Docker on the droplet now? (y/n): " setup_docker

if [ "$setup_docker" = "y" ]; then
    echo ""
    echo "======================================"
    echo "Step 3: Setting up Docker on droplet"
    echo "======================================"
    echo ""
    
    ssh -i "$SSH_KEY_PATH" "${DROPLET_USER}@${DROPLET_IP}" << 'ENDSSH'
        echo "Updating system..."
        sudo apt update && sudo apt upgrade -y
        
        echo "Installing Docker..."
        sudo apt install docker.io docker-compose -y
        
        echo "Enabling Docker service..."
        sudo systemctl enable docker
        sudo systemctl start docker
        
        echo "Creating deployment directory..."
        sudo mkdir -p /opt/tawsyla
        sudo chown -R $USER:$USER /opt/tawsyla
        
        echo "Docker installation complete!"
        docker --version
        docker-compose --version
ENDSSH
    
    echo ""
    echo -e "${GREEN}✓ Docker setup complete on droplet${NC}"
fi

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Add the GitHub secrets shown above to your repository"
echo "2. Choose which workflow to use (see DEPLOYMENT.md)"
echo "3. Commit and push the workflow files to trigger deployment"
echo ""
echo "Commands to commit and push:"
echo "  git add .github/workflows/ docker-compose.yaml DEPLOYMENT.md"
echo "  git commit -m 'Add auto-deployment workflow'"
echo "  git push origin main"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
