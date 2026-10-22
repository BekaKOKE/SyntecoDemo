'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe, getToken, type User } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, phone?: string, consent?: boolean, marketingConsent?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  token: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Hydrate user on mount
  useEffect(() => {
    const t = getToken();
    if (t) {
      setToken(t);
      getMe().then(u => { setUser(u); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.accessToken);
    const u = await getMe();
    setUser(u);
  }, []);

  const register = useCallback(async (firstName: string, lastName: string, email: string, password: string, phone?: string, consent = false, marketingConsent = false) => {
    const data = await apiRegister(firstName, lastName, email, password, phone, consent, marketingConsent);
    setToken(data.accessToken);
    const u = await getMe();
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
