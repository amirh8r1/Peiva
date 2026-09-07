import { Button, Layout, Typography, theme } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { getNavItems, isNavItemActive, LogoutButton } from './navItems';
import { ThemeToggle } from './ThemeToggle';
import { LogoMark } from '@/components/ui/LogoMark';
import { HEADER_DESKTOP_H } from '@/config/layout';
import { pivaTokens, pivaType } from '@/config/theme';

const { Header } = Layout;
const { Text } = Typography;

/**
 * هدر دسکتاپ (≥ ۷۶۸px): وردمارک راست + تب‌های ناوبری افقی، توگل تم و خروج در چپ.
 * در RTL ترتیب DOM = ترتیب بصری راست→چپ، پس وردمارک اولین فرزند است.
 * تب‌ها از منبع واحد navItems.tsx می‌آیند (آیتم fab به‌صورت تب عادی رندر می‌شود).
 */
export function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { items } = getNavItems(location.pathname);

  return (
    <Header style={{
      height: HEADER_DESKTOP_H,
      lineHeight: `${HEADER_DESKTOP_H}px`,
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: pivaTokens.shadowHeader,
      paddingInline: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LogoMark size={36} />
        <Text strong style={{
          fontSize: 20,
          fontWeight: 800,
          color: pivaTokens.brandDeep,
          lineHeight: 1,
        }}>
          پیوا
        </Text>
        <nav aria-label="ناوبری اصلی" style={{ display: 'flex', gap: 4, marginInlineStart: 16 }}>
          {items.map((item) => {
            const active = isNavItemActive(item, location.pathname);
            return (
              <Button
                key={item.key}
                type="text"
                icon={item.icon}
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(item.path)}
                style={{
                  height: 36,
                  borderRadius: 999,
                  fontSize: pivaType.tab.fontSize,
                  fontWeight: pivaType.tab.fontWeight,
                  paddingInline: 14,
                  color: active ? token.colorPrimary : token.colorTextSecondary,
                  background: active ? token.colorPrimaryBg : undefined,
                  transition: `background-color var(--piva-duration-tab) var(--piva-ease-enter), color var(--piva-duration-tab) var(--piva-ease-enter)`,
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
      <div style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </Header>
  );
}
