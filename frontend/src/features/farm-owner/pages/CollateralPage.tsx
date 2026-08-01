import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Radio, Button, InputNumber, Typography, Space, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { COLLATERAL_TYPE_LABELS } from '@/types';
import type { Collateral } from '@/types';

const { Text, Title } = Typography;

const collateralTypes: Array<{ value: Collateral['type']; icon: string }> = [
  { value: 'cash', icon: '💵' },
  { value: 'check', icon: '📝' },
  { value: 'property', icon: '🏠' },
  { value: 'guarantee', icon: '🏦' },
];

export function CollateralPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<Collateral['type']>('check');
  const [value, setValue] = useState<number | null>(500000000);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    setDone(true);
    message.success('وثیقه با موفقیت ثبت شد. قرارداد نهایی شد!');
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#389e0d' }} />
        <Title level={3} style={{ marginTop: 16 }}>قرارداد نهایی شد!</Title>
        <Text type="secondary">وثیقه شما ثبت و قرارداد به قراردادهای جاری اضافه شد.</Text>
        <Button type="primary" block size="large" style={{ marginTop: 24 }} onClick={() => navigate('/contracts')}>
          مشاهده قراردادهای جاری
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title="تأمین وثیقه" subtitle="نوع و مبلغ وثیقه را مشخص کنید" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Card style={{ marginBottom: 12 }}>
          <Title level={5}>نوع وثیقه</Title>
          <Radio.Group value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {collateralTypes.map((ct) => (
                <Radio key={ct.value} value={ct.value} style={{ padding: '8px 0' }}>
                  {ct.icon} {COLLATERAL_TYPE_LABELS[ct.value]}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Card>

        {(type === 'cash' || type === 'check') && (
          <Card style={{ marginBottom: 12 }}>
            <Title level={5}>مبلغ (تومان)</Title>
            <InputNumber
              value={value}
              onChange={(v) => setValue(v)}
              style={{ width: '100%' }}
              size="large"
              formatter={(v) => formatNumber(Number(v) || 0)}
              placeholder="مبلغ وثیقه"
            />
          </Card>
        )}

        <Button type="primary" block size="large" onClick={handleSubmit}>
          ثبت وثیقه و نهایی کردن قرارداد
        </Button>
      </div>
    </div>
  );
}
