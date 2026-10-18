import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  storageService,
  INITIAL_USER,
  INITIAL_PREFERENCES,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_LEAN_SAVINGS,
  INITIAL_NOTIFICATIONS
} from '../services/storageService.js';
import {
  calculateCurrentBalance,
  calculateSafeToSpend,
  generateCashFlowForecast,
  rankBills,
  calculateLeanWeekSavings,
  generateDashboardInsights,
  toISODate,
  addDays
} from '../services/financialEngine.js';
import { authService } from '../services/authService.js';
import { apiService } from '../services/apiService.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Core State with LocalStorage & Session Check
  const [user, setUser] = useState(() => 
    storageService.get(storageService.KEYS.USER_PROFILE, INITIAL_USER)
  );

  const [authLoading, setAuthLoading] = useState(true);

  const [preferences, setPreferencesState] = useState(() => 
    storageService.get(storageService.KEYS.PREFERENCES, INITIAL_PREFERENCES)
  );

  const [incomes, setIncomes] = useState(() => 
    storageService.get(storageService.KEYS.INCOMES, INITIAL_INCOMES)
  );

  const [expenses, setExpenses] = useState(() => 
    storageService.get(storageService.KEYS.EXPENSES, INITIAL_EXPENSES)
  );

  const [leanSavings, setLeanSavings] = useState(() => 
    storageService.get(storageService.KEYS.SAVINGS_GOALS, INITIAL_LEAN_SAVINGS)
  );

  const [notifications, setNotifications] = useState(() => 
    storageService.get(storageService.KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  const [dismissedAlertIds, setDismissedAlertIds] = useState(() => {
    try {
      const raw = localStorage.getItem(`uip_dismissed_alerts_${user?.id || 'default'}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Active navigation route: 'dashboard' | 'income' | 'expenses' | 'safe-to-spend' | 'forecast' | 'simulator' | 'prioritization' | 'savings' | 'notifications' | 'settings'
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);

  // Check HttpOnly session on initial load from backend
  useEffect(() => {
    async function checkSession() {
      try {
        const sessionUser = await authService.getCurrentUser();
        if (sessionUser) {
          setUser(prev => ({
            ...prev,
            ...sessionUser,
            isAuthenticated: true
          }));
        }
      } catch (err) {
        console.warn('Session verification check:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkSession();
  }, []);

  // Load user-specific dataset from backend / user-scoped storage when user.id changes
  useEffect(() => {
    let isCancelled = false;
    async function loadFinancialData() {
      if (!user?.id) return;
      try {
        const data = await apiService.getFinancials(user.id);
        if (isCancelled || !data) return;
        if (data.preferences) setPreferencesState(data.preferences);
        if (data.incomes) setIncomes(data.incomes);
        if (data.expenses) setExpenses(data.expenses);
        if (data.savingsGoals) setLeanSavings(data.savingsGoals);
        if (data.notifications) setNotifications(data.notifications);
      } catch (err) {
        console.warn('Financial data load error:', err);
      }
    }
    loadFinancialData();
    return () => { isCancelled = true; };
  }, [user?.id]);

  // Sync to localStorage
  useEffect(() => {
    storageService.set(storageService.KEYS.USER_PROFILE, user);
  }, [user]);

  useEffect(() => {
    storageService.set(storageService.KEYS.PREFERENCES, preferences);
  }, [preferences]);

  useEffect(() => {
    storageService.set(storageService.KEYS.INCOMES, incomes);
  }, [incomes]);

  useEffect(() => {
    storageService.set(storageService.KEYS.EXPENSES, expenses);
  }, [expenses]);

  useEffect(() => {
    storageService.set(storageService.KEYS.SAVINGS_GOALS, leanSavings);
  }, [leanSavings]);

  useEffect(() => {
    storageService.set(storageService.KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  // 2. Authoritative Financial Engine Calculations (Memoized for peak performance)
  const balanceDetails = useMemo(() => {
    return calculateCurrentBalance(
      preferences.startingBalance,
      incomes,
      expenses,
      leanSavings.currentDesignatedReserve
    );
  }, [preferences.startingBalance, incomes, expenses, leanSavings.currentDesignatedReserve]);

  const safeToSpend = useMemo(() => {
    return calculateSafeToSpend({
      availableCash: balanceDetails.availableCash,
      incomes,
      expenses,
      safetyBuffer: preferences.safetyBuffer,
      horizonDays: preferences.defaultHorizonDays,
      scenario: preferences.defaultScenario
    });
  }, [balanceDetails.availableCash, incomes, expenses, preferences.safetyBuffer, preferences.defaultHorizonDays, preferences.defaultScenario]);

  const standardForecast = useMemo(() => {
    return generateCashFlowForecast({
      availableCash: balanceDetails.availableCash,
      incomes,
      expenses,
      safetyBuffer: preferences.safetyBuffer,
      days: 30,
      scenario: 'expected'
    });
  }, [balanceDetails.availableCash, incomes, expenses, preferences.safetyBuffer]);

  const rawDashboardInsights = useMemo(() => {
    return generateDashboardInsights({
      availableCash: balanceDetails.availableCash,
      safetyBuffer: preferences.safetyBuffer,
      incomes,
      expenses,
      forecast: standardForecast.forecast,
      firstLowBufferDate: standardForecast.firstLowBufferDate,
      firstNegativeDate: standardForecast.firstNegativeDate
    });
  }, [balanceDetails.availableCash, preferences.safetyBuffer, incomes, expenses, standardForecast]);

  const dashboardInsights = useMemo(() => {
    return {
      ...rawDashboardInsights,
      alerts: rawDashboardInsights.alerts.filter(a => !dismissedAlertIds.includes(a.id))
    };
  }, [rawDashboardInsights, dismissedAlertIds]);

  const billRanking = useMemo(() => {
    return rankBills(expenses, balanceDetails.availableCash);
  }, [expenses, balanceDetails.availableCash]);

  const leanWeekCalculations = useMemo(() => {
    return calculateLeanWeekSavings(leanSavings);
  }, [leanSavings]);

  // Derived metrics for UI
  const confirmedUpcomingIncome = useMemo(() => {
    const today = toISODate(new Date());
    return incomes
      .filter(inc => inc.status === 'confirmed' && inc.expectedDate >= today)
      .reduce((sum, inc) => sum + Number(inc.amount || 0), 0);
  }, [incomes]);

  const upcomingBillsNext7Days = useMemo(() => {
    const today = toISODate(new Date());
    const sevenDaysLater = addDays(today, 7);
    return expenses
      .filter(exp => exp.status !== 'paid' && exp.dueDate >= today && exp.dueDate <= sevenDaysLater)
      .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  }, [expenses]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // 3. Mutating Actions

  // Income Actions
  const addIncome = (incomeData) => {
    const newIncome = {
      ...incomeData,
      id: `inc_${Date.now()}`,
      amount: Number(incomeData.amount || 0)
    };
    setIncomes(prev => [newIncome, ...prev]);
    apiService.addIncome(user?.id, newIncome).catch(e => console.warn('Sync addIncome error:', e));
  };

  const editIncome = (id, updatedData) => {
    setIncomes(prev => prev.map(inc => inc.id === id ? { ...inc, ...updatedData, amount: Number(updatedData.amount || 0) } : inc));
    apiService.updateIncome(user?.id, id, updatedData).catch(e => console.warn('Sync editIncome error:', e));
  };

  const deleteIncome = (id) => {
    setIncomes(prev => prev.filter(inc => inc.id !== id));
    apiService.deleteIncome(user?.id, id).catch(e => console.warn('Sync deleteIncome error:', e));
  };

  const markIncomeReceived = (id, actualDate = toISODate(new Date())) => {
    setIncomes(prev => prev.map(inc => {
      if (inc.id === id && inc.status !== 'received') {
        return {
          ...inc,
          status: 'received',
          actualDate
        };
      }
      return inc;
    }));
    apiService.updateIncome(user?.id, id, { status: 'received', actualDate }).catch(e => console.warn('Sync markIncomeReceived error:', e));
  };

  // Expense Actions
  const addExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      amount: Number(expenseData.amount || 0),
      status: expenseData.status || 'unpaid'
    };
    setExpenses(prev => [newExpense, ...prev]);
    apiService.addExpense(user?.id, newExpense).catch(e => console.warn('Sync addExpense error:', e));
  };

  const editExpense = (id, updatedData) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updatedData, amount: Number(updatedData.amount || 0) } : exp));
    apiService.updateExpense(user?.id, id, updatedData).catch(e => console.warn('Sync editExpense error:', e));
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    apiService.deleteExpense(user?.id, id).catch(e => console.warn('Sync deleteExpense error:', e));
  };

  const markExpensePaid = (id, paidDate = toISODate(new Date())) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id && exp.status !== 'paid') {
        return {
          ...exp,
          status: 'paid',
          paidDate
        };
      }
      return exp;
    }));
    apiService.updateExpense(user?.id, id, { status: 'paid', paidDate }).catch(e => console.warn('Sync markExpensePaid error:', e));
  };

  // Preferences Actions
  const setPreferences = (updater) => {
    setPreferencesState(prev => {
      const nextVal = typeof updater === 'function' ? updater(prev) : updater;
      apiService.updatePreferences(user?.id, nextVal).catch(e => console.warn('Sync updatePreferences error:', e));
      return nextVal;
    });
  };

  // Lean-Week Savings Actions
  const updateLeanSavings = (newData) => {
    setLeanSavings(prev => {
      const updated = { ...prev, ...newData };
      apiService.updateSavings(user?.id, updated).catch(e => console.warn('Sync updateSavings error:', e));
      return updated;
    });
  };

  const contributeToSavings = (amount) => {
    const addAmt = Number(amount || 0);
    if (addAmt <= 0) return;
    setLeanSavings(prev => {
      const updated = {
        ...prev,
        currentDesignatedReserve: prev.currentDesignatedReserve + addAmt
      };
      apiService.contributeSavings(user?.id, addAmt).catch(e => console.warn('Sync contributeSavings error:', e));
      return updated;
    });
  };

  // Notification Actions
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    apiService.markNotificationRead(user?.id, id).catch(e => console.warn('Sync markNotificationRead error:', e));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    apiService.markAllNotificationsRead(user?.id).catch(e => console.warn('Sync markAllNotificationsRead error:', e));
  };

  const clearNotifications = () => {
    setNotifications([]);
    apiService.clearNotifications(user?.id).catch(e => console.warn('Sync clearNotifications error:', e));
  };

  // Dismiss alert helper
  const dismissAlert = (alertId) => {
    setDismissedAlertIds(prev => {
      const next = [...new Set([...prev, alertId])];
      try {
        localStorage.setItem(`uip_dismissed_alerts_${user?.id || 'default'}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // User & Reset Actions
  const resetToDemoData = async () => {
    storageService.resetAll();
    try {
      const demoData = await apiService.resetToDemo(user?.id);
      if (demoData) {
        if (demoData.preferences) setPreferencesState(demoData.preferences);
        if (demoData.incomes) setIncomes(demoData.incomes);
        if (demoData.expenses) setExpenses(demoData.expenses);
        if (demoData.savingsGoals) setLeanSavings(demoData.savingsGoals);
        if (demoData.notifications) setNotifications(demoData.notifications);
      }
    } catch {
      setPreferencesState(INITIAL_PREFERENCES);
      setIncomes(INITIAL_INCOMES);
      setExpenses(INITIAL_EXPENSES);
      setLeanSavings(INITIAL_LEAN_SAVINGS);
      setNotifications(INITIAL_NOTIFICATIONS);
    }
    setDismissedAlertIds([]);
    try {
      localStorage.removeItem(`uip_dismissed_alerts_${user?.id || 'default'}`);
    } catch {}
    setActiveRoute('dashboard');
  };

  const clearUserData = async () => {
    try {
      const cleared = await apiService.clearUserData(user?.id);
      if (cleared) {
        if (cleared.preferences) setPreferencesState(cleared.preferences);
        setIncomes(cleared.incomes || []);
        setExpenses(cleared.expenses || []);
        if (cleared.savingsGoals) setLeanSavings(cleared.savingsGoals);
        setNotifications(cleared.notifications || []);
      }
    } catch {
      setPreferencesState({ ...INITIAL_PREFERENCES, startingBalance: 0 });
      setIncomes([]);
      setExpenses([]);
      setLeanSavings({ ...INITIAL_LEAN_SAVINGS, currentDesignatedReserve: 0 });
      setNotifications([]);
    }
    setDismissedAlertIds([]);
    try {
      localStorage.removeItem(`uip_dismissed_alerts_${user?.id || 'default'}`);
    } catch {}
    setActiveRoute('dashboard');
  };

  // Real backend authentication methods
  const loginWithGoogle = async (credential) => {
    const data = await authService.verifyGoogleCredential(credential);
    setUser(prev => ({
      ...prev,
      ...data.user,
      isAuthenticated: true
    }));
    return data;
  };

  const linkGoogleAccount = async ({ email, password, credential }) => {
    const data = await authService.linkGoogleAccount({ email, password, credential });
    setUser(prev => ({
      ...prev,
      ...data.user,
      isAuthenticated: true
    }));
    return data;
  };

  const loginWithEmail = async (email, password) => {
    const data = await authService.loginWithEmail(email, password);
    setUser(prev => ({
      ...prev,
      ...data.user,
      isAuthenticated: true
    }));
    return data;
  };

  const registerWithEmail = async (email, name, password) => {
    const data = await authService.registerWithEmail(email, name, password);
    setUser(prev => ({
      ...prev,
      ...data.user,
      isAuthenticated: true
    }));
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(INITIAL_USER);
    setPreferencesState(INITIAL_PREFERENCES);
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    setLeanSavings(INITIAL_LEAN_SAVINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setDismissedAlertIds([]);
    setActiveRoute('dashboard');
  };

  const completeOnboarding = async () => {
    try {
      await authService.completeOnboarding();
    } catch (e) {
      console.warn('Backend onboarding sync error:', e);
    }
    setUser(prev => ({
      ...prev,
      onboardingCompleted: true
    }));
  };

  return (
    <AppContext.Provider
      value={{
        // State
        user,
        setUser,
        authLoading,
        preferences,
        setPreferences,
        incomes,
        expenses,
        leanSavings,
        notifications,
        dismissedAlertIds,
        activeRoute,
        setActiveRoute,
        mobileMenuOpen,
        setMobileMenuOpen,
        quickAddModalOpen,
        setQuickAddModalOpen,

        // Calculated values
        balanceDetails,
        safeToSpend,
        standardForecast,
        dashboardInsights,
        billRanking,
        leanWeekCalculations,
        confirmedUpcomingIncome,
        upcomingBillsNext7Days,
        unreadNotificationCount,

        // Action methods
        addIncome,
        editIncome,
        deleteIncome,
        markIncomeReceived,

        addExpense,
        editExpense,
        deleteExpense,
        markExpensePaid,

        updateLeanSavings,
        contributeToSavings,

        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        dismissAlert,

        resetToDemoData,
        clearUserData,
        loginWithGoogle,
        linkGoogleAccount,
        loginWithEmail,
        registerWithEmail,
        completeOnboarding,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
