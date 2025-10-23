#!/bin/bash

echo "======================================"
echo "SSH Setup Verification"
echo "======================================"
echo ""

read -p "Enter your droplet IP: " DROPLET_IP
read -p "Enter SSH username (default: root): " DROPLET_USER
DROPLET_USER=${DROPLET_USER:-root}

echo ""
echo "1. Testing local SSH connection..."
if ssh -i ~/.ssh/github_actions_tawsyla -o ConnectTimeout=5 "${DROPLET_USER}@${DROPLET_IP}" "echo 'Local SSH works!'" 2>/dev/null; then
    echo "✓ Local SSH connection successful"
else
    echo "✗ Local SSH connection failed"
    exit 1
fi

echo ""
echo "2. Checking if public key is in authorized_keys on droplet..."
PUBLIC_KEY=$(cat ~/.ssh/github_actions_tawsyla.pub)
ssh -i ~/.ssh/github_actions_tawsyla "${DROPLET_USER}@${DROPLET_IP}" "grep -q '$PUBLIC_KEY' ~/.ssh/authorized_keys && echo 'Key found' || echo 'Key NOT found'"

echo ""
echo "3. Checking authorized_keys permissions on droplet..."
ssh -i ~/.ssh/github_actions_tawsyla "${DROPLET_USER}@${DROPLET_IP}" "ls -la ~/.ssh/authorized_keys"

echo ""
echo "4. Private key for GitHub secret (DROPLET_SSH_KEY):"
echo "Copy EVERYTHING below (including BEGIN and END lines):"
echo "---------------------------------------------------"
cat ~/.ssh/github_actions_tawsyla
echo "---------------------------------------------------"

echo ""
echo "5. GitHub Secrets to verify:"
echo "   DROPLET_HOST = ${DROPLET_IP}"
echo "   DROPLET_USERNAME = ${DROPLET_USER}"
echo "   DROPLET_SSH_KEY = (the private key shown above)"
echo ""
echo "Go to: https://github.com/a7medabdo6/tawsyla/settings/secrets/actions"
