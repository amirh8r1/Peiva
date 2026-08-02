import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, Menu, Typography, Divider, Space } from 'antd';
import { HomeOutlined, FileTextOutlined, PlusCircleOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Text } = Typography;
type MenuItem = Required<MenuProps>['items'][number];

interface AppDrawerProps { open: boolean; onClose: () => void; }

export function AppDrawer({ open, onClose }: AppDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier');

  const items: MenuItem[] = isSupplier
    ? [
        { key: '/supplier', icon: <HomeOutlined />, label: 'داشبورد' },
        { key: '/supplier/contracts/new', icon: <PlusCircleOutlined />, label: 'ایجاد قرارداد جدید' },
        { key: '/supplier/contracts', icon: <FileTextOutlined />, label: 'قراردادها' },
      ]
    : [
        { key: '/farm', icon: <HomeOutlined />, label: 'داشبورد' },
        { key: '/farm/proposals', icon: <FileTextOutlined />, label: 'قراردادهای پیشنهادی' },
        { key: '/farm/contracts', icon: <CheckCircleOutlined />, label: 'قراردادهای جاری' },
      ];

  const onNavigate = (key: string) => { navigate(key); onClose(); };

  return (
    <Drawer title="پلتفرم فنون" placement="right" onClose={onClose} open={open} width={260} styles={{ body: { padding: 0 } }}>
      <div style={{ padding: '12px 16px', background: '#fafafa' }}>
        <Space><UserOutlined /><Text strong>{isSupplier ? 'تأمین‌کننده' : 'مزرعه‌دار'}</Text></Space>
      </div>
      <Divider style={{ margin: 0 }} />
      <Menu mode="inline" items={items} onClick={({ key }) => onNavigate(key)} style={{ borderInlineEnd: 'none' }} />
    </Drawer>
  );
}
