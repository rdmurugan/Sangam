import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SolutionsPage.css';

const HealthcarePage = () => {
  return (
    <div className="solutions-page">
      {/* Hero Section */}
      <section className="solution-hero healthcare">
        <div className="hero-content">
          <h1>Sangam for Healthcare</h1>
          <p className="hero-subtitle">
            Secure, reliable telehealth platform for virtual patient consultations
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
          <h2>Why Healthcare Providers Choose Sangam</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>End-to-end encrypted video and audio ensures patient privacy and data security.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⏱️</div>
              <h3>Efficient Scheduling</h3>
              <p>Integrated scheduling and waiting room features streamline your virtual consultations.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📱</div>
              <h3>Easy Access</h3>
              <p>Patients can join from any device - desktop, tablet, or mobile - with no downloads required.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">✅</div>
              <h3>Reliable</h3>
              <p>HD video and audio quality for clear communication during medical consultations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Healthcare */}
      <section className="features-detail">
        <div className="container">
          <h2>Features Built for Telehealth</h2>

          <div className="feature-row">
            <div className="feature-content">
              <h3>Virtual Waiting Room</h3>
              <p>
                Control when patients enter your consultation with a secure virtual waiting room.
                Review patient information before admitting them to ensure a smooth experience.
              </p>
              <ul className="feature-list">
                <li>Admit patients individually</li>
                <li>Custom waiting room messages</li>
                <li>Patient screening before admission</li>
                <li>Manage multiple patients efficiently</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder waiting"></div>
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
              <h3>End-to-End Encrypted Communications</h3>
              <p>
                Video and audio streams are encrypted end-to-end using industry-standard WebRTC
                technology, ensuring patient confidentiality and data protection.
              </p>
              <ul className="feature-list">
                <li>DTLS-SRTP encryption for media</li>
                <li>Secure TLS connections</li>
                <li>No recordings without consent</li>
                <li>Private one-on-one consultations</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder security"></div>
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-content">
              <h3>Screen Sharing for Medical Review</h3>
              <p>
                Share medical records, test results, or educational materials with patients
                during consultations. Review diagnoses and treatment plans together.
              </p>
              <ul className="feature-list">
                <li>Share documents and images</li>
                <li>Annotate shared screens</li>
                <li>High-quality image sharing</li>
                <li>Privacy controls</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder screen"></div>
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
              <h3>Calendar Integration</h3>
              <p>
                Integrate with Google Calendar to schedule appointments, send automated reminders,
                and manage your telehealth schedule efficiently.
              </p>
              <ul className="feature-list">
                <li>Sync with Google Calendar</li>
                <li>Automated appointment reminders</li>
                <li>One-click join for patients</li>
                <li>Recurring appointment support</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder calendar"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="compliance-section">
        <div className="container">
          <h2>Security & Privacy</h2>
          <p className="section-intro">
            We take patient privacy seriously. Our platform is built with security best practices
            to protect sensitive health information.
          </p>
          <div className="compliance-grid">
            <div className="compliance-card">
              <h3>🔐 End-to-End Encryption</h3>
              <p>All video and audio streams are encrypted using WebRTC's DTLS-SRTP protocol.</p>
            </div>
            <div className="compliance-card">
              <h3>🛡️ Access Controls</h3>
              <p>Waiting rooms and granular permissions control who can join and what they can do.</p>
            </div>
            <div className="compliance-card">
              <h3>🔒 Data Protection</h3>
              <p>No permanent storage of video/audio. Patient conversations are not recorded without consent.</p>
            </div>
            <div className="compliance-card">
              <h3>📋 Audit Logs</h3>
              <p>Track all meeting activities with comprehensive logging for compliance requirements.</p>
            </div>
          </div>
          <div className="compliance-note">
            <p><strong>Note:</strong> While Sangam provides secure communication tools, healthcare providers are responsible for ensuring their use of the platform complies with applicable regulations (HIPAA, GDPR, etc.) in their jurisdiction.</p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="use-cases">
        <div className="container">
          <h2>Perfect for Every Healthcare Setting</h2>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <h3>🏥 Primary Care</h3>
              <p>Conduct routine check-ups, follow-up appointments, and minor consultations remotely.</p>
            </div>
            <div className="use-case-card">
              <h3>🧠 Mental Health</h3>
              <p>Provide therapy and counseling sessions in a private, secure virtual environment.</p>
            </div>
            <div className="use-case-card">
              <h3>🩺 Specialist Consultations</h3>
              <p>Connect specialists with patients regardless of geographic location for expert second opinions.</p>
            </div>
            <div className="use-case-card">
              <h3>💊 Pharmacy Services</h3>
              <p>Conduct medication reviews and consultations with patients from your pharmacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="pricing-cta">
        <div className="container">
          <h2>Flexible Pricing for Healthcare Providers</h2>
          <p>Plans designed for individual practitioners, clinics, and healthcare organizations</p>
          <div className="cta-buttons">
            <Link to="/pricing" className="btn-primary-large">View Healthcare Pricing</Link>
            <Link to="/signup" className="btn-secondary-large">Start Free Trial</Link>
          </div>
          <p className="cta-note">Free tier available • Enterprise options • Custom compliance features</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2>What Healthcare Providers Are Saying</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Sangam has enabled us to provide quality care to patients who can't make it to the clinic.
                The waiting room feature is exactly what we needed."
              </p>
              <div className="author">
                <strong>Dr. James Martinez</strong>
                <span>Family Medicine Physician</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Security and privacy are paramount in mental health. Sangam gives my patients confidence
                that our sessions are private and secure."
              </p>
              <div className="author">
                <strong>Dr. Lisa Anderson</strong>
                <span>Licensed Therapist</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Easy for both staff and patients to use. The video quality is excellent,
                and we haven't had any reliability issues."
              </p>
              <div className="author">
                <strong>Sarah Williams, RN</strong>
                <span>Telehealth Coordinator</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthcarePage;
