import { Progress, Typography, theme } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { PROGRESS_STEPS } from '@/types';
import { toPersianDigits } from '@/utils/format';
import type { ContractProgressStep } from '@/types';
import { StatusTag } from '@/components/ui/StatusTag';
import { pivaType } from '@/config/theme';

const { Text } = Typography;

/**
 * نمایش کوچک وضعیت پراگرس روی کارت قرارداد (اورویو) —
 * کاربر بدون باز کردن کارت بداند قرارداد در چه مرحله‌ای است.
 * اگر گامی وجود نداشته باشد چیزی رندر نمی‌شود.
 */
export function ContractProgressMini({ steps }: { steps: ContractProgressStep[] }) {
  const { token } = theme.useToken();
  if (steps.length === 0) return null;

  const done = steps.filter((s) => s.status === 'done').length;
  const active = steps.find((s) => s.status !== 'done');

  // تکمیل شده
  if (!active) {
    return (
      <div style={{ marginTop: 8 }}>
        <StatusTag tone="success">
          <CheckCircleFilled style={{ fontSize: 10 }} /> تمام مراحل تکمیل شده
        </StatusTag>
      </div>
    );
  }

  const pct = Math.round((done / PROGRESS_STEPS.length) * 100);
  const label = PROGRESS_STEPS.find((s) => s.key === active.key)?.label ?? '';

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>
          مرحله {toPersianDigits(done + 1)} از {toPersianDigits(PROGRESS_STEPS.length)}
        </Text>
        <Text style={{ fontSize: pivaType.caption.fontSize, color: token.colorPrimary, textAlign: 'start' }}>{label}</Text>
      </div>
      <Progress percent={pct} size="small" showInfo={false} strokeColor={token.colorPrimary} trailColor={token.colorBorderSecondary} style={{ margin: 0 }} />
    </div>
  );
}
