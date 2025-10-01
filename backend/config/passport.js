const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('✅ Google OAuth configured');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last login
            user.lastLogin = Date.now();
            await user.save();
            return done(null, user);
          }

          // Check if email exists with different provider
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.avatar = profile.photos[0]?.value;
            user.isVerified = true;
            user.lastLogin = Date.now();
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            authProvider: 'google',
            isVerified: true,
            lastLogin: Date.now()
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️ Google OAuth NOT configured - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing');
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'email', 'picture.type(large)']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ facebookId: profile.id });

          if (user) {
            // Update last login
            user.lastLogin = Date.now();
            await user.save();
            return done(null, user);
          }

          // Check if email exists with different provider
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              // Link Facebook account to existing user
              user.facebookId = profile.id;
              user.authProvider = 'facebook';
              user.avatar = profile.photos[0]?.value;
              user.isVerified = true;
              user.lastLogin = Date.now();
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          user = await User.create({
            facebookId: profile.id,
            email: profile.emails?.[0]?.value || `fb_${profile.id}@sangam.app`,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            authProvider: 'facebook',
            isVerified: true,
            lastLogin: Date.now()
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.log('⚠️ Facebook OAuth NOT configured - FACEBOOK_APP_ID or FACEBOOK_APP_SECRET missing');
}

module.exports = passport;