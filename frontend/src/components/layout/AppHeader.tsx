import { Layout, Typography, theme } from 'antd';
import { useLocation } from 'react-router-dom';
import { panelTitle, LogoutButton } from './navItems';
import { ThemeToggle } from './ThemeToggle';
import { HEADER_DESKTOP_H } from '@/config/layout';
import { pivaTokens } from '@/config/theme';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  height?: number;
  paddingInline?: number;
  fontSize?: number;
  sticky?: boolean;
}

/**
 * هدر مشترک موبایل (TopAppBar) و دسکتاپ — کلید تم سمت راست، عنوان پنل وسط، دکمه خروج چپ.
 */
export function AppHeader({
  height = HEADER_DESKTOP_H,
  paddingInline = 24,
  fontSize = 15,
  sticky = false,
}: AppHeaderProps) {
  const location = useLocation();
  const { token } = theme.useToken();

  return (
    <AntHeader style={{
      background: token.colorBgContainer,
      paddingInline,
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: pivaTokens.shadowHeader,
      borderBottom: `1px solid ${token.colorBorderSecondary}`, // مرز هدر/بدنه در تم تیره
      position: sticky ? 'sticky' : undefined,
      top: sticky ? 0 : undefined,
      zIndex: sticky ? 10 : undefined,
      height,
      lineHeight: `${height}px`,
    }}>
      <ThemeToggle />
      <Text strong style={{ fontSize }}>
        {panelTitle(location.pathname)}
      </Text>
      <LogoutButton />
    </AntHeader>
  );
}
