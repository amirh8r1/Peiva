import { Button, Card, Space, Tag, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { CONTRACT_STATUS_COLORS, CONTRACT_STATUS_LABELS } from '@/types/contract';
import type { Contract, ContractProgressStep } from '@/types';
import { ContractProgressMini } from '@/features/progress/components/ContractProgressMini';
import { formatNumber, toPersianDigits } from '@/utils/format';

const { Text } = Typography;

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

/** کارت قرارداد (کار) مشترک هر سه نقش — وضعیت، سهم تأمین‌کننده، مزرعه، پیشرفت. */
export function ContractCard({ contract, steps, onOpen, openLabel = 'مشاهده جزئیات', extra }: ContractCardProps) {
  const { estimation } = contract;
  return (
    <Card>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Text strong>{contract.name}</Text>
          <Tag color={CONTRACT_STATUS_COLORS[contract.status]} style={{ margin: 0 }}>
            {CONTRACT_STATUS_LABELS[contract.status]}
          </Tag>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {contract.farmName} · {contract.province} · تحویل هدف {toPersianDigits(contract.targetDeliveryDate)}
        </Text>
        <Space size={4} wrap>
          <Tag color="green">سهم تأمین‌کننده ٪{formatNumber(estimation.supplierSharePercent)}</Tag>
          <Tag color="blue">{formatNumber(estimation.supplierShareKg)} کیلوگرم مرغ</Tag>
        </Space>
        {contract.status === 'finalized' && <ContractProgressMini steps={steps} />}
        {extra && <div style={{ marginTop: 4 }}>{extra}</div>}
        {onOpen && (
          <Button size="small" icon={<ArrowLeftOutlined />} onClick={onOpen} style={{ marginTop: 4, alignSelf: 'flex-start' }}>
            {openLabel}
          </Button>
        )}
      </Space>
    </Card>
  );
}
