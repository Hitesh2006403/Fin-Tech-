import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const FINANCIALS_FILE = path.join(DATA_DIR, 'financials.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const BENCHMARK_DEMO_INCOMES = [
  {
    id: 'inc_101',
    title: 'Client Design Retainer (Acme Fintech)',
    source: 'Acme Corp',
    amount: 65000,
    expectedDate: '2026-10-05',
    actualDate: '2026-10-05',
    status: 'received',
    recurring: 'monthly',
    notes: 'Q4 core banking UX sprint, wire transferred.',
    isDemo: true
  },
  {
    id: 'inc_102',
    title: 'Mobile App Consulting Payout',
    source: 'Venture Studio',
    amount: 42000,
    expectedDate: '2026-10-12',
    actualDate: '2026-10-12',
    status: 'received',
    recurring: 'one-time',
    notes: 'Design audit payout received into HDFC account.',
    isDemo: true
  },
  {
    id: 'inc_103',
    title: 'Milestone 2 Backend Deliverable',
    source: 'Stripe Global Partner',
    amount: 55000,
    expectedDate: '2026-10-25',
    actualDate: null,
    status: 'confirmed',
    recurring: 'milestone',
    notes: 'Contract signed. Invoice verified by finance department.',
    isDemo: true
  },
  {
    id: 'inc_104',
    title: 'Bi-Weekly Architecture Advisory',
    source: 'SaaS Labs',
    amount: 18000,
    expectedDate: '2026-11-04',
    actualDate: null,
    status: 'confirmed',
    recurring: 'bi-weekly',
    notes: 'Ongoing architecture sprint retainer.',
    isDemo: true
  },
  {
    id: 'inc_105',
    title: 'Brand Identity Pitch (Stealth Co)',
    source: 'Stealth AI Startup',
    amount: 35000,
    expectedDate: '2026-11-12',
    actualDate: null,
    status: 'uncertain',
    recurring: 'one-time',
    notes: 'Shortlisted among 3 finalists. Awaiting board decision.',
    isDemo: true
  }
];

const BENCHMARK_DEMO_EXPENSES = [
  {
    id: 'exp_201',
    title: 'Studio Workspace & Office Rent',
    category: 'Rent',
    amount: 22000,
    dueDate: '2026-10-22',
    isEssential: true,
    priority: 'critical',
    recurring: 'monthly',
    lateFee: 1500,
    gracePeriod: 3,
    status: 'unpaid',
    notes: 'Landlord requires bank transfer before 25th.',
    isDemo: true
  },
  {
    id: 'exp_202',
    title: 'Workstation & Hardware Loan EMI',
    category: 'EMI or loan',
    amount: 8500,
    dueDate: '2026-10-20',
    isEssential: true,
    priority: 'critical',
    recurring: 'monthly',
    lateFee: 1200,
    gracePeriod: 0,
    status: 'unpaid',
    emiDetails: { remainingInstallments: 6, totalTenure: 12 },
    notes: 'Auto-debit from primary account. CIBIL impact if missed.',
    isDemo: true
  },
  {
    id: 'exp_203',
    title: 'Commercial Fiber Internet',
    category: 'Utilities',
    amount: 2400,
    dueDate: '2026-10-24',
    isEssential: true,
    priority: 'high',
    recurring: 'monthly',
    lateFee: 200,
    gracePeriod: 5,
    status: 'unpaid',
    notes: 'Broadband connection for remote client meetings.',
    isDemo: true
  },
  {
    id: 'exp_204',
    title: 'AWS Cloud Compute & Vercel Hosting',
    category: 'Subscriptions',
    amount: 4800,
    dueDate: '2026-10-26',
    isEssential: true,
    priority: 'high',
    recurring: 'monthly',
    lateFee: 0,
    gracePeriod: 7,
    status: 'unpaid',
    notes: 'Client staging demo environment infrastructure.',
    isDemo: true
  },
  {
    id: 'exp_205',
    title: 'Health & Critical Medical Insurance',
    category: 'Insurance',
    amount: 5500,
    dueDate: '2026-10-28',
    isEssential: true,
    priority: 'high',
    recurring: 'quarterly',
    lateFee: 500,
    gracePeriod: 10,
    status: 'unpaid',
    notes: 'Family health coverage quarterly premium.',
    isDemo: true
  },
  {
    id: 'exp_206',
    title: 'Adobe Creative Cloud & Figma Pro',
    category: 'Subscriptions',
    amount: 3200,
    dueDate: '2026-10-29',
    isEssential: false,
    priority: 'low',
    recurring: 'monthly',
    lateFee: 0,
    gracePeriod: 5,
    status: 'unpaid',
    notes: 'Can be downgraded or deferred if cash flow is constrained.',
    isDemo: true
  },
  {
    id: 'exp_207',
    title: 'Staging Server Backup (Paid)',
    category: 'Subscriptions',
    amount: 1500,
    dueDate: '2026-10-08',
    paidDate: '2026-10-08',
    isEssential: true,
    status: 'paid',
    notes: 'Cleared at beginning of month.',
    isDemo: true
  },
  {
    id: 'exp_208',
    title: 'Household & Pantry Staples (Paid)',
    category: 'Groceries',
    amount: 12000,
    dueDate: '2026-10-10',
    paidDate: '2026-10-10',
    isEssential: true,
    status: 'paid',
    notes: 'Monthly essential food supplies cleared.',
    isDemo: true
  }
];

const BENCHMARK_DEMO_NOTIFICATIONS = [
  {
    id: 'notif_01',
    title: 'EMI Due in 3 Days',
    description: 'Workstation Loan EMI of ₹8,500 is due on 20 October. Auto-debit will trigger.',
    relatedRecord: 'exp_202',
    date: '2026-10-17',
    severity: 'critical',
    isRead: false,
    actionPage: 'expenses'
  },
  {
    id: 'notif_02',
    title: 'Confirmed Invoice Approaching',
    description: 'Milestone 2 Deliverable (₹55,000) expected on 25 October. Track in Delay Simulator.',
    relatedRecord: 'inc_103',
    date: '2026-10-16',
    severity: 'info',
    isRead: false,
    actionPage: 'simulator'
  },
  {
    id: 'notif_03',
    title: 'Lean-Week Savings Update',
    description: 'Your designated reserve is ₹14,000 (50% of your 4-week target of ₹28,000).',
    relatedRecord: 'lean_savings',
    date: '2026-10-15',
    severity: 'info',
    isRead: true,
    actionPage: 'savings'
  }
];


// Password hashing utility using Node crypto scrypt
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

// Default benchmark demo user
const INITIAL_DEMO_USERS = [
  {
    id: 'usr_alex_01',
    email: 'alex@example.com',
    name: 'Alex Vance',
    picture: null,
    avatarInitials: 'AV',
    role: 'Freelance Product Architect',
    authProvider: 'local',
    googleSub: null,
    passwordHash: hashPassword('FinSight2026!Secured'),
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) {
      writeJSON(file, fallback);
      return fallback;
    }
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return fallback;
  }
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// Load initial databases
let users = readJSON(USERS_FILE, INITIAL_DEMO_USERS);
let sessions = readJSON(SESSIONS_FILE, {});

export const db = {
  // Users
  getUserById(id) {
    users = readJSON(USERS_FILE, users);
    return users.find(u => u.id === id) || null;
  },

  getUserByEmail(email) {
    if (!email) return null;
    users = readJSON(USERS_FILE, users);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  getUserByGoogleSub(googleSub) {
    if (!googleSub) return null;
    users = readJSON(USERS_FILE, users);
    return users.find(u => u.googleSub === googleSub) || null;
  },

  createUser({ email, name, picture = null, authProvider = 'local', googleSub = null, password = null, onboardingCompleted = false }) {
    users = readJSON(USERS_FILE, users);
    const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
    
    const newUser = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      email: email.toLowerCase(),
      name: name || 'User',
      picture: picture || null,
      avatarInitials: initials,
      role: 'Treasury Planner',
      authProvider,
      googleSub,
      passwordHash: password ? hashPassword(password) : null,
      onboardingCompleted: Boolean(onboardingCompleted),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);
    return newUser;
  },

  updateUser(id, updates) {
    users = readJSON(USERS_FILE, users);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    writeJSON(USERS_FILE, users);
    return users[index];
  },

  // Sessions (30-day HttpOnly cookie session store)
  createSession(userId) {
    sessions = readJSON(SESSIONS_FILE, sessions);
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    sessions[sessionId] = {
      sessionId,
      userId,
      createdAt: Date.now(),
      expiresAt
    };

    writeJSON(SESSIONS_FILE, sessions);
    return { sessionId, expiresAt };
  },

  getSession(sessionId) {
    if (!sessionId) return null;
    sessions = readJSON(SESSIONS_FILE, sessions);
    const session = sessions[sessionId];
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      delete sessions[sessionId];
      writeJSON(SESSIONS_FILE, sessions);
      return null;
    }

    return session;
  },

  deleteSession(sessionId) {
    if (!sessionId) return;
    sessions = readJSON(SESSIONS_FILE, sessions);
    if (sessions[sessionId]) {
      delete sessions[sessionId];
      writeJSON(SESSIONS_FILE, sessions);
    }
  },

  // ==========================================
  // PER-USER FINANCIAL DATA STORAGE (ISOLATED)
  // ==========================================
  getUserFinancials(userId) {
    let financials = readJSON(FINANCIALS_FILE, {});
    if (!financials[userId]) {
      // If benchmark user, initialize with demo records; otherwise start clean
      const isAlex = userId === 'usr_alex_01';
      financials[userId] = {
        preferences: {
          startingBalance: isAlex ? 45000 : 0,
          safetyBuffer: isAlex ? 25000 : 15000,
          defaultHorizonDays: 30,
          defaultScenario: 'expected',
          incomeFrequency: 'Irregular / Milestone-based',
          essentialExpenseAssumptions: 'Strict essential only',
          lowBalanceAlertThreshold: isAlex ? 20000 : 10000,
          billReminderLeadDays: 3,
          notificationsEnabled: true
        },
        incomes: isAlex ? BENCHMARK_DEMO_INCOMES : [],
        expenses: isAlex ? BENCHMARK_DEMO_EXPENSES : [],
        leanSavings: {
          weeks: 4,
          expectedLowIncomePerWeek: isAlex ? 5000 : 0,
          essentialWeeklyExpenses: isAlex ? 12000 : 0,
          currentDesignatedReserve: isAlex ? 14000 : 0,
          weeklyContribution: isAlex ? 3500 : 0
        },
        notifications: isAlex ? BENCHMARK_DEMO_NOTIFICATIONS : [
          {
            id: 'notif_welcome',
            title: 'Welcome to Uncertain Income Planner',
            description: 'Set your initial balance and record your first expected client milestone or gig payment.',
            relatedRecord: 'profile',
            date: new Date().toISOString().split('T')[0],
            severity: 'info',
            isRead: false,
            actionPage: 'income'
          }
        ],
        scenarios: []
      };
      writeJSON(FINANCIALS_FILE, financials);
    }
    return financials[userId];
  },

  updateUserPreferences(userId, prefs) {
    const data = this.getUserFinancials(userId);
    data.preferences = { ...data.preferences, ...prefs };
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return data.preferences;
  },

  addIncome(userId, incomeData) {
    const data = this.getUserFinancials(userId);
    const newIncome = {
      ...incomeData,
      id: `inc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      amount: Number(incomeData.amount || 0),
      createdAt: new Date().toISOString()
    };
    data.incomes.unshift(newIncome);
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return newIncome;
  },

  updateIncome(userId, incomeId, updates) {
    const data = this.getUserFinancials(userId);
    const idx = data.incomes.findIndex(i => i.id === incomeId);
    if (idx === -1) return null;

    data.incomes[idx] = {
      ...data.incomes[idx],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : data.incomes[idx].amount,
      updatedAt: new Date().toISOString()
    };
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return data.incomes[idx];
  },

  deleteIncome(userId, incomeId) {
    const data = this.getUserFinancials(userId);
    data.incomes = data.incomes.filter(i => i.id !== incomeId);
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return true;
  },

  addExpense(userId, expenseData) {
    const data = this.getUserFinancials(userId);
    const newExpense = {
      ...expenseData,
      id: `exp_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      amount: Number(expenseData.amount || 0),
      status: expenseData.status || 'unpaid',
      createdAt: new Date().toISOString()
    };
    data.expenses.unshift(newExpense);
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return newExpense;
  },

  updateExpense(userId, expenseId, updates) {
    const data = this.getUserFinancials(userId);
    const idx = data.expenses.findIndex(e => e.id === expenseId);
    if (idx === -1) return null;

    data.expenses[idx] = {
      ...data.expenses[idx],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : data.expenses[idx].amount,
      updatedAt: new Date().toISOString()
    };
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return data.expenses[idx];
  },

  deleteExpense(userId, expenseId) {
    const data = this.getUserFinancials(userId);
    data.expenses = data.expenses.filter(e => e.id !== expenseId);
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return true;
  },

  updateSavings(userId, updates) {
    const data = this.getUserFinancials(userId);
    data.leanSavings = { ...data.leanSavings, ...updates };
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return data.leanSavings;
  },

  contributeSavings(userId, amount) {
    const data = this.getUserFinancials(userId);
    const addAmt = Number(amount || 0);
    if (addAmt > 0) {
      data.leanSavings.currentDesignatedReserve = (data.leanSavings.currentDesignatedReserve || 0) + addAmt;
      const financials = readJSON(FINANCIALS_FILE, {});
      financials[userId] = data;
      writeJSON(FINANCIALS_FILE, financials);
    }
    return data.leanSavings;
  },

  markNotificationRead(userId, notifId) {
    const data = this.getUserFinancials(userId);
    data.notifications = data.notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n);
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return true;
  },

  markAllNotificationsRead(userId) {
    const data = this.getUserFinancials(userId);
    data.notifications = data.notifications.map(n => ({ ...n, isRead: true }));
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return true;
  },

  clearNotifications(userId) {
    const data = this.getUserFinancials(userId);
    data.notifications = [];
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return true;
  },

  saveScenario(userId, scenario) {
    const data = this.getUserFinancials(userId);
    const newScenario = {
      ...scenario,
      id: `scen_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      createdAt: new Date().toISOString()
    };
    data.scenarios.unshift(newScenario);
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = data;
    writeJSON(FINANCIALS_FILE, financials);
    return newScenario;
  },

  resetUserToDemo(userId) {
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = {
      preferences: {
        startingBalance: 45000,
        safetyBuffer: 25000,
        defaultHorizonDays: 30,
        defaultScenario: 'expected',
        incomeFrequency: 'Irregular / Milestone-based',
        essentialExpenseAssumptions: 'Strict essential only',
        lowBalanceAlertThreshold: 20000,
        billReminderLeadDays: 3,
        notificationsEnabled: true
      },
      incomes: BENCHMARK_DEMO_INCOMES,
      expenses: BENCHMARK_DEMO_EXPENSES,
      leanSavings: {
        weeks: 4,
        expectedLowIncomePerWeek: 5000,
        essentialWeeklyExpenses: 12000,
        currentDesignatedReserve: 14000,
        weeklyContribution: 3500
      },
      notifications: BENCHMARK_DEMO_NOTIFICATIONS,
      scenarios: []
    };
    writeJSON(FINANCIALS_FILE, financials);
    return financials[userId];
  },

  clearUserData(userId) {
    const financials = readJSON(FINANCIALS_FILE, {});
    financials[userId] = {
      preferences: {
        startingBalance: 0,
        safetyBuffer: 15000,
        defaultHorizonDays: 30,
        defaultScenario: 'expected',
        incomeFrequency: 'Irregular / Milestone-based',
        essentialExpenseAssumptions: 'Strict essential only',
        lowBalanceAlertThreshold: 10000,
        billReminderLeadDays: 3,
        notificationsEnabled: true
      },
      incomes: [],
      expenses: [],
      leanSavings: {
        weeks: 4,
        expectedLowIncomePerWeek: 0,
        essentialWeeklyExpenses: 0,
        currentDesignatedReserve: 0,
        weeklyContribution: 0
      },
      notifications: [],
      scenarios: []
    };
    writeJSON(FINANCIALS_FILE, financials);
    return financials[userId];
  }
};

