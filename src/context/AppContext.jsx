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

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // 1. Core State with LocalStorage Persistence
  const [user, setUser] = useState(() => 
    storageService.get(storageService.KEYS.USER_PROFILE, INITIAL_USER)
  );

  const [preferences, setPreferences] = useState(() => 
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

  // Active navigation route: 'dashboard' | 'income' | 'expenses' | 'safe-to-spend' | 'forecast' | 'simulator' | 'prioritization' | 'savings' | 'notifications' | 'settings'
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);

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

  const dashboardInsights = useMemo(() => {
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
  };

  const editIncome = (id, updatedData) => {
    setIncomes(prev => prev.map(inc => inc.id === id ? { ...inc, ...updatedData, amount: Number(updatedData.amount || 0) } : inc));
  };

  const deleteIncome = (id) => {
    setIncomes(prev => prev.filter(inc => inc.id !== id));
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
  };

  const editExpense = (id, updatedData) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updatedData, amount: Number(updatedData.amount || 0) } : exp));
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
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
  };

  // Lean-Week Savings Actions
  const updateLeanSavings = (newData) => {
    setLeanSavings(prev => ({
      ...prev,
      ...newData
    }));
  };

  const contributeToSavings = (amount) => {
    const addAmt = Number(amount || 0);
    if (addAmt <= 0) return;
    setLeanSavings(prev => ({
      ...prev,
      currentDesignatedReserve: prev.currentDesignatedReserve + addAmt
    }));
  };

  // Notification Actions
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // User & Reset Actions
  const resetToDemoData = () => {
    storageService.resetAll();
    setUser(INITIAL_USER);
    setPreferences(INITIAL_PREFERENCES);
    setIncomes(INITIAL_INCOMES);
    setExpenses(INITIAL_EXPENSES);
    setLeanSavings(INITIAL_LEAN_SAVINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveRoute('dashboard');
  };

  const logout = () => {
    setUser(prev => ({ ...prev, isAuthenticated: false }));
  };

  const login = (email, name = 'Alex Vance') => {
    setUser(prev => ({
      ...prev,
      email,
      name,
      isAuthenticated: true
    }));
  };

  return (
    <AppContext.Provider
      value={{
        // State
        user,
        setUser,
        preferences,
        setPreferences,
        incomes,
        expenses,
        leanSavings,
        notifications,
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

        resetToDemoData,
        login,
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
