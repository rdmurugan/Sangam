# Coturn TURN Server for Sangam

This directory contains configuration for deploying a Coturn TURN server on Render.

## Why You Need This

WebRTC connections fail when users are behind NATs or firewalls. TURN servers relay media streams when direct peer-to-peer connections fail. Public TURN servers are unreliable, so hosting your own ensures:

- ✅ Reliable video calls across all networks
- ✅ No dependency on free tier limits
- ✅ Full control over relay server

## Deployment Steps

### Option 1: Manual Render Deployment (Recommended)

1. **Push these files to GitHub:**
   ```bash
   git add coturn/
   git commit -m "Add Coturn TURN server configuration"
   git push origin master
   ```

2. **Create New Web Service on Render:**
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name:** `sangam-coturn`
     - **Environment:** `Docker`
     - **Dockerfile Path:** `./coturn/Dockerfile`
     - **Docker Context:** `./coturn`
     - **Plan:** Free (or Starter for production)

3. **Add Environment Variable:**
   - Go to Environment tab
   - Add: `TURN_SECRET` = (generate a random secret, e.g., `your-secret-password-123`)

4. **Note the URL:**
   - After deployment, you'll get: `sangam-coturn.onrender.com`
   - Your TURN server will be at: `turn:sangam-coturn.onrender.com:3478`

### Option 2: Using render.yaml (Blueprint)

1. Push to GitHub (same as above)
2. Go to https://dashboard.render.com/blueprints
3. Click "New Blueprint Instance"
4. Connect your repo
5. Render will auto-detect `render.yaml` and deploy

## Configuration

### Frontend Integration

After deployment, update `frontend/src/services/webrtc.js`:

```javascript
iceServers: [
  // Google STUN
  { urls: 'stun:stun.l.google.com:19302' },
  // Your Coturn server
  {
    urls: 'turn:sangam-coturn.onrender.com:3478',
    username: 'sangam',
    credential: 'your-secret-password-123' // Same as TURN_SECRET
  },
  {
    urls: 'turn:sangam-coturn.onrender.com:3478?transport=tcp',
    username: 'sangam',
    credential: 'your-secret-password-123'
  }
]
```

### Backend Environment Variables

Add to your backend `.env` or Render environment:

```
TURN_SERVER_URL=turn:sangam-coturn.onrender.com:3478
TURN_USERNAME=sangam
TURN_SECRET=your-secret-password-123
```

## Testing Your TURN Server

Use this online tool to test if your TURN server is working:
https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

1. Remove all ICE servers
2. Add your TURN server:
   ```
   turn:sangam-coturn.onrender.com:3478
   Username: sangam
   Password: your-secret-password-123
   ```
3. Click "Gather candidates"
4. You should see `relay` type candidates

## Render Free Tier Limitations

⚠️ **Important for Free Tier:**
- Render free tier has limited outbound data (100GB/month)
- TURN servers relay video/audio data, which can be bandwidth-intensive
- For production with heavy usage, upgrade to Starter ($7/mo) or higher

**Bandwidth Estimates:**
- 1-on-1 video call: ~20MB per minute
- Free tier: ~83 hours of relayed calls per month
- Direct P2P connections (when working) don't use TURN bandwidth

## Troubleshooting

### TURN Server Not Working?

1. **Check Render logs:**
   ```
   Render Dashboard → Your Service → Logs
   ```

2. **Verify ports are open:**
   - Render should auto-configure ports
   - Check if you see "listening on port 3478" in logs

3. **Test with trickle-ice tool** (link above)

4. **Check firewall:**
   - TURN requires UDP port 3478 and range 49152-65535
   - Render handles this automatically

### Connection Still Failing?

If direct P2P works on same network but fails across networks:
- TURN server might be unreachable
- Try TCP transport (port 3478 TCP)
- Check Render service status

## Security Notes

- Change `TURN_SECRET` to a strong password
- For production, enable TLS in `turnserver.conf`
- Consider restricting `allowed-peer-ip` for security
- Monitor Render bandwidth usage

## Cost Optimization

To reduce TURN bandwidth usage:
1. Ensure STUN servers work (they're free and help direct connections)
2. Only use TURN as last resort (set `iceTransportPolicy: 'all'`)
3. Lower video quality for relayed calls
4. Implement connection quality detection

## Production Recommendations

For production deployment:
1. Upgrade to Render Starter plan ($7/mo minimum)
2. Enable TLS/DTLS in turnserver.conf
3. Use proper SSL certificates
4. Set up monitoring and alerting
5. Consider using Render's private services for backend-coturn communication
