import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  PlusCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: 'داشبورد',
  },
  {
    key: 'divider-1',
    type: 'divider',
  },
  {
    key: '/chains/new',
    icon: <PlusCircleOutlined />,
    label: 'ایجاد زنجیره جدید',
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = (): string => {
    const path = location.pathname;
    if (path === '/') return '/';
    if (path === '/chains/new') return '/chains/new';
    if (path.startsWith('/chains/')) return '';
    return '/';
  };

  return (
    <Sider
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          margin: '0 16px',
        }}
      >
        🐔 پلتفرم فنون
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ marginTop: 8 }}
      />

      {/* Quick CTA */}
      <div style={{ padding: '12px 16px', marginTop: 24 }}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          block
          size="large"
          onClick={() => navigate('/chains/new')}
          style={{
            height: 48,
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          زنجیره جدید
        </Button>
      </div>
    </Sider>
  );
}
