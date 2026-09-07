import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Empty, InputNumber, Modal, Space, Typography, message } from 'antd';
import { ArrowRightOutlined, StopOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardGrid } from '@/components/ui/CardGrid';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { SuccessScreen } from '@/components/ui/SuccessScreen';
import { SummaryRow } from '@/features/progress/components/StepCard';
import { RequestSummaryCard } from '@/features/requests/components/RequestSummaryCard';
import { EstimationTable } from '@/features/requests/components/EstimationTable';
import { ShareSummary } from '@/features/requests/components/ShareSummary';
import { FarmCard } from '@/features/farms/components/FarmCard';
import { mockFarms } from '@/mocks';
import { buildDefaultRows, computeShares, estimateProductionKg, requiredBirds, suggestFarms } from '@/utils/estimation';
import { numberFieldProps } from '@/utils/fieldProps';
import { todayJalali } from '@/features/progress/utils/progress.utils';
import { formatNumber, toPersianDigits } from '@/utils/format';
import { useIsDesktop } from '@/hooks/useResponsive';
import { centeredForm } from '@/utils/responsive';
import { pivaType } from '@/config/theme';
import { Stepper, type StepperItem } from '@/components/ui/Stepper';
import type { Contract, CostEstimation, EstimationRow, SupplierRequest } from '@/types';
import type { Farm } from '@/types/farm';

const { Text } = Typography;

const FLOW_STEPS = [
  { title: 'بررسی درخواست' },
  { title: 'تطبیق مزرعه' },
  { title: 'برآورد هزینه و سهم' },
  { title: 'ایجاد قرارداد' },
];

/** ساخت برآورد از state فعلی ردیف‌ها + تولید — منبع واحد (گام برآورد و گام تأیید). */
function makeEstimation(rows: EstimationRow[], productionKg: number): CostEstimation {
  return { productionKg, rows, ...computeShares(rows, productionKg), version: 1 };
}

/**
 * فلو ارکستریشن زنجیره‌دار روی درخواست pending:
 * بررسی → تطبیق مزرعه (پیشنهاد خودکار) → برآورد زنده هزینه/سهم → ایجاد قرارداد و ارسال به مزرعه.
 */
function RequestFlow({ request }: { request: SupplierRequest }) {
  const navigate = useNavigate();
  const { dispatch } = useData();
  const [step, setStep] = useState(0);
  const [matchedFarm, setMatchedFarm] = useState<Farm | null>(null);
  const isDesktop = useIsDesktop();
  const topRef = useRef<HTMLDivElement>(null);

  // با هر تغییر گام، نمایش از بالای صفحه شروع شود (اسکرول‌کانتینر داخل PageFrame است)
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
  }, [step]);
  const [rows, setRows] = useState<EstimationRow[]>(() => buildDefaultRows(request));
  const [productionKg, setProductionKg] = useState(() => estimateProductionKg(request));
  const [created, setCreated] = useState(false);

  const share = computeShares(rows, productionKg);

  const selectFarm = (farm: Farm) => {
    setMatchedFarm(farm);
    // FCR واقعی مزرعه در تخمین تولید و برچسب ردیف‌ها اثر می‌گذارد
    setRows(buildDefaultRows(request, farm));
    setProductionKg(estimateProductionKg(request, farm));
  };

  const handleReject = () => {
    Modal.confirm({
      title: 'رد درخواست',
      content: 'این اقدام برگشت‌پذیر نیست — تأمین‌کننده درخواست را «رد شده» می‌بیند. مطمئنید؟',
      okText: 'رد درخواست',
      okButtonProps: { danger: true },
      cancelText: 'انصراف',
      onOk: () => {
        dispatch({ type: 'UPDATE_REQUEST', payload: { id: request.id, patch: { status: 'rejected' } } });
        message.success('درخواست رد شد.');
        navigate('/admin/requests');
      },
    });
  };

  const handleCreate = () => {
    if (!matchedFarm) return;
    const estimation = makeEstimation(rows, productionKg);
    const contract: Contract = {
      id: `ctr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: `${request.province} — ${formatNumber(request.desiredKg)} کیلوگرم مرغ زنده`,
      requestId: request.id,
      farmId: matchedFarm.id,
      farmName: matchedFarm.name,
      province: request.province,
      targetDeliveryDate: request.targetDeliveryDate,
      estimation,
      status: 'awaiting_farm',
      createdAt: todayJalali(),
    };
    dispatch({ type: 'ADD_CONTRACT', payload: contract });
    dispatch({
      type: 'UPDATE_REQUEST',
      payload: {
        id: request.id,
        patch: { matchedFarmId: matchedFarm.id, estimation, contractId: contract.id, status: 'matched' },
      },
    });
    setCreated(true);
  };

  if (created) {
    return (
      <SuccessScreen
        title="قرارداد ایجاد شد"
        subtitle="درخواست برای مزرعه انتخاب‌شده ارسال شد — پس از تأیید هماهنگی، کار وارد فاز اجرا می‌شود."
        actionLabel="بازگشت به صندوق درخواست‌ها"
        onAction={() => navigate('/admin/requests')}
      />
    );
  }

  const need = requiredBirds(request);
  const suggested = suggestFarms(request, mockFarms, 5);
  const suggestedIds = new Set(suggested.map((f) => f.id));
  const others = mockFarms.filter((f) =>
    f.active && f.address.province === request.province && f.capacity >= need && !suggestedIds.has(f.id));

  return (
    /* عرض ثابت در همه گام‌ها — جهش عرض بین گام‌ها ناخوشایند است (گرید مزارع ۲ ستونه) */
    <div ref={topRef} style={centeredForm(isDesktop, 960)}>
      <Card style={{ marginBottom: 12 }}>
        <Stepper items={FLOW_STEPS.map((s, i) => ({
          label: s.title,
          status: (i < step ? 'done' : i === step ? 'current' : 'idle') as StepperItem['status'],
        }))} />
      </Card>

      {step === 0 && (
        <>
          <RequestSummaryCard request={request} />
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            نهاده‌های اعلامی تأمین‌کننده و مرغ درخواستی را بررسی کنید؛ در گام بعد مزرعه هدف تطبیق داده می‌شود.
          </Text>
          <Space direction="vertical" style={{ width: '100%', marginTop: 12 }}>
            <PrimaryCTA onClick={() => setStep(1)}>ادامه به تطبیق مزرعه</PrimaryCTA>
            <Button danger type="text" icon={<StopOutlined />} onClick={handleReject} style={{ alignSelf: 'center' }}>
              رد درخواست
            </Button>
          </Space>
        </>
      )}

      {step === 1 && (
        <>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="چرا این مزارع پیشنهاد شدند؟"
            description={`هم‌استان بودن با درخواست (${request.province})، ظرفیت ≥ ${formatNumber(need)} قطعه، و اولویت با گرید بالاتر، امتیاز بیشتر و ضریب تبدیل بهتر.`}
          />
          {suggested.length === 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message="مزرعه هم‌استان با ظرفیت کافی یافت نشد"
              description="می‌توانید درخواست را رد کنید یا استان دیگری را به‌صورت دستی بررسی کنید."
            />
          )}
          <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>پیشنهادهای هوشمند</Text>
          <CardGrid minWidth={320} gap={12}>
            {suggested.map((f) => (
              <FarmCard key={f.id} farm={f} selected={matchedFarm?.id === f.id} onSelect={selectFarm} />
            ))}
          </CardGrid>
          {others.length > 0 && (
            <>
              <Text strong style={{ ...pivaType.sectionTitle, display: 'block', margin: '12px 0 8px' }}>سایر مزارع استان</Text>
              <CardGrid minWidth={320} gap={12}>
                {others.map((f) => (
                  <FarmCard key={f.id} farm={f} selected={matchedFarm?.id === f.id} onSelect={selectFarm} />
                ))}
              </CardGrid>
            </>
          )}
          <PrimaryCTA disabled={!matchedFarm} onClick={() => setStep(2)}>
            {matchedFarm ? `ادامه با مزرعه «${matchedFarm.name}»` : 'ابتدا یک مزرعه انتخاب کنید'}
          </PrimaryCTA>
        </>
      )}

      {step === 2 && (
        <>
          <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>
            برآورد هزینه تولید و سهم تأمین‌کننده
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            اعداد پیش‌فرض از قیمت‌های بازار آمده‌اند؛ هر ردیف را می‌توانید تنظیم کنید — سهم تأمین‌کننده زنده محاسبه می‌شود.
          </Text>
          <Card style={{ marginBottom: 12 }}>
            <SummaryRow
              label="تولید برآوردی"
              value={
                <InputNumber
                  min={1}
                  value={productionKg}
                  onChange={(v) => setProductionKg(Number(v) || 1)}
                  addonAfter="کیلوگرم"
                  parser={numberFieldProps.parser}
                  formatter={numberFieldProps.formatter}
                  style={{ width: 200 }}
                />
              }
            />
          </Card>
          <EstimationTable rows={rows} productionKg={productionKg} editable onChange={setRows} />
          <div style={{ marginTop: 12 }}>
            <ShareSummary share={share} />
          </div>
          <PrimaryCTA onClick={() => setStep(3)}>ثبت برآورد و ادامه</PrimaryCTA>
        </>
      )}

      {step === 3 && (
        <>
          <Card>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>پیش‌نمایش قرارداد (کار)</Text>
            <SummaryRow label="درخواست" value={`${formatNumber(request.desiredKg)} کیلوگرم مرغ زنده — ${request.province}`} />
            <SummaryRow label="مزرعه هدف" value={matchedFarm ? `${matchedFarm.name} (${matchedFarm.address.city})` : '—'} />
            <SummaryRow label="تاریخ تحویل هدف" value={toPersianDigits(request.targetDeliveryDate)} />
            <SummaryRow label="تولید برآوردی" value={`${formatNumber(productionKg)} کیلوگرم`} />
            <SummaryRow label="کل هزینه تولید" value={`${formatNumber(share.totalCost)} تومان`} />
            <SummaryRow label="سهم تأمین‌کننده" value={`٪${formatNumber(share.supplierSharePercent)} — ${formatNumber(share.supplierShareKg)} کیلوگرم مرغ`} />
          </Card>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', margin: '12px 0' }}>
            با ایجاد قرارداد، درخواست برای مزرعه ارسال می‌شود تا هماهنگی را تأیید کند؛ پس از تأیید، کار وارد فاز اجرا (۴ گام) می‌شود و شما فقط نظارت می‌کنید.
          </Text>
          <PrimaryCTA disabled={!matchedFarm} onClick={handleCreate}>
            ایجاد قرارداد و ارسال به مزرعه
          </PrimaryCTA>
        </>
      )}
    </div>
  );
}

/** نمایش خواندنی درخواست غیر pending — برآورد، مزرعه تطبیق‌شده و لینک پایش قرارداد. */
function RequestReadonly({ request }: { request: SupplierRequest }) {
  const navigate = useNavigate();
  const { data } = useData();
  const contract = data.contracts.find((c) => c.id === request.contractId);
  const farm = request.matchedFarmId ? mockFarms.find((f) => f.id === request.matchedFarmId) : undefined;

  return (
    <>
      {request.status === 'rejected' && (
        <Alert type="error" showIcon message="این درخواست رد شده است" style={{ marginBottom: 12 }} />
      )}
      <RequestSummaryCard request={request} />

      {farm && (
        <div style={{ marginTop: 12 }}>
          <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>مزرعه تطبیق‌شده</Text>
          <FarmCard farm={farm} selected={false} onSelect={() => {}} />
        </div>
      )}

      {request.estimation && (
        <div style={{ marginTop: 12 }}>
          <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>برآورد هزینه و سهم تأمین‌کننده</Text>
          <EstimationTable rows={request.estimation.rows} productionKg={request.estimation.productionKg} />
          <div style={{ marginTop: 8 }}>
            <ShareSummary share={computeShares(request.estimation.rows, request.estimation.productionKg)} />
          </div>
        </div>
      )}

      {contract && (
        <div style={{ marginTop: 12 }}>
          {contract.status === 'awaiting_farm' ? (
            <Alert type="info" showIcon message="قرارداد ایجاد شده — در انتظار تأیید هماهنگی مزرعه‌دار" />
          ) : (
            <PrimaryCTA onClick={() => navigate(`/admin/contracts/${contract.id}/progress`)}>
              پایش قرارداد
            </PrimaryCTA>
          )}
        </div>
      )}
    </>
  );
}

export function AdminRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { data } = useData();
  const request = data.requests.find((r) => r.id === id);

  if (!request) {
    return (
      <PageFrame header={<PageHeader title="جزئیات درخواست" />}>
        <Empty description="درخواست یافت نشد" style={{ marginTop: 48 }} />
      </PageFrame>
    );
  }

  return (
    <PageFrame
      header={
        <PageHeader
          title="جزئیات درخواست"
          subtitle={`${formatNumber(request.desiredKg)} کیلوگرم مرغ زنده — ${request.province}`}
          extra={<Button icon={<ArrowRightOutlined />} onClick={() => navigate('/admin/requests')}>بازگشت</Button>}
        />
      }
    >
      {request.status === 'pending' ? (
        /* RequestFlow خودش عرض را به‌ازای گام مدیریت می‌کند (۹۶۰ برای گرید مزارع) */
        <RequestFlow key={request.id} request={request} />
      ) : (
        /* هم‌عرض فلو تا بعد از ایجاد قرارداد جهش عرض نداشته باشیم */
        <div style={centeredForm(isDesktop, 960)}>
          <RequestReadonly request={request} />
        </div>
      )}
    </PageFrame>
  );
}
