# 🚀 Complete Deployment Guide - Sangam

## Table of Contents
1. [Quick Deployment (Free Tier)](#quick-deployment-free-tier)
2. [Database Setup](#database-setup)
3. [OAuth Configuration](#oauth-configuration)
4. [Railway Deployment (Backend)](#railway-deployment-backend)
5. [Netlify Deployment (Frontend)](#netlify-deployment-frontend)
6. [Environment Variables](#environment-variables)
7. [Custom Domain Setup](#custom-domain-setup)
8. [Production Checklist](#production-checklist)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Quick Deployment (Free Tier)

**Total Time:** 30-45 minutes
**Cost:** $0/month (using free tiers)

### Prerequisites
- GitHub account (you have: rdmurugan)
- Railway account (https://railway.app)
- Netlify account (https://netlify.com)
- MongoDB Atlas account (https://mongodb.com/cloud/atlas)

### Deployment Flow
```
GitHub Repo → Railway (Backend) ← MongoDB Atlas
              ↓
         Netlify (Frontend)
```

---

## Database Setup

### MongoDB Atlas (Free Tier - 512MB)

#### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email
3. Choose **"Shared"** (Free tier)

#### Step 2: Create Cluster
1. Click **"Build a Database"**
2. Select **"M0 FREE"** tier
3. Choose **Provider:** AWS
4. Choose **Region:** Closest to your users
   - For US users: `us-east-1` (N. Virginia)
   - For EU users: `eu-west-1` (Ireland)
   - For Asia users: `ap-south-1` (Mumbai)
5. **Cluster Name:** `Sangam` (or leave default)
6. Click **"Create"**
7. Wait 3-5 minutes for provisioning

#### Step 3: Create Database User
1. You'll see "Security Quickstart"
2. **Username:** `sangam_admin` (remember this)
3. **Password:** Click **"Autogenerate Secure Password"** (COPY IT!)
4. Or create your own strong password
5. Click **"Create User"**

#### Step 4: Network Access
1. Click **"Add My Current IP Address"**
2. Then click **"Add a Different IP Address"**
3. Enter: `0.0.0.0/0` (Allow from anywhere)
   - **Note:** This is for development. For production, restrict to Railway IPs
4. Description: `Railway & Development`
5. Click **"Confirm"**

#### Step 5: Get Connection String
1. Click **"Databases"** in sidebar
2. Click **"Connect"** on your cluster
3. Click **"Connect your application"**
4. **Driver:** Node.js, **Version:** 4.1 or later
5. Copy the connection string:
   ```
   mongodb+srv://sangam_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before `?`:
   ```
   mongodb+srv://sangam_admin:YourPassword123@cluster0.xxxxx.mongodb.net/sangam?retryWrites=true&w=majority
   ```

**Example Final Connection String:**
```
mongodb+srv://sangam_admin:MySecurePass123@cluster0.abc123.mongodb.net/sangam?retryWrites=true&w=majority
```

**SAVE THIS STRING!** You'll need it for Railway.

---

## OAuth Configuration

### Google OAuth Setup

#### Step 1: Create Project
1. Go to https://console.cloud.google.com/
2. Click project dropdown (top left)
3. Click **"New Project"**
4. **Project name:** `Sangam Video Conference`
5. Click **"Create"**
6. Wait for project creation (30 seconds)
7. Select your new project from dropdown

#### Step 2: Enable APIs
1. Search for **"Google+ API"** in search bar
2. Click on **"Google+ API"**
3. Click **"Enable"**
4. Go back to console

#### Step 3: Configure OAuth Consent Screen
1. Click **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (for public apps)
3. Click **"Create"**

**Fill in:**
- **App name:** `Sangam`
- **User support email:** your email
- **App logo:** (optional)
- **Application home page:** `https://your-app.netlify.app` (update later)
- **Developer contact email:** your email
4. Click **"Save and Continue"**
5. **Scopes:** Skip (click "Save and Continue")
6. **Test users:** Skip (click "Save and Continue")
7. Click **"Back to Dashboard"**

#### Step 4: Create OAuth Credentials
1. Click **"Credentials"** in sidebar
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. **Application type:** Web application
4. **Name:** `Sangam Web Client`

**Authorized JavaScript origins:**
- `http://localhost:5001` (for development)
- `https://your-railway-app.up.railway.app` (add after Railway deployment)

**Authorized redirect URIs:**
- `http://localhost:5001/api/auth/google/callback` (development)
- `https://your-railway-app.up.railway.app/api/auth/google/callback` (production)

5. Click **"Create"**
6. **COPY YOUR CREDENTIALS:**
   - Client ID: `1234567890-abcdefghijklmnop.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-AbCdEfGhIjKlMnOpQrStUvWx`

**SAVE THESE!** You'll need them for Railway.

---

### Facebook OAuth Setup

#### Step 1: Create App
1. Go to https://developers.facebook.com/
2. Click **"My Apps"** → **"Create App"**
3. Choose **"Consumer"** or **"None"**
4. Click **"Next"**
5. **App name:** `Sangam Video Conference`
6. **App contact email:** your email
7. Click **"Create App"**
8. Complete security check if prompted

#### Step 2: Add Facebook Login
1. In dashboard, find **"Facebook Login"**
2. Click **"Set Up"**
3. Choose **"Web"**
4. **Site URL:** `http://localhost:3000`
5. Click **"Save"** → **"Continue"**

#### Step 3: Configure Settings
1. In left sidebar: **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs:**
   ```
   http://localhost:5001/api/auth/facebook/callback
   https://your-railway-app.up.railway.app/api/auth/facebook/callback
   ```
3. Click **"Save Changes"**

#### Step 4: Get Credentials
1. Go to **Settings** → **Basic** in sidebar
2. **COPY YOUR CREDENTIALS:**
   - App ID: `1234567890123456`
   - App Secret: Click **"Show"** → Copy it

**SAVE THESE!** You'll need them for Railway.

#### Step 5: Make App Live
1. Toggle **"App Mode"** from "Development" to "Live" (top of page)
2. You may need to complete **App Review** for public use

---

## Railway Deployment (Backend)

### Step 1: Sign Up for Railway
1. Go to https://railway.app
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Click **"Configure GitHub App"**
4. Select **"Only select repositories"**
5. Choose **"rdmurugan/Sangam"**
6. Click **"Install & Authorize"**

### Step 3: Select Repository
1. Find and click **"rdmurugan/Sangam"**
2. Railway detects it's a monorepo
3. Click **"Add variables"** (we'll do this next)

### Step 4: Configure Root Directory
1. Click on your deployed service
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Enter: `backend`
5. Click checkmark to save

### Step 5: Add Environment Variables
1. Click **"Variables"** tab
2. Click **"New Variable"** for each:

**Required Variables:**
```
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
BACKEND_URL=https://your-app.up.railway.app
```

**Database:**
```
MONGODB_URI=mongodb+srv://sangam_admin:YourPassword@cluster0.xxxxx.mongodb.net/sangam?retryWrites=true&w=majority
```
*(Use your actual MongoDB connection string from earlier)*

**Secrets (Generate secure random strings):**
```
JWT_SECRET=your-32-character-random-string-here
SESSION_SECRET=another-different-32-char-string
```

**To generate secrets, run in terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Google OAuth (if using):**
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-secret
```

**Facebook OAuth (if using):**
```
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

3. Click **"Add"** after each variable

### Step 6: Deploy
1. Railway auto-deploys on commit
2. Watch the **"Deployments"** tab
3. Wait for build to complete (2-3 minutes)
4. Check logs for errors

### Step 7: Generate Domain
1. Go to **"Settings"** tab
2. Find **"Domains"** section
3. Click **"Generate Domain"**
4. You'll get: `your-app-production-xxxx.up.railway.app`
5. **COPY THIS URL!**

### Step 8: Test Backend
1. Visit: `https://your-railway-url.up.railway.app/api/room/create`
2. Should return JSON response or "Cannot GET" (OK)
3. Check **"Deployments"** → **"View Logs"** for any errors

---

## Netlify Deployment (Frontend)

### Step 1: Update Frontend Configuration
Before deploying, update your local code:

1. **Edit `frontend/.env`:**
   ```
   REACT_APP_SOCKET_URL=https://your-railway-url.up.railway.app
   ```
   *(Replace with your actual Railway URL)*

2. **Commit changes:**
   ```bash
   cd /Users/durai/Documents/GitHub/Sangam
   git add frontend/.env
   git commit -m "Update backend URL for production"
   git push
   ```

### Step 2: Sign Up for Netlify
1. Go to https://app.netlify.com
2. Click **"Sign up"** → **"GitHub"**
3. Authorize Netlify

### Step 3: Create New Site
1. Click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Click **"Configure the Netlify app on GitHub"**
4. Select **"rdmurugan/Sangam"** repository
5. Click **"Save"**

### Step 4: Configure Build Settings
1. Select **"rdmurugan/Sangam"** from list
2. Configure build settings:

**Build Settings:**
```
Base directory: frontend
Build command: npm install && npm run build
Publish directory: frontend/build
```

3. Click **"Show advanced"** → **"New variable"**
4. Add environment variable:
   ```
   Key: REACT_APP_SOCKET_URL
   Value: https://your-railway-url.up.railway.app
   ```

5. Click **"Deploy site"**

### Step 5: Wait for Deployment
1. Netlify builds your site (3-5 minutes)
2. Watch the deploy log
3. Wait for "Site is live" message

### Step 6: Get Your URL
1. Your site is live at: `https://random-name-12345.netlify.app`
2. **COPY THIS URL!**

### Step 7: (Optional) Change Site Name
1. Click **"Site settings"**
2. Click **"Change site name"**
3. Try: `sangam-video`, `sangam-conference`, `sangam-meet`
4. If available, your new URL: `https://sangam-video.netlify.app`

### Step 8: Update Backend CORS
1. Go back to **Railway dashboard**
2. Click your backend service
3. Go to **"Variables"** tab
4. Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://sangam-video.netlify.app
   ```
5. Railway will auto-redeploy

### Step 9: Update OAuth Redirect URLs

**Google:**
1. Go to https://console.cloud.google.com/
2. **APIs & Services** → **Credentials**
3. Click your OAuth client
4. Update **Authorized redirect URIs:**
   - Add: `https://your-railway-url.up.railway.app/api/auth/google/callback`
5. Click **"Save"**

**Facebook:**
1. Go to https://developers.facebook.com/
2. Your app → **Facebook Login** → **Settings**
3. Update **Valid OAuth Redirect URIs:**
   - Add: `https://your-railway-url.up.railway.app/api/auth/facebook/callback`
4. Click **"Save Changes"**

---

## Environment Variables

### Complete Backend .env (Railway)
```env
# Server
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://sangam-video.netlify.app
BACKEND_URL=https://sangam-production-xxxx.up.railway.app

# Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sangam?retryWrites=true&w=majority

# Secrets (REQUIRED - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
SESSION_SECRET=z6y5x4w3v2u1t0s9r8q7p6o5n4m3l2k1j0i9h8g7f6e5d4c3b2a1

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrSt

# Facebook OAuth (Optional)
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
```

### Frontend .env (Netlify)
```env
REACT_APP_SOCKET_URL=https://sangam-production-xxxx.up.railway.app
```

---

## Custom Domain Setup

### Buy Domain
**Recommended Registrars:**
- Namecheap (https://namecheap.com) - $8-12/year
- Google Domains (https://domains.google) - $12/year
- Cloudflare (https://cloudflare.com) - At cost (~$8/year)

### Configure DNS

**For Frontend (Netlify):**
1. Netlify Dashboard → **Domain settings** → **Add custom domain**
2. Enter your domain: `sangam.yourdomain.com`
3. Follow Netlify instructions:
   - Add CNAME record: `sangam` → `your-site.netlify.app`
4. Netlify auto-provisions SSL (free)

**For Backend (Railway):**
1. Railway Dashboard → **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter: `api.yourdomain.com`
4. Add CNAME record to your DNS:
   - Name: `api`
   - Value: `your-app.up.railway.app`
5. Wait for DNS propagation (5-60 minutes)

**Update Environment Variables:**
- Railway `FRONTEND_URL`: `https://sangam.yourdomain.com`
- Railway `BACKEND_URL`: `https://api.yourdomain.com`
- Netlify `REACT_APP_SOCKET_URL`: `https://api.yourdomain.com`

---

## Production Checklist

### Security
- [ ] MongoDB: Restrict IP access to Railway IPs only
- [ ] Change all default secrets (JWT, Session)
- [ ] Enable 2FA on all accounts (GitHub, Railway, Netlify, MongoDB)
- [ ] Review OAuth app settings (make apps public/live)
- [ ] Enable HTTPS only (automatic on Railway & Netlify)
- [ ] Set secure cookie flags (already configured)
- [ ] Review CORS settings (whitelist only your domain)

### Performance
- [ ] Enable Netlify CDN (automatic)
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Enable gzip compression (automatic)
- [ ] Monitor MongoDB query performance

### Monitoring
- [ ] Set up Railway alerts (in settings)
- [ ] Configure Netlify deploy notifications
- [ ] Set up MongoDB alerts (in Atlas)
- [ ] Add error tracking (Sentry recommended)
- [ ] Set up uptime monitoring (UptimeRobot free tier)

### Backup
- [ ] Enable MongoDB automated backups (Atlas)
- [ ] Backup environment variables (save securely)
- [ ] Document deployment process
- [ ] Keep local copy of codebase

---

## Monitoring & Maintenance

### Railway Monitoring
1. **Dashboard:** https://railway.app/dashboard
2. **Metrics:** CPU, Memory, Network usage
3. **Logs:** Real-time application logs
4. **Alerts:** Set up in project settings

### Netlify Monitoring
1. **Dashboard:** https://app.netlify.com
2. **Analytics:** Page views, bandwidth
3. **Deploy logs:** Build status and errors
4. **Forms:** (if you add contact forms)

### MongoDB Atlas Monitoring
1. **Dashboard:** https://cloud.mongodb.com
2. **Metrics:** Connections, operations, storage
3. **Alerts:** Configure in project settings
4. **Backups:** Automated daily backups (free tier)

### Recommended Tools

**Error Tracking:**
- Sentry (https://sentry.io) - Free tier: 5K errors/month
- LogRocket (https://logrocket.com) - Session replay

**Uptime Monitoring:**
- UptimeRobot (https://uptimerobot.com) - Free: 50 monitors
- Pingdom (https://pingdom.com) - Paid

**Analytics:**
- Google Analytics (free)
- Plausible (privacy-focused, paid)

---

## Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check Railway logs for errors
- Verify `PORT` environment variable is set
- Check `MONGODB_URI` is correct
- Review startup logs

**"Cannot connect to MongoDB"**
- Verify connection string format
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify database user credentials
- Check network access settings

**"OAuth not working"**
- Verify redirect URIs match exactly
- Check OAuth credentials are set
- Make sure apps are published/live
- Review OAuth consent screen settings

### Frontend Issues

**"Failed to fetch"**
- Check `REACT_APP_SOCKET_URL` is correct
- Verify backend is running (visit Railway URL)
- Check CORS settings in backend
- Review browser console for errors

**"WebSocket connection failed"**
- Verify Socket.io CORS configuration
- Check Railway logs for connection errors
- Ensure `FRONTEND_URL` matches exactly

### Database Issues

**"Connection timeout"**
- Check MongoDB Atlas status
- Verify IP whitelist includes 0.0.0.0/0
- Check connection string format
- Review MongoDB Atlas logs

### Deployment Issues

**Railway build fails:**
- Check `package.json` syntax
- Verify all dependencies are listed
- Review build logs for specific errors
- Check Node version compatibility

**Netlify build fails:**
- Check `REACT_APP_SOCKET_URL` is set
- Verify build command is correct
- Check for syntax errors in code
- Review deploy logs

---

## Cost Breakdown

### Free Tier (Current Setup)
- **Railway:** 500 hours/month + $5 credit/month = $0-5/month
- **Netlify:** 100GB bandwidth/month = $0/month
- **MongoDB Atlas:** 512MB storage = $0/month
- **Total:** $0-5/month

### Paid Tier (Recommended for Production)
- **Railway Hobby:** $5/month (always-on, better resources)
- **Netlify Pro:** $19/month (analytics, forms) - *Optional*
- **MongoDB M10:** $0.08/hour (~$57/month) - *When you need more storage*
- **Domain:** $12/year
- **Total:** $17-81/month depending on features

### Enterprise Scale
- **Railway Pro:** $20/month per service
- **MongoDB M30+:** $200+/month
- **CDN:** $20-100/month
- **Monitoring:** $50-200/month
- **Total:** $500-2000+/month

---

## Next Steps After Deployment

1. **Test Everything:**
   - Create account
   - Login with email
   - Test Google OAuth
   - Test Facebook OAuth
   - Create meeting
   - Join meeting
   - Test video/audio
   - Test screen share
   - Test chat

2. **Share Your App:**
   - Get feedback from users
   - Monitor usage metrics
   - Track errors

3. **Iterate:**
   - Fix bugs
   - Add features
   - Improve performance

4. **Scale:**
   - Upgrade MongoDB when needed
   - Upgrade Railway plan for better performance
   - Add CDN for global users
   - Implement SFU for more participants

---

## Support

**Documentation:**
- Railway: https://docs.railway.app
- Netlify: https://docs.netlify.com
- MongoDB Atlas: https://docs.atlas.mongodb.com

**Community:**
- Railway Discord: https://discord.gg/railway
- Netlify Community: https://answers.netlify.com
- MongoDB Community: https://community.mongodb.com

**Your Repository:**
- GitHub: https://github.com/rdmurugan/Sangam
- Issues: https://github.com/rdmurugan/Sangam/issues

---

## Congratulations! 🎉

Your Sangam video conferencing app is now deployed and accessible worldwide!

**Your URLs:**
- Frontend: `https://your-app.netlify.app`
- Backend: `https://your-app.up.railway.app`
- Database: MongoDB Atlas Cloud

**Share with friends and start conferencing!** 🚀