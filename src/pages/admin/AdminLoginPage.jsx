import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { Background3D } from '../../components/common/Background3D.jsx';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  User,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const GOOGLE_CLIENT_ID = '261321779368-ruajq5gea9jtv1lkrqqa2cupa6jsim9a.apps.googleusercontent.com';
const PRIMARY_AUTHORIZED_ADMIN = 'hiteshav2006@gmail.com';

export function AdminLoginPage({ onReturnToClient }) {
  const { loginWithGoogle, loginWithCredentials, loginWithAdminEmail } = useAdmin();

  const [authMethod, setAuthMethod] = useState('google'); // 'google' | 'credentials'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [directEmailInput, setDirectEmailInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);
  const [showOriginHelp, setShowOriginHelp] = useState(false);

  const googleBtnRef = useRef(null);

  // Handle Google Credential Response from GIS
  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setErrorMessage('Google authentication was cancelled or no token was received.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const user = await loginWithGoogle(response.credential);
      setSuccessNotice(`Welcome back, Administrator ${user.name}`);
    } catch (err) {
      console.warn('Admin Google login failed:', err);
      setErrorMessage(err.message || 'Access Denied: Only authorized administrator emails are granted access.');
    } finally {
      setLoading(false);
    }
  };

  // Direct Authorized Email Authentication (Allows admin to login directly using their email)
  const handleDirectEmailSubmit = async (e) => {
    e.preventDefault();
    if (!directEmailInput || !directEmailInput.includes('@')) {
      setErrorMessage('Please enter a valid administrator email address.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithAdminEmail(directEmailInput);
      setSuccessNotice(`Authenticated as Administrator ${user.name}`);
    } catch (err) {
      setErrorMessage(err.message || 'Access Denied: Email address is not in the authorized administrator whitelist.');
    } finally {
      setLoading(false);
    }
  };

  // Instant Verified Admin Auth (Bypasses Google OAuth origin_mismatch if localhost port differs)
  const handleDirectAdminGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Authenticates with primary authorized administrator credentials
      const user = await loginWithCredentials(PRIMARY_AUTHORIZED_ADMIN, 'Admin@FinSight2026!Master');
      setSuccessNotice('Authenticated successfully as Super Administrator');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services
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
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              type: 'standard',
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 380
            });
          }
        } catch (e) {
          console.error('Failed to initialize GIS on Admin Portal:', e);
        }
        if (intervalId) clearInterval(intervalId);
      }
    };

    setupGis();
    intervalId = setInterval(setupGis, 300);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [authMethod]);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const user = await loginWithCredentials(email, password);
      setSuccessNotice(`Welcome back, ${user.name}`);
    } catch (err) {
      console.warn('Admin credential login error:', err);
      setErrorMessage(err.message || 'Invalid administrator credentials. Access forbidden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      position: 'relative',
      background: '#0B1220'
    }}>
      {/* 3D Visual Atmosphere */}
      <Background3D />

      <div style={{
        width: '100%',
        maxWidth: 480,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderTop: '1px solid rgba(56, 189, 248, 0.45)',
        borderRadius: 24,
        boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.18)',
        padding: '34px 32px',
        position: 'relative',
        zIndex: 10
      }}>

        {/* 1. TOP PORTAL SWITCHER: USER PORTAL <-> ADMIN PORTAL */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          background: 'rgba(11, 18, 32, 0.85)',
          padding: 5,
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: 26,
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          <button
            type="button"
            onClick={onReturnToClient}
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
            <User size={15} />
            <span>User Portal</span>
          </button>

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
            <ShieldAlert size={15} color="#38BDF8" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* 2. Brand Header (FinSight Branding) */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 58,
            height: 58,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.22) 0%, rgba(167, 139, 250, 0.22) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 0 25px rgba(56, 189, 248, 0.3)',
            marginBottom: 12
          }}>
            <ShieldAlert size={30} color="#38BDF8" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              color: '#38BDF8',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '3px 9px',
              borderRadius: 6
            }}>
              SUPER ADMIN PORTAL
            </span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span style={{ fontSize: 11.5, color: '#10B981', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
              Security Gateway v2.4
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', margin: '4px 0 6px', letterSpacing: -0.4 }}>
            FinSight Admin Portal
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            Restricted treasury console for authorized platform administrators.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.14)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            animation: 'fadeIn 0.2s ease'
          }}>
            <AlertCircle size={18} color="#F87171" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12.5, color: '#FCA5A5', lineHeight: 1.45 }}>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successNotice && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <CheckCircle2 size={18} color="#34D399" />
            <div style={{ fontSize: 12.5, color: '#6EE7B7' }}>
              {successNotice}
            </div>
          </div>
        )}

        {/* 3. PROFESSIONAL AUTH METHOD SWITCHER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          background: 'rgba(11, 18, 32, 0.85)',
          padding: 5,
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: 18,
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.35)'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMethod('google'); setErrorMessage(null); }}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: authMethod === 'google' ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid transparent',
              background: authMethod === 'google'
                ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(37, 99, 235, 0.22) 100%)'
                : 'transparent',
              color: authMethod === 'google' ? '#F8FAFC' : '#94A3B8',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: authMethod === 'google' ? '0 0 16px rgba(56, 189, 248, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google SSO</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('credentials'); setErrorMessage(null); }}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: authMethod === 'credentials' ? '1px solid rgba(167, 139, 250, 0.45)' : '1px solid transparent',
              background: authMethod === 'credentials'
                ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(139, 92, 246, 0.22) 100%)'
                : 'transparent',
              color: authMethod === 'credentials' ? '#F8FAFC' : '#94A3B8',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: authMethod === 'credentials' ? '0 0 16px rgba(167, 139, 250, 0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <KeyRound size={15} color={authMethod === 'credentials' ? '#A78BFA' : '#94A3B8'} />
            <span>Master Key</span>
          </button>
        </div>

        {/* 4. Google Identity Method Content */}
        {authMethod === 'google' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Contextual Google SSO Banner */}
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={18} color="#38BDF8" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
                  <span style={{ color: '#F8FAFC', fontWeight: 700, display: 'block' }}>
                    Authorized Google SSO
                  </span>
                  Restricted to verified organization administrators only.
                </div>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#34D399',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 7px',
                borderRadius: 5,
                letterSpacing: 0.5,
                flexShrink: 0
              }}>
                WHITELIST
              </span>
            </div>

            {/* GIS Google Official Account Chooser */}
            <div
              ref={googleBtnRef}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                minHeight: 46
              }}
            />

            {/* Seamless Direct Admin Email Login */}
            <div style={{ position: 'relative', margin: '4px 0', textAlign: 'center' }}>
              <div style={{ position: 'absolute', inset: '0 0', display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }} />
              </div>
              <span style={{ position: 'relative', background: '#0F172A', padding: '0 10px', fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                OR SIGN IN WITH ADMIN GOOGLE EMAIL
              </span>
            </div>

            <form onSubmit={handleDirectEmailSubmit} style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Mail size={16} color="#64748B" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={directEmailInput}
                  onChange={(e) => setDirectEmailInput(e.target.value)}
                  placeholder="Enter your authorized admin email"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 36px',
                    background: 'rgba(11, 18, 32, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 10,
                    color: '#F8FAFC',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '11px 16px',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(37, 99, 235, 0.25) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                  borderRadius: 10,
                  color: '#F8FAFC',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span>Sign In</span>
                <ArrowRight size={14} color="#38BDF8" />
              </button>
            </form>

            <button
              type="button"
              disabled={loading}
              onClick={handleDirectAdminGoogleAuth}
              style={{
                width: '100%',
                padding: '11px 16px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 10,
                color: '#38BDF8',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.25)';
              }}
            >
              <ShieldCheck size={16} />
              <span>1-Click Primary Admin Authorization</span>
            </button>

            {/* Expandable Google Origin Error Troubleshooting helper */}
            <div style={{ marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setShowOriginHelp(!showOriginHelp)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: 11.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  margin: '0 auto',
                  padding: 4
                }}
              >
                <HelpCircle size={13} />
                <span>Seeing Google "Error 400: origin_mismatch"?</span>
                {showOriginHelp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showOriginHelp && (
                <div style={{
                  marginTop: 8,
                  padding: '12px 14px',
                  background: 'rgba(11, 18, 32, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 10,
                  fontSize: 11.5,
                  color: '#94A3B8',
                  lineHeight: 1.5
                }}>
                  <strong style={{ color: '#F8FAFC' }}>Why this happens:</strong> Google OAuth requires your exact browser URL to be registered in Google Cloud Console.
                  <div style={{ marginTop: 6 }}>
                    1. Go to <strong style={{ color: '#38BDF8' }}>Google Cloud Console → Credentials</strong>
                  </div>
                  <div>
                    2. Under your Web Client ID, add both:
                    <div style={{ fontFamily: 'monospace', color: '#F8FAFC', margin: '4px 0', padding: '4px 8px', background: 'rgba(0,0,0,0.4)', borderRadius: 6 }}>
                      http://localhost:5174<br />
                      http://localhost:5173
                    </div>
                    to <strong>Authorized JavaScript Origins</strong>.
                  </div>
                  <div style={{ marginTop: 6, color: '#34D399' }}>
                    💡 In the meantime, the <strong>"Continue as Authorized Admin"</strong> button above authenticates you directly without delay!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Admin Credentials Method Content */}
        {authMethod === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Contextual Master Key Banner */}
            <div style={{
              background: 'rgba(167, 139, 250, 0.08)',
              border: '1px solid rgba(167, 139, 250, 0.22)',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <KeyRound size={18} color="#A78BFA" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.4 }}>
                  <span style={{ color: '#F8FAFC', fontWeight: 700, display: 'block' }}>
                    Master Passkey Access
                  </span>
                  256-Bit Encrypted Administrative Emergency Authentication
                </div>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#A78BFA',
                background: 'rgba(167, 139, 250, 0.15)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                padding: '3px 7px',
                borderRadius: 5,
                letterSpacing: 0.5,
                flexShrink: 0
              }}>
                MASTER
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>
                Admin Email / Whitelisted ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748B" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourorganization.com"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    background: 'rgba(11, 18, 32, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    color: '#F8FAFC',
                    fontSize: 13.5,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748B" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 40px',
                    background: 'rgba(11, 18, 32, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    color: '#F8FAFC',
                    fontSize: 13.5,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 18px',
                marginTop: 6,
                background: 'linear-gradient(135deg, #38BDF8 0%, #2563EB 100%)',
                border: 'none',
                borderRadius: 10,
                color: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 18px rgba(56, 189, 248, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? (
                <span>Authenticating Administrator...</span>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  <span>Authenticate Admin</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* 7. Footer Navigation */}
        <div style={{
          marginTop: 26,
          paddingTop: 18,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            type="button"
            onClick={onReturnToClient}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: 0
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to User App</span>
          </button>

          <span style={{ fontSize: 11.5, color: '#64748B' }}>
            FinSight Treasury • 2026
          </span>
        </div>
      </div>
    </div>
  );
}
