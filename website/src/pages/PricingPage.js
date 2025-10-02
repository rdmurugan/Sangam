import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/PricingPage.css';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await axios.get('/api/license/tiers');
      setTiers(response.data.tiers);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      // Use fallback tiers if API fails
      setTiers(getFallbackTiers());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackTiers = () => [
    {
      id: 'free',
      name: 'Free',
      displayName: 'Free Plan',
      price: 0,
      maxParticipants: 5,
      maxMeetingDuration: 40,
      features: {
        videoConferencing: true,
        audioConferencing: true,
        screenSharing: true,
        chat: true,
        recording: false,
        aiAssistant: false,
        breakoutRooms: false
      }
    },
    {
      id: 'startup',
      name: 'Startup',
      displayName: 'Startup Plan',
      price: 39,
      annualPrice: 390,
      maxParticipants: 50,
      maxMeetingDuration: null,
      features: {
        videoConferencing: true,
        audioConferencing: true,
        screenSharing: true,
        chat: true,
        recording: true,
        aiAssistant: true,
        breakoutRooms: true,
        calendarIntegration: true,
        advancedAnalytics: true
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      displayName: 'Enterprise Plan',
      price: 299,
      annualPrice: 2990,
      maxParticipants: 300,
      maxMeetingDuration: null,
      features: {
        videoConferencing: true,
        audioConferencing: true,
        screenSharing: true,
        chat: true,
        recording: true,
        aiAssistant: true,
        breakoutRooms: true,
        calendarIntegration: true,
        advancedAnalytics: true,
        customBranding: true,
        customDomain: true
      }
    }
  ];

  const getPrice = (tier) => {
    if (tier.price === 0) return 'Free';
    const price = billingCycle === 'annual' && tier.annualPrice
      ? Math.round(tier.annualPrice / 12)
      : tier.price;
    return `$${price}`;
  };

  const getFullPrice = (tier) => {
    if (tier.price === 0) return null;
    return billingCycle === 'annual' && tier.annualPrice
      ? tier.annualPrice
      : tier.price;
  };

  const getSavings = (tier) => {
    if (!tier.annualPrice || billingCycle === 'monthly') return null;
    const monthlyCost = tier.price * 12;
    const savings = monthlyCost - tier.annualPrice;
    const savingsPercent = Math.round((savings / monthlyCost) * 100);
    return `Save ${savingsPercent}%`;
  };

  if (loading) {
    return (
      <div className="pricing-page">
        <div className="loading">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="pricing-page">
      <section className="pricing-hero">
        <div className="pricing-container">
          <h1>Plans & Pricing</h1>
          <p className="pricing-subtitle">
            Choose the perfect plan for your team. Start free, upgrade as you grow.
          </p>

          <div className="billing-toggle">
            <button
              className={billingCycle === 'monthly' ? 'active' : ''}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={billingCycle === 'annual' ? 'active' : ''}
              onClick={() => setBillingCycle('annual')}
            >
              Annual
              <span className="savings-badge">Save 16%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="pricing-tiers">
        <div className="pricing-container">
          <div className="tiers-grid">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`tier-card ${tier.id === 'startup' ? 'featured' : ''}`}
              >
                {tier.id === 'startup' && (
                  <div className="popular-badge">Most Popular</div>
                )}

                <h3 className="tier-name">{tier.displayName || tier.name}</h3>
                <div className="tier-price">
                  <span className="price">{getPrice(tier)}</span>
                  {tier.price > 0 && (
                    <span className="period">/{billingCycle === 'annual' ? 'month' : 'month'}</span>
                  )}
                </div>

                {getSavings(tier) && (
                  <div className="savings-note">{getSavings(tier)}</div>
                )}

                {billingCycle === 'annual' && tier.annualPrice && (
                  <div className="billed-note">
                    Billed annually at ${tier.annualPrice}
                  </div>
                )}

                <div className="tier-features">
                  <h4>Key Features:</h4>
                  <ul>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {tier.maxMeetingDuration
                        ? `${tier.maxMeetingDuration} min meetings`
                        : 'Unlimited meeting duration'}
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Up to {tier.maxParticipants} participants
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      HD video & audio
                    </li>
                    <li>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Screen sharing
                    </li>
                    {tier.features?.recording && (
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Cloud recording
                      </li>
                    )}
                    {tier.features?.aiAssistant && (
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        AI Assistant
                      </li>
                    )}
                    {tier.features?.breakoutRooms && (
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Breakout rooms
                      </li>
                    )}
                    {tier.features?.advancedAnalytics && (
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Advanced analytics
                      </li>
                    )}
                    {tier.features?.customBranding && (
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Custom branding
                      </li>
                    )}
                  </ul>
                </div>

                <Link
                  to={`/signup?plan=${tier.id}&billing=${billingCycle}`}
                  className={`btn-tier ${tier.id === 'startup' ? 'btn-primary' : 'btn-outline'}`}
                >
                  {tier.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>

          <div className="enterprise-note">
            <h3>Need a custom plan?</h3>
            <p>
              Contact our sales team for enterprise solutions with custom pricing,
              dedicated support, and advanced security features.
            </p>
            <a href="#contact" className="btn-contact">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="comparison-section">
        <div className="pricing-container">
          <h2>Compare Plans</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  {tiers.map(tier => (
                    <th key={tier.id}>{tier.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Meeting Duration</td>
                  {tiers.map(tier => (
                    <td key={tier.id}>
                      {tier.maxMeetingDuration ? `${tier.maxMeetingDuration} min` : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Max Participants</td>
                  {tiers.map(tier => (
                    <td key={tier.id}>{tier.maxParticipants}</td>
                  ))}
                </tr>
                <tr>
                  <td>Cloud Recording</td>
                  {tiers.map(tier => (
                    <td key={tier.id}>{tier.features?.recording ? '✓' : '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td>AI Assistant</td>
                  {tiers.map(tier => (
                    <td key={tier.id}>{tier.features?.aiAssistant ? '✓' : '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Breakout Rooms</td>
                  {tiers.map(tier => (
                    <td key={tier.id}>{tier.features?.breakoutRooms ? '✓' : '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Advanced Analytics</td>
                  {tiers.map(tier => (
                    <td key={tier.id}>{tier.features?.advancedAnalytics ? '✓' : '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td>Custom Branding</td>
                  {tiers.map(tier => (
                    <td key={tier.id}>{tier.features?.customBranding ? '✓' : '—'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="pricing-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Can I change my plan later?</h4>
              <p>Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
            </div>
            <div className="faq-item">
              <h4>Is there a free trial?</h4>
              <p>Yes, all paid plans come with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div className="faq-item">
              <h4>What payment methods do you accept?</h4>
              <p>We accept all major credit cards, PayPal, and wire transfers for enterprise plans.</p>
            </div>
            <div className="faq-item">
              <h4>Can I cancel anytime?</h4>
              <p>Absolutely. You can cancel your subscription at any time. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
