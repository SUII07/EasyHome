import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './components/Footer';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Custom header for landing page */}
      <header className="landing-header">
        <div className="landing-logo">EasyHome</div>
        <div className="landing-nav">
          <button onClick={() => navigate('/login')} className="landing-login-btn">Log in</button>
          <button onClick={() => navigate('/signup')} className="landing-signup-btn">Sign up</button>
        </div>
      </header>

      {/* Main content */}
      <main className="landing-main">
        <div className="landing-content">
          <h1>Home Services Made <span className="highlight">Easy</span></h1>
          <p>Connect with trusted professionals for all your home maintenance needs in just a few clicks.</p>
          
          <div className="landing-features">
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <span>Quick Booking</span>
            </div>
            <div className="feature">
              <div className="feature-icon">✓</div>
              <span>Verified Experts</span>
            </div>
            <div className="feature">
              <div className="feature-icon">⭐</div>
              <span>Quality Guaranteed</span>
            </div>
          </div>

          <button onClick={() => navigate('/login')} className="get-started-btn">
            Get Started
          </button>
        </div>

        <div className="landing-image">
          <img 
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3"
            alt="Home service professional at work"
            className="hero-image"
          />
        </div>
      </main>

      {/* Reuse existing Footer component */}
      <Footer />
    </div>
  );
};

export default Landing; 