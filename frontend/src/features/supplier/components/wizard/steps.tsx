/**
 * بدنه گام‌های ویزارد قرارداد جدید + پنل اورویو کناری (فاکتور).
 * گام ۱: انتخاب آورده‌ها (چک‌باکس → اینپوت مقدار) | گام ۲: پارامترهای درخواست
 * گام ۳: برآورد سهم | گام ۴: خلاصه و ارسال
 */
import { useState } from 'react';
import { Card, Checkbox, Form, InputNumber, Typography, theme } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';
import { NumberField, DateField, SelectField } from '@/features/progress/components/fields';
import { numberFieldProps } from '@/utils/fieldProps';
import { SummaryRow } from '@/features/progress/components/StepCard';
import { ShareSplitBar } from '@/components/ui/ShareSplitBar';
import { useIsDesktop } from '@/hooks/useResponsive';
import { REQUEST_INPUT_LABELS, IRAN_PROVINCES } from '@/types/request';
import type { RequestInput, RequestInputKind } from '@/types/request';
import type { ParticipationComputation } from '@/utils/participation';
import { formatNumber, toPersianDigits } from '@/utils/format';
import { pivaTokens, pivaType } from '@/config/theme';

const { Text } = Typography;

// ── draft ویزارد ──

export interface WizardDraft {
  feed?: number;
  chick?: number;
  cash?: number;
  desiredKg?: number;
  deliveryDate?: Dayjs;
  province?: string;
}

export const draftInputs = (draft: WizardDraft): RequestInput[] => {
  const list: RequestInput[] = [];
  if (draft.feed) list.push({ kind: 'feed', amount: draft.feed });
  if (draft.chick) list.push({ kind: 'chick', amount: draft.chick });
  if (draft.cash) list.push({ kind: 'cash', amount: draft.cash });
  return list;
};

// ── گام ۱: آورده‌ها ──

const CONTRIBUTION_CARDS: { kind: RequestInputKind; title: string; desc: string }[] = [
  { kind: 'feed', title: 'نهاده', desc: 'دان مرغی موردنیاز دوره پرورش' },
  { kind: 'chick', title: 'جوجه یک‌روزه', desc: 'جوجه‌های آماده پرورش' },
  { kind: 'cash', title: 'اعتبار مالی', desc: 'وجه نقد برای تأمین سایر هزینه‌ها' },
];

interface StepOneProps {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

/** گام ۱ — سه کارت آورده؛ تیک = نمایش اینپوت مقدار. */
export function StepOneBody({ draft, onChange }: StepOneProps) {
  const { token } = theme.useToken();
  const isDesktop = useIsDesktop();

  return (
    <div>
      <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 12 }}>
        کدام یک از آورده‌ها را در این قرارداد ارائه می‌دهید؟ (حداقل یکی)
      </Text>
      {CONTRIBUTION_CARDS.map((c) => {
        const checked = draft[c.kind] != null;
        return (
          <Card
            key={c.kind}
            style={{
              marginBottom: 10,
              border: checked ? `1.5px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
            }}
            styles={{ body: { padding: 14 } }}
          >
            <Checkbox
              checked={checked}
              onChange={(e) => onChange({ [c.kind]: e.target.checked ? 0 : undefined })}
              style={{ fontWeight: 600 }}
            >
              {c.title}
              <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', fontWeight: 400 }}>
                {c.desc} — واحد: {REQUEST_INPUT_LABELS[c.kind].unit}
              </Text>
            </Checkbox>
            {checked && (
              <div style={{ marginTop: 10, maxWidth: 320 }}>
                <InputNumber
                  size={isDesktop ? 'middle' : 'large'}
                  min={1}
                  placeholder="مقدار"
                  addonAfter={REQUEST_INPUT_LABELS[c.kind].unit}
                  parser={numberFieldProps.parser}
                  formatter={numberFieldProps.formatter}
                  value={draft[c.kind]}
                  onChange={(v) => onChange({ [c.kind]: Number(v) || undefined })}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── گام ۲: پارامترهای درخواست ──

export interface StepTwoValues {
  desiredKg: number;
  deliveryDate: Dayjs;
  province: string;
}

interface StepTwoProps {
  form: FormInstance<StepTwoValues>;
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

/** گام ۲ — وزن مرغ مطلوب، زمان تحویل حدودی، استان. draft با onValuesChange همگام می‌ماند. */
export function StepTwoBody({ form, draft, onChange }: StepTwoProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ desiredKg: draft.desiredKg, deliveryDate: draft.deliveryDate, province: draft.province }}
      onValuesChange={(_, all) => onChange({
        desiredKg: all.desiredKg,
        deliveryDate: all.deliveryDate,
        province: all.province,
      })}
    >
      <Form.Item
        name="desiredKg"
        rules={[{ required: true, message: 'وزن مرغ مطلوب را وارد کنید' }]}
      >
        <NumberField
          label="وزن مرغ مطلوب"
          unit="کیلوگرم"
          hint="مقدار کل مرغ زنده‌ای که در پایان دوره می‌خواهید"
        />
      </Form.Item>
      <Form.Item
        name="province"
        rules={[{ required: true, message: 'استان را انتخاب کنید' }]}
      >
        <SelectField
          label="استان مدنظر"
          options={IRAN_PROVINCES.map((p) => ({ value: p, label: p }))}
          placeholder="انتخاب استان"
        />
      </Form.Item>
      <Form.Item
        name="deliveryDate"
        rules={[{ required: true, message: 'زمان تحویل حدودی را انتخاب کنید' }]}
      >
        <DateField
          label="زمان تحویل حدودی"
          hint="تاریخ تقریبی — زمان دقیق پس از تأیید قرارداد قطعی می‌شود"
        />
      </Form.Item>
    </Form>
  );
}

// ── گام ۳: برآورد سهم ──

const BUCKET_COLOR = (key: string, token: { colorWarning: string; colorInfo: string; colorTextTertiary: string }): string => {
  if (key === 'participant') return pivaTokens.brandDeep;
  if (key === 'farm') return token.colorInfo;
  if (key === 'platform') return token.colorTextTertiary;
  return token.colorWarning;
};

interface StepThreeProps {
  participation: ParticipationComputation;
  desiredKg: number;
}

/** گام ۳ — سهم بازیگران: ردیف‌ها + بار تقسیم + کل. */
export function StepThreeBody({ participation, desiredKg }: StepThreeProps) {
  const { token } = theme.useToken();

  return (
    <div>
      <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 12 }}>
        سامانه بر اساس آورده‌های شما (حدود {formatNumber(desiredKg)} کیلوگرم مرغ زنده) این سهم‌ها را برآورد کرده است:
      </Text>

      <div style={{ marginBottom: 12 }}>
        {participation.buckets.map((b) => (
          <div key={b.key} style={{
            display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 12px', marginBottom: 6,
            background: b.key === 'participant' ? token.colorSuccessBg : token.colorFillQuaternary,
            border: `1px solid ${b.key === 'participant' ? token.colorSuccessBorder : 'transparent'}`,
            borderRadius: token.borderRadius,
          }}>
            <Text style={{ fontSize: pivaType.body.fontSize, fontWeight: b.key === 'participant' ? 600 : 400 }}>
              {b.label}
            </Text>
            <Text style={{ fontSize: pivaType.body.fontSize, textAlign: 'start' }}>
              ٪{formatNumber(b.percent)} · {formatNumber(b.amountToman)} تومان
            </Text>
          </div>
        ))}
      </div>

      <ShareSplitBar segments={participation.buckets.map((b) => ({
        key: b.key,
        label: b.label,
        percent: b.percent,
        color: BUCKET_COLOR(b.key, token),
      }))} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 12px', marginTop: 10, background: token.colorFillSecondary, borderRadius: token.borderRadius }}>
        <Text strong style={{ fontSize: pivaType.body.fontSize }}>ارزش کل تولید</Text>
        <Text strong style={{ fontSize: pivaType.body.fontSize }}>{formatNumber(participation.productionValue)} تومان</Text>
      </div>
    </div>
  );
}

// ── پنل اورویو (فاکتور کناری) ──

interface OverviewProps {
  participation: ParticipationComputation;
  desiredKg: number;
}

/** اورویو کناری دسکتاپ — مثل فاکتور، وضعیت را یک‌جا نشان می‌دهد. */
export function OverviewAside({ participation, desiredKg }: OverviewProps) {
  const { token } = theme.useToken();

  return (
    <Card style={{ position: 'sticky', top: 16, border: `1px solid ${token.colorBorderSecondary}` }} styles={{ body: { padding: 16 } }}>
      <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', textAlign: 'center' }}>
        تعداد حدودی مرغ زنده تحویلی
      </Text>
      <div style={{ textAlign: 'center', margin: '6px 0 12px' }}>
        <span style={{ fontSize: pivaType.statValue.fontSize, fontWeight: 800, color: token.colorPrimary, lineHeight: 1.2 }}>
          {formatNumber(participation.estimatedBirds)}
        </span>
        <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block' }}>
          قطعه (حدود {formatNumber(participation.productionKg)} کیلوگرم)
        </Text>
      </div>
      <SummaryRow label="وزن مرغ مطلوب" value={`${formatNumber(desiredKg)} کیلوگرم`} />
      <SummaryRow
        label="سهم مشارکت‌کننده"
        value={`٪${formatNumber(participation.shares.participant)} — ${formatNumber(Math.round(participation.shares.participant * participation.productionKg / 100))} کیلوگرم مرغ`}
      />
      <SummaryRow label="ارزش تولید" value={`${formatNumber(participation.productionValue)} تومان`} />
    </Card>
  );
}

/** اورویو موبایل — باکس قابل باز/بسته زیر استپر: اعداد کلیدی همیشه دیده، جزئیات با expand. */
export function MobileOverview({ participation, desiredKg }: OverviewProps) {
  const { token } = theme.useToken();
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: token.borderRadiusLG,
      background: token.colorBgContainer,
      marginBottom: 14,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: '10px 14px',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
          <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>قرارداد</Text>
          <span style={{ fontSize: 15, fontWeight: 800, color: token.colorPrimary }}>
            {formatNumber(participation.estimatedBirds)} مرغ
          </span>
          <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>
            · سهم شما ٪{formatNumber(participation.shares.participant)}
          </Text>
        </span>
        <DownOutlined
          rotate={expanded ? 180 : 0}
          style={{ color: token.colorTextTertiary, flexShrink: 0, transition: 'transform var(--piva-duration-tab) var(--piva-ease-enter)' }}
        />
      </button>
      {expanded && (
        <div style={{ padding: '0 14px 10px', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          <SummaryRow label="تعداد حدودی مرغ" value={`${formatNumber(participation.estimatedBirds)} قطعه (حدود ${formatNumber(participation.productionKg)} کیلوگرم)`} />
          <SummaryRow
            label="سهم مشارکت‌کننده"
            value={`٪${formatNumber(participation.shares.participant)} — ${formatNumber(Math.round(participation.shares.participant * participation.productionKg / 100))} کیلوگرم مرغ`}
          />
          <SummaryRow label="وزن مرغ مطلوب" value={`${formatNumber(desiredKg)} کیلوگرم`} />
          <SummaryRow label="ارزش تولید" value={`${formatNumber(participation.productionValue)} تومان`} />
        </div>
      )}
    </div>
  );
}

// ── گام ۴: خلاصه و ارسال ──

interface StepFourProps {
  draft: WizardDraft;
  inputs: RequestInput[];
  participation: ParticipationComputation;
}

/** گام ۴ — خلاصه کامل: آورده‌ها + پارامترها + منفعت. */
export function StepFourBody({ draft, inputs, participation }: StepFourProps) {
  const inputLabel = (kind: RequestInputKind) => {
    const titles: Record<RequestInputKind, string> = { feed: 'نهاده (دان مرغی)', chick: 'جوجه یک‌روزه', cash: 'اعتبار مالی' };
    return titles[kind];
  };

  return (
    <div>
      <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>آورده‌های شما</Text>
      <Card style={{ marginBottom: 12 }} styles={{ body: { padding: '8px 16px' } }}>
        {inputs.map((i) => (
          <SummaryRow key={i.kind} label={inputLabel(i.kind)} value={`${formatNumber(i.amount)} ${REQUEST_INPUT_LABELS[i.kind].unit}`} />
        ))}
      </Card>

      <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>پارامترهای درخواست</Text>
      <Card style={{ marginBottom: 12 }} styles={{ body: { padding: '8px 16px' } }}>
        <SummaryRow label="وزن مرغ مطلوب" value={`${formatNumber(draft.desiredKg ?? 0)} کیلوگرم مرغ زنده`} />
        <SummaryRow label="زمان تحویل حدودی" value={toPersianDigits(draft.deliveryDate?.format('YYYY/MM/DD') ?? '')} />
        <SummaryRow label="استان" value={draft.province ?? ''} />
      </Card>

      <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>منفعت شما</Text>
      <Card styles={{ body: { padding: '8px 16px' } }}>
        <SummaryRow label="تعداد حدودی مرغ تحویلی" value={`${formatNumber(participation.estimatedBirds)} قطعه`} />
        <SummaryRow
          label="سهم مشارکت‌کننده"
          value={`٪${formatNumber(participation.shares.participant)} — ${formatNumber(Math.round(participation.shares.participant * participation.productionKg / 100))} کیلوگرم مرغ زنده`}
        />
        <SummaryRow label="ارزش کل تولید" value={`${formatNumber(participation.productionValue)} تومان`} />
      </Card>

      <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', marginTop: 12 }}>
        با ارسال، قرارداد شما برای بررسی به زنجیره‌دار می‌رود — پس از تأیید، مزرعه تطبیق و کار وارد فاز اجرا می‌شود.
      </Text>
    </div>
  );
}
