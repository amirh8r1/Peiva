import { useState } from 'react';
import { Alert, Button, DatePicker, InputNumber, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { StepCard, SummaryRow } from '../StepCard';
import { FeedbackActions } from '../FeedbackActions';
import { useStepFeedback } from '../../hooks/useStepFeedback';
import { makeEvent, todayJalali, numberFieldProps, jalaliDatePickerProps } from '../../utils/progress.utils';
import { toPersianDigits, formatNumber } from '@/utils/format';
import dayjs from '@/utils/dayjs';
import type { ContractProgressStep, ProgressRole, SupplyPayload } from '@/types';

const { Text } = Typography;

interface Props {
  step: Extract<ContractProgressStep, { key: 'supply' }>;
  role: ProgressRole;
  onUpsert: (next: ContractProgressStep) => void;
}

/** گام ۱ — تأمین نهاده و جوجه: ادعای تأمین‌کننده، تأیید/رد مزرعه‌دار. */
export function SupplyStepCard({ step, role, onUpsert }: Props) {
  const { confirm, reject } = useStepFeedback(step, role, onUpsert);
  const [chickCount, setChickCount] = useState<number | null>(step.payload.chickCount || null);
  const [feedAmount, setFeedAmount] = useState<number | null>(step.payload.feedAmount || null);
  const [suppliedAt, setSuppliedAt] = useState<string>(step.payload.suppliedAt || '');

  const isSupplier = role === 'supplier';
  const canClaim = isSupplier && (step.status === 'idle' || step.status === 'rejected');

  const handleClaim = () => {
    if (!chickCount || chickCount <= 0) return message.warning('تعداد جوجه را وارد کنید');
    if (!feedAmount || feedAmount <= 0) return message.warning('مقدار دان را وارد کنید');
    if (!suppliedAt) return message.warning('تاریخ تأمین را انتخاب کنید');
    const payload: SupplyPayload = { chickCount, feedAmount, suppliedAt };
    onUpsert({
      ...step, status: 'claimed', claimedBy: 'supplier', claimedAt: todayJalali(), payload,
      events: [...step.events, makeEvent('supplier', 'claimed')],
    });
    message.success('ادعای تأمین ثبت شد و برای مزرعه‌دار ارسال گردید.');
  };

  return (
    <StepCard step={step} stepLabel="تأمین نهاده و جوجه">
      {/* ادعای تأمین‌کننده */}
      {canClaim && (
        <>
          {step.status === 'rejected' && (
            <Alert type="error" showIcon style={{ marginBottom: 12 }}
              message="نظر مزرعه‌دار" description={step.rejectedNote || 'ادعای شما رد شده است.'} />
          )}
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            جزئیات تأمین نهاده و جوجه را ثبت کنید
          </Text>
          <InputNumber value={chickCount ?? undefined} {...numberFieldProps}
            placeholder="تعداد جوجه (قطعه)" onChange={(v) => setChickCount(v ?? null)} />
          <InputNumber value={feedAmount ?? undefined} {...numberFieldProps}
            placeholder="مقدار دان (کیلوگرم)" onChange={(v) => setFeedAmount(v ?? null)} />
          <DatePicker
            {...jalaliDatePickerProps}
            placeholder="تاریخ تأمین"
            value={suppliedAt ? (dayjs as any)(suppliedAt, { jalali: true }) : null}
            onChange={(d) => setSuppliedAt(d ? (d as { format: (f: string) => string }).format('YYYY/MM/DD') : '')}
          />
          <Button type="primary" size="large" block icon={<SendOutlined />} style={{ marginTop: 4 }} onClick={handleClaim}>
            ثبت ادعای تأمین
          </Button>
        </>
      )}

      {/* خلاصه برای مزرعه‌دار + اقدام */}
      {!isSupplier && step.status === 'claimed' && (
        <>
          <SummaryRow label="تعداد جوجه" value={`${formatNumber(step.payload.chickCount)} قطعه`} />
          <SummaryRow label="مقدار دان" value={`${formatNumber(step.payload.feedAmount)} کیلوگرم`} />
          <SummaryRow label="تاریخ تأمین" value={toPersianDigits(step.payload.suppliedAt)} />
          <FeedbackActions
            allowReject
            confirmLabel="تأیید دریافت نهاده و جوجه"
            onConfirm={() => { confirm(); message.success('دریافت تأیید شد.'); }}
            onReject={(note) => { reject(note); message.success('رد ثبت شد.'); }}
          />
        </>
      )}

      {/* خلاصه نهایی برای هر دو نقش */}
      {step.status === 'done' && (
        <>
          <SummaryRow label="تعداد جوجه" value={`${formatNumber(step.payload.chickCount)} قطعه`} />
          <SummaryRow label="مقدار دان" value={`${formatNumber(step.payload.feedAmount)} کیلوگرم`} />
          <SummaryRow label="تاریخ تأمین" value={toPersianDigits(step.payload.suppliedAt)} />
          <SummaryRow label="تأیید دریافت" value={`توسط مزرعه‌دار — ${toPersianDigits(step.confirmedAt ?? '')}`} />
        </>
      )}
    </StepCard>
  );
}
