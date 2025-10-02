/**
 * LMS Plugin Configuration Example
 *
 * Copy this file to config.js and fill in your credentials.
 * NEVER commit config.js with real credentials to version control!
 */

module.exports = {
  // LTI 1.3 Configuration
  lti: {
    // Generate RSA key pair for LTI:
    // openssl genrsa -out lti-private.key 2048
    // openssl rsa -in lti-private.key -pubout -out lti-public.key
    privateKey: process.env.LTI_PRIVATE_KEY || `-----BEGIN RSA PRIVATE KEY-----
Your private key here
-----END RSA PRIVATE KEY-----`,

    publicKey: process.env.LTI_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
Your public key here
-----END PUBLIC KEY-----`,

    // Your Sangam instance URL
    issuer: process.env.LTI_ISSUER || 'https://sangam.yourschool.edu',

    // Token expiration (seconds)
    tokenExpiration: 3600 // 1 hour
  },

  // Platform Configurations
  platforms: {
    /**
     * Canvas LMS
     * https://canvas.instructure.com
     */
    canvas: {
      enabled: process.env.CANVAS_ENABLED === 'true' || false,

      // Your Canvas instance URL
      baseUrl: process.env.CANVAS_BASE_URL || 'https://canvas.yourschool.edu',

      // Canvas API access token
      // Generate at: Account → Settings → + New Access Token
      accessToken: process.env.CANVAS_ACCESS_TOKEN || '',

      // LTI Configuration
      lti: {
        // Canvas Developer Key Client ID
        clientId: process.env.CANVAS_CLIENT_ID || '',

        // Deployment ID (usually "1" for first deployment)
        deploymentId: process.env.CANVAS_DEPLOYMENT_ID || '1',

        // Canvas-specific issuer
        issuer: 'https://canvas.instructure.com'
      }
    },

    /**
     * Moodle
     * https://moodle.org
     */
    moodle: {
      enabled: process.env.MOODLE_ENABLED === 'true' || false,

      // Your Moodle instance URL
      baseUrl: process.env.MOODLE_BASE_URL || 'https://moodle.yourschool.edu',

      // Moodle Web Services token
      // Generate at: Site Administration → Server → Web services → Manage tokens
      token: process.env.MOODLE_TOKEN || '',

      // LTI Configuration
      lti: {
        // Moodle LTI Client ID
        clientId: process.env.MOODLE_CLIENT_ID || '',

        // Deployment ID
        deploymentId: process.env.MOODLE_DEPLOYMENT_ID || '1',

        // Moodle instance URL (same as baseUrl)
        issuer: process.env.MOODLE_BASE_URL || 'https://moodle.yourschool.edu'
      }
    },

    /**
     * Blackboard Learn
     * https://www.blackboard.com
     */
    blackboard: {
      enabled: process.env.BLACKBOARD_ENABLED === 'true' || false,

      // Your Blackboard instance URL
      baseUrl: process.env.BLACKBOARD_BASE_URL || 'https://blackboard.yourschool.edu',

      // Blackboard REST API credentials
      // Register at: https://developer.blackboard.com
      clientId: process.env.BLACKBOARD_CLIENT_ID || '',
      clientSecret: process.env.BLACKBOARD_CLIENT_SECRET || '',

      // LTI Configuration
      lti: {
        // Blackboard LTI Client ID
        clientId: process.env.BLACKBOARD_LTI_CLIENT_ID || '',

        // Deployment ID
        deploymentId: process.env.BLACKBOARD_DEPLOYMENT_ID || '1',

        // Blackboard issuer
        issuer: 'https://blackboard.com'
      }
    },

    /**
     * Google Classroom
     * https://classroom.google.com
     */
    googleClassroom: {
      enabled: process.env.GOOGLE_CLASSROOM_ENABLED === 'true' || false,

      // Google OAuth 2.0 credentials
      // Create at: https://console.cloud.google.com
      clientId: process.env.GOOGLE_CLASSROOM_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLASSROOM_CLIENT_SECRET || '',

      // OAuth redirect URI
      redirectUri: process.env.GOOGLE_CLASSROOM_REDIRECT_URI || 'https://sangam.yourschool.edu/api/auth/google/callback',

      // Access token (obtain via OAuth flow)
      accessToken: process.env.GOOGLE_CLASSROOM_ACCESS_TOKEN || '',

      // Refresh token (obtain via OAuth flow)
      refreshToken: process.env.GOOGLE_CLASSROOM_REFRESH_TOKEN || '',

      // LTI Configuration (Google Classroom doesn't use LTI, but kept for consistency)
      lti: {
        clientId: process.env.GOOGLE_CLASSROOM_CLIENT_ID || '',
        deploymentId: '1'
      }
    }
  },

  // Feature Flags
  features: {
    // Enable automatic roster sync on meeting creation
    autoRosterSync: true,

    // Enable automatic attendance grading after meeting
    autoAttendanceGrading: true,

    // Enable deep linking for assignment creation
    deepLinking: true,

    // Enable SSO via LMS
    ssoEnabled: true,

    // Cache roster data (in minutes)
    rosterCacheDuration: 60,

    // Sync interval for grades (in minutes)
    gradeSyncInterval: 15
  },

  // Attendance Grading Configuration
  attendanceGrading: {
    // Points for attending meeting
    attendanceWeight: 80,

    // Bonus for joining on time (within grace period)
    onTimeBonus: 5,

    // Bonus for staying until end (within grace period)
    stayedBonus: 5,

    // Grace period for "on time" (minutes)
    onTimeGracePeriod: 5,

    // Grace period for "stayed until end" (minutes)
    endGracePeriod: 5,

    // Minimum attendance percentage to receive credit
    minimumAttendance: 50, // 50%

    // Maximum points possible
    maxPoints: 100
  },

  // Security Configuration
  security: {
    // JWT signature algorithm
    jwtAlgorithm: 'RS256',

    // Nonce expiration (seconds)
    nonceExpiration: 300, // 5 minutes

    // Maximum clock skew for timestamp validation (seconds)
    maxClockSkew: 300, // 5 minutes

    // JWKS cache duration (seconds)
    jwksCacheDuration: 86400, // 24 hours

    // Rate limiting
    rateLimit: {
      // Maximum API calls per minute
      maxCallsPerMinute: 60,

      // Maximum roster syncs per hour
      maxRosterSyncsPerHour: 10,

      // Maximum grade syncs per hour
      maxGradeSyncsPerHour: 100
    }
  },

  // Logging Configuration
  logging: {
    // Log level: 'debug', 'info', 'warn', 'error'
    level: process.env.LOG_LEVEL || 'info',

    // Log LTI launches
    logLtiLaunches: true,

    // Log API calls
    logApiCalls: true,

    // Log grade syncs
    logGradeSyncs: true,

    // Log roster syncs
    logRosterSyncs: true
  }
};
