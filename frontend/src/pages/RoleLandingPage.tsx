import { useNavigate } from 'react-router-dom';
import { Card, Typography, theme } from 'antd';
import { ApartmentOutlined, TeamOutlined } from '@ant-design/icons';
import { useIsDesktop } from '@/hooks/useResponsive';
import { PageTransition } from '@/components/layout/PageTransition';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { pivaTokens } from '@/config/theme';

const { Title, Text } = Typography;

export function RoleLandingPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();

  return (
    <PageTransition>
      {/* ریشه با اسکرول: در گوشی landscape کوتاه محتوا کلیپ نمی‌شود */}
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
          <ThemeToggle />
        </div>
        <div style={{
          margin: 'auto',
          width: '100%',
          maxWidth: isDesktop ? 720 : 300,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title style={{
              marginBottom: 0,
              fontSize: 'clamp(32px, 12vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.2,
              color: pivaTokens.brandDeep,
            }}>
              پیوا
            </Title>
            <Text type="secondary" style={{ fontSize: 16, display: 'block', marginTop: 4 }}>
              مزرعه ای به وسعت ایران
            </Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 16 }}>
              گزینه مورد نظر خود را انتخاب کنید
            </Text>
          </div>

          <Card hoverable style={{ border: `2px solid ${token.colorPrimary}`, width: '100%' }}
            onClick={() => navigate('/supplier')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ApartmentOutlined style={{ fontSize: 36, color: token.colorPrimary }} />
              <div style={{ minWidth: 0 }}>
                <Title level={5} style={{ margin: 0 }}>می‌خواهم زنجیره ایجاد کنم</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>ایجاد قرارداد، مدیریت دوره‌های پرورش، انتخاب مزرعه</Text>
              </div>
            </div>
          </Card>

          <Card hoverable style={{ border: `2px solid ${token.colorInfo}`, width: '100%' }}
            onClick={() => navigate('/farm')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <TeamOutlined style={{ fontSize: 36, color: token.colorInfo }} />
              <div style={{ minWidth: 0 }}>
                <Title level={5} style={{ margin: 0 }}>می‌خواهم در زنجیره مشارکت کنم</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>مشاهده قراردادهای پیشنهادی، تأمین تضامین</Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
