import { Dropdown, Button, theme } from 'antd';
import { UserOutlined, SunOutlined, MoonOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { toPersianDigits } from '@/utils/format';
import { panelTitle } from './navItems';
import type { MenuProps } from 'antd';

/**
 * منوی حساب — سوییچ تم و خروج بعد از لاگین در یک منوی آواتار جمع شده‌اند
 * تا هدر شلوغ نشود (کانونشن: اکشن‌های سطح حساب پشت آواتار).
 * زنگوله بیرون منو می‌ماند — بج نوتیفیکیشن باید همیشه قابل دیدن باشد.
 */
export function AccountMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();
  const { session, signOut } = useAuth();
  const { token } = theme.useToken();
  const isDark = mode === 'dark';

  const items: MenuProps['items'] = [
    {
      key: 'panel',
      label: session?.phone ? `${panelTitle(location.pathname)} — ${toPersianDigits(session.phone)}` : panelTitle(location.pathname),
      disabled: true,
    },
    {
      key: 'theme',
      icon: isDark ? <SunOutlined /> : <MoonOutlined />,
      label: isDark ? 'تغییر به تم روشن' : 'تغییر به تم تیره',
      onClick: toggleTheme,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <ArrowRightOutlined />,
      label: 'خروج',
      danger: true,
      onClick: () => {
        signOut();
        navigate('/');
      },
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomLeft">
      <Button
        type="text"
        aria-label="حساب کاربری"
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          padding: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: token.colorFillSecondary,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <UserOutlined style={{ fontSize: 16, color: token.colorTextSecondary }} />
      </Button>
    </Dropdown>
  );
}
