# Google OAuth Setup Guide

Your Google OAuth Client ID has been added to the frontend. Now complete the backend setup.

## What You Have

✅ **Google Client ID:** `111814588260-dqglapi8a5krg5qebvqijppl1fh1idv8.apps.googleusercontent.com`
✅ **Frontend configured:** Added to `.env` and `.env.example`
✅ **Backend code:** OAuth handlers already implemented

## What You Need to Do

### Step 1: Get Google Client Secret

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `111814588260-dqglapi8a5krg5qebvqijppl1fh1idv8`
3. Click on it
4. Copy the **Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)

### Step 2: Configure Redirect URIs in Google Console

In the same OAuth 2.0 Client ID page, add these **Authorized redirect URIs**:

```
https://sangamam.onrender.com/api/auth/google/callback
http://localhost:5001/api/auth/google/callback
```

Click **Save** after adding both.

### Step 3: Add to Render Backend

1. Go to: https://dashboard.render.com/
2. Click on your backend service (`sangam-backend` or similar)
3. Go to **Environment** tab
4. Add these two environment variables:

```
GOOGLE_CLIENT_ID=111814588260-dqglapi8a5krg5qebvqijppl1fh1idv8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<paste your client secret here>
```

5. Click **Save Changes**
6. Render will auto-redeploy (~2 minutes)

### Step 4: Add to Netlify Frontend (if needed)

If your frontend directly uses Google OAuth (not through backend):

1. Go to: https://app.netlify.com/
2. Click on your site (`sangami`)
3. Go to **Site settings** → **Environment variables**
4. Add:
```
REACT_APP_GOOGLE_CLIENT_ID=111814588260-dqglapi8a5krg5qebvqijppl1fh1idv8.apps.googleusercontent.com
```
5. Click **Save**
6. **Trigger redeploy** (Settings → Build & deploy → Trigger deploy)

## How Google OAuth Works in Your App

### Backend Flow (passport.js)

1. User clicks "Login with Google" button
2. Frontend redirects to: `https://sangamam.onrender.com/api/auth/google`
3. User authenticates with Google
4. Google redirects to: `https://sangamam.onrender.com/api/auth/google/callback`
5. Backend creates/updates user in MongoDB
6. Backend issues JWT token
7. Frontend stores token and logs user in

### Current Status

- ✅ Backend routes exist: `/api/auth/google` and `/api/auth/google/callback`
- ✅ Backend configured in `config/passport.js`
- ⚠️ **Missing:** Google Client Secret in Render environment
- ⚠️ **Missing:** Redirect URIs in Google Console
- ℹ️ **Note:** Frontend login UI needs Google button (optional - can implement later)

## Testing OAuth

After setup is complete:

### Test Backend Directly

1. Open browser
2. Go to: `https://sangamam.onrender.com/api/auth/google`
3. Should redirect to Google login
4. After login, should redirect to frontend with token

### Check Backend Logs

In Render logs, look for:
```
✅ Google OAuth configured
User authenticated: {email: "user@example.com"}
```

If you see errors like:
```
❌ GOOGLE_CLIENT_SECRET not configured
```
Then the environment variable wasn't added correctly.

## Troubleshooting

### "Error: redirect_uri_mismatch"

**Cause:** Redirect URI not added to Google Console

**Fix:** Add `https://sangamam.onrender.com/api/auth/google/callback` to Authorized redirect URIs

### "Error: invalid_client"

**Cause:** Client Secret is wrong or not set

**Fix:** Double-check the Client Secret in Render environment variables

### Backend logs show "GOOGLE_CLIENT_SECRET not configured"

**Cause:** Environment variable not added to Render

**Fix:** Add `GOOGLE_CLIENT_SECRET` in Render Environment tab and save

### Login works but user not created

**Cause:** MongoDB not connected

**Fix:** Check `MONGODB_URI` is set in Render environment

## Security Notes

- ✅ Client ID is public (safe to commit to git)
- ❌ Client Secret is private (NEVER commit to git)
- ✅ Use HTTPS in production
- ✅ Restrict redirect URIs to your domains only
- ✅ Enable MongoDB authentication

## Next Steps (Optional)

### Add Google Login Button to Frontend

If you want a "Login with Google" button on your home page:

1. Install Google OAuth library:
   ```bash
   npm install @react-oauth/google
   ```

2. Add button to `Home.js`:
   ```jsx
   import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

   <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
     <GoogleLogin
       onSuccess={(response) => {
         // Send response.credential to your backend
         // Backend validates and creates session
       }}
       onError={() => console.log('Login Failed')}
     />
   </GoogleOAuthProvider>
   ```

Currently, users can access OAuth by visiting:
`https://sangamam.onrender.com/api/auth/google`

## Summary Checklist

- [ ] Get Google Client Secret from Google Console
- [ ] Add Redirect URIs to Google Console
- [ ] Add `GOOGLE_CLIENT_SECRET` to Render backend
- [ ] Add `GOOGLE_CLIENT_ID` to Render backend
- [ ] Wait for Render to redeploy
- [ ] Test by visiting: `https://sangamam.onrender.com/api/auth/google`
- [ ] (Optional) Add Google login button to frontend UI

---

**Status:** Backend configured, needs Client Secret to be functional
**Priority:** Optional - authentication works without OAuth
**Estimated Time:** 5 minutes to complete setup
