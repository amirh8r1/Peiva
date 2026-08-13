import { Layout, Menu, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getNavItems, isNavItemActive, panelTitle, LogoutButton } from './navItems';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

/**
 * شل دسکتاپ (عرض ≥ ۷۶۸px): سایدبار راست + هدر + محتوای وسط با حداکثر عرض.
 * Sider باید اولین فرزند Layout بماند تا در حالت RTL سمت راست رندر شود.
 * ساختار flex column ارتفاع‌محدود مثل شل موبایل حفظ می‌شود تا صفحات بدون تغییر اسکرول کار کنند.
 */
export function DesktopLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = getNavItems(location.pathname);
  const selectedKey = items.find((item) => isNavItemActive(item, location.pathname))?.key;

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider width={220} style={{ overflow: 'auto' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', paddingInline: 20 }}>
          <Text strong style={{ fontSize: 20, color: '#fff' }}>پیوا</Text>
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
        <Header style={{
          background: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', paddingInline: 24,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <div style={{ width: 48 }} />
          <Text strong style={{ fontSize: 15 }}>
            {panelTitle(location.pathname)}
          </Text>
          <LogoutButton />
        </Header>
        <Content style={{
          flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          width: '100%', maxWidth: 1100, margin: '0 auto', padding: '0 32px 24px',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
