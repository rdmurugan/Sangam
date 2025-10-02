import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SolutionsPage.css';

const GovernmentPage = () => {
  return (
    <div className="solutions-page">
      {/* Hero Section */}
      <section className="solution-hero government">
        <div className="hero-content">
          <h1>Sangam for Government</h1>
          <p className="hero-subtitle">
            Secure, accessible video conferencing for public sector agencies and government organizations
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn-primary-large">Request Demo</Link>
            <Link to="/pricing" className="btn-secondary-large">View Pricing</Link>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="benefits-section">
        <div className="container">
          <h2>Why Government Agencies Choose Sangam</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🔐</div>
              <h3>Security First</h3>
              <p>End-to-end encryption, audit logging, and access controls protect sensitive government communications.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">♿</div>
              <h3>Accessible</h3>
              <p>Meet accessibility standards with live translation, screen reader support, and inclusive design.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🏛️</div>
              <h3>Transparent</h3>
              <p>Recording capabilities and comprehensive audit trails ensure accountability and transparency.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🌍</div>
              <h3>Serve Citizens</h3>
              <p>Connect with constituents through virtual town halls, public meetings, and online services.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Government */}
      <section className="features-detail">
        <div className="container">
          <h2>Features Built for Public Sector</h2>

          <div className="feature-row">
            <div className="feature-content">
              <h3>Secure Government Communications</h3>
              <p>
                Protect sensitive government discussions with enterprise-grade security. End-to-end encrypted
                video and audio ensure confidential communications remain private.
              </p>
              <ul className="feature-list">
                <li>End-to-end encrypted video/audio</li>
                <li>Secure TLS connections</li>
                <li>Role-based access controls</li>
                <li>Comprehensive audit logging</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder security"></div>
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
              <h3>Virtual Town Halls & Public Meetings</h3>
              <p>
                Engage with constituents through accessible virtual meetings. Support large-scale town halls,
                public hearings, and community forums with reliable video conferencing.
              </p>
              <ul className="feature-list">
                <li>Support for large participant counts</li>
                <li>Waiting room for controlled access</li>
                <li>Polls and Q&A for engagement</li>
                <li>Recording for public transparency</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder waiting"></div>
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-content">
              <h3>Inter-Agency Collaboration</h3>
              <p>
                Facilitate seamless collaboration between departments and agencies. Share information securely,
                coordinate responses, and maintain operational efficiency.
              </p>
              <ul className="feature-list">
                <li>Breakout rooms for team discussions</li>
                <li>Screen sharing for presentations</li>
                <li>Interactive whiteboard collaboration</li>
                <li>Secure file and document sharing</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder breakout"></div>
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
              <h3>Multilingual Support</h3>
              <p>
                Serve diverse communities with real-time language translation. Break down language barriers
                and ensure all constituents can participate effectively.
              </p>
              <ul className="feature-list">
                <li>Real-time translation</li>
                <li>Multiple language support</li>
                <li>Automatic language detection</li>
                <li>Inclusive communication</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder screen"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="use-cases">
        <div className="container">
          <h2>Serving Communities Across Government</h2>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <h3>🏛️ Legislative Sessions</h3>
              <p>Conduct remote legislative hearings, committee meetings, and voting sessions with full transparency.</p>
            </div>
            <div className="use-case-card">
              <h3>👥 Public Hearings</h3>
              <p>Enable citizen participation in public hearings and community forums from anywhere.</p>
            </div>
            <div className="use-case-card">
              <h3>🚨 Emergency Response</h3>
              <p>Coordinate emergency response teams across agencies with reliable, secure communications.</p>
            </div>
            <div className="use-case-card">
              <h3>🏢 Inter-Agency Meetings</h3>
              <p>Collaborate effectively across departments with secure video conferencing and document sharing.</p>
            </div>
            <div className="use-case-card">
              <h3>📚 Public Training</h3>
              <p>Deliver training programs for employees and educational content for citizens remotely.</p>
            </div>
            <div className="use-case-card">
              <h3>🗳️ Constituent Services</h3>
              <p>Provide virtual office hours and one-on-one consultations with constituents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="compliance-section">
        <div className="container">
          <h2>Security & Compliance</h2>
          <p className="section-intro">
            Built to meet the stringent security and compliance requirements of government agencies.
          </p>
          <div className="compliance-grid">
            <div className="compliance-card">
              <h3>🔐 Data Protection</h3>
              <p>End-to-end encryption ensures sensitive government communications remain confidential.</p>
            </div>
            <div className="compliance-card">
              <h3>📋 Audit Trails</h3>
              <p>Comprehensive logging of all meeting activities for compliance and accountability.</p>
            </div>
            <div className="compliance-card">
              <h3>🛡️ Access Controls</h3>
              <p>Granular permissions and waiting rooms ensure only authorized participants can join.</p>
            </div>
            <div className="compliance-card">
              <h3>📊 Transparency</h3>
              <p>Recording and reporting capabilities support open government initiatives.</p>
            </div>
          </div>
          <div className="compliance-note">
            <p><strong>Note:</strong> Government agencies are responsible for ensuring their use of the platform complies with applicable regulations and security requirements in their jurisdiction.</p>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="pricing-cta">
        <div className="container">
          <h2>Flexible Pricing for Government Organizations</h2>
          <p>Custom solutions for federal, state, and local government agencies</p>
          <div className="cta-buttons">
            <Link to="/pricing" className="btn-primary-large">View Government Pricing</Link>
            <Link to="/signup" className="btn-secondary-large">Request Demo</Link>
          </div>
          <p className="cta-note">Volume discounts available • Custom deployments • Dedicated support</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2>Trusted by Government Agencies</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Sangam has enabled us to conduct transparent public meetings while maintaining security.
                The audit logging features are exactly what we need for compliance."
              </p>
              <div className="author">
                <strong>David Miller</strong>
                <span>IT Director, City Government</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "We've used Sangam for virtual town halls reaching thousands of constituents.
                The platform is reliable, secure, and easy for everyone to use."
              </p>
              <div className="author">
                <strong>Patricia Lopez</strong>
                <span>Director of Communications, State Agency</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "The multilingual support has been invaluable for serving our diverse community.
                Sangam helps us connect with all our constituents effectively."
              </p>
              <div className="author">
                <strong>James Chen</strong>
                <span>Community Outreach Manager</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GovernmentPage;
