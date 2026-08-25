import { useNavigate } from 'react-router-dom';
import { Card, Space, Typography, theme } from 'antd';
import { CrownOutlined, ApartmentOutlined, TeamOutlined, SafetyCertificateOutlined, BankOutlined, SyncOutlined } from '@ant-design/icons';
import { useIsDesktop } from '@/hooks/useResponsive';
import { PageTransition } from '@/components/layout/PageTransition';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { StatTile } from '@/components/ui/StatTile';
import { pivaTokens } from '@/config/theme';
import { mockFarms } from '@/mocks';
import { formatNumber } from '@/utils/format';

const { Title, Text } = Typography;

interface RoleCardProps {
  icon: React.ReactNode;
  iconColor: string;
  borderColor: string;
  title: string;
  description: string;
  onClick: () => void;
}

/** کارت ورود نقش — یک شکل واحد برای هر سه نقش (DRY). */
function RoleCard({ icon, iconColor, borderColor, title, description, onClick }: RoleCardProps) {
  return (
    <Card hoverable style={{ border: `2px solid ${borderColor}`, width: '100%' }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 36, color: iconColor, display: 'inline-flex' }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
          <Title level={5} style={{ margin: 0 }}>{title}</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{description}</Text>
        </div>
      </div>
    </Card>
  );
}

/** لندینگ v3 — سه نقش با زنجیره‌دار در صدر؛ چیپ‌های اعتماد پایین صفحه. */
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
          maxWidth: isDesktop ? 760 : 340,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
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
              نقش خود را انتخاب کنید
            </Text>
          </div>

          <div className="piva-stagger" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <RoleCard
              icon={<CrownOutlined />}
              iconColor={pivaTokens.brandDeep}
              borderColor={pivaTokens.brandDeep}
              title="زنجیره‌دار — پنل مدیریت"
              description="تطبیق درخواست‌ها با مزرعه، برآورد شفاف هزینه و سهم، پایش اجرا"
              onClick={() => navigate('/admin')}
            />
            <RoleCard
              icon={<ApartmentOutlined />}
              iconColor={token.colorPrimary}
              borderColor={token.colorPrimary}
              title="تأمین‌کننده نهاده"
              description="ثبت درخواست نهاده (دان/جوجه/نقد) و دریافت مرغ با سهم شفاف"
              onClick={() => navigate('/supplier')}
            />
            <RoleCard
              icon={<TeamOutlined />}
              iconColor={token.colorInfo}
              borderColor={token.colorInfo}
              title="مزرعه‌دار"
              description="تأیید هماهنگی با زنجیره‌دار و اجرای فرایند پرورش و تحویل"
              onClick={() => navigate('/farm')}
            />
          </div>

          {/* چیپ‌های اعتماد */}
          <Card style={{ width: '100%', border: `1px solid ${token.colorBorder}` }} styles={{ body: { padding: '12px 16px' } }}>
            <Space direction="vertical" size={10} style={{ width: '100%' }}>
              <StatTile direction="row" tone="success" icon={<BankOutlined />}
                label={`${formatNumber(mockFarms.length)} مزرعه فعال`} value="شبکه مزارع سراسری" />
              <StatTile direction="row" tone="purple" icon={<SafetyCertificateOutlined />}
                label="شفافیت کامل هزینه‌ها" value="سهم دقیق از برآورد تولید" />
              <StatTile direction="row" tone="info" icon={<SyncOutlined />}
                label="زنجیره‌دار وسط میدان" value="از درخواست تا تحویل مرغ" />
            </Space>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
