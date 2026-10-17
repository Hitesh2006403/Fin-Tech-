import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR } from '../services/financialEngine.js';
import {
  ShieldCheck,
  TrendingUp,
  Receipt,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  CheckCircle2,
  Sliders,
  DollarSign
} from 'lucide-react';

export function AuthPage() {
  const { login, setUser, setPreferences } = useApp();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'onboarding'
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('FinSight2026!Secured');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('Alex Vance');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Onboarding Wizard state (3 short steps)
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [obBalance, setObBalance] = useState('45000');
  const [obBuffer, setObBuffer] = useState('25000');
  const [obFrequency, setObFrequency] = useState('Irregular / Milestone-based');
  const [obEssentialRent, setObEssentialRent] = useState('22000');
  const [obThreshold, setObThreshold] = useState('20000');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(email, fullName);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setMode('onboarding');
  };

  const handleOnboardingFinish = () => {
    setPreferences(prev => ({
      ...prev,
      startingBalance: Number(obBalance),
      safetyBuffer: Number(obBuffer),
      incomeFrequency: obFrequency,
      lowBalanceAlertThreshold: Number(obThreshold)
    }));

    login(email, fullName);
  };

  const handleDemoBypass = () => {
    login('alex@example.com', 'Alex Vance');
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
          <span>SOC-2 Verified Security Standards</span>
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
          padding: '40px'
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          
          {/* Quick Demo Bypass Banner for Hackathon Judges */}
          <div
            style={{
              background: '#F0EFFF',
              border: '1px solid #E0E7FF',
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#635BFF' }}>
                ⚡ Hackathon Evaluator Access
              </div>
              <div style={{ fontSize: 11.5, color: '#667085' }}>
                Jump directly into the workspace with sample data
              </div>
            </div>
            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={handleDemoBypass}
            >
              <span>Instant Launch</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Mode 1: Login */}
          {mode === 'login' && (
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#172033', margin: '0 0 6px 0' }}>
                Welcome Back
              </h2>
              <p style={{ fontSize: 14, color: '#667085', margin: '0 0 24px 0' }}>
                Access your personalized treasury cash flow dashboard.
              </p>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group-item">
                  <label className="form-label-title">Work Email</label>
                  <input
                    type="email"
                    className="form-input-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
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

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 10 }}
                >
                  <span>Sign In to FinSight</span>
                  <ArrowRight size={16} />
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
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14.5, marginTop: 10 }}
                >
                  <span>Continue to Financial Setup</span>
                  <ArrowRight size={16} />
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

          {/* Mode 4: 3-Step Onboarding Wizard */}
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
                      style={{ flex: 2, justifyContent: 'center', padding: '12px' }}
                      onClick={handleOnboardingFinish}
                    >
                      <CheckCircle2 size={16} />
                      <span>Launch Planner Workspace</span>
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
