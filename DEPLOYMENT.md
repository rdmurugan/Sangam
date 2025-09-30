# Sangam Deployment Guide

## Quick Deployment (For Testing - Up to 5 users)

### Option 1: Railway.app (Easiest)

#### Backend Deployment
1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your Sangam repository
4. Railway auto-detects Node.js
5. Set environment variables:
   - `PORT`: 5001
   - `NODE_ENV`: production
   - `FRONTEND_URL`: (will be your frontend URL)
6. Deploy! You'll get a URL like `https://sangam-backend.railway.app`

#### Frontend Deployment
1. Update frontend `.env`:
   ```
   REACT_APP_SOCKET_URL=https://sangam-backend.railway.app
   ```
2. Deploy frontend to Netlify:
   - Connect GitHub repo
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/build`
3. Get URL like `https://sangam.netlify.app`

#### Update Backend CORS
Update backend `.env`:
```
FRONTEND_URL=https://sangam.netlify.app
```

**Cost**: $0-5/month
**Capacity**: 3-5 concurrent users per room

---

## Production Deployment (10-50 users per room)

### Requirements
1. **Media Server**: Switch from P2P to SFU
2. **TURN Server**: For users behind NAT
3. **Load Balancer**: Distribute connections
4. **Redis**: Shared state across servers
5. **Database**: Store meetings, users, recordings
6. **Monitoring**: Track performance

### Architecture Upgrade Needed

#### Current (Mesh/P2P):
```
User A ←→ User B
  ↓  ×      ↓
User C ←→ User D
(6 connections for 4 users)
```

#### Recommended (SFU):
```
User A ↘
User B → [Media Server] → User A, B, C, D
User C ↗
User D ↗
(4 connections for 4 users)
```

### Implementation Steps

#### 1. Install Mediasoup (Media Server)
```bash
cd backend
npm install mediasoup mediasoup-client
```

#### 2. Setup TURN Server (Coturn)
```bash
# On Ubuntu/Debian server
sudo apt-get update
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
fingerprint
lt-cred-mech
use-auth-secret
static-auth-secret=YOUR_SECRET_KEY
realm=yourdomain.com
total-quota=100
stale-nonce=600
cert=/etc/ssl/cert.pem
pkey=/etc/ssl/key.pem
```

#### 3. Setup Redis
```bash
# Install Redis
npm install redis ioredis

# Or use Redis Cloud (free tier)
# https://redis.com/try-free/
```

#### 4. Update Backend for Horizontal Scaling
```javascript
// Use Redis adapter for Socket.io
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

---

## Deployment Options Comparison

### 1. Render.com
**Pros:**
- Easy deployment
- Free tier available
- Auto-scaling

**Cons:**
- Free tier sleeps after inactivity
- Limited to 750 hours/month free

**Cost:** $0-25/month
**Capacity:** 5-10 users per room

### 2. DigitalOcean
**Pros:**
- $6/month droplet
- Full control
- Simple dashboard

**Setup:**
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repo
git clone https://github.com/yourusername/Sangam.git
cd Sangam

# Backend
cd backend
npm install
pm2 start server.js --name sangam-backend

# Frontend (serve with nginx)
cd ../frontend
npm install
npm run build
sudo apt-get install nginx
# Copy build to /var/www/html
```

**Cost:** $6-20/month
**Capacity:** 5-10 users per room (without SFU)

### 3. AWS EC2 + CloudFront
**Pros:**
- Enterprise-grade
- Auto-scaling
- Global CDN

**Cons:**
- Complex setup
- Can get expensive

**Cost:** $30-500+/month
**Capacity:** 50-1000+ users (with proper setup)

---

## Bandwidth Requirements

### Per User Per Room:
- **Video (720p)**: ~2 Mbps upload, ~2 Mbps download per stream
- **Audio**: ~64 Kbps
- **Chat/Signaling**: ~10 Kbps

### Server Bandwidth (SFU Model):
```
4 users × 2 Mbps = 8 Mbps down, 8 Mbps up per room
10 users × 2 Mbps = 20 Mbps down, 20 Mbps up per room
50 users × 2 Mbps = 100 Mbps down, 100 Mbps up per room
```

### Mesh Model (Current):
```
4 users: Each user needs 3× bandwidth
10 users: Each user needs 9× bandwidth (NOT FEASIBLE)
```

---

## Cost Breakdown

### Minimal Setup (Current Code, 3-5 users)
- **Hosting**: Railway/Render - $0-10/month
- **Domain**: Namecheap - $12/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$10/month

### Small Business (10-20 users, SFU)
- **VPS**: DigitalOcean - $20/month
- **TURN Server**: Coturn on same VPS - $0
- **Domain**: $12/year
- **Redis**: Redis Cloud free tier - $0
- **Total**: ~$25/month

### Medium Scale (50-100 users, Multiple rooms)
- **App Servers**: 2× DigitalOcean ($40/month)
- **Media Server**: Dedicated SFU ($40/month)
- **TURN Server**: Separate instance ($20/month)
- **Load Balancer**: $12/month
- **Redis**: $15/month
- **Database**: PostgreSQL $15/month
- **CDN**: CloudFlare - $20/month
- **Monitoring**: $20/month
- **Total**: ~$180/month

### Enterprise (1000+ concurrent users)
- **Infrastructure**: $2,000-5,000/month
- **CDN**: $500-1,000/month
- **Engineering**: 2-3 DevOps engineers
- **Total**: $5,000-20,000+/month

---

## Security Checklist Before Going Live

- [ ] Enable HTTPS (SSL/TLS)
- [ ] Add authentication (JWT, OAuth)
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] CORS configuration
- [ ] Environment variables (no hardcoded secrets)
- [ ] DDoS protection (CloudFlare)
- [ ] Regular security updates
- [ ] Backup strategy
- [ ] Monitoring and logging
- [ ] Privacy policy and ToS
- [ ] GDPR compliance (if EU users)

---

## Recommended Path

### Phase 1: MVP (0-50 users total)
1. Deploy current code to Railway.app + Netlify
2. Use free tier
3. Test with real users
4. Limit rooms to 4 users max

**Timeline**: 1-2 days
**Cost**: $0-10/month

### Phase 2: Small Scale (50-500 users total)
1. Implement SFU using Mediasoup
2. Deploy to DigitalOcean droplet
3. Add TURN server
4. Set up monitoring

**Timeline**: 2-4 weeks
**Cost**: $25-50/month

### Phase 3: Production Ready (1000+ users)
1. Kubernetes cluster
2. Multiple media servers
3. Global CDN
4. Database replication
5. Auto-scaling
6. Hire DevOps engineer

**Timeline**: 2-3 months
**Cost**: $500-2000+/month

---

## Quick Start Commands

### Deploy to Railway (Backend)
```bash
npm install -g railway
railway login
cd backend
railway init
railway up
railway open
```

### Deploy to Netlify (Frontend)
```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod
```

---

## Monitoring & Analytics

### Free Tools:
- **UptimeRobot**: Server uptime monitoring
- **Google Analytics**: User tracking
- **LogRocket**: Session replay
- **Sentry**: Error tracking

### Paid Tools:
- **DataDog**: $15-100/month
- **New Relic**: $25-100/month
- **CloudWatch** (AWS): $10-50/month

---

## Support & Maintenance

### Minimum Requirements:
- **Server monitoring**: Daily checks
- **Security updates**: Weekly
- **Backup verification**: Weekly
- **User support**: Email/ticket system
- **Bug fixes**: As reported
- **Feature updates**: Monthly

### Team Size by Scale:
- **0-100 users**: 1 developer (part-time)
- **100-1000 users**: 1 developer + 1 support
- **1000-10K users**: 2 developers + 1 DevOps + 2 support
- **10K+ users**: Full team (6-10 people)

---

## Legal Requirements

Before launching publicly:
1. **Privacy Policy**: Required (use template)
2. **Terms of Service**: Required
3. **Cookie Policy**: If using cookies
4. **DMCA Policy**: If user-generated content
5. **Data Processing Agreement**: If storing user data
6. **Business License**: Depending on location
7. **Insurance**: Professional liability ($500-2000/year)

---

## Next Steps

1. **Test Current Deployment**: Deploy to Railway/Netlify
2. **Get Feedback**: Invite 5-10 users
3. **Measure Usage**: See concurrent user counts
4. **Decide Architecture**: Based on actual needs
5. **Scale Gradually**: Don't over-engineer early

**Remember**: Start simple, scale when needed!