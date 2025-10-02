/**
 * License Validation Middleware
 */

const licenseService = require('../services/licenseService');

/**
 * Validate license for API routes
 */
const validateLicense = (req, res, next) => {
  const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';

  const validation = licenseService.validateLicense(organizationId);

  // Attach license info to request
  req.license = validation.license;
  req.licenseValid = validation.valid;
  req.licenseWarning = validation.warning;

  if (!validation.valid && !validation.warning) {
    return res.status(403).json({
      error: 'License expired or invalid',
      reason: validation.reason,
      license: {
        tier: validation.license.tierName,
        status: validation.license.status
      }
    });
  }

  next();
};

/**
 * Check specific feature availability
 */
const requireFeature = (featureName) => {
  return (req, res, next) => {
    const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';

    const featureCheck = licenseService.checkFeature(organizationId, featureName);

    if (!featureCheck.available) {
      return res.status(403).json({
        error: `Feature '${featureName}' not available in your plan`,
        reason: featureCheck.reason,
        upgradeRequired: featureCheck.upgradeRequired,
        currentTier: featureCheck.currentTier,
        message: featureCheck.upgradeMessage
      });
    }

    next();
  };
};

/**
 * Validate meeting limits
 */
const validateMeetingLimits = (req, res, next) => {
  const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';
  const { participants, estimatedDuration } = req.body;

  const checks = licenseService.checkMeetingLimits(organizationId, {
    participants: participants || 2,
    estimatedDuration: estimatedDuration || null
  });

  if (!checks.valid) {
    return res.status(403).json({
      error: 'Meeting limits exceeded',
      violations: checks.violations,
      upgradeRequired: checks.upgradeRequired,
      currentTier: checks.currentTier,
      message: checks.upgradeMessage
    });
  }

  req.meetingLimitsValid = true;
  next();
};

module.exports = {
  validateLicense,
  requireFeature,
  validateMeetingLimits
};
