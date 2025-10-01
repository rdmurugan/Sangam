# Metered.ca TURN Server Setup

## ✅ What's Already Done

The backend and frontend have been configured to use Metered.ca's managed TURN service with dynamic credential fetching:

- ✅ `backend/routes/turn.js` - API endpoint to fetch TURN credentials
- ✅ `backend/server.js` - Route integrated at `/api/turn`
- ✅ `frontend/src/services/webrtc.js` - Dynamic ICE server fetching

## 🚀 Setup Steps (5 minutes)

### 1. Sign Up for Metered.ca

1. Go to https://dashboard.metered.ca/signup
2. Create free account (20GB/month bandwidth)
3. Verify email

### 2. Create Application

1. Login to https://dashboard.metered.ca/
2. Click "Create New App"
3. Name: `sangam` (or any name you prefer)
4. Click "Create"

### 3. Get API Key

1. Click on your app
2. Find **API Key** in the dashboard
3. Copy the full API key (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 4. Add to Backend Environment

**On Render:**
1. Go to https://dashboard.render.com/
2. Click on your backend service (`sangam-backend` or similar)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `METERED_API_KEY`
   - **Value**: `<paste your API key>`
6. Click **Save Changes**
7. Render will auto-redeploy (takes ~2 minutes)

**For Local Development:**
Add to `backend/.env`:
```
METERED_API_KEY=your_api_key_here
```

### 5. Update API URL (if app name differs)

If you named your app something other than "sangam":

Edit `backend/routes/turn.js` line 35:
```javascript
// Change this URL to match your app name
const response = await fetch(
  `https://YOUR_APP_NAME.metered.live/api/v1/turn/credentials?apiKey=${METERED_API_KEY}`
);
```

## 🧪 Testing

### Test 1: Verify Backend API

After deployment completes:
```bash
# Replace with your actual backend URL
curl https://sangam-backend.onrender.com/api/turn/credentials
```

Expected response:
```json
{
  "iceServers": [
    {
      "urls": ["stun:stun.relay.metered.ca:80"],
      ...
    },
    {
      "urls": "turn:a.relay.metered.ca:80",
      "username": "...",
      "credential": "..."
    },
    ...
  ]
}
```

### Test 2: Test TURN Server Connectivity

1. Go to https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
2. Remove all default servers
3. Click "Gather candidates"
4. Look for lines containing:
   - `typ relay` (TURN working ✅)
   - `typ srflx` (STUN working ✅)
   - `typ host` (Local candidates ✅)

If you see `typ relay` candidates, TURN is working!

### Test 3: Video Call Test

1. Open your app in two different browsers/devices
2. Create a meeting
3. Join from second browser
4. Open browser console (F12)
5. Look for these logs:
   ```
   ✅ Fetched TURN credentials: X servers
   🧊 [socketId] ICE candidate generated: {type: "relay", ...}
   ✅ [socketId] TURN RELAY candidate found!
   🔵 [socketId] ICE connection state: connected
   ✅ [socketId] ICE CONNECTION ESTABLISHED
   ```

## 📊 Bandwidth Usage

**Free tier limits:**
- 20GB/month bandwidth
- Unlimited STUN usage (doesn't count)
- Only TURN relay counts toward limit

**Estimates:**
- 1-on-1 video call: ~20MB per minute relayed
- Free tier: ~1000 minutes (~16 hours) of relayed calls/month
- Direct P2P (when working): 0 bandwidth used

**Tips to reduce usage:**
- TURN only activates when P2P fails (NAT/firewall issues)
- Most calls on same network use direct P2P
- Only cross-network calls typically need TURN

## 🔍 Troubleshooting

### "No relay candidates appearing"

**Check:**
1. API key is correctly set in Render environment
2. Backend redeployed after adding API key
3. No typos in app name URL
4. Fetch `/api/turn/credentials` returns valid servers

**Console check:**
```
✅ Fetched TURN credentials: 4 servers  // Good!
❌ Failed to fetch TURN credentials     // Bad - check API key
```

### "ICE still stuck at checking"

**Possible causes:**
1. TURN credentials expired (refresh page to get new ones)
2. Firewall blocking TURN ports (try different network)
3. SimplePeer version issue (check compatibility)

**Debug:**
```javascript
// In browser console during call:
const peer = webRTCService.peers.get(SOCKET_ID);
peer._pc.getConfiguration().iceServers;
// Should show Metered.ca servers with credentials
```

### "Bandwidth exceeded"

If you exceed 20GB/month:
1. Upgrade Metered.ca plan ($29/mo for 500GB)
2. Implement lower quality for relayed calls
3. Add connection quality detection
4. Consider SFU architecture for group calls

## 🎯 Next Steps After Setup

Once TURN is working:
1. Monitor Metered.ca dashboard for usage stats
2. Test across different networks (mobile data, public WiFi)
3. Consider upgrading video quality now that connectivity is reliable
4. For 6+ participants, research SFU architecture (like Zoom uses)

## 📞 Support

- Metered.ca Docs: https://www.metered.ca/docs/
- Dashboard: https://dashboard.metered.ca/
- WebRTC Debugging: https://webrtc.github.io/samples/
