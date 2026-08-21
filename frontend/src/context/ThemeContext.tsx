import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import faIR from 'antd/locale/fa_IR';
import { antdTheme, antdThemeDark } from '@/config/theme';

export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'piva-theme-mode';

interface ThemeContextValue {
  mode: ResolvedTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * تم پیوا — فقط دو حالت روشن/تیره با سوییچ ساده.
 * بار اول (بدون انتخاب ذخیره‌شده): از تم سیستم شروع می‌شود و تغییرات سیستم را زنده دنبال می‌کند؛
 * با اولین سوییچ دستی، انتخاب در localStorage ماندگار می‌شود.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ResolvedTheme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [followsSystem, setFollowsSystem] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== 'light' && stored !== 'dark';
  });

  // تا وقتی کاربر دستی انتخاب نکرده، تغییر تم سیستم را زنده دنبال کن
  useEffect(() => {
    if (!followsSystem) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light');
    setMode(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [followsSystem]);

  const activeTheme = mode === 'dark' ? antdThemeDark : antdTheme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.colorScheme = mode; // اسکرول‌بار و کنترل‌های بومی هم عوض شوند
    // پیام/مودال‌های استاتیک antd (message/toast) هم با تم سوییچ شوند
    ConfigProvider.config({
      holderRender: (children) => <AntdApp>{children}</AntdApp>,
      theme: activeTheme,
    });
  }, [mode, activeTheme]);

  const toggleTheme = () => {
    const next: ResolvedTheme = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    setFollowsSystem(false);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ mode, toggleTheme }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={activeTheme} locale={faIR} direction="rtl">
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode باید داخل ThemeProvider استفاده شود');
  return ctx;
}
