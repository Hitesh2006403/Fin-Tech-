import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  Menu,
  Bell,
  Plus,
  HelpCircle,
  Calendar,
  LogOut,
  Settings,
  RotateCcw
} from 'lucide-react';

export function Header() {
  const {
    user,
    setMobileMenuOpen,
    setActiveRoute,
    unreadNotificationCount,
    setQuickAddModalOpen,
    resetToDemoData,
    logout
  } = useApp();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="app-header">
      {/* Left: Mobile Toggle & Date Indicator */}
      <div className="header-left-col">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-date-badge">
          <Calendar size={14} color="#635BFF" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="header-actions-col">
        {/* Quick Add Button */}
        <button
          type="button"
          className="btn-quick-add"
          onClick={() => setQuickAddModalOpen(true)}
        >
          <Plus size={16} />
          <span>Add Record</span>
        </button>

        {/* Notifications Button */}
        <button
          type="button"
          className="btn-header-action"
          onClick={() => setActiveRoute('notifications')}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadNotificationCount > 0 && (
            <span className="header-notification-badge" />
          )}
        </button>

        {/* User Profile & Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          >
            <div className="user-avatar-circle">
              {user.avatarInitials || 'AV'}
            </div>
            <div className="user-meta-text">
              <div className="user-name-title">{user.name}</div>
              <div className="user-role-sub">{user.role || 'Freelance Planner'}</div>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: 220,
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '8px 0',
                zIndex: 200
              }}
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{user.name}</div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>{user.email}</div>
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => {
                  setActiveRoute('settings');
                  setProfileDropdownOpen(false);
                }}
              >
                <Settings size={15} />
                <span>Settings & Preferences</span>
              </button>

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: 'none',
                  background: 'transparent',
                  color: '#635BFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => {
                  resetToDemoData();
                  setProfileDropdownOpen(false);
                }}
              >
                <RotateCcw size={15} />
                <span>Reset Demo Sample Data</span>
              </button>

              <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '9px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: 'none',
                  background: 'transparent',
                  color: '#D64545',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => {
                  logout();
                  setProfileDropdownOpen(false);
                }}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
