import { createContext, useMemo, useState, type ReactNode } from 'react';
import { type AuthCtx } from './authTypes';

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const value = useMemo<AuthCtx>(() => ({
    isAuthenticated: !!token,
    login: (t: string) => { localStorage.setItem('token', t); setToken(t); },
    logout: () => { localStorage.removeItem('token'); setToken(null); },
  }), [token]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { Ctx };
