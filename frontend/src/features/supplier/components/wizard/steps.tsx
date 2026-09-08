/**
 * بدنه گام‌های ویزارد سفارش جدید (۶ گام) + پنل اورویو کناری (پیش‌فاکتور).
 * گام ۰: مبنای سفارش | گام ۱: نهاده (مقدار + ترکیب ۷۰/۳۰ + تاریخ تحویل)
 * گام ۲: وزن مطلوب هر مرغ + استان | گام ۳: محاسبه جوجه لازم + مشارکت اختیاری جوجه/سرمایه
 * گام ۴: پیش‌فاکتور (سهم + تلرانس ±۱۰٪) | گام ۵: پیش‌قرارداد (تعهدات طرفین)
 */
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Checkbox, Form, InputNumber, Typography, theme } from 'antd';
import { CheckCircleFilled, DownOutlined, DownloadOutlined, AppstoreOutlined, DatabaseOutlined, NumberOutlined, SwapOutlined, ThunderboltOutlined, WalletOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';
import { NumberField, DateField, SelectField, FieldLabel } from '@/features/progress/components/fields';
import { numberFieldProps } from '@/utils/fieldProps';
import { SummaryRow } from '@/features/progress/components/StepCard';
import { ShareSplitBar } from '@/components/ui/ShareSplitBar';
import { useIsDesktop } from '@/hooks/useResponsive';
import { formGrid } from '@/utils/responsive';
import { ESTIMATION_CONSTANTS } from '@/utils/estimation';
import { SHARE_BY_KIND, type ParticipationComputation } from '@/utils/participation';
import { IRAN_PROVINCES } from '@/types/request';
import type { ParticipationBucket, RequestBasisKind, RequestInput } from '@/types/request';
import { formatNumber, toPersianDigits } from '@/utils/format';
import { pivaTokens, pivaType } from '@/config/theme';

const { Text } = Typography;

// ── draft ویزارد ──

export interface WizardDraft {
  basis?: RequestBasisKind;
  /** نهاده (تن) */
  feed?: number;
  feedDeliveryDate?: Dayjs;
  /** وزن مطلوب هر مرغ زنده (کیلوگرم) */
  perBirdKg?: number;
  province?: string;
  /** مشارکت کامل (۱۰۰٪) جوجه / سرمایه در گردش — تیک = سهم کامل، بدون مقدار */
  chick?: boolean;
  cash?: boolean;
}

/** آورده‌های درخواست — مقدارها از محاسبات می‌آیند: مشارکت جوجه یعنی تأمین کامل جوجه لازم،
 *  سرمایه در گردش یعنی پوشش کامل سایر هزینه‌ها. */
export const draftInputs = (draft: WizardDraft, productionKg: number, perBirdKg?: number): RequestInput[] => {
  const list: RequestInput[] = [];
  if (draft.feed) list.push({ kind: 'feed', amount: draft.feed });
  if (draft.chick && productionKg > 0 && perBirdKg != null) {
    const { survivalRate } = ESTIMATION_CONSTANTS;
    list.push({ kind: 'chick', amount: Math.ceil(productionKg / (survivalRate * perBirdKg)) });
  }
  if (draft.cash && productionKg > 0) {
    const { livePricePerKg } = ESTIMATION_CONSTANTS;
    // معادل ارزشی سهم سرمایه در گردش — فقط برای محاسبه سهم داخلی، جایی نمایش داده نمی‌شود
    list.push({ kind: 'cash', amount: Math.round(productionKg * livePricePerKg * (SHARE_BY_KIND.cash / 100)) });
  }
  return list;
};

// ── کارت انتخاب — حالت عادی (قابل انتخاب) و غیرفعال (به‌زودی) با یک ساختار ──

interface ChoiceCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function ChoiceCard({ icon, title, desc, selected, disabled, onClick }: ChoiceCardProps) {
  const { token } = theme.useToken();

  return (
    <Card
      hoverable={!disabled}
      onClick={disabled ? undefined : onClick}
      style={{
        marginBottom: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        border: selected ? `1.5px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
        background: selected ? token.colorPrimaryBg : token.colorBgContainer,
      }}
      styles={{ body: { padding: 14 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: selected ? token.colorSuccessBgHover : token.colorFillSecondary,
          color: selected ? token.colorPrimary : token.colorTextTertiary,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong style={{ fontSize: pivaType.body.fontSize, display: 'block' }}>{title}</Text>
          <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block' }}>{desc}</Text>
        </div>
        {selected ? (
          <CheckCircleFilled style={{ fontSize: 20, color: token.colorPrimary, flexShrink: 0 }} />
        ) : disabled ? (
          <span style={{
            flexShrink: 0,
            padding: '2px 10px',
            borderRadius: 999,
            background: token.colorFillSecondary,
            border: `1px solid ${token.colorBorderSecondary}`,
            color: token.colorTextSecondary,
            fontSize: pivaType.caption.fontSize,
            fontWeight: 600,
          }}>
            به‌زودی
          </span>
        ) : null}
      </div>
    </Card>
  );
}

// ── گام ۰: مبنای سفارش ──

interface StepZeroProps {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

const BASIS_CHOICES: { kind: RequestBasisKind; icon: React.ReactNode; title: string; desc: string; disabled?: boolean }[] = [
  { kind: 'production', icon: <SwapOutlined />, title: 'مشارکت در تولید', desc: 'تأمین نهاده و دریافت سهم شفاف از مرغ تولیدی' },
  { kind: 'count', icon: <NumberOutlined />, title: 'تعداد', desc: 'سفارش تعداد مشخصی مرغ', disabled: true },
  { kind: 'other', icon: <AppstoreOutlined />, title: 'سایر', desc: 'روش‌های دیگر همکاری', disabled: true },
];

/** گام ۰ — سفارش بر چه مبنایی است؟ فعلاً فقط «مشارکت در تولید» فعال است. */
export function StepZeroBody({ draft, onChange }: StepZeroProps) {
  return (
    <div>
      <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 12 }}>
        سفارش جدید شما بر چه مبنایی است؟
      </Text>
      {BASIS_CHOICES.map((c) => (
        <ChoiceCard
          key={c.kind}
          icon={c.icon}
          title={c.title}
          desc={c.desc}
          selected={draft.basis === c.kind}
          disabled={c.disabled}
          onClick={() => onChange({ basis: c.kind })}
        />
      ))}
    </div>
  );
}

// ── گام ۱: نهاده (آورده مشارکت‌کننده) ──

interface StepOneProps {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

const CONTRIBUTION_CHOICES: { kind: 'feed' | 'chick' | 'cash'; icon: React.ReactNode; title: string; desc: string; disabled?: boolean }[] = [
  { kind: 'feed', icon: <DatabaseOutlined />, title: 'نهاده', desc: 'دان مرغی موردنیاز دوره پرورش' },
  { kind: 'chick', icon: <ThunderboltOutlined />, title: 'جوجه یک‌روزه', desc: 'جوجه‌های آماده پرورش', disabled: true },
  { kind: 'cash', icon: <WalletOutlined />, title: 'سرمایه در گردش', desc: 'وجه نقد برای تأمین سایر هزینه‌ها', disabled: true },
];

const COMPOSITION_COLORS = { corn: pivaTokens.orange, soybean: pivaTokens.purple };

/** گام ۱ — چه آورده‌ای دارید؟ فعلاً فقط نهاده فعال: مقدار (تن) + ترکیب ۷۰/۳۰ + تاریخ تحویل. */
export function StepOneBody({ draft, onChange }: StepOneProps) {
  const { token } = theme.useToken();
  const isDesktop = useIsDesktop();
  const feedSelected = draft.feed != null;
  const c = ESTIMATION_CONSTANTS;

  return (
    <div>
      <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 12 }}>
        برای این سفارش چه آورده‌ای دارید؟
      </Text>
      {CONTRIBUTION_CHOICES.map((ch) => (
        <ChoiceCard
          key={ch.kind}
          icon={ch.icon}
          title={ch.title}
          desc={ch.desc}
          selected={ch.kind === 'feed' && feedSelected}
          disabled={ch.disabled}
          onClick={() => onChange({ feed: feedSelected ? undefined : 0 })}
        />
      ))}

      {feedSelected && (
        <Card style={{ marginTop: 4, border: `1px solid ${token.colorBorderSecondary}` }} styles={{ body: { padding: 16 } }}>
          <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 12 }}>جزئیات نهاده</Text>

          {/* مقدار و تاریخ در یک سطر (موبایل و دسکتاپ) تا باز شدن تقویم نیاز به اسکرول نداشته باشد */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0 12px' }}>
            <div>
              <FieldLabel>مقدار نهاده (تن)</FieldLabel>
              <InputNumber
                size={isDesktop ? 'middle' : 'large'}
                min={1}
                placeholder="مقدار"
                parser={numberFieldProps.parser}
                formatter={numberFieldProps.formatter}
                value={draft.feed}
                onChange={(v) => onChange({ feed: Number(v) || undefined })}
                style={{ width: '100%' }}
              />
            </div>
            {/* DateField فرگمنت برمی‌گرداند — باید داخل یک div باشد تا یک سلول گرید بگیرد */}
            <div>
              <DateField
                label="تاریخ تحویل نهاده"
                value={draft.feedDeliveryDate ?? null}
                onChange={(v) => onChange({ feedDeliveryDate: v ?? undefined })}
              />
            </div>
          </div>

          {/* اطلاع ترکیب استاندارد — ۷۰٪ ذرت / ۳۰٪ کنجاله سویا */}
          <div style={{
            marginTop: 12, padding: 12,
            background: token.colorFillQuaternary,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadius,
          }}>
            <Text strong style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 8 }}>
              ترکیب استاندارد نهاده
            </Text>
            <ShareSplitBar segments={[
              { key: 'corn', label: 'ذرت', percent: c.feedCornPercent, color: COMPOSITION_COLORS.corn },
              { key: 'soybean', label: 'کنجاله سویا', percent: c.feedSoybeanPercent, color: COMPOSITION_COLORS.soybean },
            ]} />
            <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', marginTop: 8 }}>
              نهاده تحویلی باید ٪{formatNumber(c.feedCornPercent)} ذرت و ٪{formatNumber(c.feedSoybeanPercent)} کنجاله سویا باشد — کیفیت نهاده هنگام تحویل توسط ناظر فنی بررسی می‌شود.
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── گام ۲: وزن مطلوب هر مرغ + استان ──

export interface StepTwoValues {
  perBirdKg: number;
  province: string;
}

interface StepTwoProps {
  form: FormInstance<StepTwoValues>;
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
}

/** گام ۲ — وزن مطلوب هر مرغ زنده در محصول نهایی + استان. draft با onValuesChange همگام می‌ماند. */
export function StepTwoBody({ form, draft, onChange }: StepTwoProps) {
  const isDesktop = useIsDesktop();

  // پیش‌فرض معقول وزن هر مرغ تا کاربر بدون ورود هم بتواند ادامه دهد
  useEffect(() => {
    if (draft.perBirdKg == null) onChange({ perBirdKg: 2.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ perBirdKg: draft.perBirdKg, province: draft.province }}
      onValuesChange={(_, all) => onChange({
        perBirdKg: all.perBirdKg,
        province: all.province,
      })}
    >
      <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', marginBottom: 12 }}>
        وزن هر مرغ در محصول نهایی و استان تولید را مشخص کنید.
      </Text>
      <div style={formGrid(isDesktop)}>
        <Form.Item
          name="perBirdKg"
          rules={[{ required: true, message: 'وزن مطلوب هر مرغ را وارد کنید' }]}
        >
          <NumberField
            label="وزن مطلوب هر مرغ زنده"
            unit="کیلوگرم"
            min={1.5}
            max={4}
            step={0.1}
            hint="مثلاً ۲٫۵ — وزن زنده هر مرغ در پایان دوره پرورش"
          />
        </Form.Item>
        <Form.Item
          name="province"
          rules={[{ required: true, message: 'استان را انتخاب کنید' }]}
        >
          <SelectField
            label="استان تولید"
            options={IRAN_PROVINCES.map((p) => ({ value: p, label: p }))}
            placeholder="انتخاب استان"
          />
        </Form.Item>
      </div>
    </Form>
  );
}

// ── گام ۳: محاسبه جوجه + مشارکت اختیاری ──

interface StepThreeProps {
  draft: WizardDraft;
  onChange: (patch: Partial<WizardDraft>) => void;
  participation: ParticipationComputation;
}

/** گام ۳ — خروجی محاسبه سیستم (جوجه لازم، تولید) + مشارکت کامل جوجه/سرمایه در گردش با تیک. */
export function StepThreeBody({ draft, onChange, participation }: StepThreeProps) {
  const { token } = theme.useToken();
  const c = ESTIMATION_CONSTANTS;

  const optionalInputs: { kind: 'chick' | 'cash'; title: string; desc: string }[] = [
    {
      kind: 'chick',
      title: 'مشارکت کامل جوجه یک‌روزه',
      desc: `تأمین کامل ${formatNumber(participation.requiredBirds)} قطعه جوجه لازم — سهم شما ٪${formatNumber(SHARE_BY_KIND.chick)} بیشتر می‌شود`,
    },
    {
      kind: 'cash',
      title: 'مشارکت کامل سرمایه در گردش',
      desc: `پوشش کامل سایر هزینه‌های دوره — سهم شما ٪${formatNumber(SHARE_BY_KIND.cash)} بیشتر می‌شود`,
    },
  ];

  return (
    <div>
      {/* خروجی محاسبه سیستم — تمرکز روی تعداد جوجه */}
      <Card style={{ border: `1px solid ${token.colorBorderSecondary}` }} styles={{ body: { padding: 16 } }}>
        <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', textAlign: 'center' }}>
          جوجه لازم برای این سفارش
        </Text>
        <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
          <span style={{ fontSize: pivaType.statValue.fontSize, fontWeight: 800, color: token.colorPrimary, lineHeight: 1.2 }}>
            {formatNumber(participation.requiredBirds)}
          </span>
          <Text type="secondary" style={{ fontSize: pivaType.body.fontSize }}> قطعه جوجه یک‌روزه</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 12px', borderRadius: 999,
            background: token.colorSuccessBg, color: token.colorSuccess,
            fontSize: pivaType.secondary.fontSize, fontWeight: 600,
          }}>
            مرغ نهایی حدودی: {formatNumber(participation.estimatedBirds)} قطعه
          </span>
          <span style={{
            padding: '4px 12px', borderRadius: 999,
            background: token.colorInfoBg, color: token.colorInfo,
            fontSize: pivaType.secondary.fontSize, fontWeight: 600,
          }}>
            حدود {formatNumber(participation.productionKg)} کیلوگرم
          </span>
        </div>
        <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', marginTop: 10, textAlign: 'center' }}>
          با {formatNumber(draft.feed ?? 0)} تن نهاده و ضریب تبدیل {formatNumber(c.defaultFcr)}، برای وزن مطلوب {formatNumber(participation.perBirdWeightKg)} کیلوگرم هر مرغ و نرخ بقای ٪{formatNumber(c.survivalRate * 100)} محاسبه شده است.
        </Text>
      </Card>

      {/* مشارکت بیشتر — تیک = مشارکت کامل (۱۰۰٪)، بدون ورود مقدار */}
      <Text strong style={{ ...pivaType.sectionTitle, display: 'block', margin: '16px 0 8px' }}>مشارکت بیشتر (اختیاری)</Text>
      {optionalInputs.map((o) => {
        const checked = draft[o.kind] != null;
        return (
          <Card
            key={o.kind}
            style={{
              marginBottom: 10,
              border: checked ? `1.5px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
            }}
            styles={{ body: { padding: 14 } }}
          >
            <Checkbox
              checked={checked}
              onChange={(e) => onChange({ [o.kind]: e.target.checked ? true : undefined })}
              style={{ fontWeight: 600 }}
            >
              {o.title}
              <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', fontWeight: 400 }}>
                {o.desc}
              </Text>
            </Checkbox>
          </Card>
        );
      })}
    </div>
  );
}

// ── خلاصه مشارکت (پیش‌فاکتور) — سهم‌ها با تمرکز روی تعداد (قطعه) — قابل استفاده در صفحه جزئیات هم ──

export interface ParticipationSummaryProps {
  productionKg: number;
  buckets: ParticipationBucket[];
  estimatedBirds: number;
  minBirds?: number;
  maxBirds?: number;
  tolerancePercent?: number;
}

function bucketColor(key: string, token: { colorWarning: string; colorInfo: string; colorTextTertiary: string }): string {
  if (key === 'participant') return pivaTokens.brandDeep;
  if (key === 'farm') return token.colorInfo;
  if (key === 'platform') return token.colorTextTertiary;
  return token.colorWarning;
}

/** ردیف‌های سهم بازیگران (٪ + قطعه + کیلوگرم) + بار تقسیم — منبع واحد نمایش پیش‌فاکتور. بدون قیمت. */
export function ParticipationSummary({ productionKg, buckets, estimatedBirds, minBirds, maxBirds, tolerancePercent }: ParticipationSummaryProps) {
  const { token } = theme.useToken();

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        {buckets.map((b) => (
          <div key={b.key} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            padding: '8px 12px', marginBottom: 6,
            background: b.key === 'participant' ? token.colorSuccessBg : token.colorFillQuaternary,
            border: `1px solid ${b.key === 'participant' ? token.colorSuccessBorder : 'transparent'}`,
            borderRadius: token.borderRadius,
          }}>
            <div style={{ minWidth: 0 }}>
              <Text style={{ fontSize: pivaType.body.fontSize, fontWeight: b.key === 'participant' ? 600 : 400, display: 'block' }}>
                {b.label}
              </Text>
              <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>
                حدود {formatNumber(Math.round((b.percent / 100) * productionKg))} کیلوگرم
              </Text>
            </div>
            <div style={{ textAlign: 'start', flexShrink: 0 }}>
              <Text strong style={{ fontSize: pivaType.body.fontSize, display: 'block' }}>
                {formatNumber(Math.round((b.percent / 100) * estimatedBirds))} قطعه
              </Text>
              <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>
                ٪{formatNumber(b.percent)}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <ShareSplitBar segments={buckets.map((b) => ({
        key: b.key,
        label: b.label,
        percent: b.percent,
        color: bucketColor(b.key, token),
      }))} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: 12,
        padding: '10px 12px', marginTop: 10,
        background: token.colorFillSecondary, borderRadius: token.borderRadius,
      }}>
        <Text strong style={{ fontSize: pivaType.body.fontSize }}>مرغ نهایی حدودی</Text>
        <Text strong style={{ fontSize: pivaType.body.fontSize }}>
          {formatNumber(estimatedBirds)} قطعه
          {minBirds != null && maxBirds != null && tolerancePercent != null ? ` (بازه ${formatNumber(minBirds)} تا ${formatNumber(maxBirds)})` : ''}
        </Text>
      </div>
    </div>
  );
}

// ── گام ۴: پیش‌فاکتور ──

interface StepFourProps {
  participation: ParticipationComputation;
  feedTons: number;
}

/** گام ۴ — پیش‌فاکتور: تعداد مرغ نهایی (تمرکز)، سهم طرفین و تلرانس ±۱۰٪. بدون قیمت. */
export function StepFourBody({ participation, feedTons }: StepFourProps) {
  const { token } = theme.useToken();

  return (
    <div>
      {/* عدد اصلی: تعداد مرغ نهایی — تمرکز سامانه روی تعداد، کیلوگرم در حاشیه */}
      <Card style={{ border: `1px solid ${token.colorBorderSecondary}`, marginBottom: 12 }} styles={{ body: { padding: 16 } }}>
        <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', textAlign: 'center' }}>
          مرغ نهایی حدودی
        </Text>
        <div style={{ textAlign: 'center', margin: '4px 0 8px' }}>
          <span style={{ fontSize: pivaType.statValue.fontSize, fontWeight: 800, color: token.colorPrimary, lineHeight: 1.2 }}>
            {formatNumber(participation.estimatedBirds)}
          </span>
          <Text type="secondary" style={{ fontSize: pivaType.body.fontSize }}> قطعه مرغ زنده</Text>
        </div>
        <Text type="secondary" style={{ fontSize: pivaType.secondary.fontSize, display: 'block', textAlign: 'center' }}>
          با {formatNumber(feedTons)} تن نهاده و وزن مطلوب {formatNumber(participation.perBirdWeightKg)} کیلوگرم هر مرغ
          · حدود {formatNumber(participation.productionKg)} کیلوگرم مرغ زنده
        </Text>
      </Card>

      <ParticipationSummary
        productionKg={participation.productionKg}
        buckets={participation.buckets}
        estimatedBirds={participation.estimatedBirds}
        minBirds={participation.minBirds}
        maxBirds={participation.maxBirds}
        tolerancePercent={participation.tolerancePercent}
      />

      <Alert
        type="warning"
        showIcon
        style={{ marginTop: 12 }}
        message={`تلرانس ٪${formatNumber(participation.tolerancePercent)}± تعداد مرغ نهایی`}
        description={`به دلیل سقف تلفات مجاز و تراکم‌ریزی مجاز، تعداد مرغ نهایی ممکن است بین ${formatNumber(participation.minBirds)} تا ${formatNumber(participation.maxBirds)} قطعه باشد — سهم هر طرف به همان نسبت تنظیم می‌شود.`}
      />
    </div>
  );
}

// ── گام ۵: پیش‌قرارداد (تعهدات طرفین) ──

interface StepFiveProps {
  draft: WizardDraft;
  inputs: RequestInput[];
  participation: ParticipationComputation;
  /** دانلود سند پیش‌قرارداد — داخل محتوا تا فوتر در موبایل شلوغ نشود */
  onDownload: () => void;
}

/** گام ۵ — پیش‌قرارداد: تعهدات مشارکت‌کننده و زنجیره‌دار + پارامترهای تولید + دانلود سند. */
export function StepFiveBody({ draft, inputs, participation, onDownload }: StepFiveProps) {
  const c = ESTIMATION_CONSTANTS;
  const feedInput = inputs.find((i) => i.kind === 'feed');
  const chickInput = inputs.find((i) => i.kind === 'chick');
  const cashInput = inputs.find((i) => i.kind === 'cash');
  const feedProvided = (feedInput?.amount ?? 0) > 0;

  return (
    <div>
      <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>تعهدات مشارکت‌کننده</Text>
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '8px 16px' } }}>
        <SummaryRow
          label="تحویل نهاده"
          value={`${formatNumber(feedInput?.amount ?? 0)} تن — ترکیب ٪${formatNumber(c.feedCornPercent)} ذرت و ٪${formatNumber(c.feedSoybeanPercent)} کنجاله سویا`}
        />
        <SummaryRow
          label="تاریخ تحویل نهاده"
          value={toPersianDigits(draft.feedDeliveryDate?.format('YYYY/MM/DD') ?? '')}
        />
        {chickInput && (
          <SummaryRow label="تحویل جوجه یک‌روزه" value={`تأمین کامل — ${formatNumber(chickInput.amount)} قطعه`} />
        )}
        {cashInput && (
          <SummaryRow label="سرمایه در گردش" value="تأمین کامل سایر هزینه‌های دوره" />
        )}
      </Card>

      <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>تعهدات زنجیره‌دار (پیوا)</Text>
      <Card style={{ marginBottom: 16 }} styles={{ body: { padding: '8px 16px' } }}>
        {!feedProvided && <SummaryRow label="تأمین نهاده" value="خرید دان دوره پرورش" />}
        {!chickInput && (
          <SummaryRow label="تأمین جوجه یک‌روزه" value={`${formatNumber(participation.requiredBirds)} قطعه`} />
        )}
        <SummaryRow label="مزرعه و ناظر فنی" value="تطبیق مزرعه استان و نظارت فنی دوره" />
        <SummaryRow label="دارو، واکسن و انرژی" value="تأمین کامل ملزومات پرورش" />
        <SummaryRow
          label="تسویه سهم"
          value={`تسویه سهم مشارکت‌کننده طبق پیش‌فاکتور (تلرانس ٪${formatNumber(participation.tolerancePercent)}±)`}
        />
      </Card>

      <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>پارامترهای تولید</Text>
      <Card styles={{ body: { padding: '8px 16px' } }}>
        <SummaryRow label="وزن مطلوب هر مرغ" value={`${formatNumber(participation.perBirdWeightKg)} کیلوگرم زنده`} />
        <SummaryRow label="استان تولید" value={draft.province ?? ''} />
        <SummaryRow label="تولید برآوردی" value={`${formatNumber(participation.productionKg)} کیلوگرم مرغ زنده`} />
        <SummaryRow label="جوجه لازم" value={`${formatNumber(participation.requiredBirds)} قطعه`} />
      </Card>

      {/* دانلود داخل محتوا — فوتر فقط بازگشت + ارسال می‌ماند تا در موبایل بیرون نزند */}
      <Button block icon={<DownloadOutlined />} size="large" onClick={onDownload} style={{ marginTop: 16, fontWeight: 600 }}>
        دانلود سند پیش‌قرارداد
      </Button>

      <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', marginTop: 12 }}>
        با ارسال، پیش‌قرارداد شما برای بررسی به زنجیره‌دار می‌رود — پس از تأیید، مزرعه تطبیق و قرارداد قطعی می‌شود.
      </Text>
    </div>
  );
}

// ── پنل اورویو (پیش‌فاکتور کناری) ──

interface OverviewProps {
  participation: ParticipationComputation;
}

/** اورویو کناری دسکتاپ — مثل فاکتور، اعداد کلیدی را یک‌جا نشان می‌دهد (بدون قیمت). */
export function OverviewAside({ participation }: OverviewProps) {
  const { token } = theme.useToken();

  return (
    <Card style={{ position: 'sticky', top: 16, border: `1px solid ${token.colorBorderSecondary}` }} styles={{ body: { padding: 16 } }}>
      <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block', textAlign: 'center' }}>
        مرغ نهایی حدودی
      </Text>
      <div style={{ textAlign: 'center', margin: '6px 0 12px' }}>
        <span style={{ fontSize: pivaType.statValue.fontSize, fontWeight: 800, color: token.colorPrimary, lineHeight: 1.2 }}>
          {formatNumber(participation.estimatedBirds)}
        </span>
        <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize, display: 'block' }}>
          قطعه مرغ زنده
        </Text>
      </div>
      <SummaryRow label="جوجه لازم" value={`${formatNumber(participation.requiredBirds)} قطعه`} />
      <SummaryRow label="تولید کل" value={`حدود ${formatNumber(participation.productionKg)} کیلوگرم`} />
      <SummaryRow
        label="سهم مشارکت‌کننده"
        value={`٪${formatNumber(participation.shares.participant)} — ${formatNumber(Math.round(participation.shares.participant * participation.estimatedBirds / 100))} قطعه`}
      />
    </Card>
  );
}

/** اورویو موبایل — باکس قابل باز/بسته زیر استپر: اعداد کلیدی همیشه دیده، جزئیات با expand. */
export function MobileOverview({ participation }: OverviewProps) {
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
          <Text type="secondary" style={{ fontSize: pivaType.caption.fontSize }}>پیش‌فاکتور</Text>
          <span style={{ fontSize: 15, fontWeight: 800, color: token.colorPrimary }}>
            {formatNumber(participation.estimatedBirds)} قطعه مرغ
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
          <SummaryRow label="جوجه لازم" value={`${formatNumber(participation.requiredBirds)} قطعه`} />
          <SummaryRow label="تولید کل" value={`حدود ${formatNumber(participation.productionKg)} کیلوگرم`} />
          <SummaryRow
            label="سهم مشارکت‌کننده"
            value={`٪${formatNumber(participation.shares.participant)} — ${formatNumber(Math.round(participation.shares.participant * participation.estimatedBirds / 100))} قطعه`}
          />
        </div>
      )}
    </div>
  );
}
