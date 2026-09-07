import { Layout, Typography, theme } from 'antd';
import { useLocation } from 'react-router-dom';
import { AccountMenu } from './AccountMenu';
import { LogoMark } from '@/components/ui/LogoMark';
import { NotificationBell } from '@/features/supplier/components/NotificationBell';
import { pivaTokens } from '@/config/theme';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  height: number;
  paddingInline: number;
  fontSize: number;
  sticky?: boolean;
}

/**
 * هدر موبایل (فقط TopAppBar) — سه ناحیه هم‌عرض: کلید تم راست، برند دقیقاً وسط، خروج چپ.
 * دسکتاپ از DesktopHeader (تب‌های ناوبری) استفاده می‌کند.
 */
export function AppHeader({
  height,
  paddingInline,
  fontSize,
  sticky = false,
}: AppHeaderProps) {
  const { token } = theme.useToken();
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier');

  return (
    <AntHeader style={{
      background: token.colorBgContainer,
      paddingInline,
      display: 'flex', alignItems: 'center',
      boxShadow: pivaTokens.shadowHeader,
      borderBottom: `1px solid ${token.colorBorderSecondary}`, // مرز هدر/بدنه در تم تیره
      position: sticky ? 'sticky' : undefined,
      top: sticky ? 0 : undefined,
      zIndex: sticky ? 10 : undefined,
      height,
      lineHeight: `${height}px`,
    }}>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LogoMark size={28} />
        <Text strong style={{ fontSize, fontWeight: 800, color: pivaTokens.brandDeep, lineHeight: 1 }}>
          پیوا
        </Text>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
        {isSupplier && <NotificationBell />}
        <AccountMenu />
      </div>
    </AntHeader>
  );
}
