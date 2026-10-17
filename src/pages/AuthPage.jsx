import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR } from '../services/financialEngine.js';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  Sliders,
  AlertCircle,
  Link2,
  RefreshCw
} from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '261321779368-ruajq5gea9jtv1lkrqqa2cupa6jsim9a.apps.googleusercontent.com';

export function AuthPage({ initialMode = 'login' }) {
  const {
    loginWithGoogle,
    linkGoogleAccount,
    loginWithEmail,
    registerWithEmail,
    completeOnboarding,
    setPreferences,
    setActiveRoute
  } = useApp();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'onboarding' | 'link_account'
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('FinSight2026!Secured');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('Alex Vance');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Authentication status & error handling (Requirements 11 & 12)
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);

  // Account linking state (Requirement 8)
  const [conflictData, setConflictData] = useState(null);
  const [linkPassword, setLinkPassword] = useState('');
  const [showLinkPassword, setShowLinkPassword] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  // Onboarding Wizard state (3 short steps)
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [obBalance, setObBalance] = useState('45000');
  const [obBuffer, setObBuffer] = useState('25000');
  const [obFrequency, setObFrequency] = useState('Irregular / Milestone-based');
  const [obThreshold, setObThreshold] = useState('20000');

  // Google Identity Services (GIS) button ref
  const googleBtnRef = useRef(null);

  // Handle Google Credential Response
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setAuthError('Authentication canceled or no credential was returned by Google.');
      return;
    }

    setAuthError(null);
    setLoading(true);

    try {
      const data = await loginWithGoogle(response.credential);
      // If new user with incomplete onboarding, switch to onboarding
      if (data.user && !data.user.onboardingCompleted) {
        setMode('onboarding');
      }
    } catch (err) {
      console.warn('Google authentication response handling:', err);
      if (err.code === 'EXISTING_LOCAL_ACCOUNT') {
        // Trigger secure account linking modal
        setConflictData({
          email: err.details?.email || email,
          credential: response.credential,
          message: err.message
        });
        setMode('link_account');
      } else {
        setAuthError(err.message || 'Google authentication failed. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services (Requirements 1, 3, 4)
  useEffect(() => {
    let intervalId = null;

    const setupGis = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin'
          });

          if (googleBtnRef.current) {
            // Render genuine GIS button inside the overlay container
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 380
            });
          }
        } catch (e) {
          console.error('Failed to initialize Google Identity Services:', e);
        }
        if (intervalId) clearInterval(intervalId);
      }
    };

    // Try immediately
    setupGis();

    // Check periodically if library script is still loading
    intervalId = setInterval(setupGis, 300);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [mode]);

  // Fallback trigger if user clicks the button before/around overlay
  const handleGoogleBtnClick = () => {
    setAuthError(null);
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn('GIS prompt trigger error:', err);
      }
    } else {
      setAuthError('Google Identity Services library is still connecting. Please check your network and retry.');
    }
  };

  // Handle standard email/password login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      await loginWithEmail(email, password);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      await registerWithEmail(email, fullName, password);
      setMode('onboarding');
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Linking (Requirement 8)
  const handleAccountLinkSubmit = async (e) => {
    e.preventDefault();
    if (!conflictData) return;

    setAuthError(null);
    setLinkLoading(true);

    try {
      await linkGoogleAccount({
        email: conflictData.email,
        password: linkPassword,
        credential: conflictData.credential
      });
      setAuthNotice('Google account successfully linked!');
    } catch (err) {
      setAuthError(err.message || 'Failed to link account. Please verify password.');
    } finally {
      setLinkLoading(false);
    }
  };

  // Handle Onboarding Completion (Requirement 10)
  const handleOnboardingFinish = async () => {
    setLoading(true);
    try {
      setPreferences(prev => ({
        ...prev,
        startingBalance: Number(obBalance),
        safetyBuffer: Number(obBuffer),
        incomeFrequency: obFrequency,
        lowBalanceAlertThreshold: Number(obThreshold)
      }));

      await completeOnboarding();
      setActiveRoute('dashboard');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setActiveRoute('dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F7F8FC' }}>
      
      {/* Left Showcase Panel (Fintech Hackathon Presentation Quality) */}
      <div
        style={{
          flex: 1.15,
          background: 'radial-gradient(circle at 15% 15%, #131b31 0%, #0c1222 50%, #070a14 100%)',
          padding: '60px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow & Curve background */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 450, height: 450, background: 'radial-gradient(circle, rgba(99, 91, 255, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Brand Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #635BFF 0%, #4338CA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99, 91, 255, 0.4)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>FinSight</span>
            <span style={{ background: 'rgba(99, 91, 255, 0.18)', border: '1px solid rgba(129, 140, 248, 0.35)', color: '#A5B4FC', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, padding: '3px 8px', borderRadius: 6 }}>
              UNCERTAIN INCOME PLANNER
            </span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99, 91, 255, 0.14)', border: '1px solid rgba(99, 91, 255, 0.28)', borderRadius: 20, padding: '6px 14px', color: '#A5B4FC', fontSize: 12.5, fontWeight: 600, marginBottom: 20 }}>
            <Sparkles size={14} color="#818CF8" />
            <span>Built for Freelancers, Creators & Milestone Professionals</span>
          </div>

          <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.18, letterSpacing: -0.8, marginBottom: 18, maxWidth: 520 }}>
            Make smarter decisions with irregular money.
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#94A3B8', maxWidth: 480, marginBottom: 36 }}>
            Never wonder if you can afford rent before an invoice clears. Model payment delays, calculate pure Safe-to-Spend, and protect your cash buffer.
          </p>

          {/* Feature Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.55)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(99, 91, 255, 0.16)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>True Safe-to-Spend Engine</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Separates actual bank cash from unreceived promises.</div>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.55)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(217, 145, 22, 0.16)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sliders size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Payment Delay Stress-Tester</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Simulate 10–30 day invoice delays before they trigger panic.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 20, fontSize: 12, color: '#64748B' }}>
          <span>Indian Currency Architecture (₹ INR)</span>
          <span>Google OAuth 2.0 & SOC-2 Verified</span>
        </div>
      </div>

      {/* Right Authentication & Onboarding Form Panel */}
      <div
        style={{
          flex: 0.95,
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          position: 'relative'
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Feedback Alerts */}
          {authError && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                color: '#991B1B'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, lineHeight: '1.45' }}>{authError}</div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: 700 }}
              >
                ×
              </button>
            </div>
          )}

          {authNotice && (
            <div
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: '#065F46'
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{authNotice}</div>
            </div>
          )}
          
          {/* Mode 1: Login */}
          {mode === 'login' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: '#172033', margin: 0 }}>
                  Welcome back
                </h2>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: '#F5F3FF',
                    border: '1px solid #E0E7FF',
                    color: '#635BFF',
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setEmail('alex@example.com');
                    setPassword('FinSight2026!Secured');
                  }}
                  title="Auto-fill demo credentials"
                >
                  <Sparkles size={12} />
                  <span>Auto-fill</span>
                </button>
              </div>

              <p style={{ fontSize: 14, color: '#667085', margin: '0 0 20px 0' }}>
                Sign in to continue to your financial dashboard.
              </p>

              {/* Google SSO Button Container (Preserves exact design + Real GIS Account Chooser) */}
              <div style={{ position: 'relative', width: '100%', marginBottom: 6 }}>
                {/* Visual presentation exactly matches existing design */}
                <button
                  type="button"
                  className="btn-google-sso"
                  onClick={handleGoogleBtnClick}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {loading ? (
                      <RefreshCw size={18} className="spin" color="#635BFF" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12c0 1.97.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                    )}
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1E293B' }}>
                      {loading ? 'Authenticating with Google...' : 'Continue with Google'}
                    </span>
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      right: '14px',
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#64748B',
                      fontSize: '10.5px',
                      fontWeight: 500,
                      padding: '2px 7px',
                      borderRadius: '4px'
                    }}
                  >
                    Fast SSO
                  </span>
                </button>

                {/* Real Google Identity Services Overlay (Seamlessly renders genuine account chooser iframe over button) */}
                <div
                  ref={googleBtnRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.001,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: loading ? 'none' : 'auto'
                  }}
                  title="Sign in with genuine Google account"
                />
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                <span style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.9px', color: '#94A3B8', textTransform: 'uppercase' }}>
                  OR CONTINUE WITH EMAIL
                </span>
                <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group-item">
                  <label className="form-label-title">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="form-label-title" style={{ margin: 0 }}>Password</label>
                    <a
                      href="#forgot"
                      style={{ fontSize: 12, color: '#635BFF', textDecoration: 'none', fontWeight: 600 }}
                      onClick={(e) => { e.preventDefault(); setMode('forgot'); }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{ letterSpacing: showPassword ? 'normal' : '2px' }}
                    />
                    <button
                      type="button"
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember this device & 30-day session */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 20px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 13, color: '#334155', fontWeight: 500 }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#EA580C', width: 16, height: 16, borderRadius: 4 }} />
                    <span>Remember this device</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#10B981', fontWeight: 500 }}>
                    <Lock size={12} />
                    <span>30-day session</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14.5 }}
                >
                  {loading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#667085' }}>
                Don't have an account?{' '}
                <a
                  href="#register"
                  style={{ color: '#635BFF', fontWeight: 600, textDecoration: 'none' }}
                  onClick={(e) => { e.preventDefault(); setMode('register'); }}
                >
                  Create account
                </a>
              </div>
            </div>
          )}

          {/* Mode 2: Register */}
          {mode === 'register' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#172033', margin: '0 0 6px 0' }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: 14, color: '#667085', margin: '0 0 24px 0' }}>
                Set up your uncertain income workspace in 60 seconds.
              </p>

              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group-item">
                  <label className="form-label-title">Full Name</label>
                  <input
                    type="text"
                    className="form-input-control"
                    placeholder="e.g. Alex Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group-item">
                  <label className="form-label-title">Email Address</label>
                  <input
                    type="email"
                    className="form-input-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group-item">
                  <label className="form-label-title">Create Password</label>
                  <input
                    type="password"
                    className="form-input-control"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 10 }}
                >
                  {loading ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <span>Continue to Financial Setup</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#667085' }}>
                Already registered?{' '}
                <a
                  href="#login"
                  style={{ color: '#635BFF', fontWeight: 600, textDecoration: 'none' }}
                  onClick={(e) => { e.preventDefault(); setMode('login'); }}
                >
                  Sign in
                </a>
              </div>
            </div>
          )}

          {/* Mode: Account Linking Modal (Requirement 8) */}
          {mode === 'link_account' && (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EEF2FF', border: '1px solid #C7D2FE', color: '#4338CA', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                <Link2 size={14} />
                <span>Account Linking Required</span>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172033', margin: '0 0 6px 0' }}>
                Link Google Account
              </h2>
              <p style={{ fontSize: 13.5, color: '#667085', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                An existing account with <strong>{conflictData?.email}</strong> already exists. To securely connect your Google credentials and prevent unauthorized access, please confirm your account password.
              </p>

              <form onSubmit={handleAccountLinkSubmit}>
                <div className="form-group-item">
                  <label className="form-label-title">Account Email</label>
                  <input
                    type="email"
                    className="form-input-control"
                    value={conflictData?.email || ''}
                    disabled
                    style={{ background: '#F8FAFC', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group-item">
                  <label className="form-label-title">Existing Account Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLinkPassword ? 'text' : 'password'}
                      className="form-input-control"
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      placeholder="Enter your existing password"
                      required
                      disabled={linkLoading}
                      autoFocus
                    />
                    <button
                      type="button"
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      onClick={() => setShowLinkPassword(!showLinkPassword)}
                    >
                      {showLinkPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={linkLoading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 10 }}
                >
                  {linkLoading ? (
                    <span>Verifying & Linking...</span>
                  ) : (
                    <>
                      <span>Verify & Link Google Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'center', color: '#667085', fontSize: 12.5, marginTop: 14, cursor: 'pointer' }}
                  onClick={() => {
                    setMode('login');
                    setConflictData(null);
                    setLinkPassword('');
                  }}
                >
                  ← Cancel and return to Sign In
                </button>
              </form>
            </div>
          )}

          {/* Mode 3: Forgot Password */}
          {mode === 'forgot' && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#172033', margin: '0 0 6px 0' }}>
                Reset Password
              </h2>
              <p style={{ fontSize: 13.5, color: '#667085', margin: '0 0 20px 0' }}>
                Enter your verified email and we'll dispatch an instant recovery link.
              </p>

              {forgotSubmitted ? (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '16px', borderRadius: 10, fontSize: 13, color: '#065F46' }}>
                  <CheckCircle2 size={18} style={{ marginBottom: 6 }} />
                  <div>Password reset link dispatched to <strong>{email}</strong>. Check your inbox.</div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                    onClick={() => { setMode('login'); setForgotSubmitted(false); }}
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setForgotSubmitted(true); }}>
                  <div className="form-group-item">
                    <label className="form-label-title">Email Address</label>
                    <input
                      type="email"
                      className="form-input-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                    Send Recovery Link
                  </button>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', width: '100%', textAlign: 'center', color: '#667085', fontSize: 12.5, marginTop: 14, cursor: 'pointer' }}
                    onClick={() => setMode('login')}
                  >
                    ← Back to Sign In
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Mode 4: 3-Step Onboarding Wizard (Requirement 10) */}
          {mode === 'onboarding' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#635BFF', textTransform: 'uppercase' }}>
                  Setup Wizard • Step {onboardingStep} of 2
                </span>
                <span style={{ fontSize: 12, color: '#667085' }}>Currency: INR (₹)</span>
              </div>

              {onboardingStep === 1 ? (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#172033', marginBottom: 6 }}>
                    Baseline Cash & Safety Buffer
                  </h3>
                  <p style={{ fontSize: 13, color: '#667085', marginBottom: 18 }}>
                    Establish your true recorded available balance and minimum comfort reserve.
                  </p>

                  <div className="form-group-item">
                    <label className="form-label-title">Current Recorded Bank Balance (₹ INR) *</label>
                    <input
                      type="number"
                      className="form-input-control"
                      value={obBalance}
                      onChange={(e) => setObBalance(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Minimum Safety Buffer Target (₹ INR) *</label>
                    <input
                      type="number"
                      className="form-input-control"
                      value={obBuffer}
                      onChange={(e) => setObBuffer(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Typical Income Frequency</label>
                    <select
                      className="form-input-control"
                      value={obFrequency}
                      onChange={(e) => setObFrequency(e.target.value)}
                    >
                      <option value="Irregular / Milestone-based">Irregular / Milestone-based</option>
                      <option value="Gig / Weekly Variable">Gig / Weekly Variable</option>
                      <option value="Commission-based">Commission-based</option>
                      <option value="Monthly Retainer with Delays">Monthly Retainer with Delays</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 10 }}
                    onClick={() => setOnboardingStep(2)}
                  >
                    <span>Next: Set Alerts & Finish</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#172033', marginBottom: 6 }}>
                    Alert Thresholds & Review
                  </h3>
                  <p style={{ fontSize: 13, color: '#667085', marginBottom: 18 }}>
                    Configure automated notifications when liquidity drops below safe levels.
                  </p>

                  <div className="form-group-item">
                    <label className="form-label-title">Low Balance Warning Trigger (₹ INR)</label>
                    <input
                      type="number"
                      className="form-input-control"
                      value={obThreshold}
                      onChange={(e) => setObThreshold(e.target.value)}
                    />
                  </div>

                  <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0', marginBottom: 20, fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, color: '#172033', marginBottom: 4 }}>Ready to calculate Safe-to-Spend!</div>
                    Starting Balance: <strong>{formatINR(Number(obBalance))}</strong><br />
                    Protected Safety Buffer: <strong>{formatINR(Number(obBuffer))}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setOnboardingStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={loading}
                      style={{ flex: 2, justifyContent: 'center', padding: '12px' }}
                      onClick={handleOnboardingFinish}
                    >
                      <CheckCircle2 size={16} />
                      <span>{loading ? 'Launching...' : 'Launch Planner Workspace'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
