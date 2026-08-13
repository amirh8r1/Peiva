import { useEffect, useState } from 'react';
import { DESKTOP_QUERY } from '@/config/breakpoints';

/**
 * هوک matchMedia با listener زنده — تغییر سایز پنجره بدون رفرش منعکس می‌شود.
 * state اولیه سینکرون است تا در لود اولیه فلش طراحی موبایل/دسکتاپ دیده نشود.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** true = کاربر روی مانیتور/لپ‌تاپ (عرض ≥ ۷۶۸px) است. */
export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
