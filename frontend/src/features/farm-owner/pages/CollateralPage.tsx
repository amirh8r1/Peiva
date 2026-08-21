import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Button, InputNumber, Typography, Space, message, Tag, Divider, Empty, theme } from 'antd';
import {
  CheckCircleOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SkinOutlined,
  ArrowLeftOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageFrame } from '@/components/ui/PageFrame';
import { StatTile } from '@/components/ui/StatTile';
import { ProfitShareBadge } from '@/components/ui/ProfitShareBadge';
import { SuccessScreen } from '@/components/ui/SuccessScreen';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { formatNumber, parsePersianNumber } from '@/utils/format';
import { COLLATERAL_TYPE_LIST, CONTRACT_TYPE_LABELS, TERM_TEMPLATES, PROFIT_METHODS, IRANIAN_BANKS } from '@/types';
import { useIsDesktop } from '@/hooks/useResponsive';
import { centeredForm } from '@/utils/responsive';
import { CTA_MAX } from '@/config/layout';

const { Text, Title } = Typography;

type Step = 'form' | 'confirm';

export function CollateralPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();
  const { data, dispatch } = useData();
  const [step, setStep] = useState<Step>('form');
  const [type, setType] = useState('check');
  const [value, setValue] = useState<number | null>(500000000);
  const [bankId, setBankId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const contractId = id;
  const contract = data.contracts.find((c) => c.id === contractId);

  const handleGoToConfirm = () => {
    if (!contractId) return;
    // Validate: if bank guarantee selected, a bank must be chosen
    if (type === 'guarantee' && !bankId) {
      message.warning('لطفاً بانک صادرکننده ضمانت‌نامه را انتخاب کنید');
      return;
    }
    setStep('confirm');
  };

  const handleFinalSubmit = () => {
    if (!contractId) return;
    const bankName = type === 'guarantee' && bankId
      ? IRANIAN_BANKS.find((b) => b.id === bankId)?.label
      : undefined;

    dispatch({
      type: 'ADD_COLLATERAL',
      payload: {
        id: `col-${Date.now()}`,
        contractId,
        farmId: 'farm-1',
        type,
        value: type === 'cash' || type === 'check' ? (value ?? 0) : undefined,
        bankName,
        status: 'provided',
        submittedAt: new Date().toLocaleDateString('fa-IR'),
      },
    });
    dispatch({ type: 'UPDATE_CONTRACT_STATUS', payload: { id: contractId, status: 'finalized' } });
    setDone(true);
    message.success('وثیقه تأیید و قرارداد نهایی شد!');
  };

  const selectedCollateralType = COLLATERAL_TYPE_LIST.find((ct) => ct.id === type);
  const selectedBank = bankId ? IRANIAN_BANKS.find((b) => b.id === bankId) : null;

  // ── Contract summary data ──
  const terms = contract ? TERM_TEMPLATES.filter((t) => contract.selectedTermIds.includes(t.id)) : [];
  const method = contract ? PROFIT_METHODS.find((m) => m.id === contract.profitMethodId) : null;
  const totalChicks = contract ? contract.periods.reduce((s, p) => s + p.chickCount, 0) : 0;

  // ── Success screen ──
  if (done) {
    return (
      <SuccessScreen
        title="قرارداد نهایی شد!"
        subtitle="وثیقه تأیید و قرارداد شما نهایی گردید"
        actionLabel="بازگشت به داشبورد"
        onAction={() => navigate('/farm')}
      />
    );
  }

  if (!contract) {
    return <Empty description="قرارداد یافت نشد" />;
  }

  // ── Confirmation step ──
  if (step === 'confirm') {
    return (
      <PageFrame remountKey="confirm" header={<PageHeader title="تأیید نهایی" subtitle="خلاصه شرایط قرارداد و وثایق" />}>
        {/* ── Contract summary ── */}
        <Card
          title={<Space><FileTextOutlined /><span>خلاصه قرارداد</span></Space>}
          style={{ marginBottom: 12 }}
        >
          {/* Basic info — two per row mobile، چهار ستون دسکتاپ */}
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4, 1fr)' : '1fr 1fr', gap: 8, marginBottom: 16 }}>
            <StatTile icon={<FileTextOutlined />} label="نوع قرارداد" value={CONTRACT_TYPE_LABELS[contract.contractType]} tone="info" />
            <StatTile icon={<EnvironmentOutlined />} label="استان" value={contract.region} tone="success" />
            <StatTile icon={<CalendarOutlined />} label="مدت قرارداد" value={`${formatNumber(contract.duration)} دوره`} tone="warning" />
            <StatTile icon={<SkinOutlined />} label="کل جوجه‌ریزی" value={`${formatNumber(totalChicks)} قطعه`} tone="purple" />
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* Terms */}
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>شرایط و تعهدات:</Text>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {terms.map((t) => (
                <Tag key={t.id} color="blue" style={{ fontSize: 12, padding: '4px 10px', borderRadius: token.borderRadius }}>{t.label}</Tag>
              ))}
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* Profit sharing — stacked vertically for readability */}
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>شیوه و درصد تسهیم سود:</Text>
            <div style={{
              background: token.colorFillSecondary,
              borderRadius: token.borderRadius,
              padding: '12px 16px',
              marginBottom: 12,
            }}>
              <Text strong style={{ fontSize: 14, display: 'block' }}>{method?.label}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>{method?.description}</Text>
            </div>
            <ProfitShareBadge percent={contract.profitSharingMin} size="lg" />
          </div>
        </Card>

        {/* ── Collateral summary ── */}
        <Card
          title={<Space><SafetyOutlined /><span>تضمین انتخابی</span></Space>}
          style={{ marginBottom: 12, border: `2px solid ${token.colorPrimary}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Text style={{ fontSize: 32 }}>{selectedCollateralType?.icon}</Text>
            <div>
              <Text strong style={{ fontSize: 16, display: 'block' }}>{selectedCollateralType?.label}</Text>
              {type === 'guarantee' && selectedBank && (
                <Text style={{ fontSize: 13, color: token.colorInfo, display: 'block', marginTop: 4 }}>
                  <BankOutlined style={{ marginInlineStart: 4 }} />
                  {selectedBank.label}
                </Text>
              )}
            </div>
          </div>
          {(type === 'cash' || type === 'check') && value != null && (
            <div style={{
              background: token.colorSuccessBg,
              borderRadius: token.borderRadius,
              padding: '12px 16px',
              border: `1px solid ${token.colorSuccessBorder}`,
            }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>مبلغ تضمین</Text>
              <Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
                {formatNumber(value)} تومان
              </Text>
            </div>
          )}
        </Card>

        {/* ── Action buttons — یک سطر: بازگشت سمت راست، تایید سمت چپ ── */}
        <div style={centeredForm(isDesktop, CTA_MAX)}>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => setStep('form')}
              style={{ height: 48, borderRadius: token.borderRadius, flexShrink: 0, paddingInline: 16 }}
            >
              بازگشت و ویرایش
            </Button>
            <PrimaryCTA
              centered={false}
              icon={<CheckCircleOutlined />}
              onClick={handleFinalSubmit}
              style={{ flex: 1, minWidth: 0 }}
            >
              تایید نهایی و ثبت قرارداد
            </PrimaryCTA>
          </div>
        </div>
      </PageFrame>
    );
  }

  // ── Form step ──
  return (
    <PageFrame remountKey="form" header={<PageHeader title="تأمین تضامین" />}>
      {/* Collateral type selection */}
      <Card style={{ marginBottom: 12 }}>
        <Title level={5} style={{ marginBottom: 12 }}>نوع تضمین</Title>
        <Radio.Group value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {COLLATERAL_TYPE_LIST.map((ct) => (
              <Radio key={ct.id} value={ct.id} style={{ padding: '8px 0' }}>{ct.icon} {ct.label}</Radio>
            ))}
          </Space>
        </Radio.Group>
      </Card>

      {/* Bank selection — shown only for bank guarantee */}
      {type === 'guarantee' && (
        <Card style={{ marginBottom: 12 }}>
          <Title level={5} style={{ marginBottom: 4 }}>
            <BankOutlined style={{ marginInlineStart: 6 }} />
            انتخاب بانک صادرکننده ضمانت‌نامه
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
            بانکی که از آن ظرفیت دریافت ضمانت‌نامه دارید را انتخاب کنید
          </Text>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr 1fr',
            gap: 8,
          }}>
            {IRANIAN_BANKS.map((bank) => {
              const isSelected = bankId === bank.id;
              return (
                <SelectableCard
                  key={bank.id}
                  selected={isSelected}
                  onSelect={() => setBankId(bank.id)}
                  tone="info"
                  bodyPadding="10px 12px"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <BankOutlined style={{
                      fontSize: 16,
                      color: isSelected ? token.colorInfo : token.colorTextSecondary,
                      flexShrink: 0,
                    }} />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? token.colorInfo : token.colorText,
                      lineHeight: 1.3,
                      minWidth: 0,
                    }}>
                      {bank.label}
                    </Text>
                  </div>
                </SelectableCard>
              );
            })}
          </div>
        </Card>
      )}

      {/* Amount input — for cash and check */}
      {(type === 'cash' || type === 'check') && (
        <Card style={{ marginBottom: 12 }}>
          <Title level={5}>مبلغ (تومان)</Title>
          <InputNumber
            value={value}
            onChange={(v) => setValue(v)}
            style={{ width: '100%' }}
            size="large"
            parser={(v) => parsePersianNumber(v || '')}
            formatter={(v) => v != null ? formatNumber(Number(v)) : ''}
          />
        </Card>
      )}

      <PrimaryCTA onClick={handleGoToConfirm}>
        ادامه و مشاهده خلاصه قرارداد
      </PrimaryCTA>
    </PageFrame>
  );
}
