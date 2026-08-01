import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Radio, Slider, Button, Input, Typography, Space, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import type { Contract } from '@/types';

const { Text, Title } = Typography;
const { TextArea } = Input;

export function ContractTermsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [type, setType] = useState<Contract['contractType']>('commission');
  const [profitMin, setProfitMin] = useState(30);
  const [terms, setTerms] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    message.success('قرارداد با موفقیت ارسال شد و برای مزرعه‌داران واجد شرایط نوتیفیکیشن ارسال گردید.');
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <Title level={4}>✅ قرارداد ارسال شد</Title>
        <Text type="secondary">مزرعه‌داران در حال بررسی و ارسال پیشنهاد هستند.</Text>
        <Button type="primary" block size="large" style={{ marginTop: 24 }} onClick={() => navigate('/contracts')}>
          مشاهده قراردادها
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title="تعریف شرایط قرارداد" subtitle="نوع، شرایط و تسهیم منافع را مشخص کنید" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Contract type */}
        <Card style={{ marginBottom: 12 }}>
          <Title level={5}>نوع قرارداد</Title>
          <Radio.Group value={type} onChange={(e) => setType(e.target.value)}>
            <Space direction="vertical">
              <Radio value="commission">
                <Text strong>کارمزدی</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>تأمین‌کننده نهاده تأمین میکند، مزرعه‌دار درصدی از سود را دریافت میکند</Text>
              </Radio>
              <Radio value="contract">
                <Text strong>پیمانکاری</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>تأمین‌کننده کل فرآیند را مدیریت میکند، مزرعه‌دار حق‌الزحمه ثابت دریافت میکند</Text>
              </Radio>
            </Space>
          </Radio.Group>
        </Card>

        {/* Terms */}
        <Card style={{ marginBottom: 12 }}>
          <Title level={5}>شرایط و تعهدات</Title>
          <TextArea
            rows={4}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="تعهدات طرفین را وارد کنید..."
          />
        </Card>

        {/* Profit sharing */}
        <Card style={{ marginBottom: 12 }}>
          <Title level={5}>حداقل تسهیم منافع</Title>
          <Slider
            min={10}
            max={60}
            value={profitMin}
            onChange={setProfitMin}
            marks={{ 10: '۱۰٪', 25: '۲۵٪', 40: '۴۰٪', 60: '۶۰٪' }}
          />
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <Text strong style={{ fontSize: 20, color: '#389e0d' }}>
              ٪{formatNumber(profitMin)}
            </Text>
          </div>
        </Card>

        <Button type="primary" block size="large" onClick={handleSubmit}>
          تأیید و ارسال به مزرعه‌داران
        </Button>
      </div>
    </div>
  );
}
