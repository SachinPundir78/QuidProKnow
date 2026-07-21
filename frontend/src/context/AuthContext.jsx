import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('quidproknow_user');
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('quidproknow_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('quidproknow_token'));

  const persist = (newToken, newUser) => {
    localStorage.setItem('quidproknow_token', newToken);
    localStorage.setItem('quidproknow_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('quidproknow_token');
    localStorage.removeItem('quidproknow_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await authService.profile();
    localStorage.setItem('quidproknow_user', JSON.stringify(fresh));
    setUser(fresh);
    return fresh;
  }, []);

  const updateLocalUser = useCallback((partialUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...partialUser };
      localStorage.setItem('quidproknow_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, refreshUser, updateLocalUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
