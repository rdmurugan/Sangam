import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/FeaturesPage.css';

const FeaturesPage = () => {
  const featureCategories = [
    {
      title: 'Video & Audio',
      icon: '🎥',
      features: [
        {
          name: 'HD Video & Audio',
          description: 'Crystal-clear video up to 1080p HD and superior audio quality with noise suppression.',
          benefits: ['Up to 1080p HD video quality', 'AI-powered noise cancellation', 'Automatic echo elimination', 'Low-light correction'],
          useCase: 'Perfect for professional presentations, client meetings, and remote interviews where quality matters.'
        },
        {
          name: 'Camera & Audio Selection',
          description: 'Choose from multiple cameras and microphones to optimize your meeting setup.',
          benefits: ['Multiple camera support', 'Audio device selection', 'Device testing tools', 'Settings saved per device'],
          useCase: 'Switch between built-in and external cameras, or select your preferred microphone setup.'
        }
      ]
    },
    {
      title: 'Collaboration Tools',
      icon: '🤝',
      features: [
        {
          name: 'Interactive Whiteboard',
          description: 'Collaborative digital whiteboard with real-time drawing, shapes, and sticky notes.',
          benefits: ['Unlimited canvas space', 'Real-time collaboration', 'Drawing tools', 'Multi-user editing'],
          useCase: 'Brainstorm ideas, diagram workflows, and visualize concepts with your entire team in real-time.'
        },
        {
          name: 'Screen Sharing',
          description: 'Share your entire screen, specific application window, or presentation with advanced controls.',
          benefits: ['Full screen or window sharing', 'Audio sharing capability', 'Annotation tools', 'High quality streaming'],
          useCase: 'Present slides, demonstrate software, review documents, or troubleshoot technical issues collaboratively.'
        },
        {
          name: 'Breakout Rooms',
          description: 'Create smaller discussion groups within your meeting for focused collaboration.',
          benefits: ['Automatic or manual assignment', 'Flexible room creation', 'Broadcast messages', 'Seamless transitions'],
          useCase: 'Facilitate small group discussions in training sessions, workshops, and large team meetings.'
        },
        {
          name: 'Live Chat & Reactions',
          description: 'In-meeting chat with file sharing, emoji reactions, and threaded conversations.',
          benefits: ['Public and private messaging', 'File and link sharing', 'Emoji reactions', 'Save chat history'],
          useCase: 'Share links, ask questions, and provide feedback without interrupting the speaker.'
        },
        {
          name: 'Polls & Voting',
          description: 'Create interactive polls to gather instant feedback and make decisions during meetings.',
          benefits: ['Multiple choice polls', 'Real-time results', 'Anonymous voting', 'Export poll data'],
          useCase: 'Make group decisions, gather feedback, or conduct quick surveys during team meetings and webinars.'
        },
        {
          name: 'Live Translation',
          description: 'Real-time language translation to break down language barriers in global meetings.',
          benefits: ['Multiple language support', 'Real-time translation', 'Auto language detection', 'Seamless communication'],
          useCase: 'Conduct international meetings with participants speaking different languages without communication barriers.'
        }
      ]
    },
    {
      title: 'AI & Intelligence',
      icon: '🤖',
      features: [
        {
          name: 'Meeting Recording',
          description: 'Record meetings with speaker view and gallery view options for later review.',
          benefits: ['Local recording support', 'Speaker and gallery view', 'High quality audio/video', 'Easy playback'],
          useCase: 'Create training materials, capture important decisions, and review meetings you missed.'
        },
        {
          name: 'AI Meeting Summaries',
          description: 'Automatically generated meeting summaries with key points, action items, and decisions.',
          benefits: ['Action item extraction', 'Key decision highlights', 'Topic segmentation', 'Smart summaries'],
          useCase: 'Save time on note-taking and ensure everyone is aligned on outcomes and next steps.'
        }
      ]
    },
    {
      title: 'Security & Privacy',
      icon: '🔒',
      features: [
        {
          name: 'Secure Encryption',
          description: 'Video and audio streams are end-to-end encrypted using industry-standard WebRTC technology.',
          benefits: ['E2E encrypted video/audio (DTLS-SRTP)', 'TLS encrypted chat', 'Secure WebRTC connections', 'Protected data transmission'],
          useCase: 'Keep your video and audio conversations private with encryption that prevents unauthorized access.'
        },
        {
          name: 'Waiting Room',
          description: 'Control who enters your meeting with a virtual waiting room and admission controls.',
          benefits: ['Admit participants individually', 'Bulk admission options', 'Participant screening', 'Custom waiting messages'],
          useCase: 'Prevent uninvited participants and ensure only authorized attendees join sensitive meetings.'
        },
        {
          name: 'Access Controls',
          description: 'Granular permissions for screen sharing, chat, recording, and other meeting functions.',
          benefits: ['Role-based permissions', 'Lock meeting settings', 'Remove participants', 'Disable features selectively'],
          useCase: 'Maintain control in large webinars, prevent disruptions, and manage participant capabilities.'
        }
      ]
    },
    {
      title: 'Analytics & Insights',
      icon: '📊',
      features: [
        {
          name: 'Meeting Analytics',
          description: 'Comprehensive dashboard showing attendance, engagement, and meeting quality metrics.',
          benefits: ['Attendance tracking', 'Engagement metrics', 'Quality of service data', 'Custom reports'],
          useCase: 'Measure team productivity, optimize meeting schedules, and identify engagement patterns.'
        },
        {
          name: 'Participant Engagement',
          description: 'Track participant attention, questions asked, and interaction levels during meetings.',
          benefits: ['Attention tracking', 'Interaction metrics', 'Question analytics', 'Participation scores'],
          useCase: 'Understand which topics engage your audience and improve future presentations.'
        }
      ]
    },
    {
      title: 'Integration & Productivity',
      icon: '🔗',
      features: [
        {
          name: 'Calendar Integration',
          description: 'Seamless integration with Google Calendar and scheduling tools.',
          benefits: ['Google Calendar sync', 'One-click join', 'Meeting scheduling', 'OAuth authentication'],
          useCase: 'Schedule meetings directly from your calendar and join with a single click.'
        },
        {
          name: 'REST API Access',
          description: 'Developer-friendly REST APIs for custom integrations and workflow automation.',
          benefits: ['Room creation API', 'User authentication', 'Meeting management', 'License control'],
          useCase: 'Build custom workflows, integrate with internal tools, and automate meeting room creation.'
        }
      ]
    }
  ];

  return (
    <div className="features-page">
      <section className="features-hero">
        <div className="hero-content">
          <h1>Powerful Features for Modern Teams</h1>
          <p>Everything you need for productive meetings, seamless collaboration, and meaningful connections</p>
          <div className="hero-cta">
            <Link to="/signup" className="btn-primary">Start Free Trial</Link>
            <Link to="/pricing" className="btn-secondary">View Pricing</Link>
          </div>
        </div>
      </section>

      <section className="features-overview">
        <div className="container">
          <div className="overview-stats">
            <div className="stat">
              <h3>20+</h3>
              <p>Powerful Features</p>
            </div>
            <div className="stat">
              <h3>WebRTC</h3>
              <p>Technology</p>
            </div>
            <div className="stat">
              <h3>1080p</h3>
              <p>HD Video Quality</p>
            </div>
            <div className="stat">
              <h3>E2E</h3>
              <p>Encryption</p>
            </div>
          </div>
        </div>
      </section>

      {featureCategories.map((category, catIndex) => (
        <section key={catIndex} className={`feature-category ${catIndex % 2 === 0 ? 'bg-white' : 'bg-gray'}`}>
          <div className="container">
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <h2>{category.title}</h2>
            </div>

            <div className="features-grid">
              {category.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="feature-detail-card">
                  <h3>{feature.name}</h3>
                  <p className="feature-description">{feature.description}</p>

                  <div className="feature-benefits">
                    <h4>Key Benefits:</h4>
                    <ul>
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="feature-usecase">
                    <h4>Use Case:</h4>
                    <p>{feature.useCase}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="features-cta">
        <div className="container">
          <h2>Ready to Experience These Features?</h2>
          <p>Start your free 14-day trial today. No credit card required.</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn-primary-large">Start Free Trial</Link>
            <Link to="/download" className="btn-secondary-large">Download App</Link>
          </div>
          <p className="cta-note">Trusted by teams worldwide for secure video conferencing</p>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
