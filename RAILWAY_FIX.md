# 🔧 Railway Deployment Fix

## Problem: "Railpack could not determine how to build the app" or "Error creating build plan"

Railway has issues with:
1. Monorepo structure (backend + frontend)
2. Native dependencies (bcrypt requires Python/GCC)
3. Complex package structures

## BEST SOLUTION: Use Render.com or Heroku Instead

Railway is having issues with our dependencies. **Use Render.com** (same free tier, better support):

---

## Solution 1: Use Root Directory Setting (EASIEST)

### Steps:
1. Deploy your app to Railway normally
2. Click on your service
3. Go to **Settings** tab
4. Scroll to **Service Settings**
5. Find **Root Directory**
6. Enter: `backend`
7. Click save (checkmark)
8. Railway will redeploy automatically

**This is the recommended approach!**

---

## Solution 2: Railway Configuration Files (ALTERNATIVE)

I've added configuration files to your repo:

### Files Added:
- `railway.json` - Railway build configuration
- `nixpacks.toml` - Nixpacks build instructions
- `backend/.railwayignore` - Ignore frontend files

### How It Works:
```json
// railway.json tells Railway:
{
  "build": {
    "buildCommand": "cd backend && npm install"
  },
  "deploy": {
    "startCommand": "cd backend && npm start"
  }
}
```

---

## Solution 3: Separate Repository (MOST RELIABLE)

If Railway still has issues:

### Option A: Deploy Backend Only

1. **Create new Railway project**
2. Click **"Deploy from GitHub repo"**
3. Select **"rdmurugan/Sangam"**
4. Railway detects `backend/package.json`
5. Set **Root Directory** to `backend`
6. Deploy!

### Option B: Split into Two Repos (For complex projects)

**Not needed for now**, but for reference:

```bash
# Create backend-only repo
cd /Users/durai/Documents/GitHub
mkdir Sangam-Backend
cp -r Sangam/backend/* Sangam-Backend/
cd Sangam-Backend
git init
git add .
git commit -m "Backend only"
gh repo create Sangam-Backend --public --source=. --remote=origin --push
```

Then deploy from `Sangam-Backend` repo.

---

## Verify Deployment

### Check Build Logs:
1. Railway Dashboard → Your service
2. Click **"Deployments"** tab
3. Click latest deployment
4. Watch logs for:
   ```
   > sangam-backend@1.0.0 start
   > node server.js

   MongoDB connected successfully (or: running without database)
   Server running on port 5001
   ```

### Test Endpoints:
```bash
# Test basic endpoint
curl https://your-app.up.railway.app/api/room/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"hostName":"Test","roomName":"Test Room"}'

# Should return JSON with roomId
```

---

## Common Railway Errors & Fixes

### Error: "No package.json found"
**Fix:** Set Root Directory to `backend`

### Error: "Port already in use"
**Fix:** Make sure `PORT` environment variable is set to `5001`

### Error: "Cannot find module"
**Fix:** Check `package.json` has all dependencies listed

### Error: "Command not found: node"
**Fix:** Check `nixpacks.toml` has correct Node version

### Error: "Application crashed"
**Fix:**
- Check logs for specific error
- Verify environment variables are set
- Test locally first: `cd backend && npm start`

---

## Environment Variables (Quick Reference)

**Required:**
```
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-netlify-app.netlify.app
JWT_SECRET=your-32-char-secret
SESSION_SECRET=another-32-char-secret
```

**Optional (but recommended):**
```
MONGODB_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

---

## Railway Service Settings

**Recommended settings:**

```
Root Directory: backend
Build Command: npm install
Start Command: npm start
Node Version: 18.x
Auto Deploy: ON
Health Check: /api/room/create (GET)
```

---

## ⭐ RECOMMENDED: Render.com Deployment (EASIEST)

Render.com handles monorepos and native dependencies better than Railway:

### Steps:
1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub: `rdmurugan/Sangam`
4. **Settings:**
   - Name: `sangam-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Environment:**
   - Add all environment variables
6. Click **"Create Web Service"**

**Free tier includes:**
- 750 hours/month
- Auto-sleep after 15 min inactivity
- Custom domain support

---

## Quick Deploy Checklist

- [ ] Repository pushed to GitHub
- [ ] Railway account created
- [ ] MongoDB Atlas cluster created
- [ ] Connection string copied
- [ ] Railway project created
- [ ] Root directory set to `backend`
- [ ] Environment variables added
- [ ] Domain generated
- [ ] Deployment successful
- [ ] Endpoints tested
- [ ] Logs reviewed

---

## Need Help?

**Check:**
1. Railway build logs (most important!)
2. Railway runtime logs
3. MongoDB Atlas connection status
4. GitHub Actions (if enabled)

**Test Locally:**
```bash
cd backend
npm install
npm start
# Should work locally first!
```

**Railway Community:**
- Discord: https://discord.gg/railway
- Docs: https://docs.railway.app

---

## Success Indicators

✅ **Build succeeds:**
```
Building...
Installing dependencies
Build complete
```

✅ **Deploy succeeds:**
```
Starting application
Server running on port 5001
Healthy
```

✅ **Endpoint works:**
```bash
curl https://your-app.up.railway.app
# Returns response (not 502 error)
```

You're all set! 🚀