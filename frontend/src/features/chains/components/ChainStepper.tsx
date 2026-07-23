import { Steps, Button, Typography, Alert } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useChainWizard } from '../context/ChainWizardContext';
import { CHAIN_CREATION_STEPS } from '@/types';

const { Text } = Typography;

interface ChainStepperProps {
  children: React.ReactNode;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function ChainStepper({
  children,
  onSubmit,
  isSubmitting,
}: ChainStepperProps) {
  const { state, goNext, goPrev, canProceed, proceedBlockReason } =
    useChainWizard();
  const { currentStep } = state;
  const isLastStep = currentStep === 4;
  const isFirstStep = currentStep === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Stepper — fixed at top */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '20px 32px',
          marginBottom: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}
      >
        <Steps
          current={currentStep}
          size="small"
          items={CHAIN_CREATION_STEPS.map((s, i) => ({
            title: (
              <Text
                strong={i === currentStep}
                style={{
                  fontSize: 13,
                  color: i === currentStep ? undefined : 'rgba(0,0,0,0.45)',
                }}
              >
                {s.title}
              </Text>
            ),
            description: i === currentStep ? (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {s.description}
              </Text>
            ) : undefined,
          }))}
        />
      </div>

      {/* Validation hint */}
      {!canProceed && proceedBlockReason && (
        <Alert
          message={proceedBlockReason}
          type="warning"
          showIcon
          style={{ marginBottom: 12, borderRadius: 8, flexShrink: 0 }}
        />
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, paddingBottom: 8 }}>
        {children}
      </div>

      {/* Navigation — fixed at bottom */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#fff',
          borderRadius: 12,
          padding: '12px 24px',
          boxShadow: '0 -1px 4px rgba(0,0,0,0.04)',
          flexShrink: 0,
          marginTop: 8,
        }}
      >
        <Button
          disabled={isFirstStep}
          onClick={goPrev}
          icon={<ArrowRightOutlined />}
        >
          مرحله قبل
        </Button>

        <Text type="secondary">
          مرحله {currentStep + 1} از {CHAIN_CREATION_STEPS.length}
        </Text>

        {isLastStep ? (
          <Button
            type="primary"
            onClick={onSubmit}
            disabled={!canProceed}
            loading={isSubmitting}
          >
            ایجاد زنجیره
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={goNext}
            disabled={!canProceed}
            icon={<ArrowLeftOutlined />}
          >
            مرحله بعد
          </Button>
        )}
      </div>
    </div>
  );
}
