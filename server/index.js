import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  processGoogleAuth,
  linkGoogleAccount,
  sanitizeUser,
  setSessionCookie
} from './auth.js';
import { db, verifyPassword, hashPassword } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const APP_ORIGIN = process.env.APP_ORIGIN || 'http://localhost:5174';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    APP_ORIGIN,
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

// Session authentication middleware
function authenticate(req, res, next) {
  const sessionId = req.cookies.session_token;
  if (!sessionId) {
    req.user = null;
    return next();
  }

  const session = db.getSession(sessionId);
  if (!session) {
    req.user = null;
    return next();
  }

  const user = db.getUserById(session.userId);
  req.user = user || null;
  next();
}

app.use(authenticate);

// ==========================================
// AUTHENTICATION API ROUTES
// ==========================================

// 1. Google OAuth Authentication Endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential token' });
    }

    const result = await processGoogleAuth({ token: credential });

    // Handle account conflict (Requirement 8)
    if (result.status === 'account_conflict') {
      return res.status(409).json({
        code: result.conflictType,
        message: result.message,
        email: result.email,
        googleSub: result.googleSub,
        pendingCredential: credential
      });
    }

    // Success: create session & set HttpOnly cookie (Requirement 9)
    const { sessionId } = db.createSession(result.user.id);
    setSessionCookie(res, sessionId);

    return res.json({
      success: true,
      user: sanitizeUser(result.user),
      isNewUser: Boolean(result.isNewUser)
    });
  } catch (err) {
    console.error('Google authentication error:', err.message);
    return res.status(401).json({
      error: 'Google authentication failed',
      details: err.message
    });
  }
});

// 2. Link Existing Local Account with Google (Requirement 8)
app.post('/api/auth/google/link', async (req, res) => {
  try {
    const { email, password, credential } = req.body;
    if (!email || !password || !credential) {
      return res.status(400).json({ error: 'Email, password, and Google credential are required to link accounts' });
    }

    const updatedUser = await linkGoogleAccount({ email, password, token: credential });
    const { sessionId } = db.createSession(updatedUser.id);
    setSessionCookie(res, sessionId);

    return res.json({
      success: true,
      message: 'Google account linked successfully',
      user: sanitizeUser(updatedUser)
    });
  } catch (err) {
    console.error('Account linking error:', err.message);
    return res.status(400).json({
      error: 'Failed to link account',
      details: err.message
    });
  }
});

// 3. Email & Password Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { sessionId } = db.createSession(user.id);
    setSessionCookie(res, sessionId);

    return res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// 4. Email & Password Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ error: 'Valid email and password with at least 8 characters are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const newUser = db.createUser({
      email,
      name: name || 'Planner User',
      password,
      authProvider: 'local',
      onboardingCompleted: false
    });

    const { sessionId } = db.createSession(newUser.id);
    setSessionCookie(res, sessionId);

    return res.json({
      success: true,
      user: sanitizeUser(newUser),
      isNewUser: true
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// 5. Check Current Session (me)
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
    user: sanitizeUser(req.user)
  });
});

// 6. Sign Out
app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.cookies.session_token;
  if (sessionId) {
    db.deleteSession(sessionId);
  }

  res.clearCookie('session_token', {
    path: '/',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });

  return res.json({ success: true, message: 'Logged out successfully' });
});

// 7. Complete Onboarding
app.post('/api/auth/onboarding', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const updatedUser = db.updateUser(req.user.id, {
    onboardingCompleted: true
  });

  return res.json({
    success: true,
    user: sanitizeUser(updatedUser)
  });
});

// 8. Health and Configuration Diagnostic
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'healthy',
    googleClientIdConfigured: Boolean(process.env.GOOGLE_CLIENT_ID),
    googleClientIdSnippet: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.slice(0, 15) + '...' : 'none',
    appOrigin: APP_ORIGIN,
    serverTime: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[FinSight Auth Server] Running on http://localhost:${PORT}`);
  console.log(`[FinSight Auth Server] Authorized origin: ${APP_ORIGIN}`);
  console.log(`[FinSight Auth Server] Google Client ID loaded: ${process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO'}`);
});
