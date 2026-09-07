import { useLocation } from 'react-router-dom';
import type { ProgressRole } from '@/types';

/** نقش کاربر از پیشوند مسیر — منبع واحد برای تمام صفحات role-aware (سه نقش: زنجیره‌دار/مشارکت‌کننده/مزرعه‌دار). */
export function useRole(): ProgressRole {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/supplier')) return 'supplier';
  return 'farm';
}
