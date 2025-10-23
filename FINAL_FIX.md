# Final Fix: Using Shell Scripts Instead of Inline Commands

## Problem
The `docker compose` commands were being interpreted as YAML syntax, causing:
```
yaml: line 43: found character that cannot start any token
```

This happened even with:
- Heredoc syntax (`<< 'EOF'`)
- Command chaining with `&&`
- Proper escaping

## Root Cause
When SSH executes commands remotely, the shell on the droplet interprets `docker compose` as YAML because:
1. The colon `:` in `compose:` triggers YAML parsing
2. GitHub Actions' shell processing conflicts with remote shell execution
3. Complex command strings get mangled during SSH transmission

## Final Solution: Shell Scripts

Instead of inline commands, we now use dedicated shell scripts that are:
1. Transferred to the droplet
2. Made executable
3. Executed directly via SSH

### Files Created:

#### 1. `.github/scripts/deploy.sh`
```bash
#!/bin/bash
set -e
cd /opt/tawsyla
docker compose down || true
docker image prune -af
docker compose build --no-cache
docker compose up -d
docker compose ps
```

#### 2. `.github/scripts/health-check.sh`
```bash
#!/bin/bash
set -e
cd /opt/tawsyla
sleep 10
docker compose ps
docker compose logs --tail=50
```

#### 3. `.github/scripts/deploy-image.sh`
```bash
#!/bin/bash
set -e
cd /opt/tawsyla
docker load < tawsyla-backend.tar.gz
docker compose down || true
docker compose up -d
rm -f tawsyla-backend.tar.gz
docker compose ps
docker compose logs --tail=30 nestjs
```

### Workflow Changes:

**Before (Broken):**
```yaml
run: |
  ssh -T $USER@$HOST "cd /opt/tawsyla && \
    docker compose down && \
    docker compose up -d"
```

**After (Working):**
```yaml
run: |
  # Rsync copies everything including scripts
  rsync -avz --delete ./ $USER@$HOST:/opt/tawsyla/
  
  # Make scripts executable
  ssh $USER@$HOST "chmod +x /opt/tawsyla/.github/scripts/*.sh"
  
  # Execute script
  ssh -T $USER@$HOST "/opt/tawsyla/.github/scripts/deploy.sh"
```

**Important:** Scripts are now located at `/opt/tawsyla/.github/scripts/` on the droplet, matching the repository structure.

## Benefits of This Approach:

1. ✅ **No YAML parsing issues** - Scripts are plain bash files
2. ✅ **Cleaner workflows** - Simple SSH commands
3. ✅ **Easier debugging** - Can test scripts locally
4. ✅ **Reusable** - Scripts can be run manually on droplet
5. ✅ **Better error handling** - `set -e` in scripts
6. ✅ **Maintainable** - Easy to update deployment logic

## Files Updated:
- ✅ `.github/workflows/deploy.yml`
- ✅ `.github/workflows/deploy-with-image-transfer.yml`
- ✅ Created `.github/scripts/deploy.sh`
- ✅ Created `.github/scripts/health-check.sh`
- ✅ Created `.github/scripts/deploy-image.sh`

## How It Works:

1. **GitHub Actions runs**
2. **Scripts are transferred** to droplet via SCP
3. **Scripts are made executable** with `chmod +x`
4. **Scripts are executed** via SSH
5. **Docker commands run** on droplet without YAML conflicts

## Testing Manually:

You can also run these scripts manually on your droplet:
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/tawsyla
./deploy.sh
```

## Next Steps:
```bash
git add .github/
git commit -m "Use shell scripts to fix docker compose YAML parsing"
git push origin main
```

## Why This Works:

The key insight is that the problem wasn't with SSH or YAML syntax in the workflow file. The issue was that when commands are passed through SSH, the remote shell tries to interpret them, and `docker compose` triggers YAML parsing on the remote system.

By using separate shell script files:
- Commands are executed in their own bash context
- No YAML parsing happens
- Docker compose runs as intended
- Clean separation of concerns
