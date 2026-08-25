import { Space } from 'antd';
import { ProfitShareBadge } from '@/components/ui/ProfitShareBadge';
import { SummaryRow } from '@/features/progress/components/StepCard';
import { formatNumber } from '@/utils/format';
import type { ShareComputation } from '@/utils/estimation';

interface ShareSummaryProps {
  share: ShareComputation;
  /** لیبل بج — در پنل تأمین‌کننده «سهم شما از تولید» */
  label?: string;
}

/** پنل سهم تأمین‌کننده — شفافیت کامل: درصد، کیلوگرم، ارزش‌ها. */
export function ShareSummary({ share, label = 'سهم تأمین‌کننده از تولید' }: ShareSummaryProps) {
  return (
    <ProfitShareBadge percent={share.supplierSharePercent} label={label}>
      <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 8 }}>
        <SummaryRow label="سهم از تولید" value={`${formatNumber(share.supplierShareKg)} کیلوگرم مرغ زنده`} />
        <SummaryRow label="ارزش تولید" value={`${formatNumber(share.productionValue)} تومان`} />
        <SummaryRow label="کل هزینه تولید" value={`${formatNumber(share.totalCost)} تومان`} />
        <SummaryRow label="ارزش نهاده تأمین‌کننده" value={`${formatNumber(share.supplierInputCost)} تومان`} />
      </Space>
    </ProfitShareBadge>
  );
}
