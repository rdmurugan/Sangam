# Sangam Marketing Website

Professional business-facing website for Sangam video conferencing platform.

## Overview

This is a complete marketing website built with React, featuring:
- **Landing Page** - Hero section, features, testimonials, CTAs
- **Pricing Page** - Interactive tier comparison with backend integration
- **Features Page** - Detailed product capabilities
- **Download Page** - Multi-platform app download links
- **Sign Up Flow** - Account creation with license plan selection
- **Login Page** - User authentication

---

## Technology Stack

- **Frontend**: React 18, React Router 6
- **Styling**: Custom CSS (professional Zoom-like design)
- **API Integration**: Axios for backend communication
- **Backend Integration**: Connects to existing Sangam backend

---

## Project Structure

```
website/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js          # Navigation with sticky header
│   │   └── Footer.js          # Footer with links & social
│   ├── pages/
│   │   ├── LandingPage.js     # Main homepage
│   │   ├── PricingPage.js     # Pricing tiers with comparison
│   │   ├── FeaturesPage.js    # Feature showcase
│   │   ├── DownloadPage.js    # App downloads
│   │   ├── SignUpPage.js      # Registration + license selection
│   │   └── LoginPage.js       # User login
│   ├── styles/
│   │   ├── index.css          # Global styles & variables
│   │   ├── App.css
│   │   ├── Header.css
│   │   ├── Footer.css
│   │   ├── LandingPage.css
│   │   ├── PricingPage.css
│   │   ├── SignUpPage.css
│   │   └── [other page styles]
│   ├── App.js                 # Main app with routing
│   └── index.js               # React entry point
├── package.json
└── README.md
```

---

## Features

### Landing Page
- **Hero Section**: Compelling headline, CTAs, visual mockup
- **Stats**: Key metrics (10M+ users, 99.9% uptime)
- **Features Grid**: 8 key features with icons
- **Solutions**: Business, Education, Healthcare
- **Testimonials**: Social proof from customers
- **CTA Section**: Final conversion point

### Pricing Page
- **Dynamic Tier Loading**: Fetches tiers from `/api/license/tiers`
- **Billing Toggle**: Switch between monthly/annual
- **Tier Comparison**: Side-by-side feature comparison
- **Interactive Cards**: Hover effects, "Most Popular" badge
- **Comparison Table**: Detailed feature matrix
- **FAQ Section**: Common questions

### Sign Up Flow
- **Plan Selection**: Visual plan selector with all tiers
- **Account Form**: Name, email, organization, password
- **Validation**: Real-time form validation
- **License Integration**: Creates user + license via API
- **Trial Notice**: 14-day free trial messaging

---

## Backend Integration

### Required Backend Endpoints

#### 1. License Management
```
GET  /api/license/tiers
GET  /api/license/pricing/:tierId?billingCycle=monthly|annual
POST /api/license/create
```

#### 2. Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Sign Up Flow Integration

When a user signs up:

1. **User Registration** (`POST /api/auth/register`)
   ```json
   {
     "name": "John Doe",
     "email": "john@company.com",
     "password": "securepass123",
     "organizationName": "Acme Corp"
   }
   ```

2. **License Creation** (`POST /api/license/create`)
   ```json
   {
     "organizationId": "org-xyz",
     "userId": "user-123",
     "tierId": "STARTUP",
     "billingCycle": "monthly",
     "trialPeriod": true
   }
   ```

3. **User Login** - Redirects to main app with license info

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd website
npm install
```

### 2. Configure Backend URL

The website proxies API requests to `http://localhost:5001` (defined in `package.json`).

For production, update the proxy or use environment variables.

### 3. Start Development Server

```bash
npm start
```

Website runs on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

Creates optimized build in `build/` directory.

---

## Environment Variables

Create `.env` file:

```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_APP_URL=http://localhost:3000
```

---

## Backend Requirements

### User Model (`backend/models/User.js`)

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  organizationId: String,
  organizationName: String,
  createdAt: Date
}
```

### Auth Routes (`backend/routes/auth.js`)

Must handle:
- User registration
- Password hashing (bcrypt)
- Organization creation
- License integration

### License Integration

The signup flow expects these backend responses:

**Registration Success:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@company.com"
  },
  "organization": {
    "id": "org-456",
    "name": "Acme Corp"
  }
}
```

**License Creation Success:**
```json
{
  "success": true,
  "license": {
    "licenseKey": "SANG-XXXX-XXXX",
    "tier": "STARTUP",
    "status": "active",
    "trialEndsAt": "2025-02-15"
  }
}
```

---

## Pricing Tiers Configuration

The pricing page automatically adapts to your licensing tiers. Current tiers:

| Tier | Price | Participants | Duration | Key Features |
|------|-------|--------------|----------|--------------|
| **Free** | $0 | 5 | 40 min | Basic video, audio, chat |
| **Startup** | $39/mo | 50 | Unlimited | + Recording, AI, Analytics |
| **Enterprise** | $299/mo | 300 | Unlimited | + Branding, Custom domain |
| **Institutional** | $999/mo | 1000 | Unlimited | + LMS, SSO |

To modify tiers, update `backend/config/licenseConfig.js`.

---

## Deployment

### Netlify Deployment

1. Build the website:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   ```bash
   netlify deploy --prod --dir=build
   ```

3. Configure environment variables in Netlify dashboard

### Custom Domain Setup

1. Add custom domain in hosting provider
2. Update CORS settings in backend
3. Update `REACT_APP_API_URL` to production backend

---

## User Flow

### Visitor Journey

1. **Landing Page** → Learn about Sangam
2. **Pricing Page** → Compare plans
3. **Sign Up** → Select plan → Create account → Get license
4. **Redirect to App** → Start using Sangam

### Account Creation Flow

```
Sign Up Form
    ↓
Select Plan (Free, Startup, Enterprise, Institutional)
    ↓
Enter Account Info (Name, Email, Org, Password)
    ↓
Submit → POST /api/auth/register
    ↓
Success → POST /api/license/create
    ↓
Redirect to Login/App with Trial Active
```

---

## Customization

### Branding

Update colors in `src/styles/index.css`:

```css
:root {
  --primary-color: #2D5BFF;      /* Your brand color */
  --primary-dark: #1E40C9;
  --secondary-color: #00C9A7;
}
```

### Content

- **Hero Text**: Edit `LandingPage.js` hero section
- **Features**: Modify features grid
- **Testimonials**: Update testimonial cards
- **Pricing**: Syncs with backend automatically

### Logo

Replace SVG logo in `Header.js` and `Footer.js` with your logo.

---

## Testing

### Test Sign Up Flow

1. Navigate to `/signup`
2. Select a plan (e.g., "Startup")
3. Fill in form with test data
4. Submit and verify:
   - User created in database
   - License created with correct tier
   - Redirect works

### Test Pricing Page

1. Navigate to `/pricing`
2. Verify tiers load from backend
3. Toggle monthly/annual billing
4. Click "Start Free Trial" → Should redirect to signup with plan pre-selected

---

## Integration Checklist

- [ ] Backend `/api/license/tiers` endpoint working
- [ ] Backend `/api/auth/register` endpoint working
- [ ] Backend `/api/license/create` endpoint working
- [ ] User model includes `organizationId` and `organizationName`
- [ ] License creation integrated with user registration
- [ ] CORS configured for website domain
- [ ] Environment variables set
- [ ] Build and deployment configured

---

## Troubleshooting

### Issue: Pricing tiers not loading

**Solution**:
1. Check backend is running on `http://localhost:5001`
2. Verify `/api/license/tiers` endpoint exists
3. Check console for CORS errors

### Issue: Sign up fails

**Solution**:
1. Verify `/api/auth/register` endpoint exists
2. Check backend logs for errors
3. Ensure User model is properly defined
4. Verify password hashing works

### Issue: License not created after registration

**Solution**:
1. Check `/api/license/create` endpoint
2. Verify organizationId is being passed correctly
3. Check licenseService is initialized

---

## Next Steps

1. **Payment Integration**: Add Stripe/PayPal for paid plans
2. **Email Verification**: Add email confirmation flow
3. **Password Reset**: Implement forgot password
4. **Admin Dashboard**: Build admin panel for license management
5. **Analytics**: Add Google Analytics/Mixpanel
6. **SEO**: Add meta tags, sitemap, robots.txt
7. **A/B Testing**: Test different pricing/messaging

---

## Support

For issues or questions:
- Check backend documentation: `/LICENSING_SYSTEM.md`
- Review license configuration: `/backend/config/licenseConfig.js`
- Check backend logs for API errors

---

## License

Part of the Sangam Video Conferencing Platform
