import { HomeOutlined, FileTextOutlined, PlusOutlined, CheckCircleOutlined, InboxOutlined } from '@ant-design/icons';
import type { ProgressRole } from '@/types';

export interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  /** آیتمی که در BottomNav موبایل به‌صورت FAB رندر می‌شود؛ در سایدبار دسکتاپ آیتم عادی است. */
  fab?: boolean;
}

export const adminNavItems: NavItem[] = [
  { key: '/admin', icon: <HomeOutlined />, label: 'داشبورد', path: '/admin' },
  { key: '/admin/requests', icon: <InboxOutlined />, label: 'درخواست‌ها', path: '/admin/requests' },
  { key: '/admin/contracts', icon: <FileTextOutlined />, label: 'قراردادها', path: '/admin/contracts' },
];

export const supplierNavItems: NavItem[] = [
  { key: '/supplier', icon: <HomeOutlined />, label: 'داشبورد', path: '/supplier' },
  // باز کردن ویزارد: ناوبری به /supplier?new=1 — داشبورد پارامتر را می‌خواند و ویزارد را باز می‌کند
  { key: '/supplier?new=1', icon: <PlusOutlined />, label: 'سفارش جدید', path: '/supplier?new=1', fab: true },
  { key: '/supplier/contracts', icon: <FileTextOutlined />, label: 'قراردادها', path: '/supplier/contracts' },
];

export const farmNavItems: NavItem[] = [
  { key: '/farm', icon: <HomeOutlined />, label: 'داشبورد', path: '/farm' },
  { key: '/farm/contracts', icon: <CheckCircleOutlined />, label: 'قراردادها', path: '/farm/contracts' },
];

/** آیتم‌های ناوبری بر اساس نقش (پیشوند مسیر) — منبع واحد BottomNav و سایدبار دسکتاپ. */
export function getNavItems(pathname: string): { items: NavItem[]; role: ProgressRole } {
  if (pathname.startsWith('/admin')) return { items: adminNavItems, role: 'admin' };
  if (pathname.startsWith('/supplier')) return { items: supplierNavItems, role: 'supplier' };
  return { items: farmNavItems, role: 'farm' };
}

/** منطق واحد تشخیص آیتم فعال — مشترک بین موبایل و دسکتاپ. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.path === '/admin') return pathname === '/admin';
  if (item.path === '/supplier') return pathname === '/supplier';
  if (item.path === '/farm') return pathname === '/farm';
  return pathname.startsWith(item.path);
}

export function panelTitle(pathname: string): string {
  if (pathname.startsWith('/admin')) return 'پنل زنجیره‌دار';
  if (pathname.startsWith('/supplier')) return 'پنل مشارکت‌کننده';
  return 'پنل مزرعه‌دار';
}
