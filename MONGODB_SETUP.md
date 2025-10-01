# MongoDB Atlas Setup for Sangam

Quick guide to set up free MongoDB database for persistent user storage.

## Why You Need MongoDB

**Currently (without MongoDB):**
- ❌ Users not saved (must re-login every time)
- ❌ Rooms deleted when server restarts
- ⚠️ MemoryStore warning in logs

**With MongoDB:**
- ✅ User accounts persist
- ✅ OAuth login creates permanent accounts
- ✅ Rooms persist across server restarts
- ✅ Production-ready storage

## Step 1: Create MongoDB Atlas Account (2 minutes)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with:
   - Email
   - Or Google account (easiest)
3. Verify email if needed

## Step 2: Create Free Cluster (3 minutes)

1. After login, click **"Build a Database"** (or **"Create"** button)
2. Choose **"M0 FREE"** tier
   - 512 MB storage
   - Shared CPU
   - Perfect for small apps
3. Select cloud provider and region:
   - **Provider:** AWS (or Google Cloud/Azure)
   - **Region:** Choose closest to your Render server
     - If Render is US-based: `us-east-1` or `us-west-2`
     - If Render is EU-based: `eu-west-1`
4. Cluster Name: `Sangam` (or leave default)
5. Click **"Create"**

## Step 3: Create Database User (1 minute)

You'll see a "Security Quickstart" screen:

1. **Authentication Method:** Username and Password
2. **Username:** `sangam-user` (or any name)
3. **Password:** Click "Autogenerate Secure Password" and **COPY IT**
   - ⚠️ Save this password somewhere safe!
   - Example: `xK9mP2nQ8vL4dR7w`
4. Click **"Create User"**

## Step 4: Add IP Access (1 minute)

Still on the same screen:

1. **Where would you like to connect from?**
2. Choose: **"My Local Environment"**
3. Click **"Add IP Address"**
4. Enter: `0.0.0.0/0` (allows access from anywhere)
   - Click **"Add Entry"**
5. Click **"Finish and Close"**

⚠️ **Note:** `0.0.0.0/0` allows all IPs. For production, you can restrict to Render's IPs later.

## Step 5: Get Connection String (2 minutes)

1. Click **"Connect"** button on your cluster
2. Choose: **"Connect your application"**
3. **Driver:** Node.js
4. **Version:** 4.1 or later
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://sangam-user:<password>@sangam.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Replace `<password>`** with your actual password:
   ```
   mongodb+srv://sangam-user:xK9mP2nQ8vL4dR7w@sangam.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. **Add database name** before the `?`:
   ```
   mongodb+srv://sangam-user:xK9mP2nQ8vL4dR7w@sangam.xxxxx.mongodb.net/sangam?retryWrites=true&w=majority
   ```
   ☝️ Added `/sangam` before `?`

## Step 6: Add to Render Environment (1 minute)

1. Go to: https://dashboard.render.com/
2. Click your backend service
3. **Environment** tab
4. Click **"Add Environment Variable"**
5. Add:
   ```
   MONGODB_URI=mongodb+srv://sangam-user:xK9mP2nQ8vL4dR7w@sangam.xxxxx.mongodb.net/sangam?retryWrites=true&w=majority
   ```
6. Click **"Save Changes"**
7. Render will auto-redeploy (~2 minutes)

## Step 7: Verify It's Working

After Render redeploys, check the logs:

**Look for:**
```
✅ MongoDB connected successfully
Server running on 0.0.0.0:5001
Environment: production
MongoDB: Connected
```

**If you see errors:**
```
❌ MongoDB connection error: ...
```

**Common fixes:**
- Check password is correct (no spaces)
- Check IP whitelist has `0.0.0.0/0`
- Check connection string has `/sangam` before `?`

## Testing MongoDB

**Test Google OAuth login:**
1. Visit: https://sangami.netlify.app/
2. Click "Sign in with Google"
3. Complete login
4. Check Render logs for:
   ```
   User authenticated: {email: "your@email.com"}
   Token generated successfully
   ```

**Verify user was saved:**
1. Go to MongoDB Atlas dashboard
2. Click **"Browse Collections"** on your cluster
3. You should see:
   - Database: `sangam`
   - Collection: `users`
   - Document with your email

## MongoDB Collections

Your app will create these collections automatically:

- **users** - User accounts from OAuth
- **rooms** - Meeting rooms (if persistence is added)

## Free Tier Limits

MongoDB Atlas Free (M0) includes:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Unlimited reads/writes (reasonable use)
- ✅ No credit card required
- ✅ No time limit

**Estimated capacity:**
- ~50,000+ user accounts
- ~100,000+ room records
- More than enough for getting started!

## Upgrade Later (Optional)

If you exceed free tier:
- **M10 Shared:** $9/month - 10GB storage
- **M20 Dedicated:** $57/month - 20GB storage
- Scale as needed

## Security Best Practices

**For production:**

1. **Restrict IP Access:**
   - Remove `0.0.0.0/0`
   - Add only Render's IP addresses
   - Find Render IPs in their docs

2. **Rotate Passwords:**
   - Change database password periodically
   - Update in Render environment

3. **Enable Monitoring:**
   - MongoDB Atlas → Alerts
   - Set up email notifications for issues

4. **Backup:**
   - Free tier: Cloud backups included
   - Retained for limited time
   - Upgrade for longer retention

## Troubleshooting

### "MongoNetworkError: connection timed out"
- Check IP whitelist includes `0.0.0.0/0`
- Or add Render's specific IPs

### "MongoServerError: bad auth"
- Password is wrong
- Check for spaces or special characters
- URL encode special characters

### "Cannot connect to cluster"
- Cluster is still spinning up (wait 2-3 minutes)
- Check MongoDB Atlas dashboard shows "Active"

### "Database not found"
- This is normal! App creates it on first connection
- Just use the connection string with `/sangam`

## Summary

✅ **What you get:**
- Free 512MB MongoDB database
- User accounts persist
- OAuth logins save users
- Production-ready storage

🎯 **Total setup time:** ~10 minutes

📝 **Don't forget:**
- Save your database password
- Add connection string to Render
- Test OAuth login after deployment

---

**Quick Reference:**

Connection string format:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

Example:
```
mongodb+srv://sangam-user:xK9mP2nQ8vL4dR7w@sangam.ab1cd2.mongodb.net/sangam?retryWrites=true&w=majority
```

Add to Render:
```
MONGODB_URI=<paste connection string>
```

**Status:** Ready to set up! ✨
