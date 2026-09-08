import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Typography, message, theme } from 'antd';
import { ApartmentOutlined, CrownOutlined, TeamOutlined, ArrowRightOutlined, MobileOutlined } from '@ant-design/icons';
import { PageTransition } from '@/components/layout/PageTransition';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LogoMark } from '@/components/ui/LogoMark';
import { panelTitle } from '@/components/layout/navItems';
import { useAuth, type AuthRole } from '@/context/AuthContext';
import { useIsDesktop } from '@/hooks/useResponsive';
import { pivaTokens, pivaType } from '@/config/theme';
import { toEnglishDigits, toPersianDigits } from '@/utils/format';
import { OtpInput } from '../components/OtpInput';

const { Text } = Typography;

const OTP_LENGTH = 5;
const RESEND_SECONDS = 120;

/** آیکون نقش‌ها برای چیپ پنل صفحه ورود. */
const ROLE_META: Record<AuthRole, React.ReactNode> = {
  admin: <CrownOutlined />,
  supplier: <ApartmentOutlined />,
  farm: <TeamOutlined />,
};

/** کد تأیید ۵ رقمی دمو — در نسخه نهایی با پیامک ارسال می‌شود. */
function generateDemoCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function isIranianMobile(phone: string): boolean {
  return /^09\d{9}$/.test(phone);
}

/** شمارنده ارسال مجدد — قالب mm:ss فارسی. */
function formatTimer(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return toPersianDigits(`${mm}:${ss}`);
}

/**
 * صفحه ورود — دو گام: شماره همراه → کد تأیید ۵ رقمی.
 * خارج از AppLayout (مثل لندینگ)؛ هیرو با موتیف ردیف‌های زمین، هم‌زبان لندینگ.
 * نقش از query می‌آید و پس از ورود به پنل همان نقش می‌رود.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, signIn } = useAuth();
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();

  const roleParam = searchParams.get('role') as AuthRole | null;
  const role: AuthRole | null = roleParam === 'admin' || roleParam === 'supplier' || roleParam === 'farm' ? roleParam : null;

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0); // کلید انیمیشن shake
  const [demoCode, setDemoCode] = useState('');
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);

  // اگر قبلاً با همین نقش وارد شده — مستقیم پنل (احراز هویت کامل است)
  useEffect(() => {
    if (!role) { navigate('/', { replace: true }); return; }
    if (session?.role === role) navigate(`/${role}`, { replace: true });
    document.title = `ورود | پیوا`;
  }, [role, session, navigate]);

  // شمارنده زمان ارسال مجدد
  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, timer]);

  const sendCode = useCallback((showToast: boolean) => {
    const code = generateDemoCode();
    setDemoCode(code);
    setTimer(RESEND_SECONDS);
    setOtpValue('');
    setOtpError(null);
    if (showToast) message.info(`کد تأیید آزمایشی: ${toPersianDigits(code)}`);
  }, []);

  const handlePhoneSubmit = () => {
    if (!isIranianMobile(phone)) {
      setPhoneError('شماره همراه معتبر نیست — با ۰۹ شروع شود و ۱۱ رقم باشد.');
      return;
    }
    setPhoneError(null);
    setStep('otp');
    sendCode(true);
  };

  const handleResend = () => {
    sendCode(true);
  };

  const verify = async (code: string) => {
    if (verifying || code.length !== OTP_LENGTH || !role) return;
    setVerifying(true);
    // لحظه تأیید عمداً کوتاه — حس پردازش واقعی
    await new Promise((r) => setTimeout(r, 500));
    if (code === demoCode) {
      signIn(role, phone);
      message.success('ورود موفق — خوش آمدید');
      navigate(`/${role}`);
    } else {
      setOtpError('کد واردشده صحیح نیست — دوباره بررسی کنید.');
      setOtpValue(''); // باکس‌ها برای ورود دوباره خالی می‌شوند
      setFailedAttempts((n) => n + 1);
      setVerifying(false);
    }
  };

  if (!role) return null;

  const panelName = panelTitle(`/${role}`);
  const completed = otpValue.length === OTP_LENGTH;

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

        {/* هیرو — وردمارک روی ردیف‌های زمین، محو به بدنه (هم‌زبان لندینگ) */}
        <div style={{ position: 'relative', overflow: 'hidden', padding: '40px 24px 40px' }}>
          <div className="piva-field-rows" style={{ position: 'absolute', inset: 0 }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, transparent 30%, var(--piva-body-bg) 100%)',
          }} />
          <div className="piva-stagger" style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            textAlign: 'center',
          }}>
            <LogoMark size={isDesktop ? 56 : 48} />
            <Typography.Title level={4} style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              lineHeight: 1.3,
              color: pivaTokens.brandDeep,
            }}>
              ورود به پیوا
            </Typography.Title>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '4px 14px', borderRadius: 999,
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              color: token.colorTextSecondary,
              fontSize: pivaType.secondary.fontSize,
            }}>
              <span style={{ display: 'inline-flex', color: token.colorPrimary, fontSize: 14 }}>{ROLE_META[role]}</span>
              {panelName}
            </span>
          </div>
        </div>

        {/* کارت ورود */}
        <div style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: 400,
          padding: '0 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          <Card style={{ width: '100%', border: `1px solid ${token.colorBorderSecondary}` }} styles={{ body: { padding: 24 } }}>
            {step === 'phone' ? (
              <div key="phone" className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <Text strong style={{ fontSize: pivaType.body.fontSize, display: 'block', marginBottom: 4 }}>
                    شماره همراه خود را وارد کنید
                  </Text>
                  <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>
                    کد تأیید ۵ رقمی برای شما پیامک می‌شود
                  </Text>
                </div>
                <div dir="ltr" style={{ position: 'relative' }}>
                  <input
                    className="piva-phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={11}
                    value={toPersianDigits(phone)}
                    placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                    aria-label="شماره همراه"
                    onChange={(e) => {
                      // ارقام فارسی/انگلیسی هر دو پذیرفته و به فارسی نمایش داده می‌شوند
                      const digits = toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 11);
                      setPhone(digits);
                      if (phoneError) setPhoneError(null);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handlePhoneSubmit(); }}
                    style={{
                      width: '100%',
                      height: 52,
                      textAlign: 'center',
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: 2,
                      borderRadius: token.borderRadius,
                      border: `1.5px solid ${phoneError ? token.colorError : token.colorBorder}`,
                      background: token.colorBgContainer,
                      color: token.colorText,
                      outline: 'none',
                      transition: 'border-color var(--piva-duration-tab) var(--piva-ease-enter), box-shadow var(--piva-duration-tab) var(--piva-ease-enter)',
                    }}
                  />
                  <MobileOutlined style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    right: 14, color: token.colorTextTertiary, fontSize: 18, pointerEvents: 'none',
                  }} />
                </div>
                {phoneError && (
                  <Text type="danger" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginTop: -8 }}>
                    {phoneError}
                  </Text>
                )}
                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={phone.length !== 11}
                  onClick={handlePhoneSubmit}
                  style={{ height: 48, fontSize: 15, fontWeight: 600 }}
                >
                  ادامه
                </Button>
                <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, textAlign: 'center', display: 'block' }}>
                  ورود شما به معنای پذیرش شرایط استفاده از سامانه پیواست
                </Text>
              </div>
            ) : (
              <div key="otp" className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Text strong style={{ fontSize: pivaType.body.fontSize }}>
                    کد تأیید را وارد کنید
                  </Text>
                  <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>
                    کد ۵ رقمی ارسال‌شده به{' '}
                    <Text strong style={{ fontSize: pivaType.secondary.fontSize }}>{toPersianDigits(phone)}</Text>
                  </Text>
                </div>

                {/* در حالت نمایشی، کد داخل صفحه هم نشان داده می‌شود — نسخه نهایی فقط پیامک */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  padding: '8px 12px', borderRadius: token.borderRadius,
                  background: token.colorFillQuaternary,
                  border: `1px dashed ${token.colorBorder}`,
                }}>
                  <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>کد تأیید (حالت نمایشی)</Text>
                  <Text strong style={{ fontSize: pivaType.body.fontSize, color: token.colorPrimary, letterSpacing: 2 }}>
                    {toPersianDigits(demoCode)}
                  </Text>
                </div>

                {/* key = failedAttempts تا در هر تلاش ناموفق انیمیشن shake replay شود */}
                <div key={failedAttempts} className={otpError ? 'piva-shake' : undefined} style={{ paddingTop: 4 }}>
                  <OtpInput
                    length={OTP_LENGTH}
                    value={otpValue}
                    disabled={verifying}
                    error={!!otpError}
                    onChange={(v) => { setOtpValue(v); if (otpError) setOtpError(null); }}
                    onComplete={(v) => { void verify(v); }}
                  />
                </div>
                {otpError && (
                  <Text type="danger" style={{ fontSize: pivaType.secondary.fontSize, textAlign: 'center', display: 'block' }}>
                    {otpError}
                  </Text>
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={verifying}
                  disabled={!completed}
                  onClick={() => { void verify(otpValue); }}
                  style={{ height: 48, fontSize: 15, fontWeight: 600 }}
                >
                  تأیید و ورود
                </Button>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {timer > 0 ? (
                    <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>
                      ارسال مجدد تا {formatTimer(timer)}
                    </Text>
                  ) : (
                    <Button type="link" size="small" onClick={handleResend} style={{ fontSize: pivaType.secondary.fontSize, fontWeight: 600 }}>
                      ارسال مجدد کد
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* بازگشت به انتخاب نقش / ویرایش شماره */}
          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => { if (step === 'otp') { setStep('phone'); setOtpError(null); setTimer(0); } else navigate('/'); }}
            style={{ color: token.colorTextSecondary, fontSize: pivaType.secondary.fontSize, alignSelf: 'center' }}
          >
            {step === 'otp' ? 'ویرایش شماره' : 'بازگشت به انتخاب نقش'}
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
