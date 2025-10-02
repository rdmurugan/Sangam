/**
 * LICENSE CONFIGURATION
 *
 * This file defines all license tiers, features, and limits.
 * Modify this file to adjust the licensing model for marketing needs.
 *
 * IMPORTANT: After modifying this file, restart the backend server.
 */

const LICENSE_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    displayName: 'Free Plan',
    price: 0,
    billingCycle: null,
    description: 'Perfect for personal use and family connections',

    // Meeting Limits
    maxMeetingDuration: 60, // minutes
    maxParticipants: 5,
    maxConcurrentMeetings: 1,
    recordingEnabled: false,

    // Features
    features: {
      // Core Features
      videoConferencing: true,
      audioConferencing: true,
      screenSharing: true,
      chat: true,

      // Advanced Features
      recording: false,
      transcription: false,
      aiAssistant: false,
      breakoutRooms: false,
      polls: true,
      reactions: true,
      whiteboard: true,
      virtualBackgrounds: false,

      // Calendar & Scheduling
      calendarIntegration: false,
      scheduledMeetings: false,
      recurringMeetings: false,

      // Security & Moderation
      waitingRoom: true,
      passwordProtection: true,
      endToEndEncryption: false,
      advancedModeration: false,

      // Analytics & Insights
      basicAnalytics: true,
      advancedAnalytics: false,
      exportReports: false,

      // Customization
      customBranding: false,
      customDomain: false,

      // Support
      support: 'community',
      sla: false
    },

    // Storage
    cloudStorage: 0, // GB
    recordingStorage: 0, // hours

    // API Access
    apiAccess: false,
    webhooks: false,

    // Marketing Messages
    upgradeMessage: 'Upgrade to unlock unlimited meeting time, recording, and advanced features',
    ctaText: 'Upgrade Now'
  },

  STARTUP: {
    id: 'startup',
    name: 'Startup',
    displayName: 'Startup Plan',
    price: 39, // USD per month (or per user per month)
    annualPrice: 390, // USD per year (save $78/year - 16% discount)
    billingCycle: 'monthly',
    description: 'Ideal for small teams and growing businesses',

    // Meeting Limits
    maxMeetingDuration: null, // unlimited
    maxParticipants: 50,
    maxConcurrentMeetings: 5,
    recordingEnabled: true,

    // Features
    features: {
      // Core Features
      videoConferencing: true,
      audioConferencing: true,
      screenSharing: true,
      chat: true,

      // Advanced Features
      recording: true,
      transcription: true,
      aiAssistant: true,
      breakoutRooms: true,
      polls: true,
      reactions: true,
      whiteboard: true,
      virtualBackgrounds: true,

      // Calendar & Scheduling
      calendarIntegration: true,
      scheduledMeetings: true,
      recurringMeetings: true,

      // Security & Moderation
      waitingRoom: true,
      passwordProtection: true,
      endToEndEncryption: true,
      advancedModeration: true,

      // Analytics & Insights
      basicAnalytics: true,
      advancedAnalytics: true,
      exportReports: true,

      // Customization
      customBranding: false,
      customDomain: false,

      // Support
      support: 'email',
      sla: false
    },

    // Storage
    cloudStorage: 100, // GB
    recordingStorage: 50, // hours

    // API Access
    apiAccess: true,
    webhooks: true,

    // Marketing Messages
    upgradeMessage: 'Upgrade to Enterprise for unlimited participants and priority support',
    ctaText: 'Upgrade to Enterprise'
  },

  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise Plan',
    price: 299, // USD per month (for organization)
    annualPrice: 2990, // USD per year (save $598/year - 16% discount)
    billingCycle: 'monthly',
    description: 'For large teams with advanced needs',

    // Meeting Limits
    maxMeetingDuration: null, // unlimited
    maxParticipants: 300,
    maxConcurrentMeetings: 25,
    recordingEnabled: true,

    // Features
    features: {
      // Core Features
      videoConferencing: true,
      audioConferencing: true,
      screenSharing: true,
      chat: true,

      // Advanced Features
      recording: true,
      transcription: true,
      aiAssistant: true,
      breakoutRooms: true,
      polls: true,
      reactions: true,
      whiteboard: true,
      virtualBackgrounds: true,

      // Calendar & Scheduling
      calendarIntegration: true,
      scheduledMeetings: true,
      recurringMeetings: true,

      // Security & Moderation
      waitingRoom: true,
      passwordProtection: true,
      endToEndEncryption: true,
      advancedModeration: true,

      // Analytics & Insights
      basicAnalytics: true,
      advancedAnalytics: true,
      exportReports: true,

      // Customization
      customBranding: true,
      customDomain: true,

      // Support
      support: 'priority',
      sla: '99.9%'
    },

    // Storage
    cloudStorage: 1000, // GB (1TB)
    recordingStorage: 500, // hours

    // API Access
    apiAccess: true,
    webhooks: true,

    // Marketing Messages
    upgradeMessage: 'Need LMS integration? Upgrade to Institutional Plan',
    ctaText: 'Contact Sales'
  },

  PAY_PER_HOST: {
    id: 'pay-per-host',
    name: 'Pay Per Host',
    displayName: 'Pay Per Active Host',
    price: 30, // USD per ACTIVE host per month (only charged if host creates meetings)
    annualPrice: 300, // USD per year (save $60/year - 16% discount)
    billingCycle: 'monthly',
    billingType: 'per-active-host', // Special billing: Only active hosts are charged
    description: 'Pay only for hosts who actually create meetings each month',

    // Meeting Limits
    maxMeetingDuration: null, // unlimited
    maxParticipants: 25, // Optimized for P2P/SFU cost efficiency
    maxConcurrentMeetings: null, // unlimited (per host)
    recordingEnabled: true,

    // Usage Limits (to control costs)
    monthlyMeetingHours: 100, // Max 100 hours of meetings per host per month
    monthlyRecordingHours: 20, // Max 20 hours of recording per host per month

    // Features
    features: {
      // Core Features
      videoConferencing: true,
      audioConferencing: true,
      screenSharing: true,
      chat: true,

      // Advanced Features
      recording: true,
      transcription: true,
      aiAssistant: true,
      breakoutRooms: false, // Disabled to reduce infrastructure costs
      polls: true,
      reactions: true,
      whiteboard: true,
      virtualBackgrounds: true,

      // Calendar & Scheduling
      calendarIntegration: true,
      scheduledMeetings: true,
      recurringMeetings: true,

      // Security & Moderation
      waitingRoom: true,
      passwordProtection: true,
      endToEndEncryption: true,
      advancedModeration: true,

      // Analytics & Insights
      basicAnalytics: true,
      advancedAnalytics: true,
      exportReports: true,

      // Customization
      customBranding: false,
      customDomain: false,

      // Support
      support: 'email',
      sla: false
    },

    // Storage (per host)
    cloudStorage: 100, // GB per host
    recordingStorage: 20, // hours per host

    // API Access
    apiAccess: true,
    webhooks: true,

    // Billing Details
    billingRules: {
      activeHostDefinition: 'Host who creates at least 1 meeting in the billing period',
      inactiveHostCost: 0, // Inactive hosts pay nothing
      overage: {
        extraMeetingHours: 1, // $1 per hour over limit
        extraRecordingHours: 2, // $2 per hour over limit
        extraParticipants: 0.50 // $0.50 per 10 participants over limit
      }
    },

    // Marketing Messages
    upgradeMessage: 'Need more participants? Upgrade to Startup or Enterprise',
    ctaText: 'Upgrade Plan'
  },

  INSTITUTIONAL: {
    id: 'institutional',
    name: 'Institutional',
    displayName: 'Institutional Plan',
    price: 999, // USD per month (for organization)
    annualPrice: 9990, // USD per year (save $1998/year - 16% discount)
    billingCycle: 'monthly',
    description: 'For educational institutions with LMS integration',

    // Meeting Limits
    maxMeetingDuration: null, // unlimited
    maxParticipants: 1000,
    maxConcurrentMeetings: 100,
    recordingEnabled: true,

    // Features
    features: {
      // Core Features
      videoConferencing: true,
      audioConferencing: true,
      screenSharing: true,
      chat: true,

      // Advanced Features
      recording: true,
      transcription: true,
      aiAssistant: true,
      breakoutRooms: true,
      polls: true,
      reactions: true,
      whiteboard: true,
      virtualBackgrounds: true,

      // Calendar & Scheduling
      calendarIntegration: true,
      scheduledMeetings: true,
      recurringMeetings: true,

      // Security & Moderation
      waitingRoom: true,
      passwordProtection: true,
      endToEndEncryption: true,
      advancedModeration: true,

      // Analytics & Insights
      basicAnalytics: true,
      advancedAnalytics: true,
      exportReports: true,

      // Customization
      customBranding: true,
      customDomain: true,

      // Support
      support: 'dedicated',
      sla: '99.95%'
    },

    // Institutional-Specific Features
    institutionalFeatures: {
      lmsIntegration: true, // Canvas, Moodle, Blackboard
      ssoIntegration: true, // SAML, OAuth
      studentRoster: true,
      gradebookSync: true,
      attendanceTracking: true,
      assignmentIntegration: true
    },

    // Storage
    cloudStorage: null, // unlimited
    recordingStorage: null, // unlimited

    // API Access
    apiAccess: true,
    webhooks: true,

    // Marketing Messages
    upgradeMessage: 'Contact us for custom enterprise solutions',
    ctaText: 'Contact Sales'
  }
};

/**
 * FEATURE FLAGS
 *
 * Control feature availability across all tiers.
 * Set to false to disable a feature globally.
 */
const FEATURE_FLAGS = {
  recording: true,
  transcription: true,
  aiAssistant: true,
  breakoutRooms: true,
  polls: true,
  whiteboard: true,
  virtualBackgrounds: true,
  calendarIntegration: true,
  analytics: true,
  customBranding: true,
  apiAccess: true,
  lmsIntegration: true
};

/**
 * TRIAL CONFIGURATION
 */
const TRIAL_CONFIG = {
  enabled: true,
  duration: 14, // days
  tier: 'STARTUP', // Which tier to trial
  requireCreditCard: false,
  features: 'all' // or 'limited'
};

/**
 * LICENSE ENFORCEMENT
 */
const ENFORCEMENT = {
  strictMode: false, // If true, hard-block features. If false, show warnings.
  gracePeriod: 7, // days after expiration
  maxGracePeriodMeetings: 3 // meetings allowed during grace period
};

/**
 * PRICING DISPLAY
 */
const PRICING_CONFIG = {
  currency: 'USD',
  currencySymbol: '$',
  showAnnualSavings: true,
  annualDiscountPercentage: 16,
  showMonthlyEquivalent: true, // Show monthly cost for annual plans

  // Promotional offers
  promotion: {
    enabled: false,
    code: 'LAUNCH2025',
    discount: 20, // percentage
    validUntil: '2025-12-31',
    applicableTiers: ['STARTUP', 'ENTERPRISE']
  }
};

/**
 * CONTACT SALES TIERS
 *
 * Tiers that require contacting sales instead of self-service checkout
 */
const CONTACT_SALES_TIERS = ['ENTERPRISE', 'INSTITUTIONAL'];

/**
 * FEATURE COMPARISON
 *
 * For marketing landing pages and comparison tables
 */
const FEATURE_COMPARISON = {
  'Billing Model': {
    FREE: 'Free forever',
    PAY_PER_HOST: 'Pay per active host',
    STARTUP: 'Monthly/Annual',
    ENTERPRISE: 'Monthly/Annual',
    INSTITUTIONAL: 'Monthly/Annual'
  },
  'Meeting Duration': {
    FREE: '60 minutes',
    PAY_PER_HOST: 'Unlimited',
    STARTUP: 'Unlimited',
    ENTERPRISE: 'Unlimited',
    INSTITUTIONAL: 'Unlimited'
  },
  'Max Participants': {
    FREE: '5',
    PAY_PER_HOST: '25',
    STARTUP: '50',
    ENTERPRISE: '300',
    INSTITUTIONAL: '1000'
  },
  'Monthly Hours Limit': {
    FREE: 'Unlimited meetings',
    PAY_PER_HOST: '100 hours/host',
    STARTUP: 'Unlimited',
    ENTERPRISE: 'Unlimited',
    INSTITUTIONAL: 'Unlimited'
  },
  'Recording': {
    FREE: false,
    PAY_PER_HOST: '20 hours/month',
    STARTUP: '50 hours/month',
    ENTERPRISE: '500 hours/month',
    INSTITUTIONAL: 'Unlimited'
  },
  'AI Assistant': {
    FREE: false,
    PAY_PER_HOST: true,
    STARTUP: true,
    ENTERPRISE: true,
    INSTITUTIONAL: true
  },
  'Breakout Rooms': {
    FREE: false,
    PAY_PER_HOST: false,
    STARTUP: true,
    ENTERPRISE: true,
    INSTITUTIONAL: true
  },
  'Calendar Integration': {
    FREE: false,
    PAY_PER_HOST: true,
    STARTUP: true,
    ENTERPRISE: true,
    INSTITUTIONAL: true
  },
  'Advanced Analytics': {
    FREE: false,
    PAY_PER_HOST: true,
    STARTUP: true,
    ENTERPRISE: true,
    INSTITUTIONAL: true
  },
  'Custom Branding': {
    FREE: false,
    PAY_PER_HOST: false,
    STARTUP: false,
    ENTERPRISE: true,
    INSTITUTIONAL: true
  },
  'LMS Integration': {
    FREE: false,
    PAY_PER_HOST: false,
    STARTUP: false,
    ENTERPRISE: false,
    INSTITUTIONAL: true
  },
  'Support': {
    FREE: 'Community',
    PAY_PER_HOST: 'Email',
    STARTUP: 'Email',
    ENTERPRISE: 'Priority',
    INSTITUTIONAL: 'Dedicated'
  },
  'Best For': {
    FREE: 'Personal use',
    PAY_PER_HOST: 'Occasional hosts',
    STARTUP: 'Small teams',
    ENTERPRISE: 'Large organizations',
    INSTITUTIONAL: 'Education'
  }
};

/**
 * UPGRADE PATHS
 *
 * Define allowed upgrade/downgrade paths
 */
const UPGRADE_PATHS = {
  FREE: ['PAY_PER_HOST', 'STARTUP', 'ENTERPRISE', 'INSTITUTIONAL'],
  PAY_PER_HOST: ['STARTUP', 'ENTERPRISE', 'INSTITUTIONAL'],
  STARTUP: ['ENTERPRISE', 'INSTITUTIONAL'],
  ENTERPRISE: ['INSTITUTIONAL'],
  INSTITUTIONAL: [] // Top tier
};

const DOWNGRADE_PATHS = {
  INSTITUTIONAL: ['ENTERPRISE', 'STARTUP', 'PAY_PER_HOST', 'FREE'],
  ENTERPRISE: ['STARTUP', 'PAY_PER_HOST', 'FREE'],
  STARTUP: ['PAY_PER_HOST', 'FREE'],
  PAY_PER_HOST: ['FREE'],
  FREE: [] // Bottom tier
};

/**
 * USAGE TRACKING
 *
 * What to track for billing and enforcement
 */
const USAGE_METRICS = {
  trackMeetingDuration: true,
  trackParticipantCount: true,
  trackRecordingHours: true,
  trackStorageUsed: true,
  trackApiCalls: true,
  trackActiveUsers: true
};

/**
 * HELPER FUNCTIONS
 */

/**
 * Get license tier configuration
 */
function getLicenseTier(tierId) {
  return LICENSE_TIERS[tierId.toUpperCase()];
}

/**
 * Check if a feature is available for a tier
 */
function isFeatureAvailable(tierId, featureName) {
  const tier = getLicenseTier(tierId);
  if (!tier) return false;

  // Check global feature flag first
  if (FEATURE_FLAGS[featureName] === false) return false;

  // Check tier-specific feature
  if (tier.features && tier.features[featureName] !== undefined) {
    return tier.features[featureName];
  }

  // Check institutional features
  if (tier.institutionalFeatures && tier.institutionalFeatures[featureName] !== undefined) {
    return tier.institutionalFeatures[featureName];
  }

  return false;
}

/**
 * Check if a tier allows a specific participant count
 */
function canHostParticipantCount(tierId, participantCount) {
  const tier = getLicenseTier(tierId);
  if (!tier) return false;

  if (tier.maxParticipants === null) return true; // unlimited
  return participantCount <= tier.maxParticipants;
}

/**
 * Check if a tier allows a specific meeting duration
 */
function canMeetForDuration(tierId, durationMinutes) {
  const tier = getLicenseTier(tierId);
  if (!tier) return false;

  if (tier.maxMeetingDuration === null) return true; // unlimited
  return durationMinutes <= tier.maxMeetingDuration;
}

/**
 * Get all available tiers
 */
function getAllTiers() {
  return Object.values(LICENSE_TIERS);
}

/**
 * Get tier IDs
 */
function getTierIds() {
  return Object.keys(LICENSE_TIERS);
}

/**
 * Can upgrade from one tier to another
 */
function canUpgrade(fromTier, toTier) {
  const upgradePaths = UPGRADE_PATHS[fromTier.toUpperCase()];
  return upgradePaths && upgradePaths.includes(toTier.toUpperCase());
}

/**
 * Can downgrade from one tier to another
 */
function canDowngrade(fromTier, toTier) {
  const downgradePaths = DOWNGRADE_PATHS[fromTier.toUpperCase()];
  return downgradePaths && downgradePaths.includes(toTier.toUpperCase());
}

/**
 * Get pricing for a tier
 */
function getPricing(tierId, billingCycle = 'monthly') {
  const tier = getLicenseTier(tierId);
  if (!tier) return null;

  if (billingCycle === 'annual' && tier.annualPrice) {
    return {
      price: tier.annualPrice,
      monthlyEquivalent: Math.round(tier.annualPrice / 12),
      savings: tier.price * 12 - tier.annualPrice,
      billingCycle: 'annual'
    };
  }

  return {
    price: tier.price,
    billingCycle: 'monthly'
  };
}

/**
 * Check if promotion is active
 */
function getActivePromotion() {
  if (!PRICING_CONFIG.promotion.enabled) return null;

  const validUntil = new Date(PRICING_CONFIG.promotion.validUntil);
  if (new Date() > validUntil) return null;

  return PRICING_CONFIG.promotion;
}

/**
 * Calculate discounted price
 */
function getDiscountedPrice(tierId, billingCycle = 'monthly') {
  const pricing = getPricing(tierId, billingCycle);
  const promotion = getActivePromotion();

  if (!pricing || !promotion) return pricing;

  if (!promotion.applicableTiers.includes(tierId.toUpperCase())) {
    return pricing;
  }

  const discount = promotion.discount / 100;
  const discountedPrice = Math.round(pricing.price * (1 - discount));

  return {
    ...pricing,
    originalPrice: pricing.price,
    price: discountedPrice,
    discount: promotion.discount,
    promotionCode: promotion.code
  };
}

module.exports = {
  LICENSE_TIERS,
  FEATURE_FLAGS,
  TRIAL_CONFIG,
  ENFORCEMENT,
  PRICING_CONFIG,
  CONTACT_SALES_TIERS,
  FEATURE_COMPARISON,
  UPGRADE_PATHS,
  DOWNGRADE_PATHS,
  USAGE_METRICS,

  // Helper functions
  getLicenseTier,
  isFeatureAvailable,
  canHostParticipantCount,
  canMeetForDuration,
  getAllTiers,
  getTierIds,
  canUpgrade,
  canDowngrade,
  getPricing,
  getActivePromotion,
  getDiscountedPrice
};
