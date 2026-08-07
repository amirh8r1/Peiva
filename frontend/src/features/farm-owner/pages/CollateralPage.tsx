import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Button, InputNumber, Typography, Space, message, Tag, Divider, Empty } from 'antd';
import {
  CheckCircleOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PercentageOutlined,
  SkinOutlined,
  ArrowLeftOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber, parsePersianNumber, toPersianDigits } from '@/utils/format';
import { COLLATERAL_TYPE_LIST, CONTRACT_TYPE_LABELS, TERM_TEMPLATES, PROFIT_METHODS, IRANIAN_BANKS } from '@/types';

const { Text, Title } = Typography;

type Step = 'form' | 'confirm';

export function CollateralPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#389e0d' }} />
        <Title level={3} style={{ marginTop: 16 }}>🎉 قرارداد نهایی شد!</Title>
        <Button type="primary" block size="large" style={{ marginTop: 24 }} onClick={() => navigate('/farm')}>بازگشت به داشبورد</Button>
      </div>
    );
  }

  if (!contract) {
    return <Empty description="قرارداد یافت نشد" />;
  }

  // ── Confirmation step ──
  if (step === 'confirm') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <PageHeader title="تأیید نهایی" subtitle="خلاصه شرایط قرارداد و وثایق" />
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

          {/* ── Contract summary ── */}
          <Card
            title={<Space><FileTextOutlined /><span>خلاصه قرارداد</span></Space>}
            style={{ marginBottom: 12, borderRadius: 12 }}
          >
            {/* Basic info — two per row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={summaryItemStyle}>
                <FileTextOutlined style={{ fontSize: 20, color: '#1677ff', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>نوع قرارداد</Text>
                  <Text strong style={{ fontSize: 14 }}>{CONTRACT_TYPE_LABELS[contract.contractType]}</Text>
                </div>
              </div>
              <div style={summaryItemStyle}>
                <EnvironmentOutlined style={{ fontSize: 20, color: '#389e0d', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>استان</Text>
                  <Text strong style={{ fontSize: 14 }}>{contract.region}</Text>
                </div>
              </div>
              <div style={summaryItemStyle}>
                <CalendarOutlined style={{ fontSize: 20, color: '#fa8c16', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>مدت قرارداد</Text>
                  <Text strong style={{ fontSize: 14 }}>{formatNumber(contract.duration)} دوره</Text>
                </div>
              </div>
              <div style={summaryItemStyle}>
                <SkinOutlined style={{ fontSize: 20, color: '#722ed1', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>کل جوجه‌ریزی</Text>
                  <Text strong style={{ fontSize: 14 }}>{formatNumber(totalChicks)} قطعه</Text>
                </div>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Terms */}
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>شرایط و تعهدات:</Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {terms.map((t) => (
                  <Tag key={t.id} color="blue" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8 }}>{t.label}</Tag>
                ))}
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Profit sharing — stacked vertically for readability */}
            <div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>شیوه و درصد تسهیم سود:</Text>
              <div style={{
                background: '#fafafa',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 10,
              }}>
                <Text strong style={{ fontSize: 14, display: 'block' }}>{method?.label}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>{method?.description}</Text>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                borderRadius: 10,
                padding: '14px 16px',
                border: '2px solid #b7eb8f',
                textAlign: 'center',
              }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>حداقل سهم مزرعه‌دار</Text>
                <Text strong style={{ fontSize: 28, color: '#389e0d', lineHeight: 1.3 }}>
                  ٪{formatNumber(contract.profitSharingMin)}
                </Text>
              </div>
            </div>
          </Card>

          {/* ── Collateral summary ── */}
          <Card
            title={<Space><SafetyOutlined /><span>تضمین انتخابی</span></Space>}
            style={{ marginBottom: 12, borderRadius: 12, border: '2px solid #389e0d' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Text style={{ fontSize: 32 }}>{selectedCollateralType?.icon}</Text>
              <div>
                <Text strong style={{ fontSize: 16, display: 'block' }}>{selectedCollateralType?.label}</Text>
                {type === 'guarantee' && selectedBank && (
                  <Text style={{ fontSize: 13, color: '#1677ff', display: 'block', marginTop: 4 }}>
                    <BankOutlined style={{ marginLeft: 4 }} />
                    {selectedBank.label}
                  </Text>
                )}
              </div>
            </div>
            {(type === 'cash' || type === 'check') && value != null && (
              <div style={{
                background: '#f6ffed',
                borderRadius: 10,
                padding: '14px 16px',
                border: '1px solid #b7eb8f',
              }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>مبلغ تضمین</Text>
                <Text strong style={{ fontSize: 20, color: '#389e0d' }}>
                  {formatNumber(value)} تومان
                </Text>
              </div>
            )}
          </Card>

          {/* ── Action buttons ── */}
          <Button
            type="primary"
            block
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleFinalSubmit}
            style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 600, marginBottom: 10 }}
          >
            تایید نهایی و ثبت قرارداد
          </Button>
          <Button
            block
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => setStep('form')}
            style={{ height: 44, borderRadius: 12 }}
          >
            بازگشت و ویرایش
          </Button>
        </div>
      </div>
    );
  }

  // ── Form step ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title="تأمین تضامین" />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
        {/* Collateral type selection */}
        <Card style={{ marginBottom: 12, borderRadius: 12 }}>
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
          <Card style={{ marginBottom: 12, borderRadius: 12 }}>
            <Title level={5} style={{ marginBottom: 4 }}>
              <BankOutlined style={{ marginLeft: 6 }} />
              انتخاب بانک صادرکننده ضمانت‌نامه
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 12 }}>
              بانکی که از آن ظرفیت دریافت ضمانت‌نامه دارید را انتخاب کنید
            </Text>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}>
              {IRANIAN_BANKS.map((bank) => {
                const isSelected = bankId === bank.id;
                return (
                  <div
                    key={bank.id}
                    onClick={() => setBankId(bank.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: isSelected ? '2px solid #1677ff' : '1px solid #e8e8e8',
                      background: isSelected ? '#e6f4ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minHeight: 44,
                    }}
                  >
                    <BankOutlined style={{
                      fontSize: 16,
                      color: isSelected ? '#1677ff' : '#8c8c8c',
                      flexShrink: 0,
                    }} />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? '#1677ff' : '#434343',
                      lineHeight: 1.3,
                    }}>
                      {bank.label}
                    </Text>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Amount input — for cash and check */}
        {(type === 'cash' || type === 'check') && (
          <Card style={{ marginBottom: 12, borderRadius: 12 }}>
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

        <Button
          type="primary"
          block
          size="large"
          onClick={handleGoToConfirm}
          style={{ height: 48, borderRadius: 12, fontSize: 15, fontWeight: 600 }}
        >
          ادامه و مشاهده خلاصه قرارداد
        </Button>
      </div>
    </div>
  );
}

const summaryItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  background: '#fafafa',
  borderRadius: 10,
  padding: '12px 14px',
};
