# Quick Fix for GitHub Actions SSH Issue

## Problem
SSH works locally but GitHub Actions shows "Permission denied (publickey,password)"

## Solution Applied
Updated both workflow files to use direct SSH key method instead of `webfactory/ssh-agent`.

---

## What You Need to Do Now

### Step 1: Verify GitHub Secrets

Go to: https://github.com/a7medabdo6/tawsyla/settings/secrets/actions

Make sure you have these 3 secrets with EXACT values:

#### 1. DROPLET_HOST
```
YOUR_DROPLET_IP
```
Example: `123.45.67.89` (just the IP, no http://, no port)

#### 2. DROPLET_USERNAME
```
root
```
(or whatever username you use to SSH)

#### 3. DROPLET_SSH_KEY
Copy EVERYTHING below (including BEGIN and END lines):
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDVZeL+sYoSD9Dt7m4LMPuQhUN+b8w+H6P1Ztcne/kCdQAAAKDEgfgZxIH4
GQAAAAtzc2gtZWQyNTUxOQAAACDVZeL+sYoSD9Dt7m4LMPuQhUN+b8w+H6P1Ztcne/kCdQ
AAAECAC0ah7jnedXfJUpJi9FfV+ep7Yh5aTSLG5H7RzuKZxdVl4v6xihIP0O3ubgsw+5CF
Q35vzD4fo/Vm1yd7+QJ1AAAAFmdpdGh1Yi1hY3Rpb25zLXRhd3N5bGEBAgMEBQYH
-----END OPENSSH PRIVATE KEY-----
```

**IMPORTANT:** 
- No extra spaces before or after
- Must include the BEGIN and END lines
- Copy exactly as shown above

---

### Step 2: Verify Public Key is on Droplet

Run this command to check:
```bash
ssh -i ~/.ssh/github_actions_tawsyla root@YOUR_DROPLET_IP "cat ~/.ssh/authorized_keys | grep github-actions-tawsyla"
```

If it returns nothing, add the key:
```bash
ssh-copy-id -i ~/.ssh/github_actions_tawsyla.pub root@YOUR_DROPLET_IP
```

Or manually:
```bash
ssh root@YOUR_DROPLET_IP
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINVl4v6xihIP0O3ubgsw+5CFQ35vzD4fo/Vm1yd7+QJ1 github-actions-tawsyla" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

---

### Step 3: Choose Which Workflow to Use

You have 2 workflow files. **Delete one** to avoid confusion:

**Option A: Keep `deploy.yml`** (Recommended - simpler)
```bash
rm .github/workflows/deploy-with-image-transfer.yml
```

**Option B: Keep `deploy-with-image-transfer.yml`** (Faster for large projects)
```bash
rm .github/workflows/deploy.yml
```

---

### Step 4: Commit and Push

```bash
git add .github/workflows/
git commit -m "Fix SSH authentication for GitHub Actions"
git push origin main
```

---

### Step 5: Monitor the Deployment

1. Go to: https://github.com/a7medabdo6/tawsyla/actions
2. Click on the latest workflow run
3. Watch the "Set up SSH" step - it should show "SSH connection successful"
4. If it fails, check the error message

---

## Testing Locally

Test if your local SSH key works:
```bash
ssh -i ~/.ssh/github_actions_tawsyla root@YOUR_DROPLET_IP "echo 'Test successful'"
```

If this works but GitHub Actions still fails, the issue is with the GitHub secret.

---

## Common Issues

### Issue 1: "Bad permissions" error
**Solution:** The private key in GitHub secret might have wrong format. Make sure:
- No extra spaces or newlines
- Includes BEGIN and END lines
- Copied exactly as shown above

### Issue 2: "Host key verification failed"
**Solution:** The workflow now uses `-o StrictHostKeyChecking=no` to bypass this

### Issue 3: Still getting "Permission denied"
**Solution:** 
1. Delete the `DROPLET_SSH_KEY` secret in GitHub
2. Create it again with the exact key shown above
3. Make sure `DROPLET_HOST` is just the IP (no extra characters)
4. Make sure `DROPLET_USERNAME` matches what you use locally

---

## What Changed in the Workflows

Both workflow files now:
1. Create SSH key file directly from secret
2. Set correct permissions (600)
3. Use `-i ~/.ssh/deploy_key` flag for all SSH/SCP/rsync commands
4. Use `-o StrictHostKeyChecking=no` to skip host verification
5. Test SSH connection before attempting deployment

This is more reliable than using the `webfactory/ssh-agent` action.
