import React from 'react';

const Privacy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Privacy Policy for Sangam</h1>
      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

      <h2>1. Introduction</h2>
      <p>
        Welcome to Sangam. We respect your privacy and are committed to protecting your personal data.
        This privacy policy explains how we collect, use, and safeguard your information when you use our video conferencing service.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Account Information</h3>
      <p>When you sign up or log in with Google OAuth, we collect:</p>
      <ul>
        <li>Your name</li>
        <li>Email address</li>
        <li>Profile picture (if provided by Google)</li>
      </ul>

      <h3>2.2 Usage Information</h3>
      <p>We collect information about your use of the service:</p>
      <ul>
        <li>Meeting room IDs you create or join</li>
        <li>Connection logs (for troubleshooting)</li>
        <li>Device and browser information</li>
      </ul>

      <h3>2.3 Communication Data</h3>
      <p>
        Video, audio, and chat messages are transmitted peer-to-peer using WebRTC.
        We do not store or record your calls unless you explicitly enable recording.
      </p>

      <h2>3. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide and improve our video conferencing service</li>
        <li>Authenticate users via Google OAuth</li>
        <li>Enable peer-to-peer video and audio connections</li>
        <li>Troubleshoot technical issues</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We implement industry-standard security measures:</p>
      <ul>
        <li>End-to-end encryption for peer-to-peer connections</li>
        <li>HTTPS/TLS for all data transmission</li>
        <li>Secure authentication via OAuth 2.0</li>
        <li>No permanent storage of video/audio content</li>
      </ul>

      <h2>5. Data Sharing</h2>
      <p>We do not sell or share your personal information with third parties, except:</p>
      <ul>
        <li>With your explicit consent</li>
        <li>To comply with legal requirements</li>
        <li>To protect our rights and safety</li>
      </ul>

      <h2>6. Third-Party Services</h2>
      <p>We use the following third-party services:</p>
      <ul>
        <li><strong>Google OAuth:</strong> For authentication (governed by Google's Privacy Policy)</li>
        <li><strong>Metered.ca:</strong> For TURN server relay (governed by Metered's Privacy Policy)</li>
      </ul>

      <h2>7. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your account</li>
        <li>Withdraw consent at any time</li>
        <li>Export your data</li>
      </ul>

      <h2>8. Data Retention</h2>
      <p>
        We retain your account information for as long as your account is active.
        Meeting data (room IDs, participant lists) is temporary and deleted when the meeting ends.
        Video and audio streams are not recorded or stored by default.
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        Our service is not intended for children under 13 years of age.
        We do not knowingly collect personal information from children under 13.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this privacy policy from time to time. We will notify you of any changes
        by posting the new policy on this page and updating the "Last Updated" date.
      </p>

      <h2>11. Contact Us</h2>
      <p>If you have questions about this privacy policy, please contact us at:</p>
      <p>
        <strong>Email:</strong> privacy@sangam.app<br />
        <strong>Website:</strong> https://sangami.netlify.app
      </p>

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
        © {new Date().getFullYear()} Sangam. All rights reserved.
      </p>
    </div>
  );
};

export default Privacy;
