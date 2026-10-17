import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  ShieldCheck,
  LineChart,
  Sliders,
  ArrowDownUp,
  PiggyBank,
  Bell,
  Settings,
  X
} from 'lucide-react';

export function Sidebar() {
  const {
    activeRoute,
    setActiveRoute,
    mobileMenuOpen,
    setMobileMenuOpen,
    unreadNotificationCount
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses & Bills', icon: Receipt },
    { id: 'safe-to-spend', label: 'Safe-to-Spend', icon: ShieldCheck },
    { id: 'forecast', label: 'Cash-Flow Forecast', icon: LineChart },
    { id: 'simulator', label: 'Delay Simulator', icon: Sliders, badge: 'Key Feature' },
    { id: 'prioritization', label: 'Bill Prioritization', icon: ArrowDownUp },
    { id: 'savings', label: 'Lean-Week Savings', icon: PiggyBank },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotificationCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveRoute(id);
    setMobileMenuOpen(false);
  };

  return (
    <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-logo">
          <div className="logo-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <div className="logo-text-title">FinSight</div>
            <div className="logo-text-sub">Uncertain Income Planner</div>
          </div>
        </div>

        {mobileMenuOpen && (
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="sidebar-nav-container">
        <div className="sidebar-section-label">Core Planning</div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>

              {item.badge && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  fontWeight: 700,
                  background: '#EEF2FF',
                  color: '#635BFF',
                  padding: '2px 6px',
                  borderRadius: 10
                }}>
                  {item.badge}
                </span>
              )}

              {item.count > 0 && (
                <span className="nav-badge-pill">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="environment-status-pill">
          <span className="env-label">Mode: Live Treasury</span>
          <span className="env-status-dot"></span>
        </div>
      </div>
    </aside>
  );
}
