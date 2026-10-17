/**
 * UNCERTAIN INCOME PLANNER - CLIENT AUTHENTICATION SERVICE
 * Interfaces with the backend session API and Google Identity Services
 */

const API_BASE = '/api/auth';

export const authService = {
  /**
   * Sends Google ID credential token to the backend for cryptographic validation
   */
  async verifyGoogleCredential(credential) {
    const res = await fetch(`${API_BASE}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential })
    });

    const data = await res.json();
    if (!res.ok) {
      const error = new Error(data.details || data.message || data.error || 'Google authentication failed');
      error.code = data.code;
      error.details = data;
      throw error;
    }

    return data;
  },

  /**
   * Securely links an existing local account with Google credentials after verifying password
   */
  async linkGoogleAccount({ email, password, credential }) {
    const res = await fetch(`${API_BASE}/google/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, credential })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.details || data.error || 'Failed to link account');
    }

    return data;
  },

  /**
   * Local Email/Password Login
   */
  async loginWithEmail(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password');
    }

    return data;
  },

  /**
   * Local Email/Password Registration
   */
  async registerWithEmail(email, name, password) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, name, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  },

  /**
   * Checks current HttpOnly cookie session on app load
   */
  async getCurrentUser() {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.authenticated ? data.user : null;
    } catch {
      return null;
    }
  },

  /**
   * Signs out current user and clears HttpOnly cookie session
   */
  async logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Logout network error:', e);
    }
  },

  /**
   * Marks onboarding as complete for user
   */
  async completeOnboarding() {
    const res = await fetch(`${API_BASE}/onboarding`, {
      method: 'POST',
      credentials: 'include'
    });
    return res.json();
  }
};
