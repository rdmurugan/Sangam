# 🚀 Simple Deployment Steps

Your code is ready at: **https://github.com/rdmurugan/Sangam**

---

## Step 1: Deploy Backend to Railway (5 minutes)

### Instructions:

1. **Go to https://railway.app** and sign up/login

2. Click **"New Project"**

3. Select **"Deploy from GitHub repo"**

4. Authorize Railway to access your GitHub

5. Select **"rdmurugan/Sangam"** repository

6. Railway will ask which folder - Click **"Configure"**
   - Set **Root Directory**: `backend`
   - Click **"Deploy"**

7. **Set Environment Variables:**
   - Click on your deployed service
   - Go to **"Variables"** tab
   - Click **"Add Variable"** and add these:

   ```
   Variable Name: PORT
   Value: 5001

   Variable Name: NODE_ENV
   Value: production

   Variable Name: FRONTEND_URL
   Value: https://temporary.com (we'll update this later)
   ```

8. **Generate Domain:**
   - Click **"Settings"** tab
   - Click **"Generate Domain"**
   - **COPY THIS URL** - You'll need it!
   - Example: `https://sangam-production-xxxx.up.railway.app`

✅ Backend deployed!

---

## Step 2: Update Frontend Config

Now update your frontend to use the Railway backend URL:

1. **Edit the file: `frontend/.env`**

2. **Change the URL to your Railway URL:**
   ```
   REACT_APP_SOCKET_URL=https://YOUR-RAILWAY-URL-HERE.up.railway.app
   ```

   Example:
   ```
   REACT_APP_SOCKET_URL=https://sangam-production-xxxx.up.railway.app
   ```

3. **Save the file**

4. **Commit and push changes:**
   ```bash
   git add frontend/.env
   git commit -m "Update backend URL for production"
   git push
   ```

---

## Step 3: Deploy Frontend to Netlify (5 minutes)

### Instructions:

1. **Go to https://app.netlify.com** and sign up/login

2. Click **"Add new site"** → **"Import an existing project"**

3. Choose **"Deploy with GitHub"**

4. Authorize Netlify to access GitHub

5. Select **"rdmurugan/Sangam"** repository

6. **Configure Build Settings:**
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/build`
   - Click **"Deploy site"**

7. Wait for deployment (2-3 minutes)

8. **Get your Netlify URL:**
   - It will be something like: `https://random-name-12345.netlify.app`
   - **COPY THIS URL**

9. **(Optional) Change site name:**
   - Click **"Site settings"** → **"Change site name"**
   - Choose: `sangam-video` (if available)
   - Your URL becomes: `https://sangam-video.netlify.app`

✅ Frontend deployed!

---

## Step 4: Update Backend CORS

Now connect frontend and backend:

1. **Go back to Railway dashboard**

2. **Click your backend service**

3. **Go to "Variables" tab**

4. **Update FRONTEND_URL:**
   - Click on `FRONTEND_URL` variable
   - Change value to your Netlify URL:
   ```
   https://your-netlify-app.netlify.app
   ```

5. **Click Save** - Railway will auto-redeploy

---

## Step 5: Test Your App! 🎉

1. **Open your Netlify URL** in browser:
   ```
   https://your-app.netlify.app
   ```

2. **Enter your name** and click **"Create Meeting"**

3. **Open another tab/browser** and join with the room ID

4. **Test:**
   - ✅ Video
   - ✅ Audio
   - ✅ Screen sharing
   - ✅ Chat
   - ✅ Participants

---

## Your URLs:

**Frontend (Share this with users):**
```
https://your-app.netlify.app
```

**Backend API:**
```
https://your-railway-app.railway.app
```

**GitHub Repo:**
```
https://github.com/rdmurugan/Sangam
```

---

## Troubleshooting

### "Failed to create room" error:
- Check browser console (F12)
- Verify backend is running on Railway
- Check `REACT_APP_SOCKET_URL` in frontend/.env

### CORS errors:
- Make sure `FRONTEND_URL` in Railway matches Netlify URL exactly
- Include `https://` in the URL

### Video not working:
- Allow camera/microphone permissions
- Use Chrome or Firefox
- Make sure you're using HTTPS (Railway and Netlify do this automatically)

### Backend sleeping:
- Railway free tier may sleep after inactivity
- First request will wake it up (takes 10-20 seconds)
- Upgrade to Hobby plan ($5/month) for always-on

---

## Costs

**Current setup (Free tier):**
- Railway: 500 hours/month free
- Netlify: 100GB bandwidth/month free
- **Total: $0/month**

**If you exceed free tier:**
- Railway Hobby: $5/month
- Netlify Pro: $19/month (usually not needed)

---

## Making Updates

When you want to update your app:

```bash
# Make your changes to code
git add .
git commit -m "Updated features"
git push

# Both Railway and Netlify will auto-deploy!
```

---

## Need Help?

- Check browser console for errors (F12)
- View Railway logs in dashboard
- View Netlify build logs in dashboard
- Railway docs: https://docs.railway.app
- Netlify docs: https://docs.netlify.com

---

## Next Steps

1. Share your Netlify URL with friends
2. Test with 2-3 people simultaneously
3. Gather feedback
4. Monitor usage in Railway/Netlify dashboards
5. Consider paid plans if needed

Congratulations! Your app is live! 🎊