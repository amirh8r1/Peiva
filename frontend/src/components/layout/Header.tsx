import { Layout, Typography, Space, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

export function Header() {
  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 9,
        height: 52,
        lineHeight: '52px',
      }}
    >
      <Space>
        <Text strong style={{ fontSize: 15 }}>
          سامانه مدیریت زنجیره تأمین مرغ گوشتی
        </Text>
      </Space>

      <Space size="small">
        <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>فاز توسعه</Tag>
        <UserOutlined />
        <Text style={{ fontSize: 13 }}>کاربر آزمایشی</Text>
      </Space>
    </AntHeader>
  );
}
