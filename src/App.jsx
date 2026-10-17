import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Header } from './components/layout/Header.jsx';
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

import './App.css';

function MainAppShell() {
  const { user, authLoading, activeRoute } = useApp();

  // Session check in progress
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FC' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: '#635BFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>Verifying secure session...</div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display login/register/onboarding
  if (!user || !user.isAuthenticated) {
    return <AuthPage />;
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
