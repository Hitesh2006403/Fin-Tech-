import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
  }
};
