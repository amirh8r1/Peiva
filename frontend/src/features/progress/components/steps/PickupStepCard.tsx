import { useState } from 'react';
import { Button, InputNumber, Tag, Typography, message } from 'antd';
import { CarOutlined, CheckOutlined } from '@ant-design/icons';
import { StepCard, SummaryRow } from '../StepCard';
import { useStepFeedback } from '../../hooks/useStepFeedback';
import {
  makeEvent, todayJalali, addDaysJalali, daysUntil, numberFieldProps,
} from '../../utils/progress.utils';
import { toPersianDigits, formatNumber } from '@/utils/format';
import { PICKUP_MIN_WAIT_DAYS } from '@/types';
import type { ContractProgressStep, ProgressRole } from '@/types';

const { Text } = Typography;

interface Props {
  step: Extract<ContractProgressStep, { key: 'pickup' }>;
  role: ProgressRole;
  onUpsert: (next: ContractProgressStep) => void;
}

/** گام ۲ — درخواست برداشت مرغ: ادعای تأمین‌کننده، ثبت وزن/تعداد و تأیید مزرعه‌دار.
 *  بعد از تأیید، تأمین‌کننده باید حداقل ۷ روز برای مراجعه صبر کند (earliestPickup). */
export function PickupStepCard({ step, role, onUpsert }: Props) {
  const { confirm } = useStepFeedback(step, role, onUpsert);
  const [weight, setWeight] = useState<number | null>(step.payload.chickenWeight ?? null);
  const [count, setCount] = useState<number | null>(step.payload.chickenCount ?? null);

  const isSupplier = role === 'supplier';
  const canClaim = isSupplier && (step.status === 'idle' || step.status === 'rejected');

  const handleClaim = () => {
    onUpsert({
      ...step, status: 'claimed', claimedBy: 'supplier', claimedAt: todayJalali(), payload: step.payload,
      events: [...step.events, makeEvent('supplier', 'claimed')],
    });
    message.success('درخواست برداشت ثبت شد و برای مزرعه‌دار ارسال گردید.');
  };

  const handleConfirm = () => {
    if (!weight || weight <= 0) return message.warning('وزن کل مرغ‌ها را وارد کنید');
    if (!count || count <= 0) return message.warning('تعداد مرغ‌ها را وارد کنید');
    const confirmedAt = todayJalali();
    const earliestPickup = addDaysJalali(confirmedAt, PICKUP_MIN_WAIT_DAYS);
    confirm({ chickenWeight: weight, chickenCount: count, earliestPickup });
    message.success('برداشت تأیید شد؛ زودترین زمان مراجعه تعیین گردید.');
  };

  const deadlineTag = (earliestPickup: string) => {
    const remaining = daysUntil(earliestPickup);
    return remaining > 0
      ? `زودترین زمان مجاز مراجعه: ${toPersianDigits(earliestPickup)} (${formatNumber(remaining)} روز مانده)`
      : `امکان مراجعه از ${toPersianDigits(earliestPickup)} فراهم است`;
  };

  return (
    <StepCard step={step} stepLabel="درخواست برداشت مرغ">
      {/* ادعای تأمین‌کننده */}
      {canClaim && (
        <>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            بعد از تأیید مزرعه‌دار، حداقل {formatNumber(PICKUP_MIN_WAIT_DAYS)} روز زمان لازم است تا امکان مراجعه برای دریافت مرغ‌ها فراهم شود.
          </Text>
          <Button type="primary" size="large" block icon={<CarOutlined />} onClick={handleClaim}>
            ثبت درخواست برداشت مرغ
          </Button>
        </>
      )}

      {/* ثبت وزن/تعداد و تأیید مزرعه‌دار */}
      {!isSupplier && step.status === 'claimed' && (
        <>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            وزن و تعداد مرغ‌های آماده برداشت را ثبت کنید. با تأیید شما، تأمین‌کننده باید حداقل {formatNumber(PICKUP_MIN_WAIT_DAYS)} روز صبر کند.
          </Text>
          <InputNumber value={weight ?? undefined} {...numberFieldProps}
            placeholder="وزن کل مرغ‌ها (کیلوگرم)" onChange={(v) => setWeight(v ?? null)} />
          <InputNumber value={count ?? undefined} {...numberFieldProps}
            placeholder="تعداد مرغ‌ها (قطعه)" onChange={(v) => setCount(v ?? null)} />
          <Button type="primary" size="large" block icon={<CheckOutlined />} onClick={handleConfirm}>
            ثبت وزن و تأیید برداشت
          </Button>
        </>
      )}

      {/* خلاصه نهایی */}
      {step.status === 'done' && (
        <>
          <SummaryRow label="وزن کل" value={`${formatNumber(step.payload.chickenWeight ?? 0)} کیلوگرم`} />
          <SummaryRow label="تعداد" value={`${formatNumber(step.payload.chickenCount ?? 0)} قطعه`} />
          {step.payload.earliestPickup && (
            <div style={{ marginTop: 8 }}>
              <Tag color="orange" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>
                {deadlineTag(step.payload.earliestPickup)}
              </Tag>
            </div>
          )}
        </>
      )}
    </StepCard>
  );
}
