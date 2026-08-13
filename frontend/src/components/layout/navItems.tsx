import { Button } from 'antd';
import { ArrowRightOutlined, HomeOutlined, FileTextOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  /** آیتمی که در BottomNav موبایل به‌صورت FAB رندر می‌شود؛ در سایدبار دسکتاپ آیتم عادی است. */
  fab?: boolean;
}

export const supplierNavItems: NavItem[] = [
  { key: '/supplier', icon: <HomeOutlined />, label: 'داشبورد', path: '/supplier' },
  { key: '/supplier/contracts/new', icon: <PlusOutlined />, label: 'قرارداد جدید', path: '/supplier/contracts/new', fab: true },
  { key: '/supplier/contracts', icon: <FileTextOutlined />, label: 'قراردادها', path: '/supplier/contracts' },
];

export const farmNavItems: NavItem[] = [
  { key: '/farm', icon: <HomeOutlined />, label: 'داشبورد', path: '/farm' },
  { key: '/farm/proposals', icon: <FileTextOutlined />, label: 'پیشنهادات', path: '/farm/proposals' },
  { key: '/farm/contracts', icon: <CheckCircleOutlined />, label: 'جاری', path: '/farm/contracts' },
];

/** آیتم‌های ناوبری بر اساس نقش (پیشوند مسیر) — منبع واحد BottomNav و سایدبار دسکتاپ. */
export function getNavItems(pathname: string): { items: NavItem[]; isSupplier: boolean } {
  const isSupplier = pathname.startsWith('/supplier');
  return { items: isSupplier ? supplierNavItems : farmNavItems, isSupplier };
}

/** منطق واحد تشخیص آیتم فعال — همان منطق قبلی BottomNav، مشترک بین موبایل و دسکتاپ. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.path === '/supplier') return pathname === '/supplier';
  if (item.path === '/farm') return pathname === '/farm';
  if (item.path === '/supplier/contracts') return pathname.startsWith('/supplier/contracts') && pathname !== '/supplier/contracts/new';
  return pathname.startsWith(item.path);
}

export function panelTitle(pathname: string): string {
  return pathname.startsWith('/supplier') ? 'پنل تأمین‌کننده' : 'پنل مزرعه‌دار';
}

export function LogoutButton() {
  const navigate = useNavigate();
  return (
    <Button type="text" icon={<ArrowRightOutlined />} onClick={() => navigate('/')} style={{ fontSize: 14 }}>
      خروج
    </Button>
  );
}
