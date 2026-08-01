import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Row, Col, Typography, Empty, Input, Radio, Slider, Card, Space, Tag, message } from 'antd';
import { ChainWizardProvider, useChainWizard } from '../context/ChainWizardContext';
import { ChainStepper } from '../components/ChainStepper';
import { SelectionCard, type SelectionCardField, type EntityDetail } from '@/components/ui/SelectionCard';
import { formatNumber } from '@/utils/format';
import { farmService } from '@/features/farms/services/farm.service';
import {
  chickSupplierService,
  feedSupplierService,
  slaughterhouseService,
  warehouseService,
} from '@/features/suppliers/services/supplier.service';
import { CONTRACT_TYPE_LABELS } from '@/types';
import type { Farm, ChickSupplier, FeedSupplier, Slaughterhouse, Warehouse, Contract } from '@/types';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ── Detail helpers ──

function farmDetails(f: Farm): EntityDetail[] {
  return [
    { label: 'نام', value: f.name }, { label: 'مالک', value: f.ownerName },
    { label: 'موقعیت', value: `${f.address.city}، ${f.address.province}` },
    { label: 'گرید', value: f.grade }, { label: 'ظرفیت', value: formatNumber(f.capacity) },
    { label: 'ضریب تبدیل', value: formatNumber(f.avgConversionRatio, 1) },
    { label: 'سابقه', value: `${formatNumber(f.experienceYears)} سال` },
  ];
}

function chickDetails(s: ChickSupplier): EntityDetail[] {
  return [
    { label: 'نام', value: s.name }, { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade }, { label: 'نژاد', value: s.breed },
    { label: 'موجودی', value: formatNumber(s.availableChicks) },
    { label: 'قیمت', value: `${formatNumber(s.pricePerChick)} تومان` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
  ];
}

function feedDetails(s: FeedSupplier): EntityDetail[] {
  return [
    { label: 'نام', value: s.name }, { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade }, { label: 'نوع', value: s.feedType },
    { label: 'ظرفیت', value: `${formatNumber(s.capacityTons)} تن` },
    { label: 'قیمت', value: `${formatNumber(s.pricePerKg)} تومان/کیلو` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
  ];
}

function slDetails(s: Slaughterhouse): EntityDetail[] {
  return [
    { label: 'نام', value: s.name }, { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade }, { label: 'ظرفیت روزانه', value: formatNumber(s.dailyCapacity) },
    { label: 'ساعتکاری', value: s.operatingWindow }, { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
  ];
}

function whDetails(w: Warehouse): EntityDetail[] {
  return [
    { label: 'نام', value: w.name }, { label: 'موقعیت', value: `${w.address.city}، ${w.address.province}` },
    { label: 'گرید', value: w.grade }, { label: 'ظرفیت', value: `${formatNumber(w.capacityTons)} تن` },
    { label: 'ساعتکاری', value: w.operatingWindow }, { label: 'سابقه', value: `${formatNumber(w.experienceYears)} سال` },
  ];
}

// ── Generic entity step ──

interface EntitySelectionConfig<T extends { id: string; active?: boolean }> {
  hint: string;
  emptyMessage: string;
  query: UseQueryResult<T[], Error>;
  isSelected: (item: T) => boolean;
  onToggle: (item: T) => void;
  getTitle: (item: T) => string;
  getSubtitle: (item: T) => string;
  getFields: (item: T) => SelectionCardField[];
  getDetails: (item: T) => EntityDetail[];
  getRating: (item: T) => number;
  getGrade: (item: T) => string;
}

function EntitySelectionStep<T extends { id: string; active?: boolean }>(c: EntitySelectionConfig<T>) {
  const { data, isLoading } = c.query;
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
        {c.hint}
      </Text>
      <Row gutter={[6, 10]}>
        {data?.map((item) => (
          <Col xs={24} key={item.id}>
            <SelectionCard<T>
              item={item}
              selected={c.isSelected(item)}
              onSelect={c.onToggle}
              title={c.getTitle(item)}
              subtitle={c.getSubtitle(item)}
              rating={c.getRating(item)}
              grade={c.getGrade(item) as any}
              multiSelect
              fields={c.getFields(item)}
              details={c.getDetails(item)}
            />
          </Col>
        ))}
      </Row>
      {!isLoading && data?.length === 0 && <Empty description={c.emptyMessage} />}
    </div>
  );
}

// ── Step 0: Name + Farms ──

function NameAndFarmStep() {
  const { state, dispatch } = useChainWizard();
  const query = useQuery({ queryKey: ['farms'], queryFn: () => farmService.getAll() });

  return (
    <div>
      <Input
        placeholder="نام زنجیره (مثلاً: زنجیره بهار ۱۴۰۴)"
        value={state.chainName}
        onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
        size="large"
        style={{ marginBottom: 16, borderRadius: 10 }}
        status={!state.chainName.trim() ? 'warning' : undefined}
      />
      <EntitySelectionStep<Farm>
        hint="مزارع مورد نظر را انتخاب کنید"
        emptyMessage="مزرعه‌ای یافت نشد"
        query={query}
        isSelected={(f) => state.selectedFarms.some((x) => x.id === f.id)}
        onToggle={(f) => dispatch({ type: 'TOGGLE_FARM', payload: f })}
        getTitle={(f) => f.name}
        getSubtitle={(f) => `${f.address.city}، ${f.address.province}`}
        getFields={(f) => [
          { label: 'ظرفیت', value: formatNumber(f.capacity) },
          { label: 'ضریب تبدیل', value: formatNumber(f.avgConversionRatio, 1) },
          { label: 'سابقه', value: `${formatNumber(f.experienceYears)} سال` },
          { label: 'گرید', value: f.grade, type: 'grade' },
        ]}
        getDetails={farmDetails}
        getRating={(f) => f.rating}
        getGrade={(f) => f.grade}
      />
    </div>
  );
}

// ── Steps 1-4: Entity selections ──

function ChickSupplierStep() {
  const { state, dispatch } = useChainWizard();
  const q = useQuery({ queryKey: ['chick-suppliers'], queryFn: () => chickSupplierService.getAll() });
  return <EntitySelectionStep<ChickSupplier>
    hint="تأمین‌کنندگان جوجه یکروزه" emptyMessage="موردی یافت نشد" query={q}
    isSelected={(s) => state.selectedChickSuppliers.some((x) => x.id === s.id)}
    onToggle={(s) => dispatch({ type: 'TOGGLE_CHICK_SUPPLIER', payload: s })}
    getTitle={(s) => s.name} getSubtitle={(s) => `${s.address.city}، ${s.address.province}`}
    getFields={(s) => [
      { label: 'نژاد', value: s.breed, type: 'tag' },
      { label: 'موجودی', value: formatNumber(s.availableChicks) },
      { label: 'قیمت', value: `${formatNumber(s.pricePerChick)} تومان` },
      { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    ]}
    getDetails={chickDetails} getRating={(s) => s.rating} getGrade={(s) => s.grade}
  />;
}

function FeedSupplierStep() {
  const { state, dispatch } = useChainWizard();
  const q = useQuery({ queryKey: ['feed-suppliers'], queryFn: () => feedSupplierService.getAll() });
  return <EntitySelectionStep<FeedSupplier>
    hint="تأمین‌کنندگان خوراک دان" emptyMessage="موردی یافت نشد" query={q}
    isSelected={(s) => state.selectedFeedSuppliers.some((x) => x.id === s.id)}
    onToggle={(s) => dispatch({ type: 'TOGGLE_FEED_SUPPLIER', payload: s })}
    getTitle={(s) => s.name} getSubtitle={(s) => `${s.address.city}، ${s.address.province}`}
    getFields={(s) => [
      { label: 'نوع', value: s.feedType }, { label: 'ظرفیت', value: `${formatNumber(s.capacityTons)} تن` },
      { label: 'قیمت', value: `${formatNumber(s.pricePerKg)} تومان` },
      { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    ]}
    getDetails={feedDetails} getRating={(s) => s.rating} getGrade={(s) => s.grade}
  />;
}

function SlaughterhouseStep() {
  const { state, dispatch } = useChainWizard();
  const q = useQuery({ queryKey: ['slaughterhouses'], queryFn: () => slaughterhouseService.getAll() });
  return <EntitySelectionStep<Slaughterhouse>
    hint="کشتارگاه‌های مقصد" emptyMessage="موردی یافت نشد" query={q}
    isSelected={(s) => state.selectedSlaughterhouses.some((x) => x.id === s.id)}
    onToggle={(s) => dispatch({ type: 'TOGGLE_SLAUGHTERHOUSE', payload: s })}
    getTitle={(s) => s.name} getSubtitle={(s) => `${s.address.city}، ${s.address.province}`}
    getFields={(s) => [
      { label: 'ظرفیت روزانه', value: `${formatNumber(s.dailyCapacity)} قطعه` },
      { label: 'ساعتکاری', value: s.operatingWindow },
      { label: 'قیمت', value: `${formatNumber(s.pricePerChicken)} تومان` },
      { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    ]}
    getDetails={slDetails} getRating={(s) => s.rating} getGrade={(s) => s.grade}
  />;
}

function WarehouseStep() {
  const { state, dispatch } = useChainWizard();
  const q = useQuery({ queryKey: ['warehouses'], queryFn: () => warehouseService.getAll() });
  return <EntitySelectionStep<Warehouse>
    hint="انبارهای سردخانه‌ای مقصد" emptyMessage="موردی یافت نشد" query={q}
    isSelected={(w) => state.selectedWarehouses.some((x) => x.id === w.id)}
    onToggle={(w) => dispatch({ type: 'TOGGLE_WAREHOUSE', payload: w })}
    getTitle={(w) => w.name} getSubtitle={(w) => `${w.address.city}، ${w.address.province}`}
    getFields={(w) => [
      { label: 'ظرفیت', value: `${formatNumber(w.capacityTons)} تن` },
      { label: 'ساعتکاری', value: w.operatingWindow },
      { label: 'سابقه', value: `${formatNumber(w.experienceYears)} سال` },
      { label: 'گرید', value: w.grade, type: 'grade' },
    ]}
    getDetails={whDetails} getRating={(w) => w.rating} getGrade={(w) => w.grade}
  />;
}

// ── Step 5: Contract Type ──

function ContractTypeStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>نوع قرارداد را انتخاب کنید</Text>
      <Radio.Group
        value={state.contractType}
        onChange={(e) => dispatch({ type: 'SET_CONTRACT_TYPE', payload: e.target.value })}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card hoverable={state.contractType !== 'commission'} size="small" style={state.contractType === 'commission' ? { border: '2px solid #389e0d', background: '#f6ffed' } : {}}>
            <Radio value="commission">
              <Text strong>کارمزدی</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>تأمین‌کننده نهاده تأمین میکند، سود به نسبت توافق تقسیم میشود</Text>
            </Radio>
          </Card>
          <Card hoverable={state.contractType !== 'contract'} size="small" style={state.contractType === 'contract' ? { border: '2px solid #389e0d', background: '#f6ffed' } : {}}>
            <Radio value="contract">
              <Text strong>پیمانکاری</Text>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>تأمین‌کننده کل فرآیند را مدیریت میکند، مزرعه‌دار حقوق ثابت دریافت میکند</Text>
            </Radio>
          </Card>
        </Space>
      </Radio.Group>
    </div>
  );
}

// ── Step 6: Contract Terms ──

function ContractTermsStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>تعهدات و شرایط طرفین را مشخص کنید</Text>
      <TextArea
        rows={5}
        value={state.contractTerms}
        onChange={(e) => dispatch({ type: 'SET_CONTRACT_TERMS', payload: e.target.value })}
        placeholder="مثلاً: تأمین ۱۰۰٪ خوراک توسط تأمین‌کننده. جوجه با هزینه تأمین‌کننده. حمل به عهده مزرعه‌دار..."
        style={{ borderRadius: 10 }}
      />
    </div>
  );
}

// ── Step 7: Profit Sharing + Review + Send ──

function ProfitSharingStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>حداقل درصد تسهیم منافع را تعیین کنید</Text>
      <div style={{ background: '#f6ffed', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 12 }}>حداقل سهم مزرعه‌دار</Text>
          <div><Text strong style={{ fontSize: 28, color: '#389e0d' }}>٪{formatNumber(state.profitSharingMin)}</Text></div>
        </div>
        <Slider
          min={10} max={60} value={state.profitSharingMin}
          onChange={(v) => dispatch({ type: 'SET_PROFIT_SHARING', payload: v })}
          marks={{ 10: '۱۰', 25: '۲۵', 40: '۴۰', 60: '۶۰' }}
        />
      </div>

      {/* Review summary */}
      <Card size="small" style={{ borderRadius: 10, marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>خلاصه زنجیره</Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 4 }}>
          <Text>🐔 {state.chainName || 'بدون نام'}</Text>
          <Text type="secondary">|</Text>
          <Text>🏭 {formatNumber(state.selectedFarms.length)} مزرعه</Text>
          <Text type="secondary">|</Text>
          <Text>🐣 {formatNumber(state.selectedChickSuppliers.length)} جوجه</Text>
          <Text type="secondary">|</Text>
          <Text>🌾 {formatNumber(state.selectedFeedSuppliers.length)} دان</Text>
          <Text type="secondary">|</Text>
          <Text>🔪 {formatNumber(state.selectedSlaughterhouses.length)} کشتارگاه</Text>
          <Text type="secondary">|</Text>
          <Text>🏪 {formatNumber(state.selectedWarehouses.length)} انبار</Text>
        </div>
        <div style={{ marginTop: 4 }}>
          <Tag>{CONTRACT_TYPE_LABELS[state.contractType]}</Tag>
          <Text style={{ fontSize: 12 }}>تسهیم: ٪{formatNumber(state.profitSharingMin)}</Text>
        </div>
      </Card>
    </div>
  );
}

// ── Step renderer ──

const STEPS = [
  NameAndFarmStep,        // 0
  ChickSupplierStep,      // 1
  FeedSupplierStep,       // 2
  SlaughterhouseStep,     // 3
  WarehouseStep,          // 4
  ContractTypeStep,       // 5
  ContractTermsStep,      // 6
  ProfitSharingStep,      // 7
];

function StepContent() {
  const { state } = useChainWizard();
  const StepComponent = STEPS[state.currentStep];
  return <StepComponent />;
}

// ── Page ──

export function CreateChainPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      message.success('قرارداد با موفقیت ایجاد و به مزرعه‌داران ارسال شد!');
      navigate('/');
    }, 1000);
  };

  return (
    <ChainWizardProvider>
      <ChainStepper onSubmit={handleSubmit} isSubmitting={submitting}>
        <StepContent />
      </ChainStepper>
    </ChainWizardProvider>
  );
}
