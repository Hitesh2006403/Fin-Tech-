import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { Header } from './components/layout/Header.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { MobileBottomNav } from './components/layout/MobileBottomNav.jsx';
import { QuickAddModal } from './components/common/QuickAddModal.jsx';

// 10 Dedicated Pages
import { OverviewDashboard } from './pages/OverviewDashboard.jsx';
import { IncomeManagement } from './pages/IncomeManagement.jsx';
import { ExpensesBills } from './pages/ExpensesBills.jsx';
import { SafeToSpendCalculator } from './pages/SafeToSpendCalculator.jsx';
import { CashFlowForecast } from './pages/CashFlowForecast.jsx';
import { PaymentDelaySimulator } from './pages/PaymentDelaySimulator.jsx';
import { SmartBillPrioritization } from './pages/SmartBillPrioritization.jsx';
import { LeanWeekSavings } from './pages/LeanWeekSavings.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { ProfileSettings } from './pages/ProfileSettings.jsx';
import { AuthPage } from './pages/AuthPage.jsx';

import { AdminPortal } from './pages/admin/AdminPortal.jsx';

import { Background3D } from './components/common/Background3D.jsx';

import './App.css';

function MainAppShell() {
  const { user, authLoading, activeRoute, setActiveRoute } = useApp();

  // Support direct URL access via ?admin=true or hash #admin
  const [isAdminMode, setIsAdminMode] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('admin') === 'true' || window.location.hash === '#admin';
    }
    return false;
  });

  React.useEffect(() => {
    const handleHash = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.hash === '#admin') {
        setIsAdminMode(true);
      }
    };
    window.addEventListener('popstate', handleHash);
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('popstate', handleHash);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // Dedicated Admin Portal view
  if (isAdminMode || activeRoute === 'admin') {
    return (
      <AdminPortal
        onReturnToClient={() => {
          setIsAdminMode(false);
          setActiveRoute('dashboard');
          if (typeof window !== 'undefined' && window.history.pushState) {
            const url = new URL(window.location);
            url.searchParams.delete('admin');
            if (url.hash === '#admin') url.hash = '';
            window.history.pushState({}, '', url);
          }
        }}
      />
    );
  }

  // Session check in progress
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1220', position: 'relative' }}>
        <Background3D />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 38, height: 38, border: '3px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)' }} />
          <div style={{ fontSize: 13.5, color: '#94A3B8', fontWeight: 500 }}>Verifying secure session...</div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display login/register/onboarding
  if (!user || !user.isAuthenticated) {
    return <AuthPage onOpenAdmin={() => setIsAdminMode(true)} />;
  }

  // If authenticated but onboarding is incomplete, redirect to onboarding first (Requirement 10)
  if (!user.onboardingCompleted) {
    return <AuthPage initialMode="onboarding" />;
  }

  // Active page router
  const renderActivePage = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <OverviewDashboard />;
      case 'income':
        return <IncomeManagement />;
      case 'expenses':
        return <ExpensesBills />;
      case 'safe-to-spend':
        return <SafeToSpendCalculator />;
      case 'forecast':
        return <CashFlowForecast />;
      case 'simulator':
        return <PaymentDelaySimulator />;
      case 'prioritization':
        return <SmartBillPrioritization />;
      case 'savings':
        return <LeanWeekSavings />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="app-shell">
      {/* 0. Elegant 3D Animated Background */}
      <Background3D />

      {/* 1. Left Collapsible Sidebar */}
      <Sidebar />

      {/* 2. Main Content & Header */}
      <div className="app-main-content">
        <Header />
        <main>
          {renderActivePage()}
        </main>
      </div>

      {/* 3. Global Quick Add Modal */}
      <QuickAddModal />

      {/* 4. Native-Feel Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
