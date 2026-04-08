import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const AUTH_TOKEN_KEY = 'khampha_auth_token';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return '';
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failure in strict privacy contexts.
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage remove failure in strict privacy contexts.
  }
}

/** Role labels are now handled via i18n in components */

const AuthContext = createContext(null);

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => safeStorageGet(AUTH_TOKEN_KEY) || '');
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const logout = useCallback(() => {
    safeStorageRemove(AUTH_TOKEN_KEY);
    setToken('');
    setUser(null);
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username?.trim(),
        password,
      }),
    });

    const payload = await readJson(response);
    if (!response.ok) {
      throw new Error(payload.message || 'Login failed.');
    }

    safeStorageSet(AUTH_TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user || null);
    return payload.user;
  }, []);

  const refreshProfile = useCallback(
    async (activeToken = token) => {
      if (!activeToken) {
        setUser(null);
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const payload = await readJson(response);
      if (!response.ok) {
        throw new Error(payload.message || 'Could not fetch user profile.');
      }

      setUser(payload.user || null);
      return payload.user;
    },
    [token]
  );

  const authRequest = useCallback(
    async (path, options = {}) => {
      const tokenFromStorage = safeStorageGet(AUTH_TOKEN_KEY);
      const activeToken = token || tokenFromStorage;
      if (!activeToken) {
        throw new Error('Not authenticated.');
      }

      const isFormData = options.body instanceof FormData;
      const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
        Authorization: `Bearer ${activeToken}`,
      };

      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });

      const payload = await readJson(response);

      if (response.status === 401 || response.status === 403) {
        logout();
      }

      if (!response.ok) {
        throw new Error(payload.message || 'Request failed.');
      }

      return payload;
    },
    [logout, token]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!token) {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        await refreshProfile(token);
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [logout, refreshProfile, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isBootstrapping,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshProfile,
      authRequest,
      apiBaseUrl: API_BASE_URL,
    }),
    [authRequest, isBootstrapping, login, logout, refreshProfile, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
