const express = require('express');
const router = express.Router();
const licenseService = require('../services/licenseService');
const { validateLicense, requireFeature } = require('../middleware/licenseMiddleware');

/**
 * Get current license information
 * GET /api/license
 */
router.get('/', (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';
    const summary = licenseService.getLicenseSummary(organizationId);

    res.json({
      success: true,
      license: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all available tiers
 * GET /api/license/tiers
 */
router.get('/tiers', (req, res) => {
  try {
    const tiers = licenseService.getAllTiers();

    res.json({
      success: true,
      tiers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get pricing for a specific tier
 * GET /api/license/pricing/:tierId
 */
router.get('/pricing/:tierId', (req, res) => {
  try {
    const { tierId } = req.params;
    const { billingCycle } = req.query;

    const pricing = licenseService.getPricing(tierId, billingCycle || 'monthly');

    if (!pricing) {
      return res.status(404).json({
        success: false,
        error: 'Tier not found'
      });
    }

    res.json({
      success: true,
      pricing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Check if a feature is available
 * POST /api/license/check-feature
 */
router.post('/check-feature', (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';
    const { featureName } = req.body;

    const check = licenseService.checkFeature(organizationId, featureName);

    res.json({
      success: true,
      feature: featureName,
      ...check
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Upgrade license
 * POST /api/license/upgrade
 */
router.post('/upgrade', (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';
    const { tierId, billingCycle } = req.body;

    const result = licenseService.upgradeLicense(organizationId, tierId, billingCycle);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Downgrade license
 * POST /api/license/downgrade
 */
router.post('/downgrade', (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';
    const { tierId } = req.body;

    const result = licenseService.downgradeLicense(organizationId, tierId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cancel license
 * POST /api/license/cancel
 */
router.post('/cancel', (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';
    const { immediate } = req.body;

    const result = licenseService.cancelLicense(organizationId, immediate);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Renew license
 * POST /api/license/renew
 */
router.post('/renew', (req, res) => {
  try {
    const organizationId = req.user?.organizationId || req.session?.organizationId || 'default';
    const { billingCycle } = req.body;

    const result = licenseService.renewLicense(organizationId, billingCycle || 'monthly');

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create a new license (Admin only)
 * POST /api/license/create
 */
router.post('/create', (req, res) => {
  try {
    // TODO: Add admin authentication check
    const { organizationId, tierId, billingCycle, maxUsers, trialPeriod } = req.body;

    const license = licenseService.createLicense({
      organizationId,
      tierId,
      billingCycle,
      maxUsers,
      trialPeriod
    });

    res.json({
      success: true,
      license
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
