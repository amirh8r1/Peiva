import { Button, Typography, Progress } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useChainWizard } from '../context/ChainWizardContext';
import { TOTAL_STEPS } from '@/types';

const { Text } = Typography;

interface ChainStepperProps {
  children: React.ReactNode;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Minimal mobile-friendly wizard shell.
 * - Thin progress bar at top instead of bulky stepper
 * - Floating bottom button
 * - No PageHeader / name box — all inline
 */
export function ChainStepper({ children, onSubmit, isSubmitting }: ChainStepperProps) {
  const { state, goNext, goPrev, canProceed, proceedBlockReason } = useChainWizard();
  const navigate = useNavigate();
  const { currentStep } = state;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isFirstStep = currentStep === 0;
  const progress = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Minimal top bar: close + progress */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 4px',
          flexShrink: 0,
        }}
      >
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={() => navigate('/')}
        />
        <div style={{ flex: 1 }}>
          <Progress
            percent={progress}
            size="small"
            showInfo={false}
            strokeColor="#389e0d"
            trailColor="#f0f0f0"
            style={{ margin: 0 }}
          />
        </div>
        <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
          {currentStep + 1}/{TOTAL_STEPS}
        </Text>
      </div>

      {/* Step title */}
      <Text
        strong
        style={{
          fontSize: 16,
          marginBottom: 4,
          display: 'block',
          flexShrink: 0,
        }}
      >
        {currentStep < 5 ? 'انتخاب اجزای زنجیره' : 'تعریف شرایط قرارداد'}
      </Text>
      {proceedBlockReason && !canProceed && (
        <Text type="warning" style={{ fontSize: 11, marginBottom: 8, flexShrink: 0, display: 'block' }}>
          {proceedBlockReason}
        </Text>
      )}

      {/* Scrollable content — cards area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          paddingBottom: 60,
        }}
      >
        {children}
      </div>

      {/* Floating bottom button */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          padding: '8px 12px',
          background: 'linear-gradient(transparent, #f5f5f5 30%)',
          display: 'flex',
          gap: 8,
          zIndex: 20,
        }}
      >
        {!isFirstStep && (
          <Button onClick={goPrev} icon={<ArrowRightOutlined />} size="large">
            قبل
          </Button>
        )}
        {isLastStep ? (
          <Button
            type="primary"
            onClick={onSubmit}
            disabled={!canProceed}
            loading={isSubmitting}
            size="large"
            block
            style={{ height: 44 }}
          >
            تأیید و ارسال به مزرعه‌داران
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={goNext}
            disabled={!canProceed}
            icon={<ArrowLeftOutlined />}
            size="large"
            block
            style={{ height: 44 }}
          >
            ادامه
          </Button>
        )}
      </div>
    </div>
  );
}
