import { Layout, Typography, theme } from 'antd';
import { LogoutButton } from './navItems';
import { ThemeToggle } from './ThemeToggle';
import { LogoMark } from '@/components/ui/LogoMark';
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
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <ThemeToggle />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LogoMark size={28} />
        <Text strong style={{ fontSize, fontWeight: 800, color: pivaTokens.brandDeep, lineHeight: 1 }}>
          پیوا
        </Text>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <LogoutButton />
      </div>
    </AntHeader>
  );
}
