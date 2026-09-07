import { useMemo } from 'react';
import { InputNumber, Typography, theme } from 'antd';
import { computeShares } from '@/utils/estimation';
import { numberFieldProps } from '@/utils/fieldProps';
import { formatNumber } from '@/utils/format';
import { useIsDesktop } from '@/hooks/useResponsive';
import { pivaType } from '@/config/theme';
import type { EstimationRow } from '@/types/request';

const { Text } = Typography;

export const ESTIMATION_OWNER_LABELS: Record<EstimationRow['owner'], string> = {
  supplier: 'تأمین‌کننده',
  farm: 'مزرعه‌دار',
  admin: 'زنجیره‌دار',
};

interface EstimationTableProps {
  rows: EstimationRow[];
  productionKg: number;
  /** قابل ویرایش (گام برآورد ادمین) — readonly در نمایش شفافیت */
  editable?: boolean;
  onChange?: (rows: EstimationRow[]) => void;
}

/**
 * جدول شفافیت برآورد هزینه — مبلغ هر ردیف زنده از productionKg محاسبه می‌شود؛
 * ردیف‌های مالکِ تأمین‌کننده tint سبز (مبنای سهم) هستند. موبایل: ردیف‌های عمودی.
 */
export function EstimationTable({ rows, productionKg, editable, onChange }: EstimationTableProps) {
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();
  const shares = useMemo(() => computeShares(rows, productionKg), [rows, productionKg]);

  const updateRow = (key: EstimationRow['key'], amount: number) => {
    onChange?.(rows.map((r) => (r.key === key ? { ...r, amount } : r)));
  };

  /** مبلغ نهایی هر ردیف — percent → از ارزش تولید. */
  const rowValue = (row: EstimationRow) =>
    row.kind === 'percent' ? Math.round((row.amount / 100) * shares.productionValue) : row.amount;

  return (
    <div>
      {rows.map((row) => (
        <div key={row.key} style={{
          display: 'flex',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'stretch',
          gap: 8,
          padding: '8px 12px',
          marginBottom: 8,
          background: row.owner === 'supplier' ? token.colorSuccessBg : token.colorFillQuaternary,
          border: `1px solid ${row.owner === 'supplier' ? token.colorSuccessBorder : 'transparent'}`,
          borderRadius: token.borderRadius,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: pivaType.body.fontSize, display: 'block' }}>{row.label}</Text>
            <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>
              {ESTIMATION_OWNER_LABELS[row.owner]}{row.owner === 'supplier' ? ' — مبنای سهم' : ''}
            </Text>
          </div>
          <div style={{ width: isDesktop ? 220 : '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
            {editable ? (
              <InputNumber
                size="small"
                min={0}
                max={row.kind === 'percent' ? 100 : undefined}
                value={row.amount}
                onChange={(v) => updateRow(row.key, Number(v) || 0)}
                addonAfter={row.kind === 'percent' ? '٪' : 'تومان'}
                parser={numberFieldProps.parser}
                formatter={numberFieldProps.formatter}
                style={{ width: '100%' }}
              />
            ) : (
              <Text style={{ fontSize: pivaType.body.fontSize }}>
                {row.kind === 'percent' ? `٪${formatNumber(row.amount)}` : `${formatNumber(row.amount)} تومان`}
              </Text>
            )}
            <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, whiteSpace: 'nowrap' }}>
              {formatNumber(rowValue(row))} تومان
            </Text>
          </div>
        </div>
      ))}

      {/* جمع‌بندی شفاف */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: 8, padding: '10px 12px',
        background: token.colorFillSecondary, borderRadius: token.borderRadius, marginBottom: 4,
      }}>
        <Text strong style={{ fontSize: pivaType.body.fontSize }}>کل هزینه تولید</Text>
        <Text strong style={{ fontSize: pivaType.body.fontSize }}>{formatNumber(shares.totalCost)} تومان</Text>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '10px 12px' }}>
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>ارزش تولید ({formatNumber(productionKg)} کیلوگرم × قیمت بازار)</Text>
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize }}>{formatNumber(shares.productionValue)} تومان</Text>
      </div>
    </div>
  );
}
