import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, Menu, Typography, Divider, Space } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useRole } from '@/context/RoleContext';

const { Text } = Typography;

interface AppDrawerProps {
  open: boolean;
  onClose: () => void;
}

type MenuItem = Required<MenuProps>['items'][number];

export function AppDrawer({ open, onClose }: AppDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, roleLabel } = useRole();

  const isFarmOwner = role === 'farm-owner';

  const items: MenuItem[] = isFarmOwner
    ? [
        { key: '/', icon: <HomeOutlined />, label: 'داشبورد' },
        { key: '/proposals', icon: <FileTextOutlined />, label: 'قراردادهای پیشنهادی' },
        { key: '/contracts', icon: <CheckCircleOutlined />, label: 'قراردادهای جاری' },
      ]
    : [
        { key: '/', icon: <HomeOutlined />, label: 'داشبورد' },
        { key: '/chains/new', icon: <PlusCircleOutlined />, label: 'ایجاد زنجیره جدید' },
        { key: '/contracts', icon: <CheckCircleOutlined />, label: 'قراردادها' },
      ];

  const onNavigate = (key: string) => {
    navigate(key);
    onClose();
  };

  const getSelected = () => {
    const p = location.pathname;
    if (p === '/') return '/';
    if (p.startsWith('/proposals')) return '/proposals';
    if (p === '/chains/new') return '/chains/new';
    if (p.startsWith('/contracts')) return '/contracts';
    return '';
  };

  return (
    <Drawer
      title="پلتفرم فنون"
      placement="right"
      onClose={onClose}
      open={open}
      width={260}
      styles={{ body: { padding: 0 } }}
    >
      {/* User role info */}
      <div style={{ padding: '12px 16px', background: '#fafafa' }}>
        <Space>
          <UserOutlined />
          <Text strong>کاربر آزمایشی</Text>
        </Space>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          نقش فعلی: {roleLabel}
        </Text>
      </div>
      <Divider style={{ margin: 0 }} />

      <Menu
        mode="inline"
        selectedKeys={[getSelected()]}
        items={items}
        onClick={({ key }) => onNavigate(key)}
        style={{ borderInlineEnd: 'none' }}
      />
    </Drawer>
  );
}
