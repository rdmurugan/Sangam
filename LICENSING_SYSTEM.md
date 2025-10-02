# Licensing System - Flexible Model for Marketing

## ✅ What's Been Implemented

### Backend Components:
1. **`backend/config/licenseConfig.js`** - Central configuration file (Easy to modify!)
2. **`backend/services/licenseService.js`** - License management service
3. **`backend/models/License.js`** - MongoDB model for license storage
4. **`backend/middleware/licenseMiddleware.js`** - Validation middleware
5. **`backend/routes/license.js`** - API endpoints
6. **`backend/server.js`** - Integrated license routes

---

## 🎯 For Marketing Teams: How to Adjust the Licensing Model

**IMPORTANT**: All pricing, features, and limits can be changed in ONE file:

### **`backend/config/licenseConfig.js`**

This file is designed for easy modification. **NO CODING REQUIRED** - just change values!

### Quick Changes:

#### 1. Change Pricing
```javascript
// In LICENSE_TIERS > STARTUP
price: 39,  // Change monthly price
annualPrice: 390,  // Change annual price (currently 16% discount)
```

#### 2. Enable/Disable Features
```javascript
// In LICENSE_TIERS > FREE > features
recording: false,  // Change to true to enable
aiAssistant: false,  // Change to true to enable
breakoutRooms: false,  // Change to true to enable
```

#### 3. Adjust Meeting Limits
```javascript
// In LICENSE_TIERS > FREE
maxMeetingDuration: 60,  // Change to 45, 90, or null (unlimited)
maxParticipants: 5,  // Change to 10, 3, etc.
maxConcurrentMeetings: 1,  // Change to 3, 5, etc.
```

#### 4. Modify Trial Period
```javascript
// In TRIAL_CONFIG
enabled: true,  // Set to false to disable trials
duration: 14,  // Change trial length in days
tier: 'STARTUP',  // Change which tier users trial
requireCreditCard: false,  // Change to true to require CC
```

#### 5. Add Promotional Pricing
```javascript
// In PRICING_CONFIG > promotion
enabled: true,  // Turn promotion on/off
code: 'LAUNCH2025',  // Promo code
discount: 20,  // Percentage off
validUntil: '2025-12-31',  // Expiration date
applicableTiers: ['STARTUP', 'ENTERPRISE']  // Which tiers get discount
```

#### 6. Change Currency
```javascript
// In PRICING_CONFIG
currency: 'USD',  // Change to 'EUR', 'GBP', 'INR', etc.
currencySymbol: '$',  // Change to '€', '£', '₹', etc.
```

---

## 📊 Current Tier Structure

### FREE Tier
- **Price**: $0/month
- **Duration**: 60 minutes per meeting
- **Participants**: 5 max
- **Features**: Basic video, audio, chat, screen sharing
- **Storage**: None
- **Support**: Community

### STARTUP Tier
- **Price**: $39/month ($390/year with 16% discount)
- **Duration**: Unlimited
- **Participants**: 50 max
- **Features**: Everything + Recording, AI, Breakout Rooms, Calendar, Analytics
- **Storage**: 100GB cloud, 50 hours recording
- **Support**: Email

### ENTERPRISE Tier
- **Price**: $299/month ($2990/year with 16% discount)
- **Duration**: Unlimited
- **Participants**: 300 max
- **Features**: Everything + Custom Branding, Custom Domain
- **Storage**: 1TB cloud, 500 hours recording
- **Support**: Priority with 99.9% SLA

### INSTITUTIONAL Tier
- **Price**: $999/month ($9990/year with 16% discount)
- **Duration**: Unlimited
- **Participants**: 1000 max
- **Features**: Everything + LMS Integration, SSO
- **Storage**: Unlimited
- **Support**: Dedicated with 99.95% SLA

---

## 🚀 Common Marketing Adjustments

### Scenario 1: Launch Promotion (20% off for 3 months)
```javascript
// In licenseConfig.js
PRICING_CONFIG: {
  promotion: {
    enabled: true,
    code: 'LAUNCH20',
    discount: 20,
    validUntil: '2025-03-31',
    applicableTiers: ['STARTUP', 'ENTERPRISE']
  }
}
```

### Scenario 2: Increase Free Tier Limits for Acquisition
```javascript
// In LICENSE_TIERS > FREE
maxMeetingDuration: 90,  // Was 60
maxParticipants: 10,  // Was 5
```

### Scenario 3: Create "Pro" Tier Between Startup and Enterprise
1. Copy STARTUP tier
2. Rename to PRO
3. Adjust pricing and features
4. Add to LICENSE_TIERS object

```javascript
PRO: {
  id: 'pro',
  name: 'Pro',
  price: 149,
  maxParticipants: 150,
  // ... rest of config
}
```

### Scenario 4: Enable Feature Flag Globally
```javascript
// In FEATURE_FLAGS
virtualBackgrounds: true,  // Enables for ALL tiers that have it set to true
```

### Scenario 5: Extended Trial for Sales Prospects
```javascript
// In TRIAL_CONFIG
duration: 30,  // Extended from 14 days
tier: 'ENTERPRISE',  // Trial higher tier
requireCreditCard: true  // Qualify leads
```

---

## 🔧 API Endpoints

### Get Current License
```http
GET /api/license
Response: {
  "success": true,
  "license": {
    "licenseKey": "SANG-XXXX-XXXX-XXXX-XXXX",
    "tier": { "id": "free", "name": "Free Plan", "price": 0 },
    "status": "active",
    "expiryDate": null,
    "usage": {...},
    "limits": {...},
    "features": {...}
  }
}
```

### Get All Tiers
```http
GET /api/license/tiers
Response: {
  "success": true,
  "tiers": [...]
}
```

### Get Pricing
```http
GET /api/license/pricing/startup?billingCycle=annual
Response: {
  "success": true,
  "pricing": {
    "price": 390,
    "monthlyEquivalent": 32.5,
    "savings": 78
  }
}
```

### Check Feature
```http
POST /api/license/check-feature
Body: { "featureName": "recording" }
Response: {
  "available": false,
  "upgradeRequired": true,
  "currentTier": "Free",
  "message": "Upgrade to unlock recording"
}
```

### Upgrade License
```http
POST /api/license/upgrade
Body: { "tierId": "STARTUP", "billingCycle": "monthly" }
Response: {
  "success": true,
  "oldTier": "Free",
  "newTier": "Startup",
  "message": "Successfully upgraded"
}
```

### Create License (Admin)
```http
POST /api/license/create
Body: {
  "organizationId": "org-123",
  "tierId": "ENTERPRISE",
  "billingCycle": "annual",
  "trialPeriod": false
}
```

---

## 💼 Integration Examples

### Check Feature Before Allowing Action
```javascript
// In Room component or backend
const checkRecording = async () => {
  const response = await fetch('/api/license/check-feature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ featureName: 'recording' })
  });

  const data = await response.json();

  if (!data.available) {
    showUpgradeModal(data.upgradeMessage);
    return false;
  }

  return true;
};
```

### Validate Meeting Limits
```javascript
// Backend middleware in room creation
app.post('/api/room/create',
  validateMeetingLimits,  // Checks participant/duration limits
  (req, res) => {
    // Create room
  }
);
```

### Require Feature for Route
```javascript
// Backend route protection
const { requireFeature } = require('./middleware/licenseMiddleware');

app.post('/api/recording/start',
  requireFeature('recording'),  // Blocks if not available
  (req, res) => {
    // Start recording
  }
);
```

---

## 📈 Usage Tracking

The system automatically tracks:
- Total meetings
- Total minutes
- Total participants
- Recording hours used
- Storage used
- API calls
- Active users

### Track Meeting Usage
```javascript
// After meeting ends
licenseService.trackMeeting(organizationId, {
  duration: 45,  // minutes
  participants: 8,
  recordingUsed: true
});
```

### Check Usage
```javascript
const summary = licenseService.getLicenseSummary(organizationId);
console.log(summary.usage);  // Current usage stats
console.log(summary.monthlyUsage);  // This month's usage
```

---

## 🎨 Marketing Landing Page Data

### Get Feature Comparison Table
```javascript
const licenseConfig = require('./backend/config/licenseConfig');

// Get comparison matrix
const comparison = licenseConfig.FEATURE_COMPARISON;

// Returns:
{
  'Meeting Duration': { FREE: '60 minutes', STARTUP: 'Unlimited', ... },
  'Max Participants': { FREE: '5', STARTUP: '50', ... },
  'Recording': { FREE: false, STARTUP: true, ... },
  ...
}
```

### Display Pricing
```javascript
// Get pricing with current promotions
const pricing = licenseService.getPricing('STARTUP', 'annual');

// pricing.originalPrice = 390 (if promotion active)
// pricing.price = 312 (with 20% discount)
// pricing.discount = 20
// pricing.promotionCode = 'LAUNCH20'
```

---

## 🔐 Enforcement Modes

### Strict Mode (Hard Block)
```javascript
// In licenseConfig.js
ENFORCEMENT: {
  strictMode: true,  // Block features completely
}
```
- Users CANNOT use premium features
- Meetings CANNOT exceed limits
- Hard stops with error messages

### Warning Mode (Soft Block)
```javascript
ENFORCEMENT: {
  strictMode: false,  // Show warnings only
}
```
- Users CAN use features with warnings
- Allows grace period after expiration
- Better UX for transitions

---

## 📝 License Lifecycle

### 1. Creation
```javascript
// New user signs up → Get FREE tier
licenseService.createLicense({
  organizationId: 'user-123',
  tierId: 'FREE'
});
```

### 2. Trial
```javascript
// User starts trial → Get STARTUP for 14 days
licenseService.createLicense({
  organizationId: 'user-123',
  tierId: 'STARTUP',
  trialPeriod: true  // Auto-expires in 14 days
});
```

### 3. Upgrade
```javascript
// User purchases → Upgrade to paid tier
licenseService.upgradeLicense('user-123', 'STARTUP', 'monthly');
```

### 4. Renewal
```javascript
// Auto-renewal or manual renewal
licenseService.renewLicense('user-123', 'monthly');
```

### 5. Downgrade
```javascript
// User downgrades → Schedule for next billing period
licenseService.downgradeLicense('user-123', 'FREE');
```

### 6. Cancellation
```javascript
// User cancels → Effective at period end
licenseService.cancelLicense('user-123', immediate=false);
```

---

## 🧪 Testing Different Models

### A/B Test Pricing
```javascript
// Version A: Current pricing
const versionA = {
  STARTUP: { price: 39 }
};

// Version B: Higher pricing
const versionB = {
  STARTUP: { price: 49 }
};

// Randomly assign users
const userVersion = Math.random() < 0.5 ? versionA : versionB;
```

### Test New Tier
```javascript
// Add temporary tier for testing
BETA: {
  id: 'beta',
  name: 'Beta Test',
  price: 0,
  // Test features here
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "Feature not available" error
**Solution**: Check `licenseConfig.js` → `FEATURE_FLAGS` and tier features

### Issue: Trial not working
**Solution**: Check `TRIAL_CONFIG.enabled = true` and duration

### Issue: Pricing not updating
**Solution**: Restart backend server after changing `licenseConfig.js`

### Issue: License validation failing
**Solution**: Check organizationId is being passed correctly

---

## 📱 Frontend Integration (To Do)

**Pending components:**
1. `LicenseManager.js` - View license, upgrade UI
2. `PricingPage.js` - Public pricing page
3. `UpgradeModal.js` - Upgrade prompts
4. `FeatureGate.js` - Component to wrap gated features

**Example FeatureGate:**
```jsx
<FeatureGate feature="recording" fallback={<UpgradePrompt />}>
  <RecordButton />
</FeatureGate>
```

---

## 🎯 Quick Start for Marketing

1. **Open** `backend/config/licenseConfig.js`
2. **Modify** prices, features, or limits
3. **Save** the file
4. **Restart** backend server: `npm start`
5. **Test** with API call: `GET /api/license/tiers`

**That's it!** No database changes, no complex code changes.

---

## 🔮 Future Enhancements

- **Payment Integration**: Stripe, PayPal, Paddle
- **Self-Service Checkout**: Automated upgrades
- **Usage Alerts**: Notify approaching limits
- **Custom Plans**: Build-your-own tier
- **Referral Credits**: Give free months
- **Volume Discounts**: Bulk seats pricing
- **Regional Pricing**: Different prices by country
- **Freemium Analytics**: Track conversion rates

---

## 📞 Support

For questions about adjusting the licensing model:
1. Check this documentation
2. Modify `backend/config/licenseConfig.js`
3. Test with API endpoints
4. Deploy changes

**Remember**: The licensing system is designed to be **marketing-friendly** - most changes require only updating the config file!
