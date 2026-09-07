import { Card, Typography, Timeline, theme } from 'antd';
import { ROLE_LABELS, STEP_ROLES } from '@/types';
import type { ContractProgressStep, ProgressEvent, ProgressStepStatus } from '@/types';
import { pivaType } from '@/config/theme';
import { StatusTag, type StatusTone } from '@/components/ui/StatusTag';

const { Text } = Typography;

const STATUS_LABELS: Record<ProgressStepStatus, { text: string; tone: StatusTone }> = {
  idle: { text: 'در انتظار', tone: 'neutral' },
  claimed: { text: 'در جریان', tone: 'info' },
  rejected: { text: 'رد شده', tone: 'error' },
  done: { text: 'تکمیل', tone: 'success' },
};

const EVENT_META: Record<ProgressEvent['type'], { label: string; color: string }> = {
  claimed: { label: 'ثبت ادعا', color: 'blue' },
  confirmed: { label: 'تأیید', color: 'green' },
  rejected: { label: 'رد', color: 'red' },
  document: { label: 'بارگذاری سند', color: 'gray' },
  announced: { label: 'اعلام مشخصات', color: 'blue' },
  updated: { label: 'به‌روزرسانی مشخصات', color: 'blue' },
};

function roleHint(step: ContractProgressStep): string | null {
  if (step.status === 'claimed' && step.claimedBy) {
    const responder = STEP_ROLES[step.key].responder;
    if (responder === null) return `${ROLE_LABELS[step.claimedBy]} ثبت کرده`;
    return responder === 'both'
      ? 'در انتظار اقدام هر دو طرف'
      : `${ROLE_LABELS[step.claimedBy]} ثبت کرده — در انتظار بازخورد ${ROLE_LABELS[responder]}`;
  }
  if (step.status === 'rejected') return 'بازخورد رد دریافت شده — نیاز به اصلاح و ارسال مجدد';
  return null;
}

interface StepCardProps {
  step: ContractProgressStep;
  stepLabel: string;
  children?: React.ReactNode;
}

/** پوسته مشترک کارت هر گام: عنوان + وضعیت + خط نقش + Timeline رویدادها + بدنه. */
export function StepCard({ step, stepLabel, children }: StepCardProps) {
  const status = STATUS_LABELS[step.status];
  const hint = roleHint(step);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Text strong style={{ fontSize: 14 }}>{stepLabel}</Text>
          <StatusTag tone={status.tone}>{status.text}</StatusTag>
        </div>
      }
      style={{ marginBottom: 12 }}
    >
      {hint && (
        <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', marginBottom: 8 }}>
          {hint}
        </Text>
      )}

      {step.events.length > 0 && (
        <Timeline
          style={{ marginBottom: children ? 12 : 0 }}
          items={step.events.map((e) => ({
            color: EVENT_META[e.type].color,
            children: (
              <div>
                <Text style={{ fontSize: 12 }}>{EVENT_META[e.type].label}</Text>
                <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>
                  {' — '}{ROLE_LABELS[e.by]} · {e.at}
                </Text>
                {e.note && (
                  <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block' }}>{e.note}</Text>
                )}
              </div>
            ),
          }))}
        />
      )}

      {children}
    </Card>
  );
}

/** ردیف label/value ساده برای خلاصه اطلاعات — مشترک بین کارت‌های گام‌ها و کارت‌های لیست. */
export function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
      <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, flexShrink: 0 }}>{label}</Text>
      <Text style={{ fontSize: pivaType.body.fontSize, fontWeight: 600, textAlign: 'start' }}>{value}</Text>
    </div>
  );
}
