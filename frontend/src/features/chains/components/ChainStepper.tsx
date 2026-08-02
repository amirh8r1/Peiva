import { Button, Typography, Progress } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useChainWizard } from '../context/ChainWizardContext';

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
  const { state } = ctx;
  const isLast = state.currentStep === ctx.totalStepCount - 1;
  const pct = Math.round(((state.currentStep + 1) / ctx.totalStepCount) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px', flexShrink: 0 }}>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => navigate('/supplier')} />
        <div style={{ flex: 1 }}><Progress percent={pct} size="small" showInfo={false} strokeColor="#389e0d" trailColor="#f0f0f0" /></div>
        <Text type="secondary" style={{ fontSize: 11 }}>{state.currentStep + 1}/{ctx.totalStepCount}</Text>
      </div>
      <Text strong style={{ fontSize: 16, marginBottom: 2, flexShrink: 0 }}>{stepTitle(state, ctx)}</Text>
      {!ctx.canProceed && ctx.proceedBlockReason && (
        <Text type="warning" style={{ fontSize: 11, marginBottom: 4, flexShrink: 0, display: 'block' }}>{ctx.proceedBlockReason}</Text>
      )}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, paddingBottom: 60 }}>{children}</div>
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '8px 12px', background: 'linear-gradient(transparent, #f5f5f5 30%)', display: 'flex', gap: 8, zIndex: 20 }}>
        {state.currentStep > 0 && <Button onClick={ctx.goPrev} icon={<ArrowRightOutlined />} size="large">قبل</Button>}
        {isLast ? (
          <Button type="primary" onClick={onSubmit} disabled={!ctx.canProceed} loading={isSubmitting} size="large" block style={{ height: 44 }}>تأیید و ارسال به مزرعه‌داران</Button>
        ) : (
          <Button type="primary" onClick={ctx.goNext} disabled={!ctx.canProceed} icon={<ArrowLeftOutlined />} size="large" block style={{ height: 44 }}>ادامه</Button>
        )}
      </div>
    </div>
  );
}
