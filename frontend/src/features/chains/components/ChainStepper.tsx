import { Button, Typography, Progress } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useChainWizard } from '../context/ChainWizardContext';

const { Text } = Typography;
const TOTAL = 4;

interface ChainStepperProps { children: React.ReactNode; onSubmit: () => void; isSubmitting?: boolean; }

export function ChainStepper({ children, onSubmit, isSubmitting }: ChainStepperProps) {
  const { state, goNext, goPrev, canProceed, proceedBlockReason } = useChainWizard();
  const navigate = useNavigate();
  const { currentStep } = state;
  const isLast = currentStep === TOTAL - 1;
  const isFirst = currentStep === 0;
  const pct = Math.round(((currentStep + 1) / TOTAL) * 100);

  const stepTitles = ['نوع قرارداد', 'شرایط و تعهدات', 'شیوه تسهیم منافع', 'خلاصه و ارسال'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Top: close + progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px', flexShrink: 0 }}>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => navigate('/')} />
        <div style={{ flex: 1 }}>
          <Progress percent={pct} size="small" showInfo={false} strokeColor="#389e0d" trailColor="#f0f0f0" />
        </div>
        <Text type="secondary" style={{ fontSize: 11 }}>{currentStep + 1}/{TOTAL}</Text>
      </div>

      {/* Title + warning */}
      <Text strong style={{ fontSize: 16, marginBottom: 2, flexShrink: 0 }}>{stepTitles[currentStep]}</Text>
      {!canProceed && proceedBlockReason && (
        <Text type="warning" style={{ fontSize: 11, marginBottom: 8, flexShrink: 0, display: 'block' }}>{proceedBlockReason}</Text>
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, paddingBottom: 60 }}>
        {children}
      </div>

      {/* Floating bottom buttons */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '8px 12px', background: 'linear-gradient(transparent, #f5f5f5 30%)', display: 'flex', gap: 8, zIndex: 20 }}>
        {!isFirst && <Button onClick={goPrev} icon={<ArrowRightOutlined />} size="large">قبل</Button>}
        {isLast ? (
          <Button type="primary" onClick={onSubmit} disabled={!canProceed} loading={isSubmitting} size="large" block style={{ height: 44 }}>
            تأیید و ارسال به مزرعه‌داران
          </Button>
        ) : (
          <Button type="primary" onClick={goNext} disabled={!canProceed} icon={<ArrowLeftOutlined />} size="large" block style={{ height: 44 }}>
            ادامه
          </Button>
        )}
      </div>
    </div>
  );
}
