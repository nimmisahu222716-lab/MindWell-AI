import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthPage.css';

export const AuthPage = () => {
  const { 
    theme, 
    toggleTheme, 
    login, 
    sendOtp, 
    verifyOtp, 
    forgotPassword, 
    verifyResetOtp, 
    resetPassword 
  } = useContext(AuthContext);

  // States: 'login' | 'signup' | 'otp_verify' | 'forgot_password' | 'otp_reset_verify' | 'reset_password'
  const [mode, setMode] = useState('login');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Helpers
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    resetMessages();
    
    const res = await login(email, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    setIsLoading(true);
    resetMessages();

    const res = await sendOtp(fullName, email, password);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg(res.message || 'OTP sent successfully! Check your email.');
      setMode('otp_verify');
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleOtpVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    resetMessages();

    const res = await verifyOtp(email, otp);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Account created successfully! You can now log in.');
      setMode('login');
      setPassword(''); // clear password for safety
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    resetMessages();

    const res = await forgotPassword(email);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Reset OTP sent successfully to your email.');
      setMode('otp_reset_verify');
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleOtpResetVerifySubmit = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    resetMessages();

    const res = await verifyResetOtp(email, otp);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('OTP verified! Enter your new password.');
      setMode('reset_password');
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setIsLoading(true);
    resetMessages();

    const res = await resetPassword(email, newPassword);
    setIsLoading(false);
    if (res.success) {
      setSuccessMsg('Password reset successful! Please log in.');
      setMode('login');
      setPassword('');
      setNewPassword('');
      setOtp('');
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Theme Toggle Button */}
      <button className="theme-toggle-btn animate-fade-in" onClick={toggleTheme} aria-label="Toggle Theme">
        {theme === 'light' ? (
          <i className="fa-solid fa-moon"></i>
        ) : (
          <i className="fa-solid fa-sun"></i>
        )}
      </button>

      <div className="auth-content-box animate-slide-up">
        {/* Left Side: Brand presentation */}
        <div className="auth-brand-panel">
          <div className="brand-header">
            <span className="brand-logo-icon-fa animate-pulse-glow">
              <i className="fa-solid fa-brain"></i>
            </span>
            <h1 className="brand-title">MindWell AI</h1>
          </div>
          <p className="brand-subtitle">
            A gentle, secure sanctuary for monitoring daily moods, receiving personalized AI insights, and understanding mental well-being over time.
          </p>
          <div className="brand-features-list">
            <div className="feature-item">
              <span className="feature-icon-fa">
                <i className="fa-solid fa-shield-halved"></i>
              </span>
              <div>
                <h4>Secure Hashing & JWT</h4>
                <p>Your mental health history is personal. We guard it with bank-grade encryption.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon-fa">
                <i className="fa-solid fa-chart-line"></i>
              </span>
              <div>
                <h4>Insightful Analytics</h4>
                <p>Track your stress distributions, mood levels, and trends across weeks.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon-fa">
                <i className="fa-solid fa-robot"></i>
              </span>
              <div>
                <h4>Mental Wellness Predictor</h4>
                <p>AI predictions mapped with personalized self-care recommendations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Forms */}
        <div className="auth-form-panel glass-card">
          {errorMsg && (
            <div className="alert-message error animate-fade-in">
              <i className="fa-solid fa-triangle-exclamation alert-icon-fa"></i>
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="alert-message success animate-fade-in">
              <i className="fa-solid fa-circle-check alert-icon-fa"></i>
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="animate-fade-in">
              <div className="form-header">
                <h2>Welcome Back</h2>
                <p>Step back into your calm space</p>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-envelope input-icon-left-fa"></i>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Password</label>
                  <button
                    type="button"
                    className="form-link-btn text-xs"
                    onClick={() => {
                      resetMessages();
                      setMode('forgot_password');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <i className="fa-solid fa-lock input-icon-left-fa"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye-slash"></i>
                    ) : (
                      <i className="fa-solid fa-eye"></i>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Entering Calm Space...' : 'Login'}
              </button>

              <div className="form-footer-switch">
                <span>New to MindWell AI?</span>
                <button
                  type="button"
                  className="form-link-btn font-semibold ml-1"
                  onClick={() => {
                    resetMessages();
                    setMode('signup');
                  }}
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="animate-fade-in">
              <div className="form-header">
                <h2>Start Your Journey</h2>
                <p>Register to verify email and secure your account</p>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-user input-icon-left-fa"></i>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-envelope input-icon-left-fa"></i>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password (Min 8 Characters)</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-lock input-icon-left-fa"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye-slash"></i>
                    ) : (
                      <i className="fa-solid fa-eye"></i>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Generating OTP...' : 'Send OTP'}
              </button>

              <div className="form-footer-switch">
                <span>Already registered?</span>
                <button
                  type="button"
                  className="form-link-btn font-semibold ml-1"
                  onClick={() => {
                    resetMessages();
                    setMode('login');
                  }}
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* OTP VERIFY FORM */}
          {mode === 'otp_verify' && (
            <form onSubmit={handleOtpVerifySubmit} className="animate-fade-in">
              <button
                type="button"
                className="back-arrow-btn"
                onClick={() => setMode('signup')}
              >
                <i className="fa-solid fa-arrow-left"></i> Back
              </button>

              <div className="form-header">
                <h2>Verify Email</h2>
                <p>We've sent a 6-digit OTP code to <strong>{email}</strong></p>
              </div>

              <div className="form-group">
                <label className="form-label">6-Digit Verification Code</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-key input-icon-left-fa"></i>
                  <input
                    type="text"
                    maxLength="6"
                    className="form-input text-center tracking-widest text-lg font-bold"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPasswordSubmit} className="animate-fade-in">
              <button
                type="button"
                className="back-arrow-btn"
                onClick={() => setMode('login')}
              >
                <i className="fa-solid fa-arrow-left"></i> Back
              </button>

              <div className="form-header">
                <h2>Forgot Password</h2>
                <p>Provide your registered email to receive a recovery code</p>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-envelope input-icon-left-fa"></i>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Sending recovery OTP...' : 'Send Recovery OTP'}
              </button>
            </form>
          )}

          {/* OTP RESET VERIFY FORM */}
          {mode === 'otp_reset_verify' && (
            <form onSubmit={handleOtpResetVerifySubmit} className="animate-fade-in">
              <button
                type="button"
                className="back-arrow-btn"
                onClick={() => setMode('forgot_password')}
              >
                <i className="fa-solid fa-arrow-left"></i> Back
              </button>

              <div className="form-header">
                <h2>Verify Reset OTP</h2>
                <p>We've sent a 6-digit recovery code to <strong>{email}</strong></p>
              </div>

              <div className="form-group">
                <label className="form-label">6-Digit Recovery Code</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-key input-icon-left-fa"></i>
                  <input
                    type="text"
                    maxLength="6"
                    className="form-input text-center tracking-widest text-lg font-bold"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Verifying code...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPasswordSubmit} className="animate-fade-in">
              <div className="form-header">
                <h2>Reset Password</h2>
                <p>Your OTP has been verified. Choose a strong new password</p>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-lock input-icon-left-fa"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye-slash"></i>
                    ) : (
                      <i className="fa-solid fa-eye"></i>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Updating password...' : 'Save New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
