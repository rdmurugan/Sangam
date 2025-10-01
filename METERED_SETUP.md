# Quick Metered.ca Setup (5 minutes)

Your WebRTC connection is failing because TURN relay servers aren't working.
Backend logs show: `METERED_API_KEY not configured`

## Step 1: Sign Up (2 minutes)

1. Go to: https://dashboard.metered.ca/signup
2. Sign up with your email
3. Verify email (check inbox)

## Step 2: Create App (1 minute)

1. Login to dashboard: https://dashboard.metered.ca/
2. Click **"New Application"** or **"Create App"**
3. Name: `sangam` (or any name you want)
4. Click **Create**

## Step 3: Get API Key (30 seconds)

1. Click on your app in the dashboard
2. Look for **"API Key"** section
3. Copy the API key (looks like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Step 4: Add to Render (2 minutes)

1. Go to: https://dashboard.render.com/
2. Find your backend service (probably named `sangam-backend` or similar)
3. Click on it
4. Go to **"Environment"** tab (left sidebar)
5. Click **"Add Environment Variable"**
6. Add:
   - **Key**: `METERED_API_KEY`
   - **Value**: (paste your API key)
7. Click **"Save Changes"**

Render will automatically redeploy (takes ~2 minutes)

## Step 5: Update API URL (if needed)

If you named your app something OTHER than "sangam":

1. Edit `backend/routes/turn.js` line 35
2. Change:
   ```javascript
   `https://sangam.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`
   ```
   to:
   ```javascript
   `https://YOUR_APP_NAME.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`
   ```
3. Commit and push

## Step 6: Test

After Render finishes deploying:

1. Refresh your frontend app
2. Join a room
3. Open browser console (F12)
4. Look for:
   ```
   ✅ Fetched TURN credentials: X servers
   ```
   (Should be more than 3 servers now - Metered provides 4-6)

5. During call, look for:
   ```
   ✅ [socketId] TURN RELAY candidate found!
   🔵 [socketId] ICE connection state: connected
   ✅ [socketId] ICE CONNECTION ESTABLISHED
   ```

## What This Fixes

**Before (broken):**
- Only HOST (local) and STUN (public IP) candidates
- No TURN relay candidates
- Fails when direct P2P blocked by:
  - Different networks
  - Strict NAT/firewalls
  - Router AP isolation
  - Mobile network restrictions

**After (working):**
- TURN relay candidates available
- Connection falls back to relay when direct fails
- Works across ANY network combination
- Mobile calls work reliably

## Free Tier Limits

- 20GB/month bandwidth
- Only counts relayed traffic (not direct P2P)
- Estimated ~16 hours of relayed calls/month
- More than enough for testing and light usage

## Troubleshooting

### "Still not working after adding key"

Check Render logs for:
```
TURN credentials fetched successfully
Available servers: X
```

If you see errors, verify:
- API key copied correctly (no extra spaces)
- App name matches URL in turn.js
- Render finished redeploying

### "Backend logs still show 'not configured'"

- Make sure you saved environment variable
- Check Render deployment status (top right)
- May need to manually trigger redeploy

### "How do I know TURN is working?"

Look for this in browser console:
```
✅ [socketId] TURN RELAY candidate found!
```

If you see this, TURN is working!

## Next Steps After Setup

Once TURN is working:
1. Video calls should work across any network
2. Monitor Metered.ca dashboard for usage
3. Upgrade plan if you exceed 20GB/month
4. Consider SFU architecture for 6+ participants

---

**Current Status:** Ready to set up Metered.ca
**Estimated Time:** 5 minutes
**Priority:** CRITICAL - required for mobile/cross-network calls
