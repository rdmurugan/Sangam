import React, { useState } from 'react';
import '../styles/InfoPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send to an API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <div className="info-page">
      <section className="info-hero">
        <div className="hero-content">
          <h1>Contact Us</h1>
          <p className="hero-subtitle">
            We're here to help. Reach out to us with any questions or feedback.
          </p>
        </div>
      </section>

      <section className="info-section">
        <div className="info-container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>
                Whether you have a question about features, pricing, need a demo, or anything else,
                our team is ready to answer all your questions.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <h3>📧 Email</h3>
                  <p><a href="mailto:support@sangam.com">support@sangam.com</a></p>
                  <p className="small">For general inquiries and support</p>
                </div>

                <div className="contact-method">
                  <h3>💼 Sales</h3>
                  <p><a href="mailto:sales@sangam.com">sales@sangam.com</a></p>
                  <p className="small">For enterprise and custom solutions</p>
                </div>

                <div className="contact-method">
                  <h3>🔒 Privacy</h3>
                  <p><a href="mailto:privacy@sangam.com">privacy@sangam.com</a></p>
                  <p className="small">For data protection and privacy inquiries</p>
                </div>

                <div className="contact-method">
                  <h3>🏢 Office</h3>
                  <p>Sangam Inc.</p>
                  <p>123 Tech Street</p>
                  <p>San Francisco, CA 94105</p>
                  <p>United States</p>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              {!submitted ? (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <h3>Send us a message</h3>

                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company">Company / Organization</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales Question</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-submit">Send Message</button>
                </form>
              ) : (
                <div className="success-message">
                  <h3>✓ Message Sent!</h3>
                  <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        company: '',
                        subject: 'general',
                        message: ''
                      });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="info-section gray">
        <div className="info-container center">
          <h2>Frequently Asked Questions</h2>
          <p>Looking for quick answers? Check out our <a href="#help">Help Center</a> for common questions and troubleshooting guides.</p>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
