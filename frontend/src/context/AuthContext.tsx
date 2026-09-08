import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ProgressRole } from '@/types';

/** نقش کاربر لاگین‌شده — همان ProgressRole سامانه (منبع واحد نقش‌ها). */
export type AuthRole = ProgressRole;

export interface Session {
  role: AuthRole;
  phone: string;
  signedInAt: string; // ISO timestamp — AI-friendly
}

const STORAGE_KEY = 'piva-session-v1';

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed || !parsed.role || !parsed.phone) return null;
    return parsed;
  } catch { /* ignore */ }
  return null;
}

interface AuthContextValue {
  session: Session | null;
  signIn: (role: AuthRole, phone: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * نشست ورود (شماره همراه + نقش) — منبع واحد احراز هویت اپ.
 * پس از تأیید OTP در LoginPage ذخیره و در AccountMenu (خروج) پاک می‌شود.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);

  const signIn = (role: AuthRole, phone: string) => {
    const next: Session = { role, phone, signedInAt: new Date().toISOString() };
    setSession(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const signOut = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
