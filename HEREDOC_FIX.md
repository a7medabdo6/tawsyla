# Heredoc YAML Syntax Fix

## Problem
The error `yaml: line 43: found character that cannot start any token` occurred because the heredoc syntax was being interpreted as YAML instead of bash commands.

## Root Cause
- Using `<< 'EOF'` in SSH commands causes issues with YAML parsing
- The `docker compose` commands were being interpreted as YAML syntax
- Pseudo-terminal warning: "stdin is not a terminal"

## Solution Applied

### Changes Made:
1. **Changed SSH command**: Added `-T` flag to disable pseudo-terminal allocation
2. **Changed heredoc delimiter**: Changed from `EOF` to `ENDSSH` to avoid conflicts
3. **Added explicit bash invocation**: `ssh -T user@host bash << 'ENDSSH'`
4. **Added error handling**: `set -e` and `|| true` for non-critical commands
5. **Added echo statements**: Better logging for debugging

### Before:
```yaml
run: |
  ssh $USER@$HOST << 'EOF'
    docker compose down
  EOF
```

### After:
```yaml
run: |
  ssh -T $USER@$HOST bash << 'ENDSSH'
    set -e
    echo "Stopping containers..."
    docker compose down || true
  ENDSSH
```

## Key Changes:

### 1. `-T` Flag
- Disables pseudo-terminal allocation
- Fixes "Pseudo-terminal will not be allocated" warning
- Required when piping commands via heredoc

### 2. `bash << 'ENDSSH'`
- Explicitly invokes bash shell
- Uses `ENDSSH` delimiter (less likely to conflict)
- Single quotes prevent variable expansion in heredoc

### 3. `set -e`
- Exit immediately if any command fails
- Better error handling

### 4. `|| true`
- Allows commands to fail without stopping the script
- Used for `docker compose down` (might not have containers to stop)

## Files Updated:
- ✅ `.github/workflows/deploy.yml`
- ✅ `.github/workflows/deploy-with-image-transfer.yml`

## Next Steps:
```bash
git add .github/workflows/
git commit -m "Fix heredoc YAML syntax in workflows"
git push origin main
```

## Testing:
The workflow should now:
1. Connect via SSH without pseudo-terminal warnings
2. Execute docker compose commands correctly
3. Show proper logging output
4. Handle errors gracefully
