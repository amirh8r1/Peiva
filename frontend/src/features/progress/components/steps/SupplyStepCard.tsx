import { Alert, Button, Form, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { StepCard, SummaryRow } from '../StepCard';
import { FeedbackActions } from '../FeedbackActions';
import { useStepFeedback } from '../../hooks/useStepFeedback';
import { makeEvent, todayJalali } from '../../utils/progress.utils';
import { NumberField, DateField } from '../fields';
import { toPersianDigits, formatNumber } from '@/utils/format';
import dayjs from '@/utils/dayjs';
import type { ContractProgressStep, ProgressRole, SupplyPayload } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';
import { formGrid } from '@/utils/responsive';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

interface Props {
  step: Extract<ContractProgressStep, { key: 'supply' }>;
  role: ProgressRole;
  onUpsert: (next: ContractProgressStep) => void;
}

interface ClaimFormValues {
  chickCount: number;
  feedAmount: number;
  suppliedAt: { format: (f: string) => string };
}

/** گام ۱ — تحویل نهاده و جوجه: ادعای مشارکت‌کننده، تأیید/رد دریافت مزرعه‌دار. */
export function SupplyStepCard({ step, role, onUpsert }: Props) {
  const { confirm, reject } = useStepFeedback(step, role, onUpsert);
  const [form] = Form.useForm<ClaimFormValues>();
  const isDesktop = useIsDesktop();

  const isSupplier = role === 'supplier';
  const isFarm = role === 'farm';
  const isAdmin = role === 'admin';
  const canClaim = isSupplier && (step.status === 'idle' || step.status === 'rejected');

  const handleClaim = async (values: ClaimFormValues) => {
    const payload: SupplyPayload = {
      chickCount: values.chickCount,
      feedAmount: values.feedAmount,
      suppliedAt: values.suppliedAt.format('YYYY/MM/DD'),
    };
    onUpsert({
      ...step, status: 'claimed', claimedBy: 'supplier', claimedAt: todayJalali(), payload,
      events: [...step.events, makeEvent('supplier', 'claimed')],
    });
    message.success('ادعای تحویل نهاده ثبت شد و برای مزرعه‌دار ارسال گردید.');
  };

  return (
    <StepCard step={step} stepLabel="تحویل نهاده و جوجه">
      {/* ادعای مشارکت‌کننده */}
      {canClaim && (
        <>
          {step.status === 'rejected' && (
            <Alert type="error" showIcon style={{ marginBottom: 12 }}
              message="نظر مزرعه‌دار" description={step.rejectedNote || 'ادعای شما رد شده است.'} />
          )}
          <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 8 }}>
            جزئیات نهاده و جوجه‌ای که به مزرعه تحویل داده‌اید را ثبت کنید؛ مزرعه‌دار دریافت را تأیید یا رد می‌کند.
          </Text>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              chickCount: step.payload.chickCount || undefined,
              feedAmount: step.payload.feedAmount || undefined,
              suppliedAt: step.payload.suppliedAt ? (dayjs as any)(step.payload.suppliedAt, { jalali: true }) : undefined,
            }}
            onFinish={handleClaim}
          >
            <div style={formGrid(isDesktop)}>
              <Form.Item
                name="chickCount"
                rules={[
                  { required: true, message: 'تعداد جوجه را وارد کنید' },
                  { type: 'number', min: 1, message: 'تعداد باید حداقل ۱ باشد' },
                ]}
              >
                <NumberField label="تعداد جوجه" unit="قطعه" hint="تعداد جوجه‌های تحویل داده‌شده به مزرعه" />
              </Form.Item>
              <Form.Item
                name="feedAmount"
                rules={[
                  { required: true, message: 'مقدار دان را وارد کنید' },
                  { type: 'number', min: 1, message: 'مقدار باید حداقل ۱ باشد' },
                ]}
              >
                <NumberField label="مقدار دان" unit="کیلوگرم" hint="مقدار کل دان تحویل داده‌شده" />
              </Form.Item>
            </div>
            <Form.Item name="suppliedAt" rules={[{ required: true, message: 'تاریخ تحویل را انتخاب کنید' }]}>
              <DateField label="تاریخ تحویل نهاده و جوجه" hint="تاریخی که نهاده و جوجه تحویل مزرعه می‌شود" />
            </Form.Item>
            <Button type="primary" size="large" block icon={<SendOutlined />} htmlType="submit">
              ثبت ادعای تحویل نهاده
            </Button>
          </Form>
        </>
      )}

      {/* خلاصه برای مزرعه‌دار + اقدام */}
      {isFarm && step.status === 'claimed' && (
        <>
          <SummaryRow label="تعداد جوجه" value={`${formatNumber(step.payload.chickCount)} قطعه`} />
          <SummaryRow label="مقدار دان" value={`${formatNumber(step.payload.feedAmount)} کیلوگرم`} />
          <SummaryRow label="تاریخ تحویل" value={toPersianDigits(step.payload.suppliedAt)} />
          <FeedbackActions
            allowReject
            confirmLabel="تأیید دریافت نهاده و جوجه"
            onConfirm={() => { confirm(); message.success('دریافت تأیید شد.'); }}
            onReject={(note) => { reject(note); message.success('رد ثبت شد.'); }}
          />
        </>
      )}

      {/* نظارت زنجیره‌دار — فقط خواندنی */}
      {isAdmin && step.status === 'claimed' && (
        <>
          <SummaryRow label="تعداد جوجه" value={`${formatNumber(step.payload.chickCount)} قطعه`} />
          <SummaryRow label="مقدار دان" value={`${formatNumber(step.payload.feedAmount)} کیلوگرم`} />
          <SummaryRow label="تاریخ تحویل" value={toPersianDigits(step.payload.suppliedAt)} />
          <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginTop: 8 }}>
            در انتظار تأیید دریافت توسط مزرعه‌دار...
          </Text>
        </>
      )}

      {/* خلاصه نهایی برای هر دو نقش */}
      {step.status === 'done' && (
        <>
          <SummaryRow label="تعداد جوجه" value={`${formatNumber(step.payload.chickCount)} قطعه`} />
          <SummaryRow label="مقدار دان" value={`${formatNumber(step.payload.feedAmount)} کیلوگرم`} />
          <SummaryRow label="تاریخ تحویل" value={toPersianDigits(step.payload.suppliedAt)} />
          <SummaryRow label="تأیید دریافت" value={`توسط مزرعه‌دار — ${toPersianDigits(step.confirmedAt ?? '')}`} />
        </>
      )}
    </StepCard>
  );
}
