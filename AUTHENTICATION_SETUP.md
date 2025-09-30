# 🔐 Authentication & Security Setup Guide

## What's Been Added

✅ **Authentication Methods:**
- Email/Password login and signup
- Google OAuth 2.0
- Facebook Login

✅ **Security Features:**
- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting (prevents brute force attacks)
- Helmet.js security headers
- Input validation and sanitization
- CORS configuration
- Session management
- XSS and SQL injection protection

✅ **Backend Features:**
- User model with MongoDB
- Passport.js OAuth strategies
- Secure password storage
- Token generation and verification
- Authentication middleware
- Protected routes

---

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

New packages added:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `passport-facebook` - Facebook OAuth strategy
- `jsonwebtoken` - JWT token generation
- `bcrypt` - Password hashing
- `express-session` - Session management
- `express-rate-limit` - Rate limiting
- `helmet` - Security headers
- `express-validator` - Input validation
- `mongoose` - MongoDB ODM

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

New package added:
- `axios` - HTTP client for API calls

---

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Server Configuration
PORT=5001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
NODE_ENV=development

# Database (REQUIRED for authentication)
MONGODB_URI=mongodb://localhost:27017/sangam
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sangam

# JWT Secret (REQUIRED - Change in production!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Session Secret (REQUIRED - Change in production!)
SESSION_SECRET=your-super-secret-session-key-change-this

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Facebook OAuth (Optional)
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here
```

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended - Free Cloud Database)

1. **Create Free Account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free tier

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "Free" tier
   - Select a region close to you
   - Click "Create Cluster"

3. **Setup Database Access:**
   - Click "Database Access" in sidebar
   - Click "Add New Database User"
   - Create username and password
   - Give "Read and write" permissions

4. **Setup Network Access:**
   - Click "Network Access" in sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String:**
   - Click "Databases" in sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Add to `.env` as `MONGODB_URI`

Example:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/sangam?retryWrites=true&w=majority
```

### Option 2: Local MongoDB

1. **Install MongoDB:**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

2. **Start MongoDB:**
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongodb

# Windows
# MongoDB runs as a service automatically
```

3. **Add to .env:**
```
MONGODB_URI=mongodb://localhost:27017/sangam
```

---

## OAuth Setup

### Google OAuth Setup

1. **Go to Google Cloud Console:**
   - Visit https://console.cloud.google.com/

2. **Create Project:**
   - Click project dropdown → "New Project"
   - Enter name: "Sangam Video Conference"
   - Click "Create"

3. **Enable Google+ API:**
   - Search for "Google+ API" in search bar
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "Credentials" in sidebar
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: Sangam
     - User support email: your email
     - Developer email: your email
   - Application type: "Web application"
   - Name: "Sangam Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5001`
     - Add production URL later
   - Authorized redirect URIs:
     - `http://localhost:5001/api/auth/google/callback`
     - Add production URL later
   - Click "Create"

5. **Copy Credentials:**
   - Copy Client ID and Client Secret
   - Add to `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   ```

### Facebook OAuth Setup

1. **Go to Facebook Developers:**
   - Visit https://developers.facebook.com/

2. **Create App:**
   - Click "Create App"
   - Choose "Consumer" or "None"
   - App name: "Sangam Video Conference"
   - App contact email: your email
   - Click "Create App"

3. **Add Facebook Login:**
   - In dashboard, click "Add Product"
   - Find "Facebook Login" → Click "Set Up"
   - Choose "Web"
   - Site URL: `http://localhost:3000`
   - Save and continue

4. **Configure OAuth Settings:**
   - Go to Facebook Login → Settings
   - Valid OAuth Redirect URIs:
     - `http://localhost:5001/api/auth/facebook/callback`
   - Save Changes

5. **Get App Credentials:**
   - Go to Settings → Basic
   - Copy App ID and App Secret
   - Add to `.env`:
   ```
   FACEBOOK_APP_ID=your-app-id-here
   FACEBOOK_APP_SECRET=your-app-secret-here
   ```

---

## API Endpoints

### Authentication Endpoints

#### 1. Signup (Email/Password)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

Response:
```json
{
  "message": "User created successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": null
  }
}
```

#### 2. Login (Email/Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### 3. Google OAuth
```http
GET /api/auth/google
```
Redirects to Google login page, then back to:
```
/auth/callback?token=eyJhbGc...
```

#### 4. Facebook OAuth
```http
GET /api/auth/facebook
```
Redirects to Facebook login page, then back to:
```
/auth/callback?token=eyJhbGc...
```

#### 5. Get Current User
```http
GET /api/auth/me
Authorization: Bearer eyJhbGc...
```

#### 6. Logout
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGc...
```

---

## Security Features Explained

### 1. Rate Limiting

**General API Limit:**
- 100 requests per 15 minutes per IP
- Prevents API abuse

**Authentication Limit:**
- 5 login/signup attempts per 15 minutes per IP
- Prevents brute force attacks

**Room Creation Limit:**
- 10 rooms per hour per IP
- Prevents spam

### 2. Password Requirements

- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

Example valid passwords:
- `SecurePass123`
- `MyP@ssw0rd`
- `Test1234`

### 3. Input Validation

All user inputs are:
- Sanitized (removes HTML/scripts)
- Validated (checks format)
- Escaped (prevents injection)

### 4. Security Headers (Helmet.js)

Added headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- Content Security Policy

### 5. JWT Tokens

- Expires after 7 days
- Stored in localStorage (frontend)
- Sent in Authorization header
- Cannot be tampered with

---

## Testing Authentication

### 1. Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

### 2. Test Email/Password

1. Open http://localhost:3000
2. Click "Sign Up" (you'll need to create this UI)
3. Enter email, password, name
4. Submit → Should receive JWT token
5. Try logging in with same credentials

### 3. Test Google OAuth

1. Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Visit http://localhost:5001/api/auth/google
3. Login with Google account
4. Should redirect to frontend with token

### 4. Test Facebook OAuth

1. Make sure `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are set
2. Visit http://localhost:5001/api/auth/facebook
3. Login with Facebook account
4. Should redirect to frontend with token

---

## Frontend Integration

### Using Authentication in Frontend

```javascript
// services/auth.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

// Signup
export const signup = async (email, password, name) => {
  const response = await axios.post(`${API_URL}/api/auth/signup`, {
    email, password, name
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Login
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email, password
  });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const response = await axios.get(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.user;
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Google OAuth
export const googleLogin = () => {
  window.location.href = `${API_URL}/api/auth/google`;
};

// Facebook OAuth
export const facebookLogin = () => {
  window.location.href = `${API_URL}/api/auth/facebook`;
};
```

---

## Production Deployment

### 1. Update Environment Variables

**Backend (.env):**
```env
PORT=5001
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
NODE_ENV=production

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sangam

# Generate secure secrets (32+ characters)
JWT_SECRET=use-a-cryptographically-secure-random-string-here-32-chars-min
SESSION_SECRET=another-secure-random-string-different-from-jwt-secret

GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-secret

FACEBOOK_APP_ID=your-production-facebook-app-id
FACEBOOK_APP_SECRET=your-production-facebook-secret
```

### 2. Update OAuth Redirect URLs

**Google:**
- Add production URLs to authorized redirect URIs:
  - `https://api.yourdomain.com/api/auth/google/callback`

**Facebook:**
- Add production URLs to Valid OAuth Redirect URIs:
  - `https://api.yourdomain.com/api/auth/facebook/callback`

### 3. Generate Secure Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Best Practices

✅ **Do:**
- Use HTTPS in production
- Store tokens securely
- Validate all inputs
- Use strong passwords
- Enable rate limiting
- Keep dependencies updated
- Use environment variables for secrets
- Enable CORS only for trusted domains
- Use secure session cookies
- Hash passwords (bcrypt with salt)

❌ **Don't:**
- Store passwords in plain text
- Commit secrets to Git
- Use weak JWT secrets
- Disable security middleware
- Allow unlimited login attempts
- Trust user input
- Use HTTP in production
- Share API keys publicly

---

## Troubleshooting

### "MongooseError: The `uri` parameter to `openUri()` must be a string"
**Solution:** Make sure `MONGODB_URI` is set in `.env`

### "Google OAuth not working"
**Solution:**
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Verify redirect URI matches exactly
- Make sure Google+ API is enabled

### "Facebook OAuth not working"
**Solution:**
- Check `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` are set
- Verify redirect URI in Facebook app settings
- Make sure app is not in development mode with restricted users

### "Rate limit exceeded"
**Solution:** Wait 15 minutes or adjust rate limits in `middleware/security.js`

### "JWT token expired"
**Solution:** User needs to login again (tokens expire after 7 days)

### "CORS errors"
**Solution:** Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL exactly

---

## Summary

🎉 **Your app now has:**
- ✅ Email/password authentication
- ✅ Google OAuth login
- ✅ Facebook OAuth login
- ✅ JWT token security
- ✅ Rate limiting protection
- ✅ Input validation
- ✅ Password hashing
- ✅ Security headers
- ✅ Session management
- ✅ Protected routes

**Next steps:**
1. Set up MongoDB (Atlas or local)
2. Configure OAuth apps (Google & Facebook)
3. Update environment variables
4. Test authentication flow
5. Build frontend login/signup UI
6. Deploy to production

**Need help?** Check the troubleshooting section or create an issue on GitHub!