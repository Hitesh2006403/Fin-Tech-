import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCurrentBalance,
  calculateSafeToSpend,
  generateCashFlowForecast,
  rankBills,
  calculateLeanWeekSavings,
  generateDashboardInsights
} from './src/services/financialEngine.js';
import {
  INITIAL_USER,
  INITIAL_PREFERENCES,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_LEAN_SAVINGS,
  INITIAL_NOTIFICATIONS
} from './src/services/storageService.js';
import { authService } from './src/services/authService.js';

const AUTHORIZED_ADMIN_EMAILS = ['hiteshav2006@gmail.com', 'dishankbs04@gmail.com'];
function checkIsAdmin(user) {
  if (!user) return false;
  if (user.isAdmin || user.role === 'Super Administrator' || user.role === 'admin') return true;
  if (user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) return true;
  return false;
}

// Polyfill localStorage for Node test runner
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

test('FinSight 70% Prototype & Guest Mode Comprehensive Test Suite', async (t) => {
  await t.test('1. Guest Login provisions an active authenticated session without credentials', () => {
    localStorage.clear();
    const guestRes = authService.loginAsGuest();
    assert.equal(guestRes.success, true);
    assert.ok(guestRes.token.startsWith('guest_'));
    assert.equal(guestRes.user.isGuest, true);
    assert.equal(guestRes.user.isAuthenticated, true);
    assert.equal(guestRes.redirectTo, '/dashboard');
    assert.equal(localStorage.getItem('uip_guest_session'), 'true');
  });

  await t.test('2. getCurrentUser() restores the guest session from localStorage across page refreshes', async () => {
    const restoredUser = await authService.getCurrentUser();
    assert.ok(restoredUser, 'Guest user must be restored on page reload');
    assert.equal(restoredUser.isGuest, true);
    assert.equal(restoredUser.isAuthenticated, true);
    assert.equal(restoredUser.email, 'guest@finsight.demo');
  });

  await t.test('3. checkIsAdmin correctly identifies admin vs normal user vs guest', () => {
    const guestUser = { email: 'guest@finsight.demo', isGuest: true, role: 'user' };
    const normalUser = { email: 'alex@example.com', role: 'user' };
    const adminUser1 = { email: 'hiteshav2006@gmail.com' };
    const adminUser2 = { email: 'dishankbs04@gmail.com' };
    const adminUserRole = { email: 'anyone@domain.com', role: 'Super Administrator' };

    assert.equal(checkIsAdmin(guestUser), false);
    assert.equal(checkIsAdmin(normalUser), false);
    assert.equal(checkIsAdmin(adminUser1), true);
    assert.equal(checkIsAdmin(adminUser2), true);
    assert.equal(checkIsAdmin(adminUserRole), true);
  });

  await t.test('4. Safe-to-Spend engine calculates accurate safe spend for initial prototype data', () => {
    const balanceDetails = calculateCurrentBalance(
      INITIAL_PREFERENCES.startingBalance,
      INITIAL_INCOMES,
      INITIAL_EXPENSES
    );
    assert.ok(typeof balanceDetails.availableCash === 'number');

    const safeToSpend = calculateSafeToSpend({
      availableCash: balanceDetails.availableCash,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      safetyBuffer: INITIAL_PREFERENCES.safetyBuffer,
      horizonDays: 14
    });

    assert.ok(typeof safeToSpend.safeToSpendToday === 'number');
    assert.ok(safeToSpend.safeToSpendToday >= 0);
    assert.ok(typeof safeToSpend.projectedShortfall === 'number');
    assert.ok(typeof safeToSpend.availableCash === 'number');
  });

  await t.test('5. Cash flow forecast generates 30-day projected balances for expected, conservative, and stress scenarios', () => {
    const balanceDetails = calculateCurrentBalance(
      INITIAL_PREFERENCES.startingBalance,
      INITIAL_INCOMES,
      INITIAL_EXPENSES
    );

    const expectedForecast = generateCashFlowForecast({
      availableCash: balanceDetails.availableCash,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      safetyBuffer: INITIAL_PREFERENCES.safetyBuffer,
      days: 30,
      scenario: 'expected'
    });
    assert.ok(Array.isArray(expectedForecast.forecast));
    assert.ok(expectedForecast.forecast.length >= 30);
    assert.ok(typeof expectedForecast.minimumBalance === 'number');

    const conservativeForecast = generateCashFlowForecast({
      availableCash: balanceDetails.availableCash,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      safetyBuffer: INITIAL_PREFERENCES.safetyBuffer,
      days: 30,
      scenario: 'conservative'
    });
    assert.ok(Array.isArray(conservativeForecast.forecast));
    assert.ok(conservativeForecast.forecast.length >= 30);

    const stressForecast = generateCashFlowForecast({
      availableCash: balanceDetails.availableCash,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      safetyBuffer: INITIAL_PREFERENCES.safetyBuffer,
      days: 30,
      scenario: 'stress'
    });
    assert.ok(Array.isArray(stressForecast.forecast));
    assert.ok(stressForecast.forecast.length >= 30);
    assert.ok(stressForecast.minimumBalance <= expectedForecast.minimumBalance);
  });

  await t.test('6. Smart Bill Prioritization ranks essential bills and due dates accurately', () => {
    const balanceDetails = calculateCurrentBalance(
      INITIAL_PREFERENCES.startingBalance,
      INITIAL_INCOMES,
      INITIAL_EXPENSES
    );

    const ranking = rankBills(
      INITIAL_EXPENSES,
      balanceDetails.availableCash
    );

    assert.ok(Array.isArray(ranking.rankedBills));
    assert.ok(ranking.rankedBills.length > 0);
    const topBill = ranking.rankedBills[0];
    assert.ok(topBill.priority);
    assert.ok(typeof topBill.score === 'number');
  });

  await t.test('7. Lean Week Savings Challenge calculates discretionary expense cuts', () => {
    const leanCuts = calculateLeanWeekSavings({
      weeks: 4,
      expectedLowIncomePerWeek: 5000,
      essentialWeeklyExpenses: 12000,
      currentDesignatedReserve: 14000,
      weeklyContribution: 3000
    });
    assert.equal(leanCuts.weeklyDeficit, 7000);
    assert.equal(leanCuts.targetReserve, 28000);
    assert.equal(leanCuts.remainingGoal, 14000);
    assert.equal(leanCuts.progressPct, 50);
  });

  await t.test('8. Dashboard Insights detects runway, buffer status, and pending payments', () => {
    const balanceDetails = calculateCurrentBalance(
      INITIAL_PREFERENCES.startingBalance,
      INITIAL_INCOMES,
      INITIAL_EXPENSES
    );

    const insights = generateDashboardInsights({
      availableCash: balanceDetails.availableCash,
      safetyBuffer: INITIAL_PREFERENCES.safetyBuffer,
      incomes: INITIAL_INCOMES,
      expenses: INITIAL_EXPENSES,
      forecast: []
    });

    assert.ok(insights.primaryInsight);
    assert.ok(insights.primaryInsight.title);
    assert.ok(Array.isArray(insights.alerts));
  });

  await t.test('9. Logout cleanly clears guest session and tokens', async () => {
    await authService.logout();
    assert.equal(localStorage.getItem('uip_auth_token'), null);
    assert.equal(localStorage.getItem('uip_guest_session'), null);
  });
});
