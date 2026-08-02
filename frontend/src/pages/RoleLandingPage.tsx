import { useNavigate } from 'react-router-dom';
import { Button, Card, Typography } from 'antd';
import { ShopOutlined, BankOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export function RoleLandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: 400, margin: '0 auto', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: 24, gap: 20,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ marginBottom: 4 }}>🐔 پلتفرم فنون</Title>
        <Text type="secondary">سامانه مدیریت زنجیره تأمین مرغ گوشتی</Text>
        <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 8 }}>
          نقش خود را انتخاب کنید
        </Text>
      </div>

      <Card hoverable style={{ borderRadius: 12, border: '2px solid #389e0d' }}
        onClick={() => navigate('/supplier')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ShopOutlined style={{ fontSize: 36, color: '#389e0d' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>تأمین‌کننده نهاده</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>ایجاد قرارداد، مدیریت دوره‌های پرورش، انتخاب مزرعه</Text>
          </div>
        </div>
      </Card>

      <Card hoverable style={{ borderRadius: 12, border: '2px solid #1677ff' }}
        onClick={() => navigate('/farm')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <BankOutlined style={{ fontSize: 36, color: '#1677ff' }} />
          <div>
            <Title level={4} style={{ margin: 0 }}>مزرعه‌دار</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>مشاهده قراردادهای پیشنهادی، تأمین تضامین</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
