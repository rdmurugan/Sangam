import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/SignUpPage.css';

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    selectedPlan: searchParams.get('plan') || 'free',
    billingCycle: searchParams.get('billing') || 'monthly'
  });

  const [tiers, setTiers] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await axios.get('/api/license/tiers');
      setTiers(response.data.tiers);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // Create user account
      const userResponse = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName
      });

      const userId = userResponse.data.user.id;
      const orgId = userResponse.data.organization.id;

      // Create license with selected plan
      await axios.post('/api/license/create', {
        organizationId: orgId,
        userId: userId,
        tierId: formData.selectedPlan.toUpperCase(),
        billingCycle: formData.billingCycle,
        trialPeriod: formData.selectedPlan !== 'free'
      });

      // Redirect to app or success page
      navigate('/login?registered=true');

    } catch (error) {
      console.error('Error creating account:', error);
      setErrors({
        submit: error.response?.data?.error || 'Failed to create account. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTier = tiers.find(t => t.id === formData.selectedPlan) || {};

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p>Start collaborating in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Plan Selection */}
          <div className="form-section">
            <h3>Choose Your Plan</h3>
            <div className="plan-selector">
              {tiers.map(tier => (
                <label
                  key={tier.id}
                  className={`plan-option ${formData.selectedPlan === tier.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="selectedPlan"
                    value={tier.id}
                    checked={formData.selectedPlan === tier.id}
                    onChange={handleChange}
                  />
                  <div className="plan-details">
                    <h4>{tier.name}</h4>
                    <p className="plan-price">
                      {tier.price === 0 ? 'Free' : `$${tier.price}/month`}
                    </p>
                    <p className="plan-desc">{tier.maxParticipants} participants</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Account Information */}
          <div className="form-section">
            <h3>Account Information</h3>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="John Doe"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="john@company.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="organizationName">Organization Name</label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className={errors.organizationName ? 'error' : ''}
                placeholder="Your Company"
              />
              {errors.organizationName && <span className="error-message">{errors.organizationName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="At least 8 characters"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          {errors.submit && (
            <div className="form-error">
              {errors.submit}
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="signup-footer">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </form>

        {formData.selectedPlan !== 'free' && (
          <div className="trial-notice">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p>You'll get a 14-day free trial. No credit card required.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
