# Auto-Deploy to DigitalOcean Setup Guide

This guide explains how to set up automatic Docker image builds and deployment to your DigitalOcean droplet when pushing to the `main` branch.

## Prerequisites

- A DigitalOcean droplet (Ubuntu recommended)
- GitHub repository with push access
- SSH access to your droplet

---

## Step 1: Prepare Your DigitalOcean Droplet

### 1.1 SSH into your droplet
```bash
ssh root@YOUR_DROPLET_IP
```

### 1.2 Install Docker and Docker Compose
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y

# Install Docker Compose
sudo apt install docker-compose -y

# Enable and start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker-compose --version
```

### 1.3 Create deployment directory
```bash
mkdir -p /opt/tawsyla
cd /opt/tawsyla
```

### 1.4 (Optional) Create a dedicated deployment user
```bash
# Create user
sudo adduser deployer

# Add to docker group
sudo usermod -aG docker deployer

# Give ownership of deployment directory
sudo chown -R deployer:deployer /opt/tawsyla
```

---

## Step 2: Set Up SSH Key for GitHub Actions

### 2.1 Generate SSH key pair on your local machine
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_tawsyla
```

### 2.2 Copy the public key to your droplet
```bash
# Copy public key content
cat ~/.ssh/github_actions_tawsyla.pub

# SSH into droplet and add it to authorized_keys
ssh root@YOUR_DROPLET_IP
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### 2.3 Test the connection
```bash
ssh -i ~/.ssh/github_actions_tawsyla root@YOUR_DROPLET_IP
```

### 2.4 Get the private key for GitHub
```bash
cat ~/.ssh/github_actions_tawsyla
```
Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

---

## Step 3: Configure GitHub Repository Secrets

1. Go to your GitHub repository: `https://github.com/a7medabdo6/tawsyla`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `DROPLET_HOST` | Your droplet IP address | `123.45.67.89` |
| `DROPLET_USERNAME` | SSH username | `root` or `deployer` |
| `DROPLET_SSH_KEY` | Private SSH key content | Content from step 2.4 |

---

## Step 4: Choose Your Deployment Strategy

Two workflow files have been created:

### Option A: `deploy.yml` (Recommended for smaller projects)
- Syncs code to droplet using rsync
- Builds Docker images on the droplet
- Faster for small changes
- Uses droplet's resources for building

### Option B: `deploy-with-image-transfer.yml` (Recommended for larger projects)
- Builds Docker image in GitHub Actions
- Transfers pre-built image to droplet
- Faster deployment, consistent builds
- Uses GitHub's resources for building

**To use only one workflow:**
```bash
# Keep deploy.yml and remove the other
rm .github/workflows/deploy-with-image-transfer.yml

# OR keep deploy-with-image-transfer.yml and remove the other
rm .github/workflows/deploy.yml
```

---

## Step 5: Update docker-compose.yaml for Production

Make sure your `docker-compose.yaml` is production-ready:

```yaml
services:
  postgres:
    image: postgres:13
    container_name: postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_pass
      POSTGRES_DB: tawsyla_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nest_network
    restart: always

  nestjs:
    build: ./tawsyla_backend
    env_file:
      - ./tawsyla_backend/.env
    container_name: nestjs-app
    depends_on:
      - postgres
    networks:
      - nest_network
    ports:
      - "3000:3000"  # Expose to host
    restart: always

networks:
  nest_network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
```

---

## Step 6: Prepare Environment Variables on Droplet

### 6.1 Create .env file on droplet
```bash
ssh root@YOUR_DROPLET_IP
mkdir -p /opt/tawsyla/tawsyla_backend
nano /opt/tawsyla/tawsyla_backend/.env
```

### 6.2 Add your production environment variables
Update the values for production (database host should be `postgres` for Docker network):
```env
NODE_ENV=production
APP_PORT=3000
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres_pass
DATABASE_NAME=tawsyla_db
# ... add all other variables
```

---

## Step 7: Test the Deployment

### 7.1 Commit and push the workflow files
```bash
git add .github/workflows/
git add DEPLOYMENT.md
git commit -m "Add auto-deployment workflow"
git push origin main
```

### 7.2 Monitor the deployment
1. Go to your GitHub repository
2. Click on **Actions** tab
3. Watch the workflow run
4. Check for any errors

### 7.3 Verify on droplet
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/tawsyla
docker-compose ps
docker-compose logs -f nestjs
```

---

## Step 8: Configure Firewall (Important!)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow your application port
sudo ufw allow 3000/tcp

# Allow HTTP/HTTPS if using nginx
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

---

## Troubleshooting

### Check GitHub Actions logs
- Go to Actions tab in GitHub
- Click on the failed workflow
- Review the logs for errors

### Check Docker logs on droplet
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/tawsyla
docker-compose logs -f
```

### Rebuild manually on droplet
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/tawsyla
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Check disk space
```bash
df -h
docker system prune -a  # Clean up unused Docker resources
```

---

## Additional Tips

### Enable Docker logging rotation
Create `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```
Then restart Docker: `sudo systemctl restart docker`

### Set up health checks
Add to your docker-compose.yaml:
```yaml
nestjs:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Monitor deployments
Use DigitalOcean's monitoring tools or install monitoring solutions like:
- Prometheus + Grafana
- Datadog
- New Relic

---

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use strong passwords** for database and services
3. **Keep SSH keys secure** - Never share or commit them
4. **Regular updates**: `sudo apt update && sudo apt upgrade`
5. **Use HTTPS** with Let's Encrypt SSL certificates
6. **Limit SSH access** to specific IPs if possible
7. **Regular backups** of your database

---

## Next Steps

1. Set up nginx as reverse proxy with SSL
2. Configure domain name
3. Set up database backups
4. Add monitoring and alerting
5. Implement CI/CD testing before deployment
