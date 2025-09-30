# 🚀 Render.com Deployment Guide (RECOMMENDED)

## Why Render.com?

✅ Better monorepo support
✅ Handles native dependencies (bcrypt, etc.)
✅ Free tier: 750 hours/month
✅ Easier configuration
✅ Better build system
✅ Free SSL certificates
✅ Auto-deploy from GitHub

---

## Step-by-Step Deployment

### 1. Sign Up for Render.com

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your GitHub

### 2. Create Web Service

1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect GitHub"** if not already connected
4. Find **"rdmurugan/Sangam"**
5. Click **"Connect"**

### 3. Configure Service

**Basic Settings:**
```
Name: sangam-backend
Region: Oregon (US West) or closest to your users
Branch: master
Runtime: Node
```

**Build & Deploy Settings:**
```
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

**Instance Type:**
```
Free (0.1 CPU, 512 MB RAM)
```

### 4. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

**Required Variables:**
```
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
BACKEND_URL=https://sangam-backend.onrender.com
```

**Secrets (Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`):**
```
JWT_SECRET=your-32-character-random-string
SESSION_SECRET=another-32-character-random-string
```

**Database (MongoDB Atlas):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sangam?retryWrites=true&w=majority
```

**OAuth (Optional):**
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### 5. Deploy

1. Click **"Create Web Service"**
2. Wait for build (3-5 minutes)
3. Watch logs in real-time
4. Service will auto-deploy

### 6. Get Your URL

Your backend will be available at:
```
https://sangam-backend.onrender.com
```

Copy this URL!

---

## Common Issues & Solutions

### Issue: "Build failed - bcrypt"
**Solution:** Already handled! Render has Python/GCC by default

### Issue: "Service Suspended"
**Solution:** Free tier sleeps after 15 minutes of inactivity
- First request wakes it up (takes 30-60 seconds)
- Upgrade to Starter ($7/month) for always-on

### Issue: "Database connection failed"
**Solution:**
- Check `MONGODB_URI` is correct
- Verify MongoDB Atlas IP whitelist has `0.0.0.0/0`
- Check MongoDB Atlas cluster is running

### Issue: "Port already in use"
**Solution:** Make sure `PORT` environment variable is set to `5001`

---

## Testing Your Deployment

### 1. Check Service Status
Visit: `https://your-app.onrender.com`

Should see JSON or "Cannot GET /" (both OK)

### 2. Test Room Creation
```bash
curl https://your-app.onrender.com/api/room/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"hostName":"Test User","roomName":"Test Room"}'
```

Should return:
```json
{
  "roomId": "uuid-here",
  "message": "Room created successfully"
}
```

### 3. Check Logs
1. Render Dashboard → Your service
2. Click **"Logs"** tab
3. Look for:
   ```
   Server running on port 5001
   MongoDB connected successfully
   ```

---

## Update Frontend

### 1. Update Frontend Environment
Edit `frontend/.env`:
```
REACT_APP_SOCKET_URL=https://sangam-backend.onrender.com
```

### 2. Commit and Push
```bash
cd /Users/durai/Documents/GitHub/Sangam
git add frontend/.env
git commit -m "Update backend URL for Render deployment"
git push
```

### 3. Deploy Frontend to Netlify

**See DEPLOYMENT_COMPLETE.md for Netlify deployment steps.**

Or quick version:
1. Go to https://netlify.com
2. New site from Git
3. Connect `rdmurugan/Sangam`
4. Settings:
   - Base: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `frontend/build`
   - Env var: `REACT_APP_SOCKET_URL=https://sangam-backend.onrender.com`
5. Deploy!

### 4. Update Backend CORS

In Render Dashboard:
1. Your service → **Environment**
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.netlify.app
   ```
3. Service auto-redeploys

---

## Update OAuth Redirect URLs

### Google OAuth
1. https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Your OAuth client
4. Add to Authorized redirect URIs:
   ```
   https://sangam-backend.onrender.com/api/auth/google/callback
   ```
5. Save

### Facebook OAuth
1. https://developers.facebook.com/
2. Your app → Facebook Login → Settings
3. Add to Valid OAuth Redirect URIs:
   ```
   https://sangam-backend.onrender.com/api/auth/facebook/callback
   ```
4. Save

---

## Custom Domain (Optional)

### Add Custom Domain to Render

1. Buy domain from Namecheap/Google Domains
2. Render Dashboard → Your service → **Settings**
3. Scroll to **Custom Domain**
4. Click **"Add Custom Domain"**
5. Enter: `api.yourdomain.com`
6. Render provides DNS records to add
7. Add CNAME record to your DNS:
   ```
   api.yourdomain.com → sangam-backend.onrender.com
   ```
8. Wait for verification (5-60 minutes)
9. SSL certificate auto-provisions

### Update Environment Variables

After custom domain is active:
```
BACKEND_URL=https://api.yourdomain.com
```

Update frontend `.env`:
```
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

---

## Monitoring & Alerts

### Enable Health Checks
1. Render Dashboard → Your service → **Settings**
2. Scroll to **Health Check Path**
3. Enter: `/api/room/create` (or leave default `/`)
4. Save

### Email Notifications
1. Render Dashboard → Account Settings
2. Enable notifications for:
   - Deploy failures
   - Service suspensions
   - Health check failures

### View Metrics
1. Your service → **Metrics** tab
2. See:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

---

## Render vs Railway vs Heroku

| Feature | Render | Railway | Heroku |
|---------|--------|---------|--------|
| Free Tier | 750 hrs | 500 hrs | 550 hrs |
| Native Deps | ✅ Easy | ⚠️ Complex | ✅ Easy |
| Monorepo | ✅ Good | ⚠️ Tricky | ✅ Good |
| Build Speed | Fast | Fast | Medium |
| Cold Start | 30s | 15s | 45s |
| SSL | Free | Free | Free |
| **Overall** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

**Recommendation:** Use Render for this project.

---

## Upgrade Plans

### Free Tier Limitations
- Service sleeps after 15 min inactivity
- 750 hours/month (~31 days)
- 512 MB RAM
- 0.1 CPU

### Starter Plan ($7/month)
- Always on (no sleep)
- 512 MB RAM
- 0.5 CPU
- **Recommended for production**

### Standard Plan ($25/month)
- 2 GB RAM
- 1 CPU
- For 100+ concurrent users

---

## Troubleshooting Commands

### View Logs
```bash
# In Render Dashboard
Logs tab → Live logs
```

### Restart Service
```bash
# In Render Dashboard
Manual Deploy → Clear build cache & deploy
```

### Check Build Logs
```bash
# In Render Dashboard
Events tab → Click on deployment → View logs
```

### SSH into Service (Paid plans only)
```bash
# Not available on free tier
```

---

## Cost Estimate

### Free Tier Setup
- Render: $0/month (750 hours)
- Netlify: $0/month
- MongoDB Atlas: $0/month
- **Total: $0/month**

### Production Setup
- Render Starter: $7/month
- Netlify: $0/month
- MongoDB Atlas: $0/month
- Domain: $12/year (~$1/month)
- **Total: ~$8/month**

### High Traffic
- Render Standard: $25/month
- MongoDB M10: $57/month
- Netlify Pro: $19/month (optional)
- **Total: ~$82-101/month**

---

## Success Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Render account created
- [ ] GitHub repo connected
- [ ] Environment variables added
- [ ] Service deployed successfully
- [ ] Backend URL obtained
- [ ] Frontend `.env` updated
- [ ] Netlify deployed
- [ ] OAuth redirect URLs updated
- [ ] Endpoints tested
- [ ] Logs reviewed

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Get backend URL
3. ✅ Update frontend `.env`
4. ✅ Deploy frontend to Netlify
5. ✅ Update OAuth settings
6. ✅ Test the app end-to-end
7. ✅ Share with users!

---

## Support

**Render Docs:** https://render.com/docs
**Render Status:** https://status.render.com
**Community:** https://community.render.com

**Your Repository:** https://github.com/rdmurugan/Sangam

---

## Congratulations! 🎉

Your Sangam app is now deployed on Render!

**Backend URL:** `https://sangam-backend.onrender.com`
**Frontend URL:** `https://your-app.netlify.app`

Share your app and start video conferencing! 🚀