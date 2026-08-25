import { Card, Space, Tag, Typography } from 'antd';
import { REQUEST_INPUT_LABELS } from '@/types/request';
import type { RequestInputKind, SupplierRequest } from '@/types/request';
import { formatNumber, toPersianDigits } from '@/utils/format';
import { RequestStatusTag } from './RequestStatusTag';

const { Text } = Typography;

/** چیپ نهاده درخواست: «۲۰ تن دان» / «۵٬۰۰۰ قطعه جوجه» / «۱۰ میلیون تومان نقدی». */
function inputChip(kind: RequestInputKind, amount: number): string {
  const { label, unit } = REQUEST_INPUT_LABELS[kind];
  return `${formatNumber(amount)} ${unit} ${label}`;
}

interface RequestSummaryCardProps {
  request: SupplierRequest;
  onClick?: () => void;
}

/** کارت خلاصه درخواست تأمین‌کننده — در صندوق ادمین و لیست درخواست‌های تأمین‌کننده. */
export function RequestSummaryCard({ request, onClick }: RequestSummaryCardProps) {
  return (
    <Card hoverable={!!onClick} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Text strong>{formatNumber(request.desiredKg)} کیلوگرم مرغ زنده</Text>
          <RequestStatusTag status={request.status} />
        </Space>
        <Space size={4} wrap>
          {request.inputs.map((i) => (
            <Tag key={i.kind} color="green">{inputChip(i.kind, i.amount)}</Tag>
          ))}
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {request.province} · تحویل هدف {toPersianDigits(request.targetDeliveryDate)}
          {request.estimation ? ` · سهم تأمین‌کننده ٪${formatNumber(request.estimation.supplierSharePercent)}` : ''}
        </Text>
      </Space>
    </Card>
  );
}
