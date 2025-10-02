import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/InfoPage.css';

const AboutPage = () => {
  return (
    <div className="info-page">
      <section className="info-hero">
        <div className="hero-content">
          <h1>About Sangam</h1>
          <p className="hero-subtitle">
            Connecting people through secure, reliable video conferencing
          </p>
        </div>
      </section>

      <section className="info-section">
        <div className="info-container">
          <h2>Our Mission</h2>
          <p className="large-text">
            To make high-quality, secure video communication accessible to everyone—from small teams
            to large enterprises, educational institutions, and healthcare providers.
          </p>
        </div>
      </section>

      <section className="info-section gray">
        <div className="info-container">
          <h2>Our Story</h2>
          <p>
            Sangam was founded with a simple belief: that everyone deserves access to secure, reliable
            video conferencing tools without complexity or compromise. We saw organizations struggling
            with platforms that were either too expensive, too complex, or lacked essential security features.
          </p>
          <p>
            We built Sangam from the ground up with a focus on three core principles:
          </p>
          <div className="principle-grid">
            <div className="principle-card">
              <h3>🔒 Security First</h3>
              <p>End-to-end encryption for video and audio, ensuring your conversations remain private.</p>
            </div>
            <div className="principle-card">
              <h3>🎯 Simplicity</h3>
              <p>Intuitive interface that anyone can use without training or technical expertise.</p>
            </div>
            <div className="principle-card">
              <h3>⚡ Reliability</h3>
              <p>HD video quality and stable connections you can count on for important meetings.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="info-container">
          <h2>What We Offer</h2>
          <div className="offering-list">
            <div className="offering-item">
              <h3>For Businesses</h3>
              <p>Professional video conferencing with enterprise security, analytics, and collaboration tools to keep your team productive.</p>
            </div>
            <div className="offering-item">
              <h3>For Education</h3>
              <p>Interactive virtual classrooms with whiteboards, breakout rooms, and attendance tracking for engaging online learning.</p>
            </div>
            <div className="offering-item">
              <h3>For Healthcare</h3>
              <p>Secure telehealth platform with waiting rooms, encrypted consultations, and calendar integration for patient care.</p>
            </div>
            <div className="offering-item">
              <h3>For Government</h3>
              <p>Accessible, transparent communication tools for public meetings, inter-agency collaboration, and constituent services.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section gray">
        <div className="info-container">
          <h2>Our Technology</h2>
          <p>
            Sangam is built on industry-standard WebRTC technology, providing:
          </p>
          <ul className="tech-list">
            <li><strong>End-to-End Encryption:</strong> Video and audio streams are encrypted using DTLS-SRTP, ensuring only participants can access the content.</li>
            <li><strong>Peer-to-Peer Connections:</strong> Direct connections between participants for optimal quality and minimal latency.</li>
            <li><strong>Cross-Platform Support:</strong> Works seamlessly on desktop, tablet, and mobile devices without downloads.</li>
            <li><strong>HD Quality:</strong> Crystal-clear video up to 1080p and studio-quality audio.</li>
          </ul>
        </div>
      </section>

      <section className="info-section">
        <div className="info-container">
          <h2>Our Commitment to Privacy</h2>
          <p>
            We believe privacy is a fundamental right. That's why:
          </p>
          <ul className="commitment-list">
            <li>We use end-to-end encryption for all video and audio communications</li>
            <li>We don't store your video or audio streams on our servers</li>
            <li>We don't sell your data to third parties</li>
            <li>We provide transparent privacy controls and audit logging</li>
            <li>We comply with industry standards and regulations (GDPR, CCPA)</li>
          </ul>
          <p>
            Read our <Link to="/privacy">Privacy Policy</Link> for complete details.
          </p>
        </div>
      </section>

      <section className="info-section cta-section">
        <div className="info-container center">
          <h2>Ready to Get Started?</h2>
          <p className="large-text">
            Join thousands of teams using Sangam for secure, reliable video communication.
          </p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-primary-large">Sign Up Free</Link>
            <Link to="/contact" className="btn-secondary-large">Contact Sales</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
