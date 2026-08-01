import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type UserRole = 'farm-owner' | 'feed-supplier';

const ROLE_KEY = 'fonoon-user-role';

interface RoleContextValue {
  role: UserRole;
  setRole: (r: UserRole) => void;
  toggleRole: () => void;
  roleLabel: string;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const ROLE_LABELS: Record<UserRole, string> = {
  'farm-owner': 'مزرعه‌دار',
  'feed-supplier': 'تأمین‌کننده نهاده',
};

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem(ROLE_KEY);
    return stored === 'feed-supplier' ? 'feed-supplier' : 'farm-owner';
  });

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    localStorage.setItem(ROLE_KEY, r);
  }, []);

  const toggleRole = useCallback(() => {
    setRole(role === 'farm-owner' ? 'feed-supplier' : 'farm-owner');
  }, [role, setRole]);

  return (
    <RoleContext.Provider
      value={{ role, setRole, toggleRole, roleLabel: ROLE_LABELS[role] }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
