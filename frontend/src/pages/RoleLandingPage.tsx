import { useNavigate } from 'react-router-dom';
import { Card, Typography } from 'antd';
import { ApartmentOutlined, TeamOutlined } from '@ant-design/icons';
import { useIsDesktop } from '@/hooks/useResponsive';

const { Title, Text } = Typography;

export function RoleLandingPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  return (
    <div style={{
      maxWidth: isDesktop ? 720 : 400, margin: '0 auto', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center',
      padding: 24, gap: 20,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title style={{ marginBottom: 0, fontSize: 48, fontWeight: 900, lineHeight: 1.2 }}>
          پیوا
        </Title>
        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginTop: 4 }}>
          مزرعه ای به وسعت ایران
        </Text>
        <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 16 }}>
          گزینه مورد نظر خود را انتخاب کنید
        </Text>
      </div>

      <Card hoverable style={{ borderRadius: 12, border: '2px solid #389e0d', width: '100%' }}
        onClick={() => navigate('/supplier')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ApartmentOutlined style={{ fontSize: 36, color: '#389e0d' }} />
          <div>
            <Title level={5} style={{ margin: 0 }}>می‌خواهم زنجیره ایجاد کنم</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>ایجاد قرارداد، مدیریت دوره‌های پرورش، انتخاب مزرعه</Text>
          </div>
        </div>
      </Card>

      <Card hoverable style={{ borderRadius: 12, border: '2px solid #1677ff', width: '100%' }}
        onClick={() => navigate('/farm')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <TeamOutlined style={{ fontSize: 36, color: '#1677ff' }} />
          <div>
            <Title level={5} style={{ margin: 0 }}>می‌خواهم در زنجیره مشارکت کنم</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>مشاهده قراردادهای پیشنهادی، تأمین تضامین</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
