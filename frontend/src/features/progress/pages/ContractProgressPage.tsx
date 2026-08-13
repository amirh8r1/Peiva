import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Empty, Space, Typography } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { useIsDesktop } from '@/hooks/useResponsive';
import { useRole } from '@/hooks/useRole';
import { makeInitialSteps, PROGRESS_STEPS, isProgressComplete } from '@/types';
import type { ContractProgressStep } from '@/types';
import { getStepsForContract, isStepClaimable } from '../utils/progress.utils';
import { ProgressStepper } from '../components/ProgressStepper';
import { SupplyStepCard } from '../components/steps/SupplyStepCard';
import { PickupStepCard } from '../components/steps/PickupStepCard';
import { DriverStepCard } from '../components/steps/DriverStepCard';
import { DeliveryStepCard } from '../components/steps/DeliveryStepCard';

const { Text, Title } = Typography;

/** صفحه پیگیری قرارداد نهایی — role-aware از pathname، در هر دو پنل. */
export function ContractProgressPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useRole();
  const isDesktop = useIsDesktop();
  const { data, dispatch } = useData();

  const contract = data.contracts.find((c) => c.id === id);

  // lazy-ensure گام‌ها (idempotent — قراردادهای قدیمی هم پوشش داده می‌شوند)
  useEffect(() => {
    if (!contract || contract.status !== 'finalized') return;
    const missing = makeInitialSteps(contract.id).filter((s) => !data.progressSteps.some((e) => e.id === s.id));
    missing.forEach((s) => dispatch({ type: 'UPSERT_PROGRESS_STEP', payload: s }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.id]);

  if (!contract || contract.status !== 'finalized') {
    return (
      <>
        <PageHeader title="پیگیری قرارداد" />
        <Empty description="قرارداد نهایی یافت نشد" style={{ marginTop: 48 }} />
      </>
    );
  }

  const steps = getStepsForContract(data.progressSteps, contract.id);
  const complete = steps.length === PROGRESS_STEPS.length && isProgressComplete(steps);
  const onUpsert = (next: ContractProgressStep) => dispatch({ type: 'UPSERT_PROGRESS_STEP', payload: next });
  const backPath = role === 'supplier' ? '/supplier/contracts' : '/farm/contracts';
  const pickupStep = steps.find((s) => s.key === 'pickup' && s.status === 'done');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title={contract.name} subtitle="پیگیری قرارداد" extra={
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate(backPath)}>بازگشت</Button>
      } />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: isDesktop ? 24 : 80 }}>
        <div style={isDesktop ? { maxWidth: 640, margin: '0 auto' } : undefined}>
          <Card style={{ marginBottom: 12, borderRadius: 12 }}>
            <ProgressStepper steps={steps} />
          </Card>

          {complete && (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <CheckCircleOutlined style={{ fontSize: 64, color: '#389e0d' }} />
              <Title level={3} style={{ marginTop: 16 }}>🎉 قرارداد کامل شد!</Title>
              <Text type="secondary">تمام مراحل با تأیید طرفین تکمیل شده است.</Text>
              <Button type="primary" block size="large" style={{ marginTop: 24 }} onClick={() => navigate(role === 'supplier' ? '/supplier' : '/farm')}>
                بازگشت به داشبورد
              </Button>
            </div>
          )}

          {PROGRESS_STEPS.map(({ key, label }) => {
            const step = steps.find((s) => s.key === key);
            if (!step) return null;

            // گام‌های قفل‌شده (idle و غیرقابل ادعا)
            if (step.status === 'idle' && !isStepClaimable(steps, key)) {
              return (
                <Card key={key} style={{ marginBottom: 12, borderRadius: 12, opacity: 0.65 }}>
                  <Space>
                    <LockOutlined />
                    <Text type="secondary">{label}</Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                    برای فعال شدن، مراحل قبلی باید تکمیل شوند.
                  </Text>
                </Card>
              );
            }

            switch (step.key) {
              case 'supply': return <SupplyStepCard key={step.id} step={step} role={role} onUpsert={onUpsert} />;
              case 'pickup': return <PickupStepCard key={step.id} step={step} role={role} onUpsert={onUpsert} />;
              case 'driver': return <DriverStepCard key={step.id} step={step} role={role}
                earliestPickup={pickupStep && pickupStep.key === 'pickup' && pickupStep.status === 'done' ? pickupStep.payload.earliestPickup : undefined}
                onUpsert={onUpsert} />;
              case 'delivery': return <DeliveryStepCard key={step.id} step={step} role={role} onUpsert={onUpsert} />;
              default: return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
