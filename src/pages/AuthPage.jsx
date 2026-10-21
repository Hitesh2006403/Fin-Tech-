import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR } from '../services/financialEngine.js';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Sliders,
  AlertCircle,
  Link2,
  RefreshCw,
  Check,
  User,
  ShieldAlert
} from 'lucide-react';
import { Background3D } from '../components/common/Background3D.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '261321779368-ruajq5gea9jtv1lkrqqa2cupa6jsim9a.apps.googleusercontent.com';

export function AuthPage({ initialMode = 'login', onOpenAdmin }) {
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
  const [confirmPassword, setConfirmPassword] = useState('FinSight2026!Secured');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
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
            context: 'signin',
            itp_support: true
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            // Dynamically calculate appropriate button width for mobile/desktop
            const containerWidth = googleBtnRef.current.offsetWidth || (typeof window !== 'undefined' && window.innerWidth < 420 ? window.innerWidth - 48 : 380);
            const btnWidth = Math.min(400, Math.max(220, containerWidth));

            // Render genuine GIS button inside the overlay container
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: btnWidth
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
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.warn('GIS One Tap prompt not displayed:', notification.getNotDisplayedReason());
          } else if (notification.isSkippedMoment()) {
            console.warn('GIS One Tap prompt skipped:', notification.getSkippedReason());
          } else if (notification.isDismissedMoment()) {
            console.warn('GIS One Tap prompt dismissed:', notification.getDismissedReason());
          }
        });
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

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: '#94A3B8' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#F59E0B' };
    if (score === 3) return { score: 3, label: 'Good', color: '#3B82F6' };
    return { score: 4, label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = Boolean(password && confirmPassword && password === confirmPassword);
  const passwordMismatch = Boolean(confirmPassword && password !== confirmPassword);

  // Handle email/password registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!fullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    if (!agreeTerms) {
      setAuthError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

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
    <div className="auth-page-root">
      {/* Background 3D Animated Scene */}
      <Background3D />
      
      {/* Left Showcase Panel */}
      <div className="auth-showcase-panel">
        {/* Glow & Curve background */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 450, height: 450, background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Brand Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 50%, #A78BFA 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(56, 189, 248, 0.45)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B1220" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, color: '#F8FAFC' }}>FinSight</span>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, padding: '3px 8px', borderRadius: 6, boxShadow: '0 0 10px rgba(56, 189, 248, 0.15)' }}>
              UNCERTAIN INCOME PLANNER
            </span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 20, padding: '6px 14px', color: '#38BDF8', fontSize: 12.5, fontWeight: 600, marginBottom: 20 }}>
            <Sparkles size={14} color="#38BDF8" />
            <span>Built for Freelancers, Creators & Milestone Professionals</span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.16, letterSpacing: -0.8, marginBottom: 18, maxWidth: 520, color: '#F8FAFC' }}>
            Make smarter decisions with irregular money.
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#94A3B8', maxWidth: 480, marginBottom: 36 }}>
            Never wonder if you can afford rent before an invoice clears. Model payment delays, calculate pure Safe-to-Spend, and protect your cash buffer.
          </p>

          {/* Feature Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 480 }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(56, 189, 248, 0.14)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(56, 189, 248, 0.25)', boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#F8FAFC' }}>True Safe-to-Spend Engine</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Separates actual bank cash from unreceived promises.</div>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderTop: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(16px)', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245, 158, 11, 0.14)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(245, 158, 11, 0.25)', boxShadow: '0 0 12px rgba(245, 158, 11, 0.15)' }}>
                <Sliders size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#F8FAFC' }}>Payment Delay Stress-Tester</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>Simulate 10–30 day invoice delays before they trigger panic.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 20, fontSize: 12, color: '#94A3B8' }}>
          <span>Indian Currency Architecture (₹ INR)</span>
          <span>Google OAuth 2.0 & SOC-2 Verified</span>
        </div>
      </div>

      {/* Right Authentication & Onboarding Form Panel */}
      <div className="auth-form-panel">
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile-Only Brand Header */}
          <div className="auth-mobile-brand-header">
            <div className="auth-mobile-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B1220" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.4, color: '#F8FAFC' }}>FinSight</span>
                <span style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                  PLANNER
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Uncertain Income Treasury</div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '13px',
                color: '#FCA5A5',
                backdropFilter: 'blur(8px)'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, lineHeight: '1.45' }}>{authError}</div>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', fontWeight: 700 }}
              >
                ×
              </button>
            </div>
          )}

          {authNotice && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: '#6EE7B7',
                backdropFilter: 'blur(8px)'
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{authNotice}</div>
            </div>
          )}
          
          {/* Top Portal Switcher: User Portal vs Admin Portal */}
          {onOpenAdmin && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              background: 'rgba(11, 18, 32, 0.85)',
              padding: 5,
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: 24,
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              <button
                type="button"
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(37, 99, 235, 0.22) 100%)',
                  color: '#F8FAFC',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 0 16px rgba(56, 189, 248, 0.25)'
                }}
              >
                <User size={15} color="#38BDF8" />
                <span>User Portal</span>
              </button>

              <button
                type="button"
                onClick={onOpenAdmin}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  color: '#94A3B8',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#F8FAFC';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94A3B8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ShieldAlert size={15} />
                <span>Admin Portal</span>
              </button>
            </div>
          )}

          {/* Mode 1: Login */}
          {mode === 'login' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: -0.3 }}>
                  Welcome back
                </h2>
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    background: 'rgba(56, 189, 248, 0.12)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38BDF8',
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(56, 189, 248, 0.15)',
                    transition: 'all 0.15s ease'
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

              <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 20px 0' }}>
                Sign in to continue to your financial dashboard.
              </p>

              {/* Google SSO Button Container (Preserves exact design + Real GIS Account Chooser) */}
              <div style={{ position: 'relative', width: '100%', marginBottom: 6 }}>
                {/* Visual presentation matching 3D dark glass theme */}
                <button
                  type="button"
                  className="btn-google-sso"
                  onClick={handleGoogleBtnClick}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.22)',
                    borderRadius: '10px',
                    padding: '11px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 18px rgba(0, 0, 0, 0.35)',
                    opacity: loading ? 0.7 : 1,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {loading ? (
                      <RefreshCw size={18} className="spin" color="#38BDF8" />
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
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#F8FAFC' }}>
                      {loading ? 'Authenticating with Google...' : 'Continue with Google'}
                    </span>
                  </div>
                </button>

                {/* Real Google Identity Services Overlay (Seamlessly renders genuine account chooser iframe over button) */}
                <div
                  ref={googleBtnRef}
                  className="gis-button-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
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
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#94A3B8', textTransform: 'uppercase' }}>
                  OR CONTINUE WITH EMAIL
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group-item">
                  <label className="form-label-title" style={{ color: '#F8FAFC' }}>Email Address</label>
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
                    <label className="form-label-title" style={{ margin: 0, color: '#F8FAFC' }}>Password</label>
                    <a
                      href="#forgot"
                      style={{ fontSize: 12, color: '#38BDF8', textDecoration: 'none', fontWeight: 600 }}
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

                {/* Remember this device */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 20px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#38BDF8', width: 16, height: 16, borderRadius: 4 }} />
                    <span>Remember this device</span>
                  </label>
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

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>
                Don't have an account?{' '}
                <a
                  href="#register"
                  style={{ color: '#38BDF8', fontWeight: 600, textDecoration: 'none' }}
                  onClick={(e) => { e.preventDefault(); setMode('register'); }}
                >
                  Create account
                </a>
              </div>

              {onOpenAdmin && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1.2,
                    color: '#64748B',
                    marginBottom: 10,
                    textAlign: 'center'
                  }}>
                    Administrative Gateway
                  </div>

                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(37, 99, 235, 0.22) 100%)',
                      border: '1.5px solid rgba(56, 189, 248, 0.45)',
                      borderRadius: 14,
                      color: '#F8FAFC',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 24px rgba(56, 189, 248, 0.2)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.26) 0%, rgba(37, 99, 235, 0.32) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.75)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 32px rgba(56, 189, 248, 0.35)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.16) 0%, rgba(37, 99, 235, 0.22) 100%)';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 24px rgba(56, 189, 248, 0.2)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(37, 99, 235, 0.25) 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 14px rgba(56, 189, 248, 0.35)',
                        flexShrink: 0
                      }}>
                        <ShieldAlert size={20} color="#38BDF8" />
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F8FAFC', letterSpacing: -0.2 }}>
                          Admin Portal
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>
                          Restricted Platform Console & Controls
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'rgba(56, 189, 248, 0.12)',
                      padding: '5px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(56, 189, 248, 0.3)'
                    }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#38BDF8' }}>Access</span>
                      <ArrowRight size={14} color="#38BDF8" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Register */}
          {mode === 'register' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 22px 0' }}>
                Set up your uncertain income workspace in 60 seconds.
              </p>

              <form onSubmit={handleRegisterSubmit}>
                {/* 1. Personal Information Section */}
                <div style={{ marginBottom: 16 }}>
                  <div className="form-group-item">
                    <label className="form-label-title" style={{ color: '#F8FAFC' }}>Full Name</label>
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
                    <label className="form-label-title" style={{ color: '#F8FAFC' }}>Email Address</label>
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
                </div>

                {/* 2. Security & Credentials Section */}
                <div style={{ marginBottom: 12 }}>
                  <div className="form-group-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label-title" style={{ margin: 0, color: '#F8FAFC' }}>Create Password</label>
                      {password && (
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input-control"
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{ letterSpacing: showPassword ? 'normal' : '1.5px', paddingRight: 40 }}
                      />
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: 4
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Interactive Password Strength Indicator */}
                    {password && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            style={{
                              flex: 1,
                              height: 3,
                              borderRadius: 2,
                              background: passwordStrength.score >= step ? passwordStrength.color : 'rgba(255, 255, 255, 0.1)',
                              transition: 'background 0.2s ease'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="form-group-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label-title" style={{ margin: 0, color: '#F8FAFC' }}>Confirm Password</label>
                      {confirmPassword && (
                        <span style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: passwordsMatch ? '#10B981' : '#EF4444',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          {passwordsMatch ? (
                            <>
                              <Check size={12} strokeWidth={3} />
                              <span>Passwords match</span>
                            </>
                          ) : (
                            <span>Passwords do not match</span>
                          )}
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-input-control"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                          letterSpacing: showConfirmPassword ? 'normal' : '1.5px',
                          paddingRight: 40,
                          borderColor: passwordMismatch ? 'rgba(239, 68, 68, 0.5)' : (passwordsMatch ? 'rgba(16, 185, 129, 0.5)' : undefined)
                        }}
                      />
                      <button
                        type="button"
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: 4
                        }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions Agreement */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 18px 0', fontSize: 12.5, color: '#94A3B8' }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ accentColor: '#38BDF8', width: 16, height: 16, borderRadius: 4, cursor: 'pointer' }}
                    id="agreeTerms"
                  />
                  <label htmlFor="agreeTerms" style={{ cursor: 'pointer', userSelect: 'none' }}>
                    I agree to the <span style={{ color: '#38BDF8', fontWeight: 600 }}>Terms of Service</span> & <span style={{ color: '#38BDF8', fontWeight: 600 }}>Privacy Policy</span>
                  </label>
                </div>

                {/* 5. Primary Submit Button */}
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12.5px',
                    fontSize: 14.5
                  }}
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

              {/* 6. Footer Navigation Links */}
              <div style={{ marginTop: 22, textAlign: 'center', fontSize: 13, color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  Already registered?{' '}
                  <a
                    href="#login"
                    style={{ color: '#38BDF8', fontWeight: 600, textDecoration: 'none' }}
                    onClick={(e) => { e.preventDefault(); setAuthError(null); setMode('login'); }}
                  >
                    Sign in
                  </a>
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  Trouble logging in?{' '}
                  <a
                    href="#forgot"
                    style={{ color: '#38BDF8', fontWeight: 500, textDecoration: 'none' }}
                    onClick={(e) => { e.preventDefault(); setAuthError(null); setMode('forgot'); }}
                  >
                    Forgot password
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Mode: Account Linking Modal (Requirement 8) */}
          {mode === 'link_account' && (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38BDF8', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                <Link2 size={14} />
                <span>Account Linking Required</span>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                Link Google Account
              </h2>
              <p style={{ fontSize: 13.5, color: '#94A3B8', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                An existing account with <strong>{conflictData?.email}</strong> already exists. To securely connect your Google credentials and prevent unauthorized access, please confirm your account password.
              </p>

              <form onSubmit={handleAccountLinkSubmit}>
                <div className="form-group-item">
                  <label className="form-label-title" style={{ color: '#F8FAFC' }}>Account Email</label>
                  <input
                    type="email"
                    className="form-input-control"
                    value={conflictData?.email || ''}
                    disabled
                    style={{ background: 'rgba(15, 23, 42, 0.5)', cursor: 'not-allowed', color: '#94A3B8' }}
                  />
                </div>

                <div className="form-group-item">
                  <label className="form-label-title" style={{ color: '#F8FAFC' }}>Existing Account Password</label>
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
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'center', color: '#94A3B8', fontSize: 12.5, marginTop: 14, cursor: 'pointer' }}
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
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                Reset Password
              </h2>
              <p style={{ fontSize: 14, color: '#94A3B8', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                Enter your account email and we'll send you an instant link to recover your access.
              </p>

              {forgotSubmitted ? (
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '24px 20px', borderRadius: 12, textAlign: 'center', backdropFilter: 'blur(12px)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC', margin: '0 0 6px 0' }}>
                    Recovery Link Dispatched
                  </h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                  </p>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 13.5 }}
                    onClick={() => { setMode('login'); setForgotSubmitted(false); }}
                  >
                    <span>Return to Sign In</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setForgotSubmitted(true); }}>
                  <div className="form-group-item">
                    <label className="form-label-title" style={{ color: '#F8FAFC' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-input-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '12px',
                      fontSize: 14.5,
                      marginTop: 6
                    }}
                  >
                    <span>Send Recovery Link</span>
                    <ArrowRight size={16} />
                  </button>

                  {/* Professional Bottom Navigation */}
                  <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <button
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: 'rgba(15, 23, 42, 0.65)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#F8FAFC',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '7px 14px',
                          borderRadius: 6,
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => { setAuthError(null); setMode('login'); }}
                      >
                        <ArrowLeft size={14} />
                        <span>Return to Sign In</span>
                      </button>
                    </div>

                    <div style={{ fontSize: 12.5, color: '#94A3B8' }}>
                      Don't have an account yet?{' '}
                      <a
                        href="#register"
                        style={{ color: '#38BDF8', fontWeight: 600, textDecoration: 'none' }}
                        onClick={(e) => { e.preventDefault(); setAuthError(null); setMode('register'); }}
                      >
                        Create an account
                      </a>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Mode 4: 3-Step Onboarding Wizard (Requirement 10) */}
          {mode === 'onboarding' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', background: 'rgba(56, 189, 248, 0.12)', padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  Setup Wizard • Step {onboardingStep} of 2
                </span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Currency: INR (₹)</span>
              </div>

              {onboardingStep === 1 ? (
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
                    Baseline Cash & Safety Buffer
                  </h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 18 }}>
                    Establish your true recorded available balance and minimum comfort reserve.
                  </p>

                  <div className="form-group-item">
                    <label className="form-label-title" style={{ color: '#F8FAFC' }}>Current Recorded Bank Balance (₹ INR) *</label>
                    <input
                      type="number"
                      className="form-input-control"
                      value={obBalance}
                      onChange={(e) => setObBalance(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title" style={{ color: '#F8FAFC' }}>Minimum Safety Buffer Target (₹ INR) *</label>
                    <input
                      type="number"
                      className="form-input-control"
                      value={obBuffer}
                      onChange={(e) => setObBuffer(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title" style={{ color: '#F8FAFC' }}>Typical Income Frequency</label>
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
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
                    Alert Thresholds & Review
                  </h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 18 }}>
                    Configure automated notifications when liquidity drops below safe levels.
                  </p>

                  <div className="form-group-item">
                    <label className="form-label-title" style={{ color: '#F8FAFC' }}>Low Balance Warning Trigger (₹ INR)</label>
                    <input
                      type="number"
                      className="form-input-control"
                      value={obThreshold}
                      onChange={(e) => setObThreshold(e.target.value)}
                    />
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: 16, borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 20, fontSize: 12.5, color: '#94A3B8', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>Ready to calculate Safe-to-Spend!</div>
                    Starting Balance: <strong style={{ color: '#F8FAFC' }}>{formatINR(Number(obBalance))}</strong><br />
                    Protected Safety Buffer: <strong style={{ color: '#38BDF8' }}>{formatINR(Number(obBuffer))}</strong>
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
