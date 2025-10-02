# Pay-Per-Host Economics Model

## Overview

The **Pay-Per-Active-Host** model charges only for hosts who create meetings in a given billing period. This provides maximum flexibility for organizations with occasional or infrequent hosts.

---

## 💰 Pricing Structure

### Base Tier: Pay-Per-Active-Host
- **$30/host/month** (or $300/year with 16% discount)
- **Only charged if the host creates at least 1 meeting that month**
- Inactive hosts = $0 charge
- Participants always join for free

### What's Included:
- ✅ Unlimited meeting duration
- ✅ Up to 25 participants per meeting
- ✅ 100 hours of total meeting time per host/month
- ✅ 20 hours of recording per host/month
- ✅ 100GB cloud storage per host
- ✅ All features: AI Assistant, Analytics, Recording, Transcription
- ✅ Email support

### Overage Charges (if limits exceeded):
- **Extra meeting hours**: $1 per hour over 100 hours/month
- **Extra recording hours**: $2 per hour over 20 hours/month
- **Extra participants**: $0.50 per 10-participant pack over 25-person limit

---

## 📊 Cost Economics Analysis

### Infrastructure Costs (Your Costs)

#### Per Meeting Costs:
```
WebRTC Infrastructure:
- Peer-to-peer (P2P): $0/minute (for ≤5 participants)
- SFU (Selective Forwarding): $0.002/participant-minute (for 6-25 participants)
- TURN server fallback: $0.02/participant-minute (only ~20% of connections)

Storage Costs:
- S3 cloud storage: $0.023/GB/month
- Recording storage: $0.023/GB/month

AI Processing:
- OpenAI API: $0.002/request (chat completions)
- Azure Speech: $1/hour (transcription)

CDN/Bandwidth:
- Video streaming: $0.08/GB transferred
```

#### Example Cost Calculation (Typical User):
```
Monthly usage for 1 active host:
- 20 meetings × 60 minutes = 20 hours
- Average 10 participants per meeting
- 5 meetings recorded (10 hours total)
- 50GB storage used

Infrastructure costs:
- SFU cost: 20 hours × 60 min × 10 participants × $0.002 = $24
- TURN fallback (20% traffic): $24 × 0.20 × 10 = $48
- Recording storage: 20GB × $0.023 = $0.46
- Cloud storage: 50GB × $0.023 = $1.15
- AI transcription: 10 hours × $1 = $10

Total infrastructure cost: $83.61 per host
Revenue per host: $30
Gross margin: -$53.61 ❌ (176% loss)
```

**The problem:** Traditional WebRTC infrastructure is too expensive for low-price per-host models.

---

## ✅ Making It Profitable

### Solution 1: Self-Hosted Infrastructure

**Use mediasoup (open-source SFU):**
- Self-hosted on AWS/DigitalOcean
- ~$200/month for a server handling 500 concurrent participants
- Cost per participant-minute: $0.002 (vs $0.02 with managed TURN)

**Revised Cost Calculation:**
```
Same usage (20 hours, 10 participants):
- mediasoup SFU: 20 × 60 × 10 × $0.002 = $24
- Recording storage: $0.46
- Cloud storage: $1.15
- AI transcription: $10

Total cost: $35.61
Revenue: $30
Gross margin: -$5.61 ❌ (19% loss)

Break-even at scale:
- 100 active hosts × $30 = $3,000 revenue
- Server cost: $200
- Per-host usage: 100 × $35.61 = $3,561
Total cost: $3,761
Net: -$761 ❌
```

Still not profitable at this price point!

### Solution 2: Usage Limits + Optimized Pricing ✅

**Adjusted Model:**
- **$30/host/month** for LIGHT users (≤10 meetings, ≤100 hours)
- **Participant limit: 25** (enforced)
- **P2P optimization** for small meetings (≤5 participants = free)
- **Disable expensive features:** Breakout rooms (requires multiple SFUs)

**Realistic Usage Distribution:**
```
User Segmentation:
- 60% light users: 5 meetings/month, 8 participants avg
- 30% medium users: 15 meetings/month, 12 participants avg
- 10% heavy users: 30+ meetings/month, 20 participants avg

Cost per segment (100 hosts):
Light users (60):
  - Cost: 5 × 60 × 8 × $0.002 × 60 hosts = $288
  - Revenue: 60 × $30 = $1,800
  - Margin: $1,512 ✅

Medium users (30):
  - Cost: 15 × 60 × 12 × $0.002 × 30 hosts = $648
  - Revenue: 30 × $30 = $900
  - Margin: $252 ✅

Heavy users (10):
  - Cost: 30 × 60 × 20 × $0.002 × 10 hosts = $720
  - Revenue: 10 × $30 = $300
  - Margin: -$420 ❌

Total (100 hosts):
  - Server: $200
  - Usage: $288 + $648 + $720 = $1,656
  - Total cost: $1,856
  - Revenue: $3,000
  - Net margin: $1,144 (38% profit) ✅
```

**Key insight:** The model is profitable because most users are light users who subsidize heavy users.

### Solution 3: Tiered Usage Pricing (Hybrid) ✅

**Most Profitable Model:**
```javascript
BASE: $30/host/month includes:
  - 100 hours meeting time
  - 20 hours recording
  - 25 participants max
  - All features

OVERAGE (automatic):
  - $1 per additional meeting hour (over 100)
  - $2 per additional recording hour (over 20)
  - $0.50 per 10 extra participants (over 25)

Heavy user example:
  - Base: $30
  - Extra 50 meeting hours: $50
  - Extra 10 recording hours: $20
  - Total: $100/month

Cost for this heavy user:
  - Infrastructure: ~$120
  - Gross margin: -$20 (still loss, but smaller)

BUT: Overage charges discourage heavy usage
```

---

## 📈 Revenue Projections

### Scenario 1: 1,000 Users, 20% Active Rate (200 hosts)

```
Revenue:
- 200 active hosts × $30 = $6,000/month

Costs:
- Servers (2× capacity): $400/month
- Usage (avg): 200 × $30 = $6,000
- AI/Storage: $800
- Total: $7,200

Net: -$1,200 ❌ (20% loss)
```

### Scenario 2: 10,000 Users, 15% Active Rate (1,500 hosts)

```
Revenue:
- 1,500 active hosts × $30 = $45,000/month
- Overage charges (est. 10%): $4,500
- Total: $49,500

Costs:
- Servers (scale up): $2,500/month
- Usage: 1,500 × $28 (economy of scale) = $42,000
- AI/Storage: $5,000
- Total: $49,500

Net: $0 (break-even) ⚖️
```

### Scenario 3: 50,000 Users, 12% Active Rate (6,000 hosts) ✅

```
Revenue:
- 6,000 active hosts × $30 = $180,000/month
- Overage charges (est. 15%): $27,000
- Total: $207,000

Costs:
- Servers (distributed): $8,000/month
- Usage: 6,000 × $22 (bulk discount) = $132,000
- AI/Storage: $18,000
- CDN/Bandwidth: $12,000
- Total: $170,000

Net: $37,000 profit (18% margin) ✅
```

**Conclusion:** Pay-per-host model requires SCALE (5,000+ active hosts) to be profitable.

---

## 🔄 Comparison to Fixed Tiers

### Current STARTUP Tier:
- **$39/month** (organization-level license)
- Unlimited hosts (all can create meetings)
- 50 participants max
- Unlimited hours
- Better for: Teams where everyone hosts regularly

### PAY_PER_HOST Model:
- **$30/host/month** (only active hosts)
- Individual host licensing
- 25 participants max
- 100 hours/month limit
- Better for: Large orgs with occasional hosts

**Example: Company with 50 employees, 10 regular hosts**

Fixed tier (STARTUP):
- Cost: $39/month (single license)
- All 50 can host ✅
- 50 participants ✅

Pay-per-host:
- Cost: 10 active × $30 = $300/month
- Only 10 active hosts counted ✅
- 25 participants (lower limit) ⚠️

**Winner:** STARTUP tier for this use case

**When PAY_PER_HOST wins:**
- 1,000 employees, 50 active hosts
- STARTUP would need 20 licenses ($780/month)
- PAY_PER_HOST: 50 × $30 = $1,500/month
- Still more expensive! ❌

**Actual win case:**
- 10,000 employees, 200 active hosts
- ENTERPRISE tier ($299) insufficient
- Would need custom enterprise deal (~$5,000/month)
- PAY_PER_HOST: 200 × $30 = $6,000/month
- Competitive ✅

---

## 🎯 Recommended Strategy

### Option A: Adjust Pricing to Cover Costs ✅
```
PAY_PER_HOST: $50/host/month (instead of $30)
- 100 hours included
- 25 participants max
- All features

Economics at 1,000 active hosts:
- Revenue: $50,000
- Costs: $32,000
- Margin: $18,000 (36% profit) ✅
```

### Option B: Add Volume Discounts ✅
```
Pricing tiers:
- 1-10 hosts: $50/host/month
- 11-50 hosts: $40/host/month
- 51-200 hosts: $30/host/month
- 201+ hosts: $25/host/month (negotiate)

Encourages larger deployments while maintaining profitability
```

### Option C: Hybrid Model (RECOMMENDED) ✅
```
FREE Tier:
  - $0
  - 40 min meetings
  - 5 participants

PAY_PER_HOST:
  - $35/host/month (only active)
  - Unlimited duration
  - 25 participants
  - 100 hours/month
  - $1/hour overage

STARTUP (Organization):
  - $99/month (unlimited hosts)
  - 50 participants
  - Unlimited hours
  - Better for teams

ENTERPRISE:
  - $299/month
  - 300 participants
  - Custom needs

Economics (1,000 users):
- FREE users (800): $0 revenue, minimal cost
- PAY_PER_HOST (150): 150 × $35 = $5,250
- STARTUP orgs (10): 10 × $99 = $990
- ENTERPRISE (2): 2 × $299 = $598
Total: $6,838/month

Costs:
- Infrastructure: $2,800
- Margin: $4,038 (59% profit) ✅
```

---

## 🚨 Key Risks

### 1. **Heavy User Problem**
- Heavy users (30+ meetings/month) cost more than they pay
- Solution: Overage charges or migrate them to higher tiers

### 2. **Participant Limit Too Low**
- 25 participants may be insufficient for many use cases
- Solution: Offer $0.50 per 10-participant add-on

### 3. **Scale Required**
- Model only profitable at 5,000+ active hosts
- Solution: Offer other tiers (STARTUP, ENTERPRISE) for immediate revenue

### 4. **Infrastructure Complexity**
- Self-hosted mediasoup requires DevOps expertise
- Solution: Budget $300-500/month for managed mediasoup hosting (Cloudflare Calls, Agora, Vonage)

---

## 📋 Implementation Checklist

### Backend Changes Needed:

- [x] Add PAY_PER_HOST tier to `licenseConfig.js`
- [ ] Update billing logic to track "active hosts" per month
- [ ] Implement monthly host activity tracking
- [ ] Add overage calculation (extra hours, participants)
- [ ] Create invoice generation for active hosts only
- [ ] Add usage alerts (approaching limits)

### Database Schema Updates:

```javascript
// Add to License model
monthlyUsage: {
  meetingHours: Number,
  recordingHours: Number,
  peakParticipants: Number,
  activeDays: [Date] // Track when host was active
},
billing: {
  lastActiveMonth: String, // "2025-01"
  chargedThisMonth: Boolean,
  overageCharges: {
    extraHours: Number,
    extraRecording: Number,
    extraParticipants: Number
  }
}
```

### Billing Integration:

```javascript
// Monthly billing cycle
function calculateMonthlyBill(hostId, month) {
  const usage = getHostUsage(hostId, month);

  if (usage.totalMeetings === 0) {
    return { charged: false, amount: 0 };
  }

  let baseCost = 30; // Pay-per-host base
  let overage = 0;

  // Check limits
  if (usage.meetingHours > 100) {
    overage += (usage.meetingHours - 100) * 1; // $1/hour
  }

  if (usage.recordingHours > 20) {
    overage += (usage.recordingHours - 20) * 2; // $2/hour
  }

  return {
    charged: true,
    baseCost,
    overage,
    total: baseCost + overage
  };
}
```

---

## 💡 Marketing Messaging

### Target Audience:
- **Large organizations** with many employees but few active hosts
- **Seasonal businesses** (education, events) with fluctuating usage
- **Consultants/freelancers** who host occasionally

### Value Proposition:
> "Only pay for what you use. $30/month per active host.
> Inactive months? Zero cost. No wasted licenses."

### Comparison Table:
```
Traditional Zoom Model:
- $15/user/month × 100 users = $1,500/month
- Everyone pays, even if they never host

Sangam Pay-Per-Host:
- $30 × 25 active hosts = $750/month
- Save $750/month (50% savings)
```

---

## 🔮 Future Enhancements

1. **Credit System** - Buy credits, use as needed
2. **Auto-scale pricing** - Price decreases as usage increases
3. **Team pools** - Share hours across team members
4. **Annual prepay** - Pay $300/year, lock in rate
5. **Usage analytics** - Show customers their usage patterns
6. **Billing predictions** - Forecast next month's bill

---

## 📞 Conclusion

### Is Pay-Per-Host Viable?

**YES, but only with:**
1. **Higher price point** ($35-50/host instead of $30)
2. **Volume discounts** for large deployments
3. **Strict usage limits** (100 hours, 25 participants)
4. **Overage charges** to cover heavy users
5. **Scale** (5,000+ active hosts minimum)

### Recommended Final Pricing:

```
PAY_PER_HOST: $35/month per active host
- First 100 hours included
- 25 participants max
- $1/hour overage
- $2/hour recording overage
- Only charged if host creates ≥1 meeting

Volume Discounts:
- 50+ hosts: $30/host
- 200+ hosts: $25/host
- 500+ hosts: Custom pricing
```

This balances profitability with competitive pricing for the target market (large organizations with occasional hosts).
