import { useState } from 'react';
import { Alert, Button, Form, List, Typography, Upload, message } from 'antd';
import { CheckOutlined, DeleteOutlined, FileOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons';
import { StepCard, SummaryRow } from '../StepCard';
import { FeedbackActions } from '../FeedbackActions';
import { useStepFeedback } from '../../hooks/useStepFeedback';
import { makeEvent, makeUploadedDoc, todayJalali } from '../../utils/progress.utils';
import { NumberField } from '../fields';
import { formatNumber } from '@/utils/format';
import { ROLE_LABELS } from '@/types';
import type { ContractProgressStep, DeliveryPayload, ProgressRole, UploadedDoc } from '@/types';
import { StatusTag } from '@/components/ui/StatusTag';
import { useIsDesktop } from '@/hooks/useResponsive';
import { formGrid } from '@/utils/responsive';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface Props {
  step: Extract<ContractProgressStep, { key: 'delivery' }>;
  role: ProgressRole;
  onUpsert: (next: ContractProgressStep) => void;
}

interface ClaimFormValues {
  chickenCount: number;
  totalWeight: number;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${formatNumber(bytes / (1024 * 1024), 1)} مگابایت` : `${formatNumber(bytes / 1024, 1)} کیلوبایت`;

/** گام ۴ — تحویل و تأیید نهایی: مزرعه‌دار ادعای تحویل (تعداد + وزن + اسناد) می‌کند،
 *  تأمین‌کننده تأیید/رد می‌کند؛ با تأیید، گام تکمیل می‌شود. */
export function DeliveryStepCard({ step, role, onUpsert }: Props) {
  const { confirm, reject } = useStepFeedback(step, role, onUpsert);
  const [form] = Form.useForm<ClaimFormValues>();
  const [docs, setDocs] = useState<UploadedDoc[]>(step.payload.farmDocs);
  const isDesktop = useIsDesktop();

  const isFarm = role === 'farm';
  const isAdmin = role === 'admin';
  const canClaim = isFarm && (step.status === 'idle' || step.status === 'rejected');
  const canRespond = role === 'supplier' && step.status === 'claimed';

  const handleAddDoc = (file: File) => {
    const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? '';
    if (!ACCEPTED_EXT.includes(ext)) return message.warning('فرمت مجاز: تصویر (JPG/PNG/WebP) یا PDF');
    if (file.size > MAX_SIZE) return message.warning('حداکثر حجم هر سند ۵ مگابایت است');
    setDocs((prev) => [...prev, makeUploadedDoc(file, 'farm')]);
    message.success('سند بارگذاری شد.');
  };

  const handleRemoveDoc = (docId: string) => setDocs((prev) => prev.filter((d) => d.id !== docId));

  const handleClaim = async (values: ClaimFormValues) => {
    if (docs.length === 0) return message.warning('حداقل یک سند (وزن‌کشی/باسکول و...) بارگذاری کنید');
    const payload: DeliveryPayload = {
      chickenCount: values.chickenCount,
      totalWeight: values.totalWeight,
      farmDocs: docs,
      supplierConfirmed: false,
    };
    onUpsert({
      ...step, status: 'claimed', claimedBy: 'farm', claimedAt: todayJalali(), payload,
      events: [...step.events, makeEvent('farm', 'claimed')],
    });
    message.success('مشخصات تحویل ثبت شد و برای تأمین‌کننده ارسال گردید.');
  };

  const docList = (list: UploadedDoc[], removable: boolean) => (
    <List
      size="small"
      dataSource={list}
      locale={{ emptyText: 'سندی بارگذاری نشده است' }}
      renderItem={(doc) => (
        <List.Item
          actions={removable ? [<Button key="del" type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveDoc(doc.id)} />] : []}
        >
          <FileOutlined style={{ marginInlineEnd: 8 }} />
          <Text style={{ fontSize: pivaType.secondary.fontSize, flex: 1, minWidth: 0 }} ellipsis>{doc.name}</Text>
          <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>{formatSize(doc.size)}</Text>
        </List.Item>
      )}
    />
  );

  const deliverySummary = (
    <>
      <SummaryRow label="تعداد مرغ تحویلی" value={`${formatNumber(step.payload.chickenCount)} قطعه`} />
      <SummaryRow label="وزن کل تحویلی" value={`${formatNumber(step.payload.totalWeight)} کیلوگرم`} />
      <SummaryRow label="اسناد مزرعه‌دار" value={`${formatNumber(step.payload.farmDocs.length)} سند`} />
    </>
  );

  // ── خلاصه نهایی ──
  if (step.status === 'done') {
    return (
      <StepCard step={step} stepLabel="تحویل و تأیید نهایی">
        {deliverySummary}
        <div style={{ marginTop: 8 }}>
          <StatusTag tone="success">تأیید نهایی تحویل ثبت شد</StatusTag>
        </div>
      </StepCard>
    );
  }

  // ── ادعای مزرعه‌دار ──
  if (canClaim) {
    return (
      <StepCard step={step} stepLabel="تحویل و تأیید نهایی">
        {step.status === 'rejected' && (
          <Alert type="error" showIcon style={{ marginBottom: 12 }}
            message="نظر تأمین‌کننده" description={step.rejectedNote || 'ادعای شما رد شده است.'} />
        )}
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 8 }}>
          تعداد و وزن مرغ‌های تحویل داده‌شده را ثبت و مدارک وزن‌کشی (باسکول) را بارگذاری کنید؛ تأیید نهایی با تأمین‌کننده است.
        </Text>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            chickenCount: step.payload.chickenCount || undefined,
            totalWeight: step.payload.totalWeight || undefined,
          }}
          onFinish={handleClaim}
        >
          <div style={formGrid(isDesktop)}>
            <Form.Item
              name="chickenCount"
              rules={[
                { required: true, message: 'تعداد مرغ تحویلی را وارد کنید' },
                { type: 'number', min: 1, message: 'تعداد باید حداقل ۱ باشد' },
              ]}
            >
              <NumberField label="تعداد مرغ تحویلی" unit="قطعه" hint="تعداد مرغ‌های تحویل داده‌شده به تأمین‌کننده" />
            </Form.Item>
            <Form.Item
              name="totalWeight"
              rules={[
                { required: true, message: 'وزن کل تحویلی را وارد کنید' },
                { type: 'number', min: 1, message: 'وزن باید حداقل ۱ باشد' },
              ]}
            >
              <NumberField label="وزن کل تحویلی" unit="کیلوگرم" hint="وزن کل مرغ‌های تحویل داده‌شده (توزین باسکول)" />
            </Form.Item>
          </div>

          <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 4 }}>مدارک تحویل</Text>
          <Upload beforeUpload={(file) => { handleAddDoc(file); return false; }} showUploadList={false} multiple accept=".jpg,.jpeg,.png,.webp,.pdf">
            <Button size="small" icon={<UploadOutlined />}>بارگذاری سند</Button>
          </Upload>
          <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', margin: '4px 0 8px' }}>
            تصویر (JPG/PNG/WebP) یا PDF — حداکثر ۵ مگابایت
          </Text>
          {docList(docs, true)}

          <Button type="primary" size="large" block icon={<SendOutlined />} htmlType="submit" style={{ marginTop: 12 }}>
            ثبت مشخصات تحویل
          </Button>
        </Form>
      </StepCard>
    );
  }

  // ── تأیید/رد تأمین‌کننده ──
  if (canRespond) {
    return (
      <StepCard step={step} stepLabel="تحویل و تأیید نهایی">
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 8 }}>
          مزرعه‌دار مشخصات تحویل را ثبت کرده است؛ صحت آن را بررسی و تأیید نهایی کنید.
        </Text>
        {deliverySummary}
        {docList(step.payload.farmDocs, false)}
        <FeedbackActions
          allowReject
          confirmLabel="تأیید نهایی تحویل"
          onConfirm={() => { confirm({ supplierConfirmed: true }); message.success('تحویل تأیید نهایی شد.'); }}
          onReject={(note) => { reject(note); message.success('رد ثبت شد.'); }}
        />
      </StepCard>
    );
  }

  // ── نظارت زنجیره‌دار — فقط خواندنی ──
  if (isAdmin && step.status === 'claimed') {
    return (
      <StepCard step={step} stepLabel="تحویل و تأیید نهایی">
        {deliverySummary}
        {docList(step.payload.farmDocs, false)}
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginTop: 8 }}>
          در انتظار تأیید نهایی تأمین‌کننده...
        </Text>
      </StepCard>
    );
  }

  // ── حالت‌های انتظار ──
  if (step.status === 'rejected' && !isFarm) {
    return (
      <StepCard step={step} stepLabel="تحویل و تأیید نهایی">
        <Alert type="warning" showIcon style={{ marginBottom: 12 }}
          message="ادعای تحویل رد شده است" description={step.rejectedNote || ''} />
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block' }}>
          در انتظار اصلاح و ارسال مجدد توسط مزرعه‌دار...
        </Text>
      </StepCard>
    );
  }

  // farm + claimed / supplier + idle
  return (
    <StepCard step={step} stepLabel="تحویل و تأیید نهایی">
      <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block' }}>
        {isFarm
          ? 'ادعای تحویل شما ثبت شده — در انتظار تأیید نهایی تأمین‌کننده...'
          : `در انتظار ثبت مشخصات تحویل توسط ${ROLE_LABELS.farm}...`}
      </Text>
      {step.status === 'claimed' && deliverySummary}
    </StepCard>
  );
}
