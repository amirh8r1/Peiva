import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Select, InputNumber, Radio, Checkbox, Slider, Card, Typography, message, DatePicker } from 'antd';
import { ChainWizardProvider, useChainWizard } from '../context/ChainWizardContext';
import { ChainStepper } from '../components/ChainStepper';
import { SelectionCard } from '@/components/ui/SelectionCard';
import dayjs from '@/utils/dayjs';
import { useData } from '@/context/DataContext';
import { formatNumber, parsePersianNumber, toPersianDigits } from '@/utils/format';
import { jalaliDatePickerLocale } from '@/utils/jalaliDatePickerLocale';
import { CONTRACT_TYPE_LABELS, TERM_TEMPLATES, PROFIT_METHODS, COLLATERAL_TYPE_LIST, IRAN_PROVINCES } from '@/types';
import { mockFarms } from '@/mocks';
import { useIsDesktop } from '@/hooks/useResponsive';
import { responsiveGrid } from '@/utils/responsive';
import type { Contract, Farm } from '@/types';

const { Text } = Typography;

// ── Step 0: Name + Duration + Region ──

function BaseInfoStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 13 }}>نام قرارداد</Text>
      <Input size="large" placeholder="مثلاً: قرارداد بهار ۱۴۰۴" value={state.contractName}
        onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
        style={{ marginBottom: 16, borderRadius: 10 }} />

      <Text type="secondary" style={{ fontSize: 13 }}>مدت قرارداد (تعداد دوره)</Text>
      <InputNumber value={state.duration || undefined}
        {...numberInputProps}
        onChange={(v) => dispatch({ type: 'SET_DURATION', payload: v ?? 0 })} />

      <Text type="secondary" style={{ fontSize: 13 }}>منطقه (استان)</Text>
      <Select showSearch value={state.region || undefined} size="large" style={{ width: '100%', borderRadius: 10 }}
        placeholder="استان مورد نظر را انتخاب کنید"
        onChange={(v) => dispatch({ type: 'SET_REGION', payload: v as string })}
        options={IRAN_PROVINCES.map((p) => ({ value: p, label: p }))} />
    </div>
  );
}

// ── Period step ──

const numberInputProps = {
  size: 'large' as const,
  style: { width: '100%', marginBottom: 16, borderRadius: 10 },
  parser: (v: string | undefined) => parsePersianNumber(v || ''),
  formatter: (v: string | number | undefined) => v != null ? formatNumber(Number(v)) : '',
};

function PeriodStep() {
  const { state, dispatch, periodIndex: pi } = useChainWizard();
  const p = state.periods[pi] || { index: pi, chickCount: 0, targetWeight: 0, deliveryDate: '' };

  return (
    <div>
      <Text type="secondary" style={{ fontSize: 13 }}>تعداد جوجه‌ریزی (قطعه)</Text>
      <InputNumber value={p.chickCount || undefined}
        {...numberInputProps}
        onChange={(v) => dispatch({ type: 'SET_PERIOD', payload: { index: pi, data: { chickCount: v ?? 0 } } })} />

      <Text type="secondary" style={{ fontSize: 13 }}>وزن هدف (گرم)</Text>
      <InputNumber value={p.targetWeight || undefined}
        {...numberInputProps}
        onChange={(v) => dispatch({ type: 'SET_PERIOD', payload: { index: pi, data: { targetWeight: v ?? 0 } } })} />

      <Text type="secondary" style={{ fontSize: 13 }}>تاریخ تحویل</Text>
      <DatePicker
        locale={jalaliDatePickerLocale}
        size="large"
        style={{ width: '100%', borderRadius: 10 }}
        placement="bottomLeft"
        showToday={false}
        popupAlign={{ offset: [0, 4], overflow: { adjustX: true, adjustY: false } }}
        format={(d) => toPersianDigits((d as any).format('YYYY/MM/DD'))}
        value={p.deliveryDate ? (dayjs as any)(p.deliveryDate, { jalali: true }) : null}
        onChange={(d) => {
          if (d) dispatch({ type: 'SET_PERIOD', payload: { index: pi, data: { deliveryDate: (d as any).format('YYYY/MM/DD') } } });
          else dispatch({ type: 'SET_PERIOD', payload: { index: pi, data: { deliveryDate: '' } } });
        }}
      />
    </div>
  );
}

// ── Contract type ──

function ContractTypeStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <Radio.Group value={state.contractType} onChange={(e) => dispatch({ type: 'SET_CONTRACT_TYPE', payload: e.target.value })} style={{ width: '100%' }}>
      <Card hoverable size="small" style={state.contractType === 'commission' ? { border: '2px solid #389e0d', background: '#f6ffed', marginBottom: 12 } : { marginBottom: 12 }}>
        <Radio value="commission"><Text strong>کارمزدی</Text><Text type="secondary" style={{ display: 'block', fontSize: 12 }}>تأمین‌کننده نهاده را تأمین میکند، سود تقسیم میشود</Text></Radio>
      </Card>
      <Card hoverable size="small" style={state.contractType === 'contract' ? { border: '2px solid #389e0d', background: '#f6ffed' } : {}}>
        <Radio value="contract"><Text strong>پیمانکاری</Text><Text type="secondary" style={{ display: 'block', fontSize: 12 }}>تأمین‌کننده کل فرآیند را مدیریت میکند</Text></Radio>
      </Card>
    </Radio.Group>
  );
}

// ── Terms ──

function ContractTermsStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <Checkbox.Group value={state.selectedTermIds} onChange={(vals) => {
      const added = vals.filter((v: string) => !state.selectedTermIds.includes(v));
      const removed = state.selectedTermIds.filter((v: string) => !vals.includes(v));
      if (added.length) dispatch({ type: 'TOGGLE_TERM', payload: added[0] });
      if (removed.length) dispatch({ type: 'TOGGLE_TERM', payload: removed[0] });
    }} style={{ width: '100%' }}>
      {TERM_TEMPLATES.map((t) => (
        <Card key={t.id} size="small" hoverable
          style={{ marginBottom: 8, borderRadius: 10, width: '100%' }}>
          <Checkbox value={t.id} style={{ width: '100%' }}>
            <Text strong style={{ fontSize: 13 }}>{t.label}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{t.description}</Text>
          </Checkbox>
        </Card>
      ))}
    </Checkbox.Group>
  );
}

// ── Profit method ──

function ProfitSharingStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <div>
      <Radio.Group value={state.profitMethodId} onChange={(e) => dispatch({ type: 'SET_PROFIT_METHOD', payload: e.target.value })} style={{ width: '100%' }}>
        {PROFIT_METHODS.map((m) => (
          <Card key={m.id} size="small" hoverable style={state.profitMethodId === m.id ? { border: '2px solid #389e0d', background: '#f6ffed', marginBottom: 8, borderRadius: 10 } : { marginBottom: 8, borderRadius: 10 }}>
            <Radio value={m.id}><Text strong style={{ fontSize: 13 }}>{m.label}</Text><Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{m.description}</Text></Radio>
          </Card>
        ))}
      </Radio.Group>
      <div style={{ background: '#f6ffed', borderRadius: 12, padding: '16px 20px', marginTop: 12 }}>
        <Text style={{ fontSize: 12 }}>حداقل درصد تسهیم مزرعه‌دار</Text>
        <div style={{ textAlign: 'center' }}><Text strong style={{ fontSize: 28, color: '#389e0d' }}>٪{formatNumber(state.profitSharingMin)}</Text></div>
        <Slider min={0} max={20} value={state.profitSharingMin} onChange={(v) => dispatch({ type: 'SET_PROFIT_SHARING', payload: v })} marks={{ 0: '۰', 5: '۵', 10: '۱۰', 15: '۱۵', 20: '۲۰' }} />
      </div>
    </div>
  );
}

// ── Collateral types ──

function CollateralTypesStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>تضامین مورد قبول را انتخاب کنید</Text>
      <Checkbox.Group value={state.acceptedCollateralTypes} onChange={(vals) => {
        const added = vals.filter((v: string) => !state.acceptedCollateralTypes.includes(v));
        const removed = state.acceptedCollateralTypes.filter((v: string) => !vals.includes(v));
        if (added.length) dispatch({ type: 'TOGGLE_COLLATERAL_TYPE', payload: added[0] });
        if (removed.length) dispatch({ type: 'TOGGLE_COLLATERAL_TYPE', payload: removed[0] });
      }} style={{ width: '100%' }}>
        {COLLATERAL_TYPE_LIST.map((ct) => (
          <Card key={ct.id} size="small" hoverable style={{ marginBottom: 8, borderRadius: 10, width: '100%' }}>
            <Checkbox value={ct.id} style={{ width: '100%' }}>{ct.icon} <Text strong>{ct.label}</Text></Checkbox>
          </Card>
        ))}
      </Checkbox.Group>
    </div>
  );
}

// ── Farm selection (filtered) ──

function FarmSelectionStep() {
  const { state, dispatch } = useChainWizard();
  const isDesktop = useIsDesktop();
  const totalChicks = state.periods.reduce((s, p) => s + (p.chickCount || 0), 0);

  // Filter farms: same province + enough capacity
  const eligible = mockFarms.filter((f) => {
    if (state.region && f.address.province !== state.region) return false;
    if (totalChicks > f.capacity) return false;
    return true;
  });

  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        مزارع منطبق با شرایط ({formatNumber(eligible.length)} مورد) — استان {state.region}، ظرفیت ≥ {formatNumber(totalChicks)}
      </Text>
      <div style={isDesktop ? responsiveGrid(360, 16) : undefined}>
      {eligible.map((farm) => (
        <div key={farm.id} style={{ marginBottom: isDesktop ? 0 : 10 }}>
          <SelectionCard<Farm>
            item={farm}
            selected={state.selectedFarmIds.includes(farm.id)}
            onSelect={() => dispatch({ type: 'TOGGLE_FARM', payload: farm.id })}
            title={farm.name}
            subtitle={`${farm.address.city}، ${farm.address.province}`}
            rating={farm.rating}
            grade={farm.grade}
            fields={[
              { label: 'ظرفیت', value: formatNumber(farm.capacity) },
              { label: 'ضریب تبدیل', value: formatNumber(farm.avgConversionRatio, 1) },
              { label: 'سابقه', value: `${formatNumber(farm.experienceYears)} سال` },
              { label: 'مالک', value: farm.ownerName },
            ]}
            details={[
              { label: 'نام', value: farm.name }, { label: 'مالک', value: farm.ownerName },
              { label: 'موقعیت', value: `${farm.address.city}، ${farm.address.province}` },
              { label: 'گرید', value: farm.grade }, { label: 'ظرفیت', value: formatNumber(farm.capacity) },
              { label: 'ضریب تبدیل', value: formatNumber(farm.avgConversionRatio, 1) },
              { label: 'سابقه', value: `${formatNumber(farm.experienceYears)} سال` },
              { label: 'تلفن', value: farm.contact.phone },
            ]}
          />
        </div>
      ))}
      </div>
    </div>
  );
}

// ── Step renderer ──

function StepContent() {
  const ctx = useChainWizard();
  const s = ctx.state;
  const off = 1 + s.duration;

  if (s.currentStep === 0) return <BaseInfoStep />;
  if (ctx.isPeriodStep) return <PeriodStep />;
  if (s.currentStep === off) return <ContractTypeStep />;
  if (s.currentStep === off + 1) return <ContractTermsStep />;
  if (s.currentStep === off + 2) return <ProfitSharingStep />;
  if (s.currentStep === off + 3) return <CollateralTypesStep />;
  if (s.currentStep === ctx.totalStepCount - 1) return <FarmSelectionStep />;
  return null;
}

// ── Page ──

export function CreateChainPage() {
  const navigate = useNavigate();
  const { dispatch: dataDispatch } = useData();
  const [submitting, setSubmitting] = useState(false);

  return (
    <ChainWizardProvider>
      <WizardInner submitting={submitting} onSubmit={(wizardState) => {
        setSubmitting(true);
        const totalChicks = wizardState.periods.reduce((s, p) => s + (p.chickCount || 0), 0);
        const contract: Contract = {
          id: `ctr-${Date.now()}`,
          name: wizardState.contractName,
          contractType: wizardState.contractType,
          selectedTermIds: wizardState.selectedTermIds,
          profitMethodId: wizardState.profitMethodId,
          profitSharingMin: wizardState.profitSharingMin,
          duration: wizardState.duration,
          region: wizardState.region,
          periods: wizardState.periods,
          acceptedCollateralTypes: wizardState.acceptedCollateralTypes,
          selectedFarmIds: wizardState.selectedFarmIds,
          status: 'sent',
          createdBy: 'supplier',
          createdAt: new Date().toLocaleDateString('fa-IR'),
        };
        dataDispatch({ type: 'ADD_CONTRACT', payload: contract });
        setTimeout(() => {
          setSubmitting(false);
          message.success(`قرارداد با موفقیت ایجاد و برای ${formatNumber(wizardState.selectedFarmIds.length)} مزرعه ارسال شد!`);
          navigate('/supplier');
        }, 600);
      }} />
    </ChainWizardProvider>
  );
}

function WizardInner({ submitting, onSubmit }: { submitting: boolean; onSubmit: (s: ReturnType<typeof useChainWizard>['state']) => void }) {
  const wizard = useChainWizard();
  return (
    <ChainStepper onSubmit={() => onSubmit(wizard.state)} isSubmitting={submitting}>
      <StepContent />
    </ChainStepper>
  );
}
