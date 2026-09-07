import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, theme } from 'antd';
import { ArrowLeftOutlined, ApartmentOutlined, BankOutlined, CrownOutlined, SafetyCertificateOutlined, SyncOutlined, TeamOutlined } from '@ant-design/icons';
import { useIsDesktop } from '@/hooks/useResponsive';
import { PageTransition } from '@/components/layout/PageTransition';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LogoMark } from '@/components/ui/LogoMark';
import { pivaTokens, pivaType } from '@/config/theme';
import { mockFarms } from '@/mocks';
import { formatNumber } from '@/utils/format';

const { Title, Text } = Typography;

interface RoleCardProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  onClick: () => void;
}

/** کارت ورود نقش — آیکون‌چیپ + توضیح + پیکان پیشروی (RTL). */
function RoleCard({ icon, iconColor, iconBg, title, description, onClick }: RoleCardProps) {
  const { token } = theme.useToken();
  return (
    <Card
      hoverable
      className="piva-lift"
      onClick={onClick}
      style={{ border: `1px solid ${token.colorBorderSecondary}` }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 44, height: 44, borderRadius: 12,
          background: iconBg, color: iconColor,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>
          {icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: pivaType.body.fontSize }}>{title}</Text>
          <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block' }}>{description}</Text>
        </div>
        <ArrowLeftOutlined style={{ color: token.colorTextTertiary, flexShrink: 0 }} />
      </div>
    </Card>
  );
}

/** آیتم اعتماد — آیکون‌چیپ کوچک + مقدار/برچسب. */
function TrustItem({ icon, iconColor, value, label }: { icon: React.ReactNode; iconColor: string; value: string; label: string }) {
  const { token } = theme.useToken();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <span style={{
        width: 36, height: 36, borderRadius: 10,
        background: token.colorFillSecondary, color: iconColor,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <Text strong style={{ fontSize: pivaType.body.fontSize, display: 'block' }}>{value}</Text>
        <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>{label}</Text>
      </div>
    </div>
  );
}

/** لندینگ v4 — هیرو با موتیف ردیف‌های زمین (امضای بصری)، نقش‌ها با آیکون‌چیپ، اعتماد پایین. */
export function RoleLandingPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();

  // عنوان تب مرورگر — لندینگ خارج از AppLayout است
  useEffect(() => {
    document.title = 'پیوا | مزرعه‌ای به وسعت ایران';
  }, []);

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

        {/* هیرو — وردمارک روی ردیف‌های زمین، محو به بدنه */}
        <div style={{ position: 'relative', overflow: 'hidden', padding: '56px 24px 48px' }}>
          <div className="piva-field-rows" style={{ position: 'absolute', inset: 0 }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 30%, var(--piva-body-bg) 100%)',
          }} />
          <div className="piva-stagger" style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            textAlign: 'center',
          }}>
            <LogoMark size={isDesktop ? 64 : 56} />
            <Title style={{
              margin: 0,
              fontSize: 'clamp(32px, 12vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.2,
              color: pivaTokens.brandDeep,
            }}>
              پیوا
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              مزرعه‌ای به وسعت ایران
            </Text>
            <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, marginTop: 4 }}>
              نقش خود را انتخاب کنید
            </Text>
          </div>
        </div>

        <div style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: isDesktop ? 720 : 340,
          padding: '0 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <div className="piva-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <RoleCard
              icon={<CrownOutlined />}
              iconColor={pivaTokens.brandDeep}
              iconBg={token.colorSuccessBg}
              title="زنجیره‌دار — پنل مدیریت"
              description="تطبیق درخواست‌ها با مزرعه، برآورد شفاف هزینه و سهم، پایش اجرا"
              onClick={() => navigate('/admin')}
            />
            <RoleCard
              icon={<ApartmentOutlined />}
              iconColor={token.colorPrimary}
              iconBg={token.colorSuccessBg}
              title="مشارکت‌کننده"
              description="اعلام نهاده/جوجه/اعتبار مالی و دریافت مرغ با سهم شفاف از تولید"
              onClick={() => navigate('/supplier')}
            />
            <RoleCard
              icon={<TeamOutlined />}
              iconColor={token.colorInfo}
              iconBg={token.colorInfoBg}
              title="مزرعه‌دار"
              description="تأیید هماهنگی با زنجیره‌دار و اجرای فرایند پرورش و تحویل"
              onClick={() => navigate('/farm')}
            />
          </div>

          {/* چیپ‌های اعتماد */}
          <Card style={{ border: `1px solid ${token.colorBorderSecondary}` }} styles={{ body: { padding: '16px' } }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <TrustItem
                icon={<BankOutlined />}
                iconColor={token.colorPrimary}
                value={`${formatNumber(mockFarms.length)} مزرعه فعال`}
                label="شبکه مزارع سراسری"
              />
              <TrustItem
                icon={<SafetyCertificateOutlined />}
                iconColor={pivaTokens.purple}
                value="شفافیت کامل هزینه‌ها"
                label="سهم دقیق از برآورد تولید"
              />
              <TrustItem
                icon={<SyncOutlined />}
                iconColor={token.colorInfo}
                value="از درخواست تا تحویل مرغ"
                label="زنجیره‌دار وسط میدان"
              />
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
