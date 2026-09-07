import { Alert, Button, Form, Typography, message } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { StepCard, SummaryRow } from '../StepCard';
import { FeedbackActions } from '../FeedbackActions';
import { useStepFeedback } from '../../hooks/useStepFeedback';
import { makeEvent, todayJalali, daysUntil } from '../../utils/progress.utils';
import { DateField } from '../fields';
import { toPersianDigits, formatNumber } from '@/utils/format';
import { PICKUP_MIN_WAIT_DAYS } from '@/types';
import type { ContractProgressStep, ProgressRole, PickupPayload } from '@/types';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

interface Props {
  step: Extract<ContractProgressStep, { key: 'pickup' }>;
  role: ProgressRole;
  onUpsert: (next: ContractProgressStep) => void;
}

interface RequestFormValues {
  pickupDate: { format: (f: string) => string };
}

/** گام ۲ — درخواست برداشت مرغ زنده (حدود یک هفته قبل از دریافت):
 *  تأمین‌کننده تاریخ بارگیری پیشنهادی ثبت می‌کند، مزرعه‌دار تأیید/رد می‌کند. */
export function PickupStepCard({ step, role, onUpsert }: Props) {
  const { confirm, reject } = useStepFeedback(step, role, onUpsert);
  const [form] = Form.useForm<RequestFormValues>();

  const isSupplier = role === 'supplier';
  const isFarm = role === 'farm';
  const isAdmin = role === 'admin';
  const canClaim = isSupplier && (step.status === 'idle' || step.status === 'rejected');

  // هشدار نرم ۷ روز — مسدودکننده نیست
  const pendingDate = Form.useWatch('pickupDate', form);
  const tooSoon = !!pendingDate && daysUntil(pendingDate.format('YYYY/MM/DD')) < PICKUP_MIN_WAIT_DAYS;

  const handleClaim = async (values: RequestFormValues) => {
    const payload: PickupPayload = { pickupDate: values.pickupDate.format('YYYY/MM/DD') };
    onUpsert({
      ...step, status: 'claimed', claimedBy: 'supplier', claimedAt: todayJalali(), payload,
      events: [...step.events, makeEvent('supplier', 'claimed')],
    });
    message.success('درخواست برداشت ثبت شد و برای مزرعه‌دار ارسال گردید.');
  };

  return (
    <StepCard step={step} stepLabel="درخواست برداشت مرغ زنده">
      {/* درخواست تأمین‌کننده */}
      {canClaim && (
        <>
          {step.status === 'rejected' && (
            <Alert type="error" showIcon style={{ marginBottom: 12 }}
              message="نظر مزرعه‌دار" description={step.rejectedNote || 'درخواست شما رد شده است.'} />
          )}
          <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 8 }}>
            این درخواست حدود یک هفته قبل از دریافت مرغ زنده ثبت می‌شود؛ مزرعه‌دار تاریخ بارگیری را تأیید یا رد می‌کند.
          </Text>
          <Form form={form} layout="vertical" onFinish={handleClaim}>
            <Form.Item name="pickupDate" rules={[{ required: true, message: 'تاریخ بارگیری را انتخاب کنید' }]}>
              <DateField
                label="تاریخ بارگیری پیشنهادی"
                hint={`پیشنهاد می‌شود تاریخ بارگیری حدود ${formatNumber(PICKUP_MIN_WAIT_DAYS)} روز بعد از ثبت این درخواست باشد.`}
              />
            </Form.Item>
            {tooSoon && (
              <Alert
                type="warning" showIcon style={{ marginBottom: 12 }}
                message={`تاریخ انتخابی کمتر از ${formatNumber(PICKUP_MIN_WAIT_DAYS)} روز با امروز فاصله دارد`}
                description="پیشنهاد می‌شود تاریخ بارگیری حدود ۷ روز بعد از ثبت درخواست باشد؛ این محدودیت اجباری نیست."
              />
            )}
            <Button type="primary" size="large" block icon={<CarOutlined />} htmlType="submit">
              ثبت درخواست برداشت مرغ زنده
            </Button>
          </Form>
        </>
      )}

      {/* تأیید/رد مزرعه‌دار */}
      {isFarm && step.status === 'claimed' && (
        <>
          <SummaryRow label="تاریخ بارگیری پیشنهادی" value={toPersianDigits(step.payload.pickupDate)} />
          <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginTop: 8 }}>
            با تأیید شما، برنامه بارگیری مرغ زنده در تاریخ فوق قطعی می‌شود.
          </Text>
          <FeedbackActions
            allowReject
            confirmLabel="تأیید درخواست برداشت"
            onConfirm={() => { confirm(); message.success('درخواست برداشت تأیید شد.'); }}
            onReject={(note) => { reject(note); message.success('رد ثبت شد.'); }}
          />
        </>
      )}

      {/* نظارت زنجیره‌دار — فقط خواندنی */}
      {isAdmin && step.status === 'claimed' && (
        <>
          <SummaryRow label="تاریخ بارگیری پیشنهادی" value={toPersianDigits(step.payload.pickupDate)} />
          <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginTop: 8 }}>
            در انتظار تأیید مزرعه‌دار...
          </Text>
        </>
      )}

      {/* خلاصه نهایی */}
      {step.status === 'done' && (
        <>
          <SummaryRow label="تاریخ بارگیری" value={toPersianDigits(step.payload.pickupDate)} />
          <SummaryRow label="تأیید مزرعه‌دار" value={toPersianDigits(step.confirmedAt ?? '')} />
        </>
      )}
    </StepCard>
  );
}
