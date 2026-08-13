import { Button, List, Tag, Typography, Upload, message } from 'antd';
import { CheckOutlined, DeleteOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import { StepCard, SummaryRow } from '../StepCard';
import { makeEvent, makeUploadedDoc } from '../../utils/progress.utils';
import { formatNumber } from '@/utils/format';
import { ROLE_LABELS } from '@/types';
import type { ContractProgressStep, DeliveryPayload, ProgressRole, UploadedDoc } from '@/types';

const { Text } = Typography;

const ACCEPTED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

interface Props {
  step: Extract<ContractProgressStep, { key: 'delivery' }>;
  role: ProgressRole;
  onUpsert: (next: ContractProgressStep) => void;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${formatNumber(bytes / (1024 * 1024), 1)} مگابایت` : `${formatNumber(bytes / 1024, 1)} کیلوبایت`;

/** گام ۴ — تحویل و تأیید نهایی: بارگذاری اسناد و تأیید مستقل هر دو طرف؛ با تأیید هر دو، گام تکمیل می‌شود. */
export function DeliveryStepCard({ step, role, onUpsert }: Props) {
  const myKey = role === 'supplier' ? 'supplierDocs' : 'farmDocs';
  const otherKey = role === 'supplier' ? 'farmDocs' : 'supplierDocs';
  const myConfirmKey = role === 'supplier' ? 'supplierConfirmed' : 'farmConfirmed';
  const otherConfirmKey = role === 'supplier' ? 'farmConfirmed' : 'supplierConfirmed';

  const upsert = (payload: DeliveryPayload, extraEvent?: { by: ProgressRole; type: 'document' | 'confirmed'; note?: string }) => {
    onUpsert({
      ...step,
      status: payload.supplierConfirmed && payload.farmConfirmed ? 'done' : 'claimed',
      payload,
      events: extraEvent ? [...step.events, makeEvent(extraEvent.by, extraEvent.type, extraEvent.note)] : step.events,
    });
  };

  const handleAddDoc = (file: File) => {
    const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? '';
    if (!ACCEPTED_EXT.includes(ext)) return message.warning('فرمت مجاز: تصویر (JPG/PNG/WebP) یا PDF');
    if (file.size > MAX_SIZE) return message.warning('حداکثر حجم هر سند ۵ مگابایت است');
    const doc = makeUploadedDoc(file, role);
    upsert({ ...step.payload, [myKey]: [...step.payload[myKey], doc] } as DeliveryPayload, { by: role, type: 'document', note: doc.name });
    message.success('سند بارگذاری شد.');
  };

  const handleRemoveDoc = (docId: string) => {
    upsert({ ...step.payload, [myKey]: step.payload[myKey].filter((d) => d.id !== docId) } as DeliveryPayload);
  };

  const handleConfirm = () => {
    if (step.payload[myKey].length === 0) return message.warning('حداقل یک سند (وزن‌کشی/باسکول و...) بارگذاری کنید');
    const next = { ...step.payload, [myConfirmKey]: true } as DeliveryPayload;
    upsert(next, { by: role, type: 'confirmed' });
    message.success('تأیید شما ثبت شد.');
  };

  const docList = (docs: UploadedDoc[], removable: boolean) => (
    <List
      size="small"
      dataSource={docs}
      locale={{ emptyText: 'سندی بارگذاری نشده است' }}
      renderItem={(doc) => (
        <List.Item
          actions={removable ? [<Button key="del" type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemoveDoc(doc.id)} />] : []}
        >
          <FileOutlined style={{ marginInlineEnd: 8 }} />
          <Text style={{ fontSize: 12, flex: 1, minWidth: 0 }} ellipsis>{doc.name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{formatSize(doc.size)}</Text>
        </List.Item>
      )}
    />
  );

  // ── خلاصه نهایی ──
  if (step.status === 'done') {
    return (
      <StepCard step={step} stepLabel="تحویل و تأیید نهایی">
        <SummaryRow label="اسناد تأمین‌کننده" value={`${formatNumber(step.payload.supplierDocs.length)} سند`} />
        <SummaryRow label="اسناد مزرعه‌دار" value={`${formatNumber(step.payload.farmDocs.length)} سند`} />
        <div style={{ marginTop: 8 }}>
          <Tag color="success">تأیید نهایی هر دو طرف ثبت شد</Tag>
        </div>
      </StepCard>
    );
  }

  return (
    <StepCard step={step} stepLabel="تحویل و تأیید نهایی">
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        مدارک وزن‌کشی (باسکول) و اسناد مربوطه را بارگذاری کنید؛ تکمیل این گام به تأیید هر دو طرف نیاز دارد.
      </Text>

      {/* اسناد من */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text strong style={{ fontSize: 13 }}>اسناد شما ({ROLE_LABELS[role]})</Text>
          <Upload beforeUpload={(file) => { handleAddDoc(file); return false; }} showUploadList={false} multiple accept=".jpg,.jpeg,.png,.pdf">
            <Button size="small" icon={<UploadOutlined />}>بارگذاری سند</Button>
          </Upload>
        </div>
        {docList(step.payload[myKey], true)}
      </div>

      {/* اسناد طرف مقابل */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
          اسناد {ROLE_LABELS[role === 'supplier' ? 'farm' : 'supplier']}
        </Text>
        {docList(step.payload[otherKey], false)}
      </div>

      <Button
        type="primary" size="large" block icon={<CheckOutlined />}
        disabled={step.payload[myConfirmKey]}
        onClick={handleConfirm}
      >
        {step.payload[myConfirmKey] ? 'تأیید شما ثبت شده' : `تأیید تحویل (${ROLE_LABELS[role]})`}
      </Button>
      {step.payload[myConfirmKey] && !step.payload[otherConfirmKey] && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
          منتظر تأیید {ROLE_LABELS[role === 'supplier' ? 'farm' : 'supplier']} هستید.
        </Text>
      )}
    </StepCard>
  );
}
