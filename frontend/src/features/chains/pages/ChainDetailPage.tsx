import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Steps, Tag, Button, Typography, Row, Col, Empty, Spin } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { chainService } from '../services/chain.service';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageFrame } from '@/components/ui/PageFrame';
import { SelectionCard, type EntityDetail } from '@/components/ui/SelectionCard';
import { StatTile } from '@/components/ui/StatTile';
import { farmFields, farmDetails } from '@/features/farms/components/FarmCard';
import { formatNumber } from '@/utils/format';
import { CHAIN_TRACKING_STEPS, getTrackingStepIndex } from '@/types';
import type { Farm, ChickSupplier, FeedSupplier, Slaughterhouse, Warehouse } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';

const { Text, Title } = Typography;

// ── Field & detail helpers ──

function chickFields(s: ChickSupplier) {
  return [
    { label: 'نژاد', value: s.breed, type: 'tag' as const },
    { label: 'موجودی', value: formatNumber(s.availableChicks) },
    { label: 'قیمت', value: `${formatNumber(s.pricePerChick)} تومان` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
  ];
}
function cDetails(s: ChickSupplier): EntityDetail[] {
  return [
    { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade },
    { label: 'نژاد', value: s.breed },
    { label: 'موجودی', value: formatNumber(s.availableChicks) },
    { label: 'قیمت', value: `${formatNumber(s.pricePerChick)} تومان` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    { label: 'تلفن', value: s.contact.phone },
  ];
}

function feedFields(s: FeedSupplier) {
  return [
    { label: 'نوع خوراک', value: s.feedType },
    { label: 'ظرفیت', value: `${formatNumber(s.capacityTons)} تن` },
    { label: 'قیمت', value: `${formatNumber(s.pricePerKg)} تومان/کیلو` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
  ];
}
function fdDetails(s: FeedSupplier): EntityDetail[] {
  return [
    { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade },
    { label: 'نوع خوراک', value: s.feedType },
    { label: 'ظرفیت', value: `${formatNumber(s.capacityTons)} تن` },
    { label: 'قیمت', value: `${formatNumber(s.pricePerKg)} تومان/کیلو` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    { label: 'تلفن', value: s.contact.phone },
  ];
}

function slFields(s: Slaughterhouse) {
  return [
    { label: 'ظرفیت روزانه', value: `${formatNumber(s.dailyCapacity)} قطعه` },
    { label: 'ساعت کاری', value: s.operatingWindow },
    { label: 'قیمت', value: `${formatNumber(s.pricePerChicken)} تومان` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
  ];
}
function slDetails(s: Slaughterhouse): EntityDetail[] {
  return [
    { label: 'موقعیت', value: `${s.address.city}، ${s.address.province}` },
    { label: 'گرید', value: s.grade },
    { label: 'ظرفیت روزانه', value: `${formatNumber(s.dailyCapacity)} قطعه` },
    { label: 'ساعت کاری', value: s.operatingWindow },
    { label: 'قیمت هر قطعه', value: `${formatNumber(s.pricePerChicken)} تومان` },
    { label: 'قیمت هر کیلو', value: `${formatNumber(s.pricePerKg)} تومان` },
    { label: 'سابقه', value: `${formatNumber(s.experienceYears)} سال` },
    { label: 'تلفن', value: s.contact.phone },
  ];
}

function whFields(w: Warehouse) {
  return [
    { label: 'ظرفیت', value: `${formatNumber(w.capacityTons)} تن` },
    { label: 'ساعت کاری', value: w.operatingWindow },
    { label: 'سابقه', value: `${formatNumber(w.experienceYears)} سال` },
    { label: 'گرید', value: w.grade, type: 'grade' as const },
  ];
}
function whDetails(w: Warehouse): EntityDetail[] {
  return [
    { label: 'موقعیت', value: `${w.address.city}، ${w.address.province}` },
    { label: 'گرید', value: w.grade },
    { label: 'ظرفیت', value: `${formatNumber(w.capacityTons)} تن` },
    { label: 'ساعت کاری', value: w.operatingWindow },
    { label: 'سابقه', value: `${formatNumber(w.experienceYears)} سال` },
    { label: 'تلفن', value: w.contact.phone },
  ];
}

// ── Entity section component ──

function EntitySection<T extends { id: string; active?: boolean; description?: string }>({
  items,
  title,
  icon,
  fieldsFn,
  detailsFn,
  ratingFn,
  gradeFn,
  subtitleFn,
}: {
  items: T[];
  title: string;
  icon: string;
  fieldsFn: (item: T) => { label: string; value: string | number; type?: 'text' | 'grade' | 'tag' }[];
  detailsFn: (item: T) => EntityDetail[];
  ratingFn: (item: T) => number;
  gradeFn: (item: T) => string;
  subtitleFn: (item: T) => string;
}) {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 12, paddingInline: 8 }}>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        {icon} {title} ({formatNumber(items.length)})
      </Text>
      <Row gutter={[8, 12]}>
        {items.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.id}>
            <SelectionCard<T>
              item={item}
              selected
              onSelect={() => {}}
              title={(item as any).name}
              subtitle={subtitleFn(item)}
              rating={ratingFn(item)}
              grade={gradeFn(item) as any}
              fields={fieldsFn(item)}
              details={detailsFn(item)}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}

// ── Page ──

export function ChainDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const { data: chain, isLoading } = useQuery({
    queryKey: ['chains', id],
    queryFn: () => chainService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!chain) {
    return <Empty description="زنجیره مورد نظر یافت نشد" />;
  }

  const trackingIdx = getTrackingStepIndex(chain.currentStep);

  return (
    <PageFrame mobilePaddingBottom={16} header={
      <PageHeader
        title={chain.name}
        subtitle={`ایجاد شده در ${chain.createdAt}`}
        extra={
          <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/')}>
            بازگشت به داشبورد
          </Button>
        }
      />
    }>
      <Card style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 12 }}>وضعیت زنجیره</Title>
        {/* در موبایل گام‌ها عمودی می‌شوند تا برچسب‌های بلند فارسی کلیپ نشوند */}
        <Steps
          direction={isDesktop ? 'horizontal' : 'vertical'}
          current={trackingIdx}
          size="small"
          status={chain.status === 'completed' ? 'finish' : 'process'}
          items={CHAIN_TRACKING_STEPS.map((s) => ({ title: s.label }))}
        />
      </Card>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatTile direction="column" label="تعداد مزارع" value={formatNumber(chain.farms.length)} />
        </Col>
        <Col xs={12} sm={6}>
          <StatTile direction="column" label="مجموع جوجه‌ریزی" value={formatNumber(chain.totalChicks)} />
        </Col>
        <Col xs={12} sm={6}>
          <StatTile direction="column" label="ضریب تبدیل" value={chain.predictedConversionRatio != null ? formatNumber(chain.predictedConversionRatio, 2) : '—'} />
        </Col>
        <Col xs={12} sm={6}>
          <StatTile direction="column" label="وضعیت" value={
            <Tag color={chain.status === 'active' ? 'processing' : chain.status === 'completed' ? 'success' : 'default'}>
              {chain.status === 'active' ? 'فعال' : chain.status === 'completed' ? 'تکمیل شده' : 'پیش‌نویس'}
            </Tag>
          } />
        </Col>
      </Row>

      <Title level={5} style={{ marginBottom: 8 }}>اجزای زنجیره</Title>

      <EntitySection<Farm> items={chain.farms} title="مزارع" icon="🏭" fieldsFn={farmFields} detailsFn={farmDetails} ratingFn={(f) => f.rating} gradeFn={(f) => f.grade} subtitleFn={(f) => `${f.address.city}، ${f.address.province}`} />
      <EntitySection<ChickSupplier> items={chain.chickSuppliers} title="تأمین‌کنندگان جوجه یکروزه" icon="🐣" fieldsFn={chickFields} detailsFn={cDetails} ratingFn={(s) => s.rating} gradeFn={(s) => s.grade} subtitleFn={(s) => `${s.address.city}، ${s.address.province}`} />
      <EntitySection<FeedSupplier> items={chain.feedSuppliers} title="تأمین‌کنندگان خوراک دان" icon="🌾" fieldsFn={feedFields} detailsFn={fdDetails} ratingFn={(s) => s.rating} gradeFn={(s) => s.grade} subtitleFn={(s) => `${s.address.city}، ${s.address.province}`} />
      <EntitySection<Slaughterhouse> items={chain.slaughterhouses} title="کشتارگاه‌ها" icon="🔪" fieldsFn={slFields} detailsFn={slDetails} ratingFn={(s) => s.rating} gradeFn={(s) => s.grade} subtitleFn={(s) => `${s.address.city}، ${s.address.province}`} />
      <EntitySection<Warehouse> items={chain.warehouses} title="انبارهای مقصد" icon="🏪" fieldsFn={whFields} detailsFn={whDetails} ratingFn={(w) => w.rating} gradeFn={(w) => w.grade} subtitleFn={(w) => `${w.address.city}، ${w.address.province}`} />
    </PageFrame>
  );
}
