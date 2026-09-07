import { Button, Card, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { CONTRACT_STATUS_LABELS } from '@/types/contract';
import type { Contract, ContractProgressStep } from '@/types';
import { ContractProgressMini } from '@/features/progress/components/ContractProgressMini';
import { SummaryRow } from '@/features/progress/components/StepCard';
import { StatusTag, type StatusTone } from '@/components/ui/StatusTag';
import { formatNumber, toPersianDigits } from '@/utils/format';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

/** تن semantic وضعیت قرارداد — هم‌زبان بج‌های وضعیت کل سامانه. */
const STATUS_TONES: Record<Contract['status'], StatusTone> = {
  awaiting_farm: 'warning',
  finalized: 'info',
  completed: 'success',
  cancelled: 'neutral',
};

interface ContractCardProps {
  contract: Contract;
  /** گام‌های فلو این قرارداد (ممکن است خالی باشد — قبل از نهایی شدن) */
  steps: ContractProgressStep[];
  /** ناوبری به جزئیات/پیگیری — undefined = دکمه رندر نمی‌شود (قرارداد هنوز نهایی نیست) */
  onOpen?: () => void;
  openLabel?: string;
  /** اکشن اضافه نقش (مثلاً دکمه «تأیید هماهنگی» برای مزرعه‌دار) */
  extra?: React.ReactNode;
}

/** کارت قرارداد (کار) مشترک هر سه نقش — هدر وضعیتدار، ردیف سهم شفاف، پیشرفت، اکشن فوتر. */
export function ContractCard({ contract, steps, onOpen, openLabel = 'مشاهده جزئیات', extra }: ContractCardProps) {
  const { estimation } = contract;
  return (
    <Card>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Text strong style={{ fontSize: pivaType.body.fontSize }}>{contract.name}</Text>
          <StatusTag tone={STATUS_TONES[contract.status]}>{CONTRACT_STATUS_LABELS[contract.status]}</StatusTag>
        </Space>
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>
          {contract.farmName} · {contract.province} · تحویل هدف {toPersianDigits(contract.targetDeliveryDate)}
        </Text>
        <SummaryRow
          label="سهم مشارکت‌کننده"
          value={`٪${formatNumber(estimation.supplierSharePercent)} — ${formatNumber(estimation.supplierShareKg)} کیلوگرم مرغ`}
        />
        {contract.status === 'finalized' && <ContractProgressMini steps={steps} />}
        {extra && <div style={{ marginTop: 4 }}>{extra}</div>}
        {onOpen && (
          <Button type="link" size="small" icon={<ArrowLeftOutlined />} onClick={onOpen}
            style={{ padding: 0, alignSelf: 'flex-start', fontWeight: 600 }}>
            {openLabel}
          </Button>
        )}
      </Space>
    </Card>
  );
}
