import { useLocation } from 'react-router-dom';
import type { ProgressRole } from '@/types';

/** نقش کاربر از پیشوند مسیر — منبع واحد برای تمام صفحات role-aware. */
export function useRole(): ProgressRole {
  return useLocation().pathname.startsWith('/supplier') ? 'supplier' : 'farm';
}
