'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getMe, getToken, type User } from '@/lib/api/auth';
import { canAccessAdminPanel, isAdminRole, isManagerRole } from '@/lib/roles';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  canAccessPanel: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => { throw new Error('AuthProvider not mounted'); },
  logout: async () => {},
  isAuthenticated: false,
  isAdmin: false,
  isManager: false,
  canAccessPanel: false,
  token: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = getToken();
    if (t) {
      setToken(t);
      getMe().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.accessToken);
    const u = await getMe();
    if (!u) throw new Error('Unable to load profile');
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
  }, []);

  const isAdmin = isAdminRole(user?.role);
  const isManager = isManagerRole(user?.role);
  const canAccessPanel = canAccessAdminPanel(user?.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user, isAdmin, isManager, canAccessPanel, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
