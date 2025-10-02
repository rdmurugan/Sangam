import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SolutionsPage.css';

const BusinessPage = () => {
  return (
    <div className="solutions-page">
      {/* Hero Section */}
      <section className="solution-hero business">
        <div className="hero-content">
          <h1>Sangam for Business</h1>
          <p className="hero-subtitle">
            Empower your team with professional video conferencing that drives productivity and collaboration
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn-primary-large">Start Free Trial</Link>
            <Link to="/pricing" className="btn-secondary-large">View Pricing</Link>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="benefits-section">
        <div className="container">
          <h2>Why Businesses Choose Sangam</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🚀</div>
              <h3>Boost Productivity</h3>
              <p>HD video, screen sharing, and collaboration tools keep your team focused and efficient.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Enterprise Security</h3>
              <p>End-to-end encryption, access controls, and compliance features protect your business data.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3>Analytics & Insights</h3>
              <p>Track meeting attendance, engagement, and usage patterns to optimize team collaboration.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🌍</div>
              <h3>Global Teams</h3>
              <p>Connect distributed teams across time zones with reliable, high-quality video conferencing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Business */}
      <section className="features-detail">
        <div className="container">
          <h2>Features Built for Business</h2>

          <div className="feature-row">
            <div className="feature-content">
              <h3>Team Collaboration Tools</h3>
              <p>
                Everything your team needs to collaborate effectively. Share screens, brainstorm on whiteboards,
                and keep everyone aligned with integrated chat and file sharing.
              </p>
              <ul className="feature-list">
                <li>HD video and audio up to 1080p</li>
                <li>Screen sharing with annotation</li>
                <li>Interactive whiteboard</li>
                <li>Real-time chat and file sharing</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder screen"></div>
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
              <h3>Breakout Rooms for Team Sessions</h3>
              <p>
                Split large meetings into focused breakout sessions for brainstorming, workshops, or team discussions.
                Perfect for training, ideation, and collaborative problem-solving.
              </p>
              <ul className="feature-list">
                <li>Create unlimited breakout rooms</li>
                <li>Automatic or manual assignment</li>
                <li>Broadcast messages to all rooms</li>
                <li>Seamless return to main meeting</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder breakout"></div>
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-content">
              <h3>Meeting Analytics & Reporting</h3>
              <p>
                Gain insights into team collaboration with comprehensive analytics. Track attendance,
                participation, and meeting patterns to improve team productivity.
              </p>
              <ul className="feature-list">
                <li>Attendance tracking and reports</li>
                <li>Engagement metrics</li>
                <li>Usage analytics and trends</li>
                <li>Export data for analysis</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder polls"></div>
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
              <h3>Enterprise Security & Compliance</h3>
              <p>
                Protect your business communications with enterprise-grade security. End-to-end encryption,
                access controls, and audit logging keep your data safe and compliant.
              </p>
              <ul className="feature-list">
                <li>End-to-end encrypted video/audio</li>
                <li>Waiting rooms and access controls</li>
                <li>Role-based permissions</li>
                <li>Comprehensive audit logs</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder security"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="use-cases">
        <div className="container">
          <h2>Perfect for Every Business Need</h2>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <h3>👔 Sales & Client Meetings</h3>
              <p>Impress clients with professional video calls, screen sharing for demos, and seamless collaboration.</p>
            </div>
            <div className="use-case-card">
              <h3>🤝 Team Collaboration</h3>
              <p>Keep distributed teams connected with daily standups, brainstorming sessions, and project meetings.</p>
            </div>
            <div className="use-case-card">
              <h3>📈 Executive Briefings</h3>
              <p>Conduct board meetings, leadership sessions, and strategic planning with secure, reliable video.</p>
            </div>
            <div className="use-case-card">
              <h3>🎓 Training & Onboarding</h3>
              <p>Deliver effective remote training with interactive features, breakout rooms, and recording capabilities.</p>
            </div>
            <div className="use-case-card">
              <h3>💼 Recruitment</h3>
              <p>Conduct remote interviews and team introductions with candidates from anywhere in the world.</p>
            </div>
            <div className="use-case-card">
              <h3>🌐 All-Hands Meetings</h3>
              <p>Bring the entire company together for announcements, Q&A sessions, and team celebrations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="compliance-section">
        <div className="container">
          <h2>Integrate with Your Workflow</h2>
          <p className="section-intro">
            Sangam works seamlessly with the tools your team already uses for maximum productivity.
          </p>
          <div className="compliance-grid">
            <div className="compliance-card">
              <h3>📅 Calendar Integration</h3>
              <p>Sync with Google Calendar to schedule meetings and send automated reminders.</p>
            </div>
            <div className="compliance-card">
              <h3>🔔 Real-time Notifications</h3>
              <p>Get instant alerts for meeting invites, participant arrivals, and important updates.</p>
            </div>
            <div className="compliance-card">
              <h3>📊 Data Export</h3>
              <p>Export attendance reports, analytics, and meeting data for your business intelligence tools.</p>
            </div>
            <div className="compliance-card">
              <h3>🔐 SSO Ready</h3>
              <p>Streamline access with OAuth 2.0 authentication for secure single sign-on.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="pricing-cta">
        <div className="container">
          <h2>Flexible Plans for Growing Businesses</h2>
          <p>From startups to enterprises, we have the right plan for your team</p>
          <div className="cta-buttons">
            <Link to="/pricing" className="btn-primary-large">View Business Pricing</Link>
            <Link to="/signup" className="btn-secondary-large">Start Free Trial</Link>
          </div>
          <p className="cta-note">Free tier available • No credit card required • Scale as you grow</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2>What Business Leaders Are Saying</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Sangam transformed how our global team collaborates. The video quality is outstanding,
                and the breakout rooms have made our workshops so much more effective."
              </p>
              <div className="author">
                <strong>Jennifer Clark</strong>
                <span>VP of Operations, TechFlow Inc.</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Security was our top concern, and Sangam delivered. The end-to-end encryption and
                audit logs give us confidence in our client communications."
              </p>
              <div className="author">
                <strong>Robert Kim</strong>
                <span>CISO, FinSecure Corp.</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "We tried several platforms, but Sangam's reliability and ease of use won us over.
                Our team adopted it immediately with zero training needed."
              </p>
              <div className="author">
                <strong>Amanda Foster</strong>
                <span>CEO, GrowthLabs</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BusinessPage;
