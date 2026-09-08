import { Card, Space, Tag, Typography, theme } from 'antd';
import { REQUEST_INPUT_LABELS } from '@/types/request';
import type { RequestInputKind, SupplierRequest } from '@/types/request';
import { formatNumber, toPersianDigits } from '@/utils/format';
import { requestEstimatedBirds } from '@/utils/estimation';
import { RequestStatusTag } from './RequestStatusTag';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

/** چیپ نهاده درخواست: «۲۰ تن دان» / «۵٬۰۰۰ قطعه جوجه» / «مشارکت کامل سرمایه در گردش» (بدون مبلغ). */
function inputChip(kind: RequestInputKind, amount: number): string {
  if (kind === 'cash') return 'مشارکت کامل سرمایه در گردش';
  const { label, unit } = REQUEST_INPUT_LABELS[kind];
  return `${formatNumber(amount)} ${unit} ${label}`;
}

interface RequestSummaryCardProps {
  request: SupplierRequest;
  onClick?: () => void;
}

/** کارت خلاصه درخواست مشارکت‌کننده — در صندوق ادمین و لیست درخواست‌های مشارکت‌کننده. */
export function RequestSummaryCard({ request, onClick }: RequestSummaryCardProps) {
  const { token } = theme.useToken();
  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={onClick ? 'piva-lift' : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
          <Text strong style={{ fontSize: pivaType.body.fontSize }}>{formatNumber(requestEstimatedBirds(request))} قطعه مرغ زنده</Text>
          <RequestStatusTag status={request.status} />
        </Space>
        <Space size={6} wrap>
          {request.inputs.map((i) => (
            <Tag key={i.kind} style={{
              margin: 0,
              background: token.colorFillSecondary,
              border: 'none',
              borderRadius: 999,
              fontSize: pivaType.secondary.fontSize,
            }}>
              {inputChip(i.kind, i.amount)}
            </Tag>
          ))}
        </Space>
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>
          {request.province} · تحویل نهاده {toPersianDigits(request.targetDeliveryDate)} · حدود {formatNumber(request.desiredKg)} کیلوگرم
          {request.targetWeightPerBirdKg != null ? ` · وزن هر مرغ ${formatNumber(request.targetWeightPerBirdKg)} کیلوگرم` : ''}
          {request.estimation ? ` · سهم مشارکت‌کننده ٪${formatNumber(request.estimation.supplierSharePercent)}` : ''}
        </Text>
      </Space>
    </Card>
  );
}
