import React from 'react';
import '../styles/DownloadPage.css';

const DownloadPage = () => (
  <div className="download-page">
    <section className="download-hero">
      <h1>Download Sangam</h1>
      <p>Get the app for Windows, Mac, Linux, iOS, and Android</p>
    </section>
    <section className="download-options">
      <div className="download-grid">
        <div className="download-card">
          <h3>Windows</h3>
          <button className="btn-download">Download for Windows</button>
        </div>
        <div className="download-card">
          <h3>Mac</h3>
          <button className="btn-download">Download for Mac</button>
        </div>
        <div className="download-card">
          <h3>Linux</h3>
          <button className="btn-download">Download for Linux</button>
        </div>
        <div className="download-card">
          <h3>iOS</h3>
          <button className="btn-download">App Store</button>
        </div>
        <div className="download-card">
          <h3>Android</h3>
          <button className="btn-download">Google Play</button>
        </div>
      </div>
    </section>
  </div>
);

export default DownloadPage;
