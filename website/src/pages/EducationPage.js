import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SolutionsPage.css';

const EducationPage = () => {
  return (
    <div className="solutions-page">
      {/* Hero Section */}
      <section className="solution-hero education">
        <div className="hero-content">
          <h1>Sangam for Education</h1>
          <p className="hero-subtitle">
            Engage students and enhance learning with interactive virtual classrooms
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
          <h2>Why Educators Choose Sangam</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">📚</div>
              <h3>Interactive Learning</h3>
              <p>Engage students with interactive whiteboards, polls, and breakout rooms for collaborative learning.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">👥</div>
              <h3>Attendance Tracking</h3>
              <p>Automatically track student attendance and participation with built-in analytics.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Easy to Use</h3>
              <p>Simple interface that students and teachers can use without technical training.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Safe & Secure</h3>
              <p>Waiting rooms, access controls, and encrypted connections keep your virtual classroom safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Education */}
      <section className="features-detail">
        <div className="container">
          <h2>Features Built for Learning</h2>

          <div className="feature-row">
            <div className="feature-content">
              <h3>Interactive Whiteboard</h3>
              <p>
                Transform your lessons with a collaborative digital whiteboard. Draw diagrams,
                solve problems together, and save your work for later review.
              </p>
              <ul className="feature-list">
                <li>Real-time collaboration with students</li>
                <li>Drawing tools and shapes</li>
                <li>Save and export board content</li>
                <li>Multiple participants can contribute</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder whiteboard"></div>
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
              <h3>Breakout Rooms</h3>
              <p>
                Facilitate small group discussions and collaborative activities with easy-to-manage
                breakout rooms. Perfect for group projects and peer learning.
              </p>
              <ul className="feature-list">
                <li>Create unlimited breakout rooms</li>
                <li>Automatic or manual student assignment</li>
                <li>Timer and broadcast announcements</li>
                <li>Return to main session seamlessly</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder breakout"></div>
            </div>
          </div>

          <div className="feature-row">
            <div className="feature-content">
              <h3>Screen Sharing & Presentations</h3>
              <p>
                Share your screen to present slides, demonstrate software, or review documents.
                Students can also share their screens for presentations and feedback.
              </p>
              <ul className="feature-list">
                <li>Share full screen or specific windows</li>
                <li>High-quality screen streaming</li>
                <li>Audio sharing for video content</li>
                <li>Annotation tools for highlighting</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder screen"></div>
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="feature-content">
              <h3>Polls & Engagement</h3>
              <p>
                Keep students engaged with interactive polls and real-time Q&A.
                Gauge understanding and gather instant feedback during lessons.
              </p>
              <ul className="feature-list">
                <li>Create multiple choice polls</li>
                <li>View results in real-time</li>
                <li>Anonymous voting options</li>
                <li>Export poll data for assessment</li>
              </ul>
            </div>
            <div className="feature-visual">
              <div className="visual-placeholder polls"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="use-cases">
        <div className="container">
          <h2>Perfect for Every Learning Environment</h2>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <h3>🏫 K-12 Schools</h3>
              <p>Engage students with interactive lessons, manage virtual classrooms, and maintain safe learning environments.</p>
            </div>
            <div className="use-case-card">
              <h3>🎓 Higher Education</h3>
              <p>Conduct lectures, facilitate discussions, and collaborate on research projects with students and faculty.</p>
            </div>
            <div className="use-case-card">
              <h3>📖 Online Courses</h3>
              <p>Deliver professional training, workshops, and certification courses to learners worldwide.</p>
            </div>
            <div className="use-case-card">
              <h3>👨‍🏫 Tutoring</h3>
              <p>Provide one-on-one or small group tutoring sessions with personalized attention and interactive tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="pricing-cta">
        <div className="container">
          <h2>Special Pricing for Educational Institutions</h2>
          <p>Flexible plans designed for schools, universities, and training organizations</p>
          <div className="cta-buttons">
            <Link to="/pricing" className="btn-primary-large">View Education Pricing</Link>
            <Link to="/signup" className="btn-secondary-large">Start Free Trial</Link>
          </div>
          <p className="cta-note">Free tier available • No credit card required • 14-day trial for paid plans</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <h2>What Educators Are Saying</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Sangam has made our transition to hybrid learning seamless. The breakout rooms
                are perfect for group work, and students love the interactive whiteboard."
              </p>
              <div className="author">
                <strong>Prof. Emily Rodriguez</strong>
                <span>University of California</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "Easy to use and reliable. My students can join classes from any device,
                and the attendance tracking saves me so much time."
              </p>
              <div className="author">
                <strong>Michael Thompson</strong>
                <span>High School Teacher, Boston</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">★★★★★</div>
              <p className="quote">
                "The polling feature helps me understand if students are grasping the material
                in real-time. It's transformed how I teach online."
              </p>
              <div className="author">
                <strong>Dr. Sarah Chen</strong>
                <span>Online Course Instructor</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EducationPage;
