import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              One platform to <span className="highlight">connect</span>
            </h1>
            <p className="hero-subtitle">
              Bring teams together, collaborate seamlessly, and build stronger relationships
              with HD video, audio, and screen sharing. Secure, reliable, and easy to use
              for all your daily meetings.
            </p>
            <div className="hero-cta">
              <Link to="/signup" className="btn-primary-large">
                Sign Up Free
              </Link>
              <Link to="/download" className="btn-secondary-large">
                Download App
              </Link>
            </div>
            <p className="hero-note">
              No credit card required • 40 minutes free meetings • Up to 100 participants
            </p>
          </div>
          <div className="hero-visual">
            <div className="mockup-container">
              <div className="mockup-screen">
                <div className="mockup-grid">
                  <div className="participant-tile"></div>
                  <div className="participant-tile"></div>
                  <div className="participant-tile"></div>
                  <div className="participant-tile"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3>1080p</h3>
            <p>HD Video Quality</p>
          </div>
          <div className="stat-item">
            <h3>E2E</h3>
            <p>Encrypted Meetings</p>
          </div>
          <div className="stat-item">
            <h3>Free</h3>
            <p>40 Min Meetings</p>
          </div>
          <div className="stat-item">
            <h3>WebRTC</h3>
            <p>Technology</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Everything you need for meetings and more</h2>
          <p className="section-subtitle">
            Powerful features that make meetings productive and engaging
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <path d="M8 21h8M12 17v4"/>
                </svg>
              </div>
              <h3>HD Video & Audio</h3>
              <p>Crystal-clear video up to 1080p and studio-quality audio for professional meetings</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                </svg>
              </div>
              <h3>Interactive Whiteboard</h3>
              <p>Collaborate in real-time with shared whiteboards and annotation tools</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3>Screen Sharing</h3>
              <p>Share your entire screen or specific applications with participants</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <h3>Team Chat</h3>
              <p>Keep conversations going with integrated chat and file sharing</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <h3>Recording</h3>
              <p>Record meetings to the cloud or local device for future reference</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3>Breakout Rooms</h3>
              <p>Split participants into smaller groups for focused discussions</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <h3>AI Assistant</h3>
              <p>Get meeting summaries, transcriptions, and smart recommendations</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
              </div>
              <h3>Scheduling</h3>
              <p>Integrate with Google Calendar and schedule meetings effortlessly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="solutions-section">
        <div className="section-container">
          <h2 className="section-title">Built for every team</h2>

          <div className="solutions-grid">
            <div className="solution-card">
              <h3>Business</h3>
              <p>Empower your team with tools that drive productivity and collaboration</p>
              <ul>
                <li>Unlimited meetings</li>
                <li>Advanced analytics</li>
                <li>Custom branding</li>
                <li>SSO integration</li>
              </ul>
              <Link to="/solutions/business" className="btn-link">Learn more →</Link>
            </div>

            <div className="solution-card">
              <h3>Education</h3>
              <p>Create engaging virtual classrooms with tools designed for learning</p>
              <ul>
                <li>Interactive whiteboard</li>
                <li>Attendance tracking</li>
                <li>Breakout rooms</li>
                <li>Screen sharing</li>
              </ul>
              <Link to="/solutions/education" className="btn-link">Learn more →</Link>
            </div>

            <div className="solution-card">
              <h3>Healthcare</h3>
              <p>Secure telehealth solutions for patient care</p>
              <ul>
                <li>Secure encryption</li>
                <li>Waiting rooms</li>
                <li>Patient scheduling</li>
                <li>Private consultations</li>
              </ul>
              <Link to="/solutions/healthcare" className="btn-link">Learn more →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="section-container">
          <h2 className="section-title">Trusted by teams worldwide</h2>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Sangam has transformed how our distributed team collaborates. The video quality
                is exceptional, and the integration with our tools is seamless."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div>
                  <p className="author-name">Sarah Johnson</p>
                  <p className="author-title">VP of Engineering, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "The breakout rooms and whiteboard features have made our training sessions
                much more interactive. Our team loves it!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div>
                  <p className="author-name">Michael Chen</p>
                  <p className="author-title">Training Manager, EduTech</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Best video conferencing platform we've used. Reliable, secure, and the
                customer support is outstanding."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div>
                  <p className="author-name">Emma Williams</p>
                  <p className="author-title">CTO, HealthCare Plus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to get started?</h2>
          <p>Join millions of users and start your first meeting today</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-primary-large">
              Start Free Trial
            </Link>
            <Link to="/pricing" className="btn-secondary-large">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
