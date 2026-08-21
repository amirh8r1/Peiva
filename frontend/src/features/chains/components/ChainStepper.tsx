import { Button, Typography, Progress, theme } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useChainWizard } from '../context/ChainWizardContext';
import { useIsDesktop } from '@/hooks/useResponsive';
import { centeredForm } from '@/utils/responsive';
import { FORM_COLUMN_MAX, SHELL_MOBILE_MAX } from '@/config/layout';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';

const { Text } = Typography;

interface ChainStepperProps { children: React.ReactNode; onSubmit: () => void; isSubmitting?: boolean; }

function stepTitle(state: ReturnType<typeof useChainWizard>['state'], ctx: ReturnType<typeof useChainWizard>) {
  const s = state; const off = 1 + s.duration; const t = ctx.totalStepCount;
  if (s.currentStep === 0) return 'اطلاعات پایه';
  if (ctx.isPeriodStep) return `دوره ${ctx.periodIndex + 1} از ${s.duration}`;
  if (s.currentStep === off) return 'نوع قرارداد';
  if (s.currentStep === off + 1) return 'شرایط و تعهدات';
  if (s.currentStep === off + 2) return 'شیوه و درصد تسهیم';
  if (s.currentStep === off + 3) return 'تضامین مورد قبول';
  if (s.currentStep === t - 1) return 'انتخاب مزرعه';
  return '';
}

export function ChainStepper({ children, onSubmit, isSubmitting }: ChainStepperProps) {
  const ctx = useChainWizard();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();
  const { state } = ctx;
  const isLast = state.currentStep === ctx.totalStepCount - 1;
  const pct = Math.round(((state.currentStep + 1) / ctx.totalStepCount) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px', flexShrink: 0 }}>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => navigate('/supplier')} />
        <div style={{ flex: 1 }}><Progress percent={pct} size="small" showInfo={false} strokeColor={token.colorPrimary} trailColor={token.colorBorderSecondary} /></div>
        <Text type="secondary" style={{ fontSize: 11 }}>{state.currentStep + 1}/{ctx.totalStepCount}</Text>
      </div>
      <Text strong style={{ fontSize: 16, marginBottom: 2, flexShrink: 0 }}>{stepTitle(state, ctx)}</Text>
      {!ctx.canProceed && ctx.proceedBlockReason && (
        <Text type="warning" style={{ fontSize: 11, marginBottom: 4, flexShrink: 0, display: 'block' }}>{ctx.proceedBlockReason}</Text>
      )}
      {/* key=currentStep → اسکرول هر گام از بالا شروع می‌شود و انیمیشن ورود replay می‌شود */}
      <div key={state.currentStep} className="page-enter" style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0,
        paddingBottom: isDesktop ? 0 : 60,
        ...centeredForm(isDesktop, FORM_COLUMN_MAX),
      }}>{children}</div>
      {/* موبایل: نوار fixed بالای BottomNav | دسکتاپ: آخرین فرزند flex که پایین ستون می‌چسبد */}
      <div style={isDesktop
        ? { flexShrink: 0, display: 'flex', gap: 8, padding: '12px 0', ...centeredForm(isDesktop, FORM_COLUMN_MAX) }
        : { position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: SHELL_MOBILE_MAX, padding: '8px 12px', background: `linear-gradient(transparent, ${token.colorBgLayout} 30%)`, display: 'flex', gap: 8, zIndex: 101 }}
      >
        {state.currentStep > 0 && <Button onClick={ctx.goPrev} icon={<ArrowRightOutlined />} size="large">قبل</Button>}
        {isLast ? (
          <PrimaryCTA centered={false} onClick={onSubmit} disabled={!ctx.canProceed} loading={isSubmitting} height={44}>تأیید و ارسال به مزرعه‌داران</PrimaryCTA>
        ) : (
          <PrimaryCTA centered={false} onClick={ctx.goNext} disabled={!ctx.canProceed} icon={<ArrowLeftOutlined />} height={44}>ادامه</PrimaryCTA>
        )}
      </div>
    </div>
  );
}
