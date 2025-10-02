import React from 'react';
import '../styles/LegalPage.css';

const PrivacyPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: October 2, 2025</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            When you use Sangam, we collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>Account information (name, email address, organization name)</li>
            <li>Meeting data (participant names, meeting times, duration)</li>
            <li>Usage information (features used, settings preferences)</li>
            <li>Technical information (IP address, device type, browser information)</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends, usage, and activities</li>
          </ul>
        </section>

        <section>
          <h2>3. Video and Audio Privacy</h2>
          <p>
            <strong>End-to-End Encryption:</strong> Video and audio streams are encrypted end-to-end using
            WebRTC technology with DTLS-SRTP encryption. This means that the content of your video and audio
            is encrypted from sender to receiver, and our servers cannot access the unencrypted content.
          </p>
          <p>
            <strong>No Storage:</strong> We do not store your video or audio streams on our servers unless
            you explicitly choose to record a meeting. Recordings are stored locally on your device by default.
          </p>
          <p>
            <strong>Chat Messages:</strong> Chat messages are transmitted using encrypted TLS connections but
            are relayed through our servers. While encrypted in transit, these messages are not end-to-end encrypted.
          </p>
        </section>

        <section>
          <h2>4. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>With your consent:</strong> We share information when you give us explicit permission</li>
            <li><strong>For legal reasons:</strong> If required by law or to protect our rights</li>
            <li><strong>Service providers:</strong> With third-party vendors who help us provide our services</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul>
            <li>End-to-end encryption for video and audio streams (DTLS-SRTP)</li>
            <li>TLS encryption for all data in transit</li>
            <li>Secure authentication using industry-standard protocols (OAuth 2.0)</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and audit logging</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your information only as long as necessary to provide our services and fulfill the purposes
            outlined in this policy. Meeting metadata (participant names, times) is retained for 90 days unless
            deleted earlier. Video and audio streams are not stored unless explicitly recorded by the host.
          </p>
        </section>

        <section>
          <h2>7. Your Rights and Choices</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and receive a copy of your personal information</li>
            <li>Correct or update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Object to or restrict certain processing of your information</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p>
            To exercise these rights, please contact us at privacy@sangam.com
          </p>
        </section>

        <section>
          <h2>8. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to provide and improve our services. You can
            control cookies through your browser settings. Disabling cookies may limit some functionality.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13 years of age. We do not knowingly collect
            personal information from children under 13. If you believe we have collected information from
            a child under 13, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure
            appropriate safeguards are in place to protect your information in accordance with this policy.
          </p>
        </section>

        <section>
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting
            the new policy on this page and updating the "Last Updated" date. Continued use of our services
            after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> privacy@sangam.com<br/>
            <strong>Address:</strong> Sangam Inc., 123 Tech Street, San Francisco, CA 94105
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
