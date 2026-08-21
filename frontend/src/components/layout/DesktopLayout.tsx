import { Layout, Menu, Typography, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getNavItems, isNavItemActive } from './navItems';
import { AppHeader } from './AppHeader';
import { PageTransition } from './PageTransition';
import { SIDER_W, HEADER_DESKTOP_H, CONTENT_DESKTOP_MAX, CONTENT_PAD_DESKTOP } from '@/config/layout';

const { Sider, Content } = Layout;
const { Text } = Typography;

/**
 * شل دسکتاپ (عرض ≥ ۷۶۸px): سایدبار راست + هدر + محتوای وسط با حداکثر عرض.
 * Sider باید اولین فرزند Layout بماند تا در حالت RTL سمت راست رندر شود.
 * ساختار flex column ارتفاع‌محدود مثل شل موبایل حفظ می‌شود تا صفحات بدون تغییر اسکرول کار کنند.
 */
export function DesktopLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { items } = getNavItems(location.pathname);
  const selectedKey = items.find((item) => isNavItemActive(item, location.pathname))?.key;

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider width={SIDER_W} style={{ overflow: 'auto' }}>
        <div style={{ height: HEADER_DESKTOP_H, display: 'flex', alignItems: 'center', paddingInline: 20 }}>
          <Text strong style={{ fontSize: 20, color: token.colorTextLightSolid }}>پیوا</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={items.map((item) => ({ key: item.key, icon: item.icon, label: item.label }))}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AppHeader />
        <Content style={{
          flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          width: '100%', maxWidth: CONTENT_DESKTOP_MAX, margin: '0 auto', padding: `0 24px ${CONTENT_PAD_DESKTOP}px`,
        }}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Content>
      </Layout>
    </Layout>
  );
}
