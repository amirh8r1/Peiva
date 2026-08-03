import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Button, InputNumber, Typography, Space, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber, parsePersianNumber } from '@/utils/format';
import { COLLATERAL_TYPE_LIST } from '@/types';

const { Text, Title } = Typography;

export function CollateralPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, dispatch } = useData();
  const [type, setType] = useState('check');
  const [value, setValue] = useState<number | null>(500000000);
  const [done, setDone] = useState(false);

  const contractId = id;

  const handleSubmit = () => {
    if (!contractId) return;
    dispatch({
      type: 'ADD_COLLATERAL',
      payload: { id: `col-${Date.now()}`, contractId, farmId: 'farm-1', type, value: type === 'cash' || type === 'check' ? (value ?? 0) : undefined, status: 'provided', submittedAt: new Date().toLocaleDateString('fa-IR') },
    });
    dispatch({ type: 'UPDATE_CONTRACT_STATUS', payload: { id: contractId, status: 'finalized' } });
    setDone(true);
    message.success('وثیقه تأیید و قرارداد نهایی شد!');
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#389e0d' }} />
        <Title level={3} style={{ marginTop: 16 }}>🎉 قرارداد نهایی شد!</Title>
        <Button type="primary" block size="large" style={{ marginTop: 24 }} onClick={() => navigate('/farm')}>بازگشت به داشبورد</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title="تأمین تضامین" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Card style={{ marginBottom: 12 }}><Title level={5}>نوع تضمین</Title>
          <Radio.Group value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {COLLATERAL_TYPE_LIST.map((ct) => (
                <Radio key={ct.id} value={ct.id} style={{ padding: '8px 0' }}>{ct.icon} {ct.label}</Radio>
              ))}
            </Space>
          </Radio.Group>
        </Card>
        {(type === 'cash' || type === 'check') && (
          <Card style={{ marginBottom: 12 }}><Title level={5}>مبلغ (تومان)</Title>
            <InputNumber value={value} onChange={(v) => setValue(v)} style={{ width: '100%' }} size="large"
              parser={(v) => parsePersianNumber(v || '')}
              formatter={(v) => v != null ? formatNumber(Number(v)) : ''} />
          </Card>
        )}
        <Button type="primary" block size="large" onClick={handleSubmit}>ثبت و نهایی کردن قرارداد</Button>
      </div>
    </div>
  );
}
