/**
 * License Service
 *
 * Manages license validation, feature checks, and usage tracking
 */

const crypto = require('crypto');
const licenseConfig = require('../config/licenseConfig');

class LicenseService {
  constructor() {
    // In-memory storage for demo (use database in production)
    this.licenses = new Map(); // organizationId/userId -> license
    this.usageTracking = new Map(); // organizationId -> usage data
  }

  /**
   * Generate a unique license key
   */
  generateLicenseKey(tierId, organizationId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const data = `${tierId}-${organizationId}-${timestamp}-${random}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    // Format: SANG-XXXX-XXXX-XXXX-XXXX
    const key = hash.substring(0, 16).toUpperCase();
    return `SANG-${key.substring(0, 4)}-${key.substring(4, 8)}-${key.substring(8, 12)}-${key.substring(12, 16)}`;
  }

  /**
   * Create a new license
   */
  createLicense({
    organizationId,
    tierId = 'FREE',
    billingCycle = 'monthly',
    maxUsers = null,
    startDate = new Date(),
    expiryDate = null,
    trialPeriod = false
  }) {
    const tier = licenseConfig.getLicenseTier(tierId);
    if (!tier) {
      throw new Error(`Invalid tier: ${tierId}`);
    }

    // Calculate expiry date
    let calculatedExpiry = expiryDate;
    if (!calculatedExpiry) {
      if (trialPeriod && licenseConfig.TRIAL_CONFIG.enabled) {
        calculatedExpiry = new Date(startDate);
        calculatedExpiry.setDate(calculatedExpiry.getDate() + licenseConfig.TRIAL_CONFIG.duration);
      } else if (tierId !== 'FREE') {
        // Default to 1 month for paid plans
        calculatedExpiry = new Date(startDate);
        calculatedExpiry.setMonth(calculatedExpiry.getMonth() + 1);
      }
    }

    const license = {
      licenseKey: this.generateLicenseKey(tierId, organizationId),
      organizationId,
      tierId: tierId.toUpperCase(),
      tierName: tier.name,
      billingCycle,
      maxUsers,
      startDate,
      expiryDate: calculatedExpiry,
      status: 'active', // active, expired, suspended, cancelled
      isTrial: trialPeriod,
      createdAt: new Date(),
      updatedAt: new Date(),

      // Usage tracking
      usage: {
        totalMeetings: 0,
        totalMinutes: 0,
        totalParticipants: 0,
        recordingHours: 0,
        storageUsed: 0,
        activeUsers: 0,
        apiCalls: 0
      },

      // Feature overrides (can override tier defaults)
      featureOverrides: {}
    };

    this.licenses.set(organizationId, license);

    // Initialize usage tracking
    this.usageTracking.set(organizationId, {
      currentMonth: {
        meetings: 0,
        minutes: 0,
        participants: 0,
        recordingHours: 0
      },
      history: []
    });

    return license;
  }

  /**
   * Get license for an organization/user
   */
  getLicense(organizationId) {
    return this.licenses.get(organizationId);
  }

  /**
   * Validate license
   */
  validateLicense(organizationId) {
    const license = this.getLicense(organizationId);

    if (!license) {
      // No license found, return FREE tier
      return {
        valid: true,
        license: this.createLicense({ organizationId, tierId: 'FREE' }),
        reason: 'default_free_tier'
      };
    }

    // Check if license is expired
    if (license.expiryDate && new Date() > license.expiryDate) {
      // Check grace period
      const gracePeriodEnd = new Date(license.expiryDate);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + licenseConfig.ENFORCEMENT.gracePeriod);

      if (new Date() > gracePeriodEnd) {
        // Grace period expired
        if (licenseConfig.ENFORCEMENT.strictMode) {
          // Downgrade to FREE
          license.tierId = 'FREE';
          license.status = 'expired';
          return {
            valid: false,
            license,
            reason: 'expired'
          };
        } else {
          // Warning mode
          return {
            valid: true,
            license,
            warning: 'Your license has expired. Please renew to continue using premium features.',
            reason: 'expired_warning'
          };
        }
      } else {
        // In grace period
        return {
          valid: true,
          license,
          warning: `Your license expired. Grace period ends ${gracePeriodEnd.toLocaleDateString()}.`,
          reason: 'grace_period'
        };
      }
    }

    // Check if suspended or cancelled
    if (license.status === 'suspended' || license.status === 'cancelled') {
      return {
        valid: false,
        license,
        reason: license.status
      };
    }

    return {
      valid: true,
      license
    };
  }

  /**
   * Check if a feature is available
   */
  checkFeature(organizationId, featureName) {
    const validation = this.validateLicense(organizationId);
    const license = validation.license;

    // Check feature override first
    if (license.featureOverrides && license.featureOverrides[featureName] !== undefined) {
      return {
        available: license.featureOverrides[featureName],
        reason: 'override'
      };
    }

    // Check tier features
    const available = licenseConfig.isFeatureAvailable(license.tierId, featureName);

    if (!available) {
      const tier = licenseConfig.getLicenseTier(license.tierId);
      return {
        available: false,
        reason: 'not_in_tier',
        upgradeRequired: true,
        currentTier: tier.name,
        upgradeMessage: tier.upgradeMessage
      };
    }

    return {
      available: true,
      reason: 'included_in_tier'
    };
  }

  /**
   * Check if meeting parameters are allowed
   */
  checkMeetingLimits(organizationId, { participants, estimatedDuration }) {
    const validation = this.validateLicense(organizationId);
    const license = validation.license;
    const tier = licenseConfig.getLicenseTier(license.tierId);

    const checks = {
      valid: true,
      violations: []
    };

    // Check participant limit
    if (!licenseConfig.canHostParticipantCount(license.tierId, participants)) {
      checks.valid = false;
      checks.violations.push({
        type: 'participants',
        limit: tier.maxParticipants,
        requested: participants,
        message: `Your plan supports up to ${tier.maxParticipants} participants. You requested ${participants}.`
      });
    }

    // Check duration limit
    if (estimatedDuration && !licenseConfig.canMeetForDuration(license.tierId, estimatedDuration)) {
      checks.valid = false;
      checks.violations.push({
        type: 'duration',
        limit: tier.maxMeetingDuration,
        requested: estimatedDuration,
        message: `Your plan supports meetings up to ${tier.maxMeetingDuration} minutes. Estimated duration: ${estimatedDuration} minutes.`
      });
    }

    // Check concurrent meetings (if tracking)
    const usage = this.usageTracking.get(organizationId);
    if (usage && usage.currentConcurrent >= tier.maxConcurrentMeetings) {
      checks.valid = false;
      checks.violations.push({
        type: 'concurrent',
        limit: tier.maxConcurrentMeetings,
        current: usage.currentConcurrent,
        message: `Your plan supports ${tier.maxConcurrentMeetings} concurrent meetings. You currently have ${usage.currentConcurrent} active.`
      });
    }

    if (!checks.valid) {
      checks.upgradeRequired = true;
      checks.upgradeMessage = tier.upgradeMessage;
      checks.currentTier = tier.name;
    }

    return checks;
  }

  /**
   * Track meeting usage
   */
  trackMeeting(organizationId, { duration, participants, recordingUsed }) {
    const license = this.getLicense(organizationId);
    if (!license) return;

    // Update license usage
    license.usage.totalMeetings++;
    license.usage.totalMinutes += duration;
    license.usage.totalParticipants += participants;
    if (recordingUsed) {
      license.usage.recordingHours += (duration / 60);
    }
    license.updatedAt = new Date();

    // Update monthly tracking
    const tracking = this.usageTracking.get(organizationId);
    if (tracking) {
      tracking.currentMonth.meetings++;
      tracking.currentMonth.minutes += duration;
      tracking.currentMonth.participants += participants;
      if (recordingUsed) {
        tracking.currentMonth.recordingHours += (duration / 60);
      }
    }
  }

  /**
   * Track concurrent meeting start
   */
  startConcurrentTracking(organizationId) {
    const tracking = this.usageTracking.get(organizationId);
    if (tracking) {
      tracking.currentConcurrent = (tracking.currentConcurrent || 0) + 1;
    }
  }

  /**
   * Track concurrent meeting end
   */
  endConcurrentTracking(organizationId) {
    const tracking = this.usageTracking.get(organizationId);
    if (tracking && tracking.currentConcurrent > 0) {
      tracking.currentConcurrent--;
    }
  }

  /**
   * Upgrade license
   */
  upgradeLicense(organizationId, newTierId, billingCycle = 'monthly') {
    const license = this.getLicense(organizationId);
    if (!license) {
      throw new Error('License not found');
    }

    if (!licenseConfig.canUpgrade(license.tierId, newTierId)) {
      throw new Error(`Cannot upgrade from ${license.tierId} to ${newTierId}`);
    }

    const newTier = licenseConfig.getLicenseTier(newTierId);
    const oldTier = licenseConfig.getLicenseTier(license.tierId);

    license.tierId = newTierId.toUpperCase();
    license.tierName = newTier.name;
    license.billingCycle = billingCycle;
    license.isTrial = false;
    license.updatedAt = new Date();

    // Extend expiry date
    if (license.tierId !== 'FREE') {
      const newExpiry = new Date();
      if (billingCycle === 'annual') {
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      } else {
        newExpiry.setMonth(newExpiry.getMonth() + 1);
      }
      license.expiryDate = newExpiry;
    }

    return {
      success: true,
      license,
      oldTier: oldTier.name,
      newTier: newTier.name,
      message: `Successfully upgraded from ${oldTier.name} to ${newTier.name}`
    };
  }

  /**
   * Downgrade license
   */
  downgradeLicense(organizationId, newTierId) {
    const license = this.getLicense(organizationId);
    if (!license) {
      throw new Error('License not found');
    }

    if (!licenseConfig.canDowngrade(license.tierId, newTierId)) {
      throw new Error(`Cannot downgrade from ${license.tierId} to ${newTierId}`);
    }

    const newTier = licenseConfig.getLicenseTier(newTierId);
    const oldTier = licenseConfig.getLicenseTier(license.tierId);

    license.tierId = newTierId.toUpperCase();
    license.tierName = newTier.name;
    license.updatedAt = new Date();

    // Downgrade takes effect at end of current billing period
    const downgradeEffectiveDate = license.expiryDate || new Date();

    return {
      success: true,
      license,
      oldTier: oldTier.name,
      newTier: newTier.name,
      effectiveDate: downgradeEffectiveDate,
      message: `Downgrade scheduled for ${downgradeEffectiveDate.toLocaleDateString()}`
    };
  }

  /**
   * Cancel license
   */
  cancelLicense(organizationId, immediate = false) {
    const license = this.getLicense(organizationId);
    if (!license) {
      throw new Error('License not found');
    }

    if (immediate) {
      license.status = 'cancelled';
      license.tierId = 'FREE';
      license.expiryDate = new Date();
    } else {
      // Cancel at end of billing period
      license.status = 'cancelling';
    }

    license.updatedAt = new Date();

    return {
      success: true,
      license,
      immediate,
      message: immediate
        ? 'License cancelled immediately'
        : `License will be cancelled on ${license.expiryDate.toLocaleDateString()}`
    };
  }

  /**
   * Renew license
   */
  renewLicense(organizationId, billingCycle = 'monthly') {
    const license = this.getLicense(organizationId);
    if (!license) {
      throw new Error('License not found');
    }

    license.status = 'active';
    license.billingCycle = billingCycle;

    // Extend expiry date
    const newExpiry = new Date();
    if (billingCycle === 'annual') {
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
    } else {
      newExpiry.setMonth(newExpiry.getMonth() + 1);
    }
    license.expiryDate = newExpiry;
    license.updatedAt = new Date();

    return {
      success: true,
      license,
      message: `License renewed until ${newExpiry.toLocaleDateString()}`
    };
  }

  /**
   * Get license summary for display
   */
  getLicenseSummary(organizationId) {
    const validation = this.validateLicense(organizationId);
    const license = validation.license;
    const tier = licenseConfig.getLicenseTier(license.tierId);
    const usage = this.usageTracking.get(organizationId);

    return {
      licenseKey: license.licenseKey,
      tier: {
        id: tier.id,
        name: tier.displayName,
        price: tier.price,
        billingCycle: license.billingCycle
      },
      status: license.status,
      isTrial: license.isTrial,
      expiryDate: license.expiryDate,
      daysRemaining: license.expiryDate
        ? Math.ceil((license.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
        : null,

      // Usage
      usage: license.usage,
      monthlyUsage: usage ? usage.currentMonth : null,

      // Limits
      limits: {
        maxMeetingDuration: tier.maxMeetingDuration,
        maxParticipants: tier.maxParticipants,
        maxConcurrentMeetings: tier.maxConcurrentMeetings,
        cloudStorage: tier.cloudStorage,
        recordingStorage: tier.recordingStorage
      },

      // Features
      features: tier.features,

      // Warnings
      warning: validation.warning,
      expired: license.status === 'expired',
      inGracePeriod: validation.reason === 'grace_period',

      // Upgrade info
      canUpgrade: licenseConfig.UPGRADE_PATHS[license.tierId]?.length > 0,
      upgradeOptions: licenseConfig.UPGRADE_PATHS[license.tierId] || [],
      upgradeMessage: tier.upgradeMessage
    };
  }

  /**
   * Get all tiers for comparison/selection
   */
  getAllTiers() {
    return licenseConfig.getAllTiers().map(tier => ({
      id: tier.id,
      name: tier.displayName,
      description: tier.description,
      price: tier.price,
      annualPrice: tier.annualPrice,
      features: tier.features,
      limits: {
        maxMeetingDuration: tier.maxMeetingDuration,
        maxParticipants: tier.maxParticipants,
        maxConcurrentMeetings: tier.maxConcurrentMeetings,
        cloudStorage: tier.cloudStorage,
        recordingStorage: tier.recordingStorage
      }
    }));
  }

  /**
   * Get pricing information
   */
  getPricing(tierId, billingCycle = 'monthly') {
    const tier = licenseConfig.getLicenseTier(tierId);
    if (!tier) return null;

    const pricing = licenseConfig.getDiscountedPrice(tierId, billingCycle);
    const promotion = licenseConfig.getActivePromotion();

    return {
      tier: {
        id: tier.id,
        name: tier.displayName,
        description: tier.description
      },
      pricing,
      promotion,
      currency: licenseConfig.PRICING_CONFIG.currency,
      currencySymbol: licenseConfig.PRICING_CONFIG.currencySymbol
    };
  }
}

// Export singleton instance
module.exports = new LicenseService();
