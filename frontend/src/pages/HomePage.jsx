import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './HomePage.css';

export const HomePage = ({ onOpenAuth }) => {
  const { theme, toggleTheme } = useContext(AuthContext);

  // Live Demo Predictor State (Starts uncalculated until user interacts)
  const [demoSleep, setDemoSleep] = useState(7.0);
  const [demoActivity, setDemoActivity] = useState(2.0);
  const [demoStress, setDemoStress] = useState('Low');
  const [demoScore, setDemoScore] = useState(null);

  const calculateQuickDemo = (sleep, activity, stress) => {
    let base = 5.0;
    base += (sleep - 6) * 0.6;
    base += activity * 0.8;
    if (stress === 'Low') base += 1.8;
    if (stress === 'Medium') base += 0.5;
    if (stress === 'High' || stress === 'Very High') base -= 1.5;
    const finalScore = Math.min(9.8, Math.max(2.1, parseFloat(base.toFixed(1))));
    setDemoScore(finalScore);
  };

  return (
    <div className="homepage-container">
      {/* Dynamic Background Glow Elements */}
      <div className="bg-glow-orb orb-1"></div>
      <div className="bg-glow-orb orb-2"></div>

      {/* Navigation Header */}
      <header className="home-navbar glass-card">
        <div className="home-logo">
          <span className="home-logo-icon">
            <i className="fa-solid fa-brain"></i>
          </span>
          <span className="home-logo-text">MindWell AI</span>
        </div>

        <nav className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#demo">Live Demo Prediction</a>
        </nav>

        <div className="home-nav-actions">
          <button className="theme-toggle-home" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
          </button>
          <button className="btn-home-secondary" onClick={() => onOpenAuth('login')}>
            Sign In
          </button>
          <button className="btn-home-primary" onClick={() => onOpenAuth('signup')}>
            Get Started <i className="fa-solid fa-arrow-right ml-2"></i>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-slide-up">
          <div className="hero-badge-pill">
            <span className="pill-pulse"></span>
            <span>AI-POWERED MENTAL WELLNESS SANCTUARY</span>
          </div>

          <h1 className="hero-title">
            Predict & Elevate Your <br />
            <span className="gradient-text">Mental Well-Being</span> Daily
          </h1>

          <p className="hero-subtitle">
            MindWell AI uses machine learning to evaluate your daily lifestyle metrics, monitor stress trends, and deliver intelligent self-care recommendations for your peace of mind.
          </p>

          <div className="hero-cta-group">
            <button className="btn-hero-main" onClick={() => onOpenAuth('signup')}>
              Start Free Assessment <i className="fa-solid fa-sparkles ml-2"></i>
            </button>
            <a href="#demo" className="btn-hero-demo">
              <i className="fa-solid fa-play mr-2"></i> Try Interactive Demo
            </a>
          </div>
        </div>

        {/* Hero Authentic Workflow Pipeline Visual */}
        <div className="hero-visual-card glass-card animate-pulse-glow">
          <div className="visual-card-header">
            <div className="visual-user-badge">
              <div className="visual-avatar">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div>
                <h4>Platform Pipeline</h4>
                <p>AI-Driven Mental Health Workflow</p>
              </div>
            </div>
          </div>

          <div className="pipeline-steps">
            <div className="pipeline-step-item">
              <div className="step-num-badge">1</div>
              <div className="step-content">
                <h5>Input Daily Lifestyle Data</h5>
                <p>Enter sleep, study/work hours, activity, and stress indicators.</p>
              </div>
            </div>

            <div className="pipeline-step-item">
              <div className="step-num-badge">2</div>
              <div className="step-content">
                <h5>Trained ML Prediction Engine</h5>
                <p>Evaluates lifestyle habits against our trained model dataset.</p>
              </div>
            </div>

            <div className="pipeline-step-item">
              <div className="step-num-badge">3</div>
              <div className="step-content">
                <h5>Actionable Insights & PDF Report</h5>
                <p>Receive your personalized Wellness Score & export PDF summaries.</p>
              </div>
            </div>
          </div>

          <button className="btn-home-primary w-full mt-4" onClick={() => onOpenAuth('signup')}>
            Get Your Real Score <i className="fa-solid fa-arrow-right ml-2"></i>
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Engineered for Your <span className="gradient-text">Mind & Peace</span></h2>
          <p>Comprehensive mental health tracking powered by machine learning and intuitive user analytics.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-box">
              <i className="fa-solid fa-microchip"></i>
            </div>
            <h3>AI Mental Health Predictor</h3>
            <p>Analyzes daily screen time, sleep, activity, and study patterns to calculate your exact Mental Health Index.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box">
              <i className="fa-solid fa-heart"></i>
            </div>
            <h3>Daily Mood Sanctuary</h3>
            <p>Log your thoughts, moods, and stress indicators with encrypted daily reflections and mood tracking history.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box">
              <i className="fa-solid fa-chart-pie"></i>
            </div>
            <h3>Wellness Analytics & Graphs</h3>
            <p>Visualize stress trends and mood distributions with interactive charts and historical analytics.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box">
              <i className="fa-solid fa-file-pdf"></i>
            </div>
            <h3>Download PDF Reports</h3>
            <p>Generate medical-grade PDF wellness summaries in one click to share with healthcare professionals.</p>
          </div>
        </div>
      </section>

      {/* Live Interactive Demo Widget */}
      <section id="demo" className="demo-section">
        <div className="demo-container glass-card">
          <div className="demo-info">
            <h2>Test the <span className="gradient-text">Live Demo Prediction</span></h2>
            <p>Adjust your daily habits below and click Calculate to test your score in real-time.</p>

            <div className="demo-sliders">
              <div className="demo-control-group">
                <label>
                  <span>Sleep Hours / Night</span>
                  <span className="demo-val">{demoSleep} hrs</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.5"
                  value={demoSleep}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setDemoSleep(v);
                    if (demoScore !== null) calculateQuickDemo(v, demoActivity, demoStress);
                  }}
                />
              </div>

              <div className="demo-control-group">
                <label>
                  <span>Physical Activity / Day</span>
                  <span className="demo-val">{demoActivity} hrs</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.5"
                  value={demoActivity}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setDemoActivity(v);
                    if (demoScore !== null) calculateQuickDemo(demoSleep, v, demoStress);
                  }}
                />
              </div>

              <div className="demo-control-group">
                <label><span>Daily Stress Level</span></label>
                <div className="demo-stress-selector">
                  {['Low', 'Medium', 'High'].map((st) => (
                    <button
                      key={st}
                      className={`demo-stress-btn ${demoStress === st ? 'active' : ''}`}
                      onClick={() => {
                        setDemoStress(st);
                        if (demoScore !== null) calculateQuickDemo(demoSleep, demoActivity, st);
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                className="btn-home-primary mt-2"
                onClick={() => calculateQuickDemo(demoSleep, demoActivity, demoStress)}
              >
                <i className="fa-solid fa-calculator mr-2"></i> Calculate Demo Score
              </button>
            </div>
          </div>

          <div className="demo-result-box">
            <h3>Calculated Wellness Index</h3>
            {demoScore === null ? (
              <div className="demo-score-placeholder">
                <span className="demo-score-num text-muted">--.--</span>
                <p className="text-xs text-secondary mt-2">Adjust values & click Calculate to see demo result</p>
              </div>
            ) : (
              <>
                <div className="demo-score-display">
                  <span className="demo-score-num">{demoScore}</span>
                  <span className="demo-score-max">/ 10.0</span>
                </div>
                <span className={`risk-badge ${demoScore >= 7.5 ? 'badge-success' : demoScore >= 5.0 ? 'badge-warning' : 'badge-danger'}`}>
                  {demoScore >= 7.5 ? 'Low Wellness Risk' : demoScore >= 5.0 ? 'Moderate Risk' : 'High Risk'}
                </span>
              </>
            )}

            <button className="btn-home-secondary mt-4 w-full" onClick={() => onOpenAuth('signup')}>
              Unlock Full Assessment <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer glass-card">
        <div className="footer-brand">
          <span className="home-logo-icon">
            <i className="fa-solid fa-brain"></i>
          </span>
          <h3>MindWell AI</h3>
        </div>
        <p>© 2026 MindWell AI. All rights reserved. Encrypted & Privacy-First Mental Health Platform.</p>
      </footer>
    </div>
  );
};
