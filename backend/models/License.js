const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
  licenseKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  organizationId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  tierId: {
    type: String,
    required: true,
    enum: ['FREE', 'PAY_PER_HOST', 'STARTUP', 'ENTERPRISE', 'INSTITUTIONAL'],
    default: 'FREE'
  },
  tierName: {
    type: String,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual', null],
    default: null
  },
  maxUsers: {
    type: Number,
    default: null
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended', 'cancelled', 'cancelling'],
    default: 'active'
  },
  isTrial: {
    type: Boolean,
    default: false
  },
  usage: {
    totalMeetings: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 },
    recordingHours: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    apiCalls: { type: Number, default: 0 }
  },
  featureOverrides: {
    type: Map,
    of: Boolean,
    default: {}
  },
  paymentInfo: {
    provider: String, // stripe, paypal, etc.
    customerId: String,
    subscriptionId: String,
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    paymentStatus: String
  }
}, {
  timestamps: true
});

// Indexes
LicenseSchema.index({ organizationId: 1, status: 1 });
LicenseSchema.index({ expiryDate: 1 });
LicenseSchema.index({ tierId: 1 });

// Virtual for days remaining
LicenseSchema.virtual('daysRemaining').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diff = this.expiryDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Method to check if license is valid
LicenseSchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (!this.expiryDate) return true; // No expiry (FREE tier)
  return new Date() < this.expiryDate;
};

// Method to check if in grace period
LicenseSchema.methods.isInGracePeriod = function() {
  if (!this.expiryDate) return false;
  const now = new Date();
  const gracePeriodEnd = new Date(this.expiryDate);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7 day grace period
  return now > this.expiryDate && now < gracePeriodEnd;
};

module.exports = mongoose.model('License', LicenseSchema);
