import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Row, Col, Typography, Empty, Input, message } from 'antd';
import { ChainWizardProvider, useChainWizard } from '../context/ChainWizardContext';
import { ChainStepper } from '../components/ChainStepper';
import { SelectionCard, type SelectionCardField, type EntityDetail } from '@/components/ui/SelectionCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { farmService } from '@/features/farms/services/farm.service';
import {
  chickSupplierService,
  feedSupplierService,
  slaughterhouseService,
  warehouseService,
} from '@/features/suppliers/services/supplier.service';
import type {
  Farm,
  ChickSupplier,
  FeedSupplier,
  Slaughterhouse,
  Warehouse,
} from '@/types';

const { Text } = Typography;

// ── Detail helpers ──

function farmDetails(f: Farm): EntityDetail[] {
  return [
    { label: 'نام مزرعه', value: f.name },
    { label: 'مالک', value: f.ownerName },
    { label: 'موقعیت', value: `${f.address.city}، ${f.address.province}` },
    { label: 'آدرس', value: f.address.address },
    { label: 'گرید', value: f.grade },
    { label: 'ظرفیت (قطعه)', value: formatNumber(f.capacity) },
    { label: 'ضریب تبدیل (۳ دوره)', value: formatNumber(f.avgConversionRatio, 1) },
    { label: 'سابقه', value: `${formatNumber(f.experienceYears)} سال` },
    { label: 'تلفن', value: f.contact.phone },
    ...(f.contact.email ? [{ label: 'ایمیل', value: f.contact.email }] : []),
  ];
}

function chickDetails(s: ChickSupplier): EntityDetail[] {
  return [
    { label: 'نام', value: s.name },
    { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade },
    { label: 'نژاد', value: s.breed },
    { label: 'موجودی (قطعه)', value: formatNumber(s.availableChicks) },
    { label: 'قیمت هر قطعه', value: `${formatNumber(s.pricePerChick)} تومان` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    { label: 'تلفن', value: s.contact.phone },
    ...(s.contact.email ? [{ label: 'ایمیل', value: s.contact.email }] : []),
  ];
}

function feedDetails(s: FeedSupplier): EntityDetail[] {
  return [
    { label: 'نام', value: s.name },
    { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade },
    { label: 'نوع خوراک', value: s.feedType },
    { label: 'ظرفیت (تن)', value: formatNumber(s.capacityTons) },
    { label: 'قیمت هر کیلو', value: `${formatNumber(s.pricePerKg)} تومان` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    { label: 'تلفن', value: s.contact.phone },
    ...(s.contact.email ? [{ label: 'ایمیل', value: s.contact.email }] : []),
  ];
}

function slDetails(s: Slaughterhouse): EntityDetail[] {
  return [
    { label: 'نام', value: s.name },
    { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade },
    { label: 'ظرفیت روزانه', value: `${formatNumber(s.dailyCapacity)} قطعه` },
    { label: 'ساعت کاری', value: s.operatingWindow },
    { label: 'قیمت هر قطعه', value: `${formatNumber(s.pricePerChicken)} تومان` },
    { label: 'قیمت هر کیلو', value: `${formatNumber(s.pricePerKg)} تومان` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    { label: 'تلفن', value: s.contact.phone },
    ...(s.contact.email ? [{ label: 'ایمیل', value: s.contact.email }] : []),
  ];
}

function whDetails(w: Warehouse): EntityDetail[] {
  return [
    { label: 'نام', value: w.name },
    { label: 'موقعیت', value: `${w.address.city}، ${w.address.province}` },
    { label: 'گرید', value: w.grade },
    { label: 'ظرفیت (تن)', value: formatNumber(w.capacityTons) },
    { label: 'ساعت کاری', value: w.operatingWindow },
    { label: 'سابقه', value: `${formatNumber(w.experienceYears)} سال` },
    { label: 'تلفن', value: w.contact.phone },
    ...(w.contact.email ? [{ label: 'ایمیل', value: w.contact.email }] : []),
  ];
}

// ── Generic entity selection step ──

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

function EntitySelectionStep<T extends { id: string; active?: boolean }>({
  hint,
  emptyMessage,
  query,
  isSelected,
  onToggle,
  getTitle,
  getSubtitle,
  getFields,
  getDetails,
  getRating,
  getGrade,
}: EntitySelectionConfig<T>) {
  const { data, isLoading } = query;

  return (
    <div style={{ paddingInline: 8 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        {hint}
      </Text>
      <Row gutter={[8, 16]}>
        {data?.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <SelectionCard<T>
              item={item}
              selected={isSelected(item)}
              onSelect={onToggle}
              title={getTitle(item)}
              subtitle={getSubtitle(item)}
              rating={getRating(item)}
              grade={getGrade(item) as any}
              multiSelect
              fields={getFields(item)}
              details={getDetails(item)}
            />
          </Col>
        ))}
      </Row>
      {!isLoading && data?.length === 0 && (
        <Empty description={emptyMessage} />
      )}
    </div>
  );
}

// ── Step definitions ──

function FarmSelectionStep() {
  const { state, dispatch } = useChainWizard();
  const query = useQuery({ queryKey: ['farms'], queryFn: () => farmService.getAll() });

  return (
    <EntitySelectionStep<Farm>
      hint="یک یا چند مزرعه برای زنجیره خود انتخاب کنید"
      emptyMessage="مزرعه‌ای یافت نشد"
      query={query}
      isSelected={(f) => state.selectedFarms.some((x) => x.id === f.id)}
      onToggle={(f) => dispatch({ type: 'TOGGLE_FARM', payload: f })}
      getTitle={(f) => f.name}
      getSubtitle={(f) => `${f.address.city}، ${f.address.province}`}
      getFields={(f) => [
        { label: 'ظرفیت (قطعه)', value: formatNumber(f.capacity) },
        { label: 'ضریب تبدیل', value: formatNumber(f.avgConversionRatio, 1) },
        { label: 'سابقه', value: `${formatNumber(f.experienceYears)} سال` },
        { label: 'گرید', value: f.grade, type: 'grade' },
      ]}
      getDetails={farmDetails}
      getRating={(f) => f.rating}
      getGrade={(f) => f.grade}
    />
  );
}

function ChickSupplierStep() {
  const { state, dispatch } = useChainWizard();
  const query = useQuery({ queryKey: ['chick-suppliers'], queryFn: () => chickSupplierService.getAll() });

  return (
    <EntitySelectionStep<ChickSupplier>
      hint="یک یا چند تأمین‌کننده جوجه یکروزه انتخاب کنید"
      emptyMessage="تأمین‌کننده‌ای یافت نشد"
      query={query}
      isSelected={(s) => state.selectedChickSuppliers.some((x) => x.id === s.id)}
      onToggle={(s) => dispatch({ type: 'TOGGLE_CHICK_SUPPLIER', payload: s })}
      getTitle={(s) => s.name}
      getSubtitle={(s) => `${s.address.city}، ${s.address.province}`}
      getFields={(s) => [
        { label: 'نژاد', value: s.breed, type: 'tag' },
        { label: 'موجودی (قطعه)', value: formatNumber(s.availableChicks) },
        { label: 'قیمت هر قطعه', value: `${formatNumber(s.pricePerChick)} تومان` },
        { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
      ]}
      getDetails={chickDetails}
      getRating={(s) => s.rating}
      getGrade={(s) => s.grade}
    />
  );
}

function FeedSupplierStep() {
  const { state, dispatch } = useChainWizard();
  const query = useQuery({ queryKey: ['feed-suppliers'], queryFn: () => feedSupplierService.getAll() });

  return (
    <EntitySelectionStep<FeedSupplier>
      hint="یک یا چند تأمین‌کننده خوراک دان انتخاب کنید"
      emptyMessage="تأمین‌کننده‌ای یافت نشد"
      query={query}
      isSelected={(s) => state.selectedFeedSuppliers.some((x) => x.id === s.id)}
      onToggle={(s) => dispatch({ type: 'TOGGLE_FEED_SUPPLIER', payload: s })}
      getTitle={(s) => s.name}
      getSubtitle={(s) => `${s.address.city}، ${s.address.province}`}
      getFields={(s) => [
        { label: 'نوع خوراک', value: s.feedType },
        { label: 'ظرفیت (تن)', value: formatNumber(s.capacityTons) },
        { label: 'قیمت هر کیلو', value: `${formatNumber(s.pricePerKg)} تومان` },
        { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
      ]}
      getDetails={feedDetails}
      getRating={(s) => s.rating}
      getGrade={(s) => s.grade}
    />
  );
}

function SlaughterhouseStep() {
  const { state, dispatch } = useChainWizard();
  const query = useQuery({ queryKey: ['slaughterhouses'], queryFn: () => slaughterhouseService.getAll() });

  return (
    <EntitySelectionStep<Slaughterhouse>
      hint="یک یا چند کشتارگاه مقصد انتخاب کنید"
      emptyMessage="کشتارگاهی یافت نشد"
      query={query}
      isSelected={(s) => state.selectedSlaughterhouses.some((x) => x.id === s.id)}
      onToggle={(s) => dispatch({ type: 'TOGGLE_SLAUGHTERHOUSE', payload: s })}
      getTitle={(s) => s.name}
      getSubtitle={(s) => `${s.address.city}، ${s.address.province}`}
      getFields={(s) => [
        { label: 'ظرفیت روزانه', value: `${formatNumber(s.dailyCapacity)} قطعه` },
        { label: 'ساعت کاری', value: s.operatingWindow },
        { label: 'قیمت هر قطعه', value: `${formatNumber(s.pricePerChicken)} تومان` },
        { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
      ]}
      getDetails={slDetails}
      getRating={(s) => s.rating}
      getGrade={(s) => s.grade}
    />
  );
}

function WarehouseStep() {
  const { state, dispatch } = useChainWizard();
  const query = useQuery({ queryKey: ['warehouses'], queryFn: () => warehouseService.getAll() });

  return (
    <EntitySelectionStep<Warehouse>
      hint="یک یا چند انبار سردخانه‌ای مقصد انتخاب کنید"
      emptyMessage="انباری یافت نشد"
      query={query}
      isSelected={(w) => state.selectedWarehouses.some((x) => x.id === w.id)}
      onToggle={(w) => dispatch({ type: 'TOGGLE_WAREHOUSE', payload: w })}
      getTitle={(w) => w.name}
      getSubtitle={(w) => `${w.address.city}، ${w.address.province}`}
      getFields={(w) => [
        { label: 'ظرفیت (تن)', value: formatNumber(w.capacityTons) },
        { label: 'ساعت کاری', value: w.operatingWindow },
        { label: 'سابقه', value: `${formatNumber(w.experienceYears)} سال` },
        { label: 'گرید', value: w.grade, type: 'grade' },
      ]}
      getDetails={whDetails}
      getRating={(w) => w.rating}
      getGrade={(w) => w.grade}
    />
  );
}

// ── Step renderer ──

const STEPS = [
  FarmSelectionStep,
  ChickSupplierStep,
  FeedSupplierStep,
  SlaughterhouseStep,
  WarehouseStep,
];

function StepContent() {
  const { state } = useChainWizard();
  const StepComponent = STEPS[state.currentStep];
  return <StepComponent />;
}

// ── Page ──

export function CreateChainPage() {
  const navigate = useNavigate();
  const [nameModal, setChainName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <ChainWizardProvider>
      <CreateChainInner
        nameModal={nameModal}
        setChainName={setChainName}
        submitting={submitting}
        onSubmit={() => {
          setSubmitting(true);
          setTimeout(() => {
            setSubmitting(false);
            message.success('زنجیره جدید با موفقیت ایجاد شد!');
            navigate('/');
          }, 800);
        }}
      />
    </ChainWizardProvider>
  );
}

function CreateChainInner({
  nameModal,
  setChainName,
  submitting,
  onSubmit,
}: {
  nameModal: string;
  setChainName: (n: string) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const { state, dispatch } = useChainWizard();
  const isStep0 = state.currentStep === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader
        title="ایجاد زنجیره جدید"
        subtitle="مراحل ساخت یک زنجیره تأمین مرغ گوشتی را تکمیل کنید"
      />

      {isStep0 && (
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '12px 24px',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <Text strong style={{ whiteSpace: 'nowrap' }}>نام زنجیره:</Text>
          <Input
            placeholder="مثلاً: زنجیره بهار ۱۴۰۴"
            value={nameModal}
            onChange={(e) => {
              setChainName(e.target.value);
              dispatch({ type: 'SET_NAME', payload: e.target.value });
            }}
            status={nameModal.trim().length === 0 ? 'warning' : undefined}
            style={{ maxWidth: 400 }}
          />
          {nameModal.trim().length === 0 && (
            <Text type="warning" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
              * وارد کردن نام زنجیره الزامی است
            </Text>
          )}
        </div>
      )}

      <ChainStepper onSubmit={onSubmit} isSubmitting={submitting}>
        <StepContent />
      </ChainStepper>
    </div>
  );
}
