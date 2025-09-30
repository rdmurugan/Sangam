# Quick Deployment Guide - Sangam

## Prerequisites
- GitHub account
- Railway account (https://railway.app)
- Netlify account (https://netlify.com)

---

## Step 1: Push to GitHub

```bash
cd /Users/durai/Documents/GitHub/Sangam

# Add all files
git add .

# Commit
git commit -m "Initial commit - Sangam video conferencing app"

# Create GitHub repo (if you have gh CLI)
gh repo create Sangam --public --source=. --remote=origin

# Push to GitHub
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

### Option A: Via Railway Dashboard (Easiest)

1. **Go to https://railway.app**
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select **"Sangam"** repository
6. Railway will ask which folder to deploy:
   - Click **"Configure"**
   - Set **Root Directory** to: `backend`
7. Railway auto-detects Node.js and deploys!

8. **Set Environment Variables:**
   - Click on your service
   - Go to **"Variables"** tab
   - Add these variables:
     ```
     PORT=5001
     NODE_ENV=production
     FRONTEND_URL=https://your-app.netlify.app
     ```
     (We'll update FRONTEND_URL after deploying frontend)

9. **Get your backend URL:**
   - Go to **"Settings"** tab
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `https://sangam-backend-production.up.railway.app`)

### Option B: Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to Railway project
cd backend
railway init

# Deploy
railway up

# Set environment variables
railway variables set PORT=5001
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-app.netlify.app

# Get your URL
railway domain
```

---

## Step 3: Update Frontend Configuration

Update your frontend to point to Railway backend:

```bash
# Edit frontend/.env
# Change:
REACT_APP_SOCKET_URL=https://YOUR-RAILWAY-URL.railway.app

# Example:
REACT_APP_SOCKET_URL=https://sangam-backend-production.up.railway.app
```

---

## Step 4: Deploy Frontend to Netlify

### Option A: Via Netlify Dashboard (Easiest)

1. **Go to https://app.netlify.com**
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify
5. Select **"Sangam"** repository
6. **Configure build settings:**
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/build`
7. Click **"Deploy site"**

8. **Update site name (optional):**
   - Go to **"Site settings"** → **"Change site name"**
   - Choose something like: `sangam-video-conf`

9. **Get your frontend URL:**
   - Your site will be at: `https://sangam-video-conf.netlify.app`

### Option B: Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build the frontend
cd frontend
npm run build

# Deploy
netlify deploy --prod

# Follow prompts:
# - Create & configure a new site
# - Publish directory: build
```

---

## Step 5: Update Backend CORS

Now that you have your Netlify URL, update Railway backend:

1. Go to Railway dashboard
2. Click your backend service
3. Go to **"Variables"** tab
4. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://sangam-video-conf.netlify.app
   ```
5. Railway will automatically redeploy

---

## Step 6: Test Your Deployment

1. **Open your Netlify URL** in browser
2. **Enter your name** and create a meeting
3. **Open in another tab** (or incognito) and join with the room ID
4. **Test features:**
   - Video/audio
   - Screen sharing
   - Chat
   - Participants list

---

## Troubleshooting

### Frontend can't connect to backend
- Check browser console (F12)
- Verify `REACT_APP_SOCKET_URL` in frontend/.env
- Make sure backend is running on Railway

### CORS errors
- Verify `FRONTEND_URL` in Railway backend variables
- Make sure it matches your Netlify URL exactly

### Video/audio not working
- Allow camera/microphone permissions in browser
- Use HTTPS (both Railway and Netlify provide this automatically)
- Test in Chrome/Firefox (Safari can be problematic)

### Backend sleeping (Railway free tier)
- Railway free tier may sleep after inactivity
- Upgrade to paid plan ($5/month) for always-on

---

## Costs

### Free Tier (Good for testing)
- **Railway**: 500 hours/month free (~20 days)
- **Netlify**: 100GB bandwidth/month free
- **Total**: $0/month

### Paid (For production)
- **Railway**: $5-10/month
- **Netlify**: $0 (free tier usually enough)
- **Domain** (optional): $12/year
- **Total**: ~$5-10/month

---

## Custom Domain (Optional)

### For Frontend (Netlify):
1. Buy domain from Namecheap/GoDaddy
2. In Netlify: **Domain settings** → **Add custom domain**
3. Update DNS records as shown

### For Backend (Railway):
1. In Railway: **Settings** → **Domains** → **Custom Domain**
2. Add your domain (e.g., api.yourdomain.com)
3. Update DNS with provided CNAME

---

## Environment Variables Summary

### Backend (.env on Railway):
```
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-netlify-app.netlify.app
```

### Frontend (.env - build time):
```
REACT_APP_SOCKET_URL=https://your-railway-app.railway.app
```

---

## Monitoring

### Railway Dashboard:
- View logs in real-time
- Monitor CPU/memory usage
- Check deployment status

### Netlify Dashboard:
- View build logs
- Monitor bandwidth usage
- See deployment history

---

## Updating Your App

### Update Backend:
```bash
cd backend
# Make your changes
git add .
git commit -m "Updated backend"
git push
# Railway auto-deploys on push!
```

### Update Frontend:
```bash
cd frontend
# Make your changes
git add .
git commit -m "Updated frontend"
git push
# Netlify auto-deploys on push!
```

---

## Next Steps After Deployment

1. **Share your link** with friends for testing
2. **Gather feedback** on features and bugs
3. **Monitor usage** via Railway/Netlify dashboards
4. **Consider upgrades** if you exceed free tier limits
5. **Add analytics** (Google Analytics) to track users
6. **Implement authentication** if going to production

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Netlify Docs**: https://docs.netlify.com
- **GitHub Issues**: Create issues in your repo
- **Community**: Railway/Netlify Discord servers

Good luck with your deployment! 🚀