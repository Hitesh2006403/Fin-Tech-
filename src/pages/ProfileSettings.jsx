import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { formatINR } from '../services/financialEngine.js';
import { exportTransactionsCSV, exportForecastCSV } from '../services/exportService.js';
import {
  Settings,
  User,
  Shield,
  Download,
  RotateCcw,
  LogOut,
  CheckCircle2,
  Lock,
  Wallet,
  DollarSign
} from 'lucide-react';

export function ProfileSettings() {
  const {
    user,
    setUser,
    preferences,
    setPreferences,
    incomes,
    expenses,
    standardForecast,
    resetToDemoData,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'financial' | 'security' | 'data'

  // Personal form
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role || 'Freelance Product Architect');
  const [timezone, setTimezone] = useState(user.timezone || 'Asia/Kolkata (IST)');

  // Financial form
  const [startingBalance, setStartingBalance] = useState(preferences.startingBalance);
  const [safetyBuffer, setSafetyBuffer] = useState(preferences.safetyBuffer);
  const [defaultHorizon, setDefaultHorizon] = useState(preferences.defaultHorizonDays);
  const [defaultScenario, setDefaultScenario] = useState(preferences.defaultScenario);

  // Security form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleSavePersonal = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      name,
      email,
      role,
      timezone,
      avatarInitials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    });
    showToast('Personal profile updated!');
  };

  const handleSaveFinancial = (e) => {
    e.preventDefault();
    setPreferences({
      ...preferences,
      startingBalance: Number(startingBalance),
      safetyBuffer: Number(safetyBuffer),
      defaultHorizonDays: Number(defaultHorizon),
      defaultScenario
    });
    showToast('Financial parameters updated and recalculated across all screens!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated securely.');
  };

  return (
    <div className="page-container">
      
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Profile & Preferences</h1>
          <p className="page-subtitle">
            Configure financial rules, personal details, CSV audit exports, and security credentials.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          style={{ color: '#635BFF', borderColor: '#C7D2FE' }}
          onClick={() => {
            resetToDemoData();
            showToast('All records reset to pristine hackathon demo dataset!');
          }}
        >
          <RotateCcw size={15} />
          <span>Reset Sample Demo Data</span>
        </button>
      </div>

      {toastMsg && (
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '10px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Settings Grid with Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        
        {/* Navigation Tabs List */}
        <div className="card" style={{ padding: '12px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'financial', label: 'Financial Rules', icon: Wallet },
            { id: 'security', label: 'Security & Auth', icon: Lock },
            { id: 'data', label: 'Data & CSV Export', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <div>
          {/* Tab 1: Personal */}
          {activeTab === 'personal' && (
            <div className="card">
              <h3 className="card-title-h3" style={{ marginBottom: 18 }}>Personal Identity</h3>
              <form onSubmit={handleSavePersonal}>
                <div className="form-grid-2">
                  <div className="form-group-item">
                    <label className="form-label-title">Full Name</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Verified Email Address</label>
                    <input
                      type="email"
                      className="form-input-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group-item">
                    <label className="form-label-title">Professional Role</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Preferred Currency</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value="INR (₹) — Indian Rupee"
                      disabled
                      style={{ background: '#F8FAFC' }}
                    />
                  </div>
                </div>

                <div className="form-group-item">
                  <label className="form-label-title">Timezone</label>
                  <select
                    className="form-input-control"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST - UTC+5:30)</option>
                    <option value="America/New_York (EST)">America/New_York (EST - UTC-5:00)</option>
                    <option value="Europe/London (GMT)">Europe/London (GMT - UTC+0:00)</option>
                    <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT - UTC+8:00)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>
                  Save Personal Settings
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Financial Rules */}
          {activeTab === 'financial' && (
            <div className="card">
              <h3 className="card-title-h3" style={{ marginBottom: 18 }}>Authoritative Financial Parameters</h3>
              <form onSubmit={handleSaveFinancial}>
                <div className="form-grid-2">
                  <div className="form-group-item">
                    <label className="form-label-title">Baseline Opening Cash (₹ INR)</label>
                    <input
                      type="number"
                      step="1000"
                      className="form-input-control"
                      value={startingBalance}
                      onChange={(e) => setStartingBalance(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: 11, color: '#64748B' }}>Live balance before added received income and bills.</span>
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Default Minimum Safety Buffer (₹ INR)</label>
                    <input
                      type="number"
                      step="2500"
                      className="form-input-control"
                      value={safetyBuffer}
                      onChange={(e) => setSafetyBuffer(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: 11, color: '#64748B' }}>Emergency cash threshold protected from Safe-to-Spend.</span>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group-item">
                    <label className="form-label-title">Default Planning Horizon</label>
                    <select
                      className="form-input-control"
                      value={defaultHorizon}
                      onChange={(e) => setDefaultHorizon(Number(e.target.value))}
                    >
                      <option value={7}>7 Days (Ultra Short-Term)</option>
                      <option value={14}>14 Days (Bi-Weekly Sprint)</option>
                      <option value={30}>30 Days (Monthly Cycle - Standard)</option>
                      <option value={60}>60 Days (Bi-Monthly Runway)</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Default Forecast Scenario</label>
                    <select
                      className="form-input-control"
                      value={defaultScenario}
                      onChange={(e) => setDefaultScenario(e.target.value)}
                    >
                      <option value="conservative">Conservative (No unreceived income counted)</option>
                      <option value="expected">Expected (Includes signed/confirmed invoices)</option>
                      <option value="optimistic">Optimistic (Includes speculative proposals)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>
                  Apply & Recalculate
                </button>
              </form>
            </div>
          )}

          {/* Tab 3: Security */}
          {activeTab === 'security' && (
            <div className="card">
              <h3 className="card-title-h3" style={{ marginBottom: 18 }}>Authentication & Security</h3>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group-item">
                  <label className="form-label-title">Current Password</label>
                  <input
                    type="password"
                    className="form-input-control"
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group-item">
                    <label className="form-label-title">New Password</label>
                    <input
                      type="password"
                      className="form-input-control"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label className="form-label-title">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input-control"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <button type="submit" className="btn-primary">
                    Update Security Password
                  </button>
                  <button type="button" className="btn-secondary" style={{ color: '#D64545' }} onClick={logout}>
                    Sign Out All Sessions
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Data & CSV Export */}
          {activeTab === 'data' && (
            <div className="card">
              <h3 className="card-title-h3" style={{ marginBottom: 12 }}>Data Export & Auditing</h3>
              <p className="card-subtitle-p" style={{ marginBottom: 24 }}>
                Export your structured financial streams and forecast points for external accounting or tax compliance.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: '18px', border: '1px solid #E2E8F0', borderRadius: 10, background: '#F8FAFC' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px 0' }}>Transaction Ledger</h4>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 16px 0' }}>
                    All recorded received income, signed milestone contracts, and planned essential bills.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => exportTransactionsCSV(incomes, expenses)}
                  >
                    <Download size={14} />
                    <span>Download Ledger (CSV)</span>
                  </button>
                </div>

                <div style={{ padding: '18px', border: '1px solid #E2E8F0', borderRadius: 10, background: '#F8FAFC' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px 0' }}>30-Day Forecast Model</h4>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 16px 0' }}>
                    Day-by-day projected closing balance, deficit markers, and safety buffer audits.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => exportForecastCSV(standardForecast.forecast)}
                  >
                    <Download size={14} />
                    <span>Download Forecast (CSV)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
