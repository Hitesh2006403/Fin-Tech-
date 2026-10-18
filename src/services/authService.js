/**
 * UNCERTAIN INCOME PLANNER - CLIENT AUTHENTICATION SERVICE
 * Interfaces with the backend session API and Google Identity Services
 */

const API_BASE = '/api/auth';

export function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('uip_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // LocalStorage unavailable
  }
  return headers;
}

export const authService = {
  /**
   * Sends Google ID credential token to the backend for cryptographic validation
   */
  async verifyGoogleCredential(credential) {
    const res = await fetch(`${API_BASE}/google`, {
      method: 'POST',
      headers: getAuthHeaders(),
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

    if (data.token) {
      try { localStorage.setItem('uip_auth_token', data.token); } catch {}
    }

    return data;
  },

  /**
   * Securely links an existing local account with Google credentials after verifying password
   */
  async linkGoogleAccount({ email, password, credential }) {
    const res = await fetch(`${API_BASE}/google/link`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, password, credential })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.details || data.error || 'Failed to link account');
    }

    if (data.token) {
      try { localStorage.setItem('uip_auth_token', data.token); } catch {}
    }

    return data;
  },

  /**
   * Local Email/Password Login
   */
  async loginWithEmail(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password');
    }

    if (data.token) {
      try { localStorage.setItem('uip_auth_token', data.token); } catch {}
    }

    return data;
  },

  /**
   * Local Email/Password Registration
   */
  async registerWithEmail(email, name, password) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email, name, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    if (data.token) {
      try { localStorage.setItem('uip_auth_token', data.token); } catch {}
    }

    return data;
  },

  /**
   * Checks current HttpOnly cookie session or token on app load
   */
  async getCurrentUser() {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
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
   * Signs out current user and clears HttpOnly cookie session & token
   */
  async logout() {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
    } catch (e) {
      console.warn('Logout network error:', e);
    } finally {
      try { localStorage.removeItem('uip_auth_token'); } catch {}
    }
  },

  /**
   * Marks onboarding as complete for user
   */
  async completeOnboarding() {
    const res = await fetch(`${API_BASE}/onboarding`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return res.json();
  }
};
