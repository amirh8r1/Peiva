import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Badge, Button, Card, Empty, Space, Tabs, Typography, theme } from 'antd';
import { ArrowRightOutlined, LockOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageFrame } from '@/components/ui/PageFrame';
import { SuccessScreen } from '@/components/ui/SuccessScreen';
import { useIsDesktop } from '@/hooks/useResponsive';
import { useRole } from '@/hooks/useRole';
import { centeredForm } from '@/utils/responsive';
import { pivaType } from '@/config/theme';
import { makeInitialSteps, PROGRESS_STEPS, isProgressComplete } from '@/types';
import type { ContractProgressStep } from '@/types';
import { getStepsForContract, isStepClaimable, makeWeightRequest, nowFa } from '../utils/progress.utils';
import { ProgressStepper } from '../components/ProgressStepper';
import { SupplyStepCard } from '../components/steps/SupplyStepCard';
import { PickupStepCard } from '../components/steps/PickupStepCard';
import { DriverStepCard } from '../components/steps/DriverStepCard';
import { DeliveryStepCard } from '../components/steps/DeliveryStepCard';
import { WeightRequests } from '../components/WeightRequests';

const { Text } = Typography;

type ProgressTabKey = 'steps' | 'weight';

/** صفحه پیگیری قرارداد نهایی — role-aware از pathname، در هر دو پنل.
 *  دو بخش مستقل در دو تب: «مراحل قرارداد» و «اعلام وزن مرغ» (با Badge تعداد آیتم‌های مهم).
 *  با باز کردن تب وزن توسط تأمین‌کننده، پاسخ‌های دیده‌نشده خودکار mark-seen می‌شوند. */
export function ContractProgressPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useRole();
  const isDesktop = useIsDesktop();
  const { data, dispatch } = useData();
  const [searchParams] = useSearchParams();
  const { token } = theme.useToken();

  const contract = data.contracts.find((c) => c.id === id);
  const [activeTab, setActiveTab] = useState<ProgressTabKey>(searchParams.get('tab') === 'weight' ? 'weight' : 'steps');

  // با عوض شدن قرارداد، تب به پیش‌فرض (یا ?tab) برگردد
  useEffect(() => {
    setActiveTab(searchParams.get('tab') === 'weight' ? 'weight' : 'steps');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.id]);

  // lazy-ensure گام‌ها (idempotent — قراردادهای قدیمی هم پوشش داده می‌شوند)
  useEffect(() => {
    if (!contract || contract.status !== 'finalized') return;
    const missing = makeInitialSteps(contract.id).filter((s) => !data.progressSteps.some((e) => e.id === s.id));
    missing.forEach((s) => dispatch({ type: 'UPSERT_PROGRESS_STEP', payload: s }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.id]);

  // دیده‌شدن پاسخ‌های وزن توسط تأمین‌کننده = باز کردن تب وزن (idempotent در reducer)
  useEffect(() => {
    if (role === 'supplier' && contract?.status === 'finalized' && activeTab === 'weight') {
      dispatch({ type: 'MARK_WEIGHT_REQUESTS_SEEN', payload: { contractId: contract.id, seenAt: nowFa() } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, role, contract?.id]);

  if (!contract || contract.status !== 'finalized') {
    return (
      <PageFrame header={<PageHeader title="پیگیری قرارداد" />}>
        <Empty description="قرارداد نهایی یافت نشد" style={{ marginTop: 48 }} />
      </PageFrame>
    );
  }

  const steps = getStepsForContract(data.progressSteps, contract.id);
  const complete = steps.length === PROGRESS_STEPS.length && isProgressComplete(steps);
  const onUpsert = (next: ContractProgressStep) => dispatch({ type: 'UPSERT_PROGRESS_STEP', payload: next });
  const backPath = role === 'supplier' ? '/supplier/contracts' : role === 'admin' ? '/admin/contracts' : '/farm/contracts';
  const pickupStep = steps.find((s): s is Extract<ContractProgressStep, { key: 'pickup' }> => s.key === 'pickup' && s.status === 'done');
  const deliveryDone = steps.find((s) => s.key === 'delivery')?.status === 'done';

  // اعلام وزن: Badge تب = آیتم‌های قابل توجه نقش (مزرعه‌دار: در انتظار پاسخ / تأمین‌کننده: پاسخ‌های دیده‌نشده / زنجیره‌دار: صفر — فقط نظارت)
  const requests = data.weightRequests.filter((r) => r.contractId === contract.id);
  const weightBadge = role === 'admin'
    ? 0
    : role === 'farm'
      ? requests.filter((r) => r.status === 'pending').length
      : requests.filter((r) => r.status === 'answered' && !r.seenAt).length;

  return (
    <PageFrame
      remountKey={activeTab}
      header={
      <PageHeader title={contract.name} subtitle="پیگیری قرارداد" extra={
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate(backPath)}>بازگشت</Button>
      } />
    }>
      <div style={centeredForm(isDesktop, 960)}>
        <Card style={{ marginBottom: 12 }}>
          <ProgressStepper steps={steps} />
        </Card>

        <Tabs
          key={contract.id}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ProgressTabKey)}
          items={[
            {
              key: 'steps',
              label: 'مراحل قرارداد',
              children: (
                <>
                  {complete && (
                    <SuccessScreen
                      title="قرارداد کامل شد!"
                      subtitle="تمام مراحل با تأیید طرفین تکمیل شده است."
                      actionLabel="بازگشت به داشبورد"
                      onAction={() => navigate(role === 'supplier' ? '/supplier' : role === 'admin' ? '/admin' : '/farm')}
                    />
                  )}

                  {PROGRESS_STEPS.map(({ key, label }) => {
                    const step = steps.find((s) => s.key === key);
                    if (!step) return null;

                    // گام‌های قفل‌شده (idle و غیرقابل ادعا)
                    if (step.status === 'idle' && !isStepClaimable(steps, key)) {
                      return (
                        <Card key={key} style={{ marginBottom: 12, borderStyle: 'dashed' }}>
                          <Space>
                            <LockOutlined style={{ color: token.colorTextTertiary }} />
                            <Text type="secondary">{label}</Text>
                          </Space>
                          <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', marginTop: 4 }}>
                            برای فعال شدن، مراحل قبلی باید تکمیل شوند.
                          </Text>
                        </Card>
                      );
                    }

                    switch (step.key) {
                      case 'supply': return <SupplyStepCard key={step.id} step={step} role={role} onUpsert={onUpsert} />;
                      case 'pickup': return <PickupStepCard key={step.id} step={step} role={role} onUpsert={onUpsert} />;
                      case 'driver': return <DriverStepCard key={step.id} step={step} role={role}
                        initialPickupDate={pickupStep ? pickupStep.payload.pickupDate : undefined}
                        deliveryDone={deliveryDone}
                        onUpsert={onUpsert} />;
                      case 'delivery': return <DeliveryStepCard key={step.id} step={step} role={role} onUpsert={onUpsert} />;
                      default: return null;
                    }
                  })}
                </>
              ),
            },
            {
              key: 'weight',
              label: (
                <Space size={4}>
                  اعلام وزن مرغ
                  <Badge count={weightBadge} size="small" offset={[8, -2]} />
                </Space>
              ),
              children: (
                <WeightRequests
                  role={role}
                  requests={requests}
                  onAdd={() => dispatch({ type: 'ADD_WEIGHT_REQUEST', payload: makeWeightRequest(contract.id) })}
                  onAnswer={(id, answer) => dispatch({ type: 'ANSWER_WEIGHT_REQUEST', payload: { id, answer } })}
                />
              ),
            },
          ]}
        />
      </div>
    </PageFrame>
  );
}
