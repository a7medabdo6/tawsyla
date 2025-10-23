# Heredoc YAML Syntax Fix

## Problem
The error `yaml: line 43: found character that cannot start any token` occurred because the heredoc syntax was being interpreted as YAML instead of bash commands.

## Root Cause
- Using `<< 'EOF'` or `<< 'ENDSSH'` in SSH commands causes issues with YAML parsing
- The `docker compose` commands were being interpreted as YAML syntax
- Heredoc delimiters conflict with YAML structure
- Pseudo-terminal warning: "stdin is not a terminal"

## Solution Applied (Final)

### Changes Made:
1. **Removed heredoc syntax entirely**: Use inline command chaining instead
2. **Added `-T` flag**: Disable pseudo-terminal allocation
3. **Use `&&` operators**: Chain commands in a single SSH session
4. **Wrap in double quotes**: Properly escape the command string
5. **Use `|| true`**: Allow non-critical commands to fail gracefully

### Before (Broken):
```yaml
run: |
  ssh -T $USER@$HOST bash << 'ENDSSH'
    docker compose down
    docker compose up -d
  ENDSSH
```

### After (Working):
```yaml
run: |
  ssh -T $USER@$HOST "cd /opt/tawsyla && \
    echo 'Stopping containers...' && \
    docker compose down || true && \
    echo 'Starting containers...' && \
    docker compose up -d"
```

## Key Changes:

### 1. No Heredoc
- Completely removed heredoc syntax (`<< 'EOF'` or `<< 'ENDSSH'`)
- Avoids YAML parsing conflicts entirely
- More reliable in GitHub Actions

### 2. `-T` Flag
- Disables pseudo-terminal allocation
- Fixes "Pseudo-terminal will not be allocated" warning
- Required for non-interactive SSH sessions

### 3. Command Chaining with `&&`
- All commands in a single SSH session
- Commands execute sequentially
- Stops on first failure (unless using `|| true`)

### 4. `|| true`
- Allows specific commands to fail without stopping the script
- Used for `docker compose down` (might not have containers to stop)
- Ensures workflow continues even if command fails

### 5. Backslash Line Continuation
- `\` at end of lines for readability
- Keeps YAML clean and easy to read
- All commands are part of one string

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
