import { AppHeader } from './AppHeader';
import { TOPBAR_H } from '@/config/layout';

/** نوار بالای موبایل — هدر مشترک با سایز موبایل و حالت sticky. */
export function TopAppBar() {
  return <AppHeader height={TOPBAR_H} paddingInline={12} fontSize={14} sticky />;
}
