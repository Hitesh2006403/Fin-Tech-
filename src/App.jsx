import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
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
import { NotFoundPage } from './pages/NotFoundPage.jsx';

import { AdminPortal } from './pages/admin/AdminPortal.jsx';
import { Background3D } from './components/common/Background3D.jsx';

import './App.css';

function LoadingScreen({ message = 'Verifying secure session...' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1220', position: 'relative' }}>
      <Background3D />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 38, height: 38, border: '3px solid rgba(56, 189, 248, 0.2)', borderTopColor: '#38BDF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)' }} />
        <div style={{ fontSize: 13.5, color: '#94A3B8', fontWeight: 500 }}>{message}</div>
      </div>
    </div>
  );
}

// Route Guard for Landing / Home
function HomeRoute() {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.isAdmin || user.role === 'Super Administrator') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

// Route Guard for Login Page
function LoginRoute() {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (user && user.isAuthenticated) {
    if (user.isAdmin || user.role === 'Super Administrator') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthPage />;
}

// User App Shell Layout
function MainAppShellLayout() {
  const { user, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user.onboardingCompleted) {
    return <AuthPage initialMode="onboarding" />;
  }

  return (
    <div className="app-shell">
      <Background3D />
      <Sidebar />
      <div className="app-main-content">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
      <QuickAddModal />
      <MobileBottomNav />
    </div>
  );
}

// Admin Route Guard
function AdminRouteGuard() {
  const { user, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return <LoadingScreen message="Verifying administrator credentials & session..." />;
  }

  if (!user || !user.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const isAdmin = user.isAdmin || user.role === 'Super Administrator';
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminPortal />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root Route */}
      <Route path="/" element={<HomeRoute />} />

      {/* Common Login Route */}
      <Route path="/login" element={<LoginRoute />} />

      {/* Protected User Dashboard Routes */}
      <Route element={<MainAppShellLayout />}>
        <Route path="/dashboard" element={<OverviewDashboard />} />
        <Route path="/income" element={<IncomeManagement />} />
        <Route path="/expenses" element={<ExpensesBills />} />
        <Route path="/transactions" element={<ExpensesBills />} />
        <Route path="/safe-to-spend" element={<SafeToSpendCalculator />} />
        <Route path="/forecast" element={<CashFlowForecast />} />
        <Route path="/simulator" element={<PaymentDelaySimulator />} />
        <Route path="/prioritization" element={<SmartBillPrioritization />} />
        <Route path="/savings" element={<LeanWeekSavings />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<ProfileSettings />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminRouteGuard />} />
      <Route path="/admin/*" element={<AdminRouteGuard />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

