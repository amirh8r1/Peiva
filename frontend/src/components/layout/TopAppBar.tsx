import { Layout, Typography, Button } from 'antd';
import { MenuOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface TopAppBarProps { onMenuClick: () => void; }

export function TopAppBar({ onMenuClick }: TopAppBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSupplier = location.pathname.startsWith('/supplier');

  return (
    <AntHeader style={{
      background: '#fff', padding: '0 12px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      position: 'sticky', top: 0, zIndex: 10, height: 48, lineHeight: '48px',
    }}>
      <Button type="text" icon={<MenuOutlined />} onClick={onMenuClick} style={{ fontSize: 18 }} />
      <Text strong style={{ fontSize: 14 }}>
        {isSupplier ? 'پنل تأمین‌کننده' : 'پنل مزرعه‌دار'}
      </Text>
      <Button type="text" icon={<ArrowRightOutlined />} onClick={() => navigate('/')} style={{ fontSize: 14 }}>
        خروج
      </Button>
    </AntHeader>
  );
}
