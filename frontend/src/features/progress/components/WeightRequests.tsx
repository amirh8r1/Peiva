import { Button, Card, Form, Input, List, Tag, Typography, message } from 'antd';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { SummaryRow } from './StepCard';
import { FieldLabel, NumberField } from './fields';
import { todayJalali } from '../utils/progress.utils';
import { formatNumber, toPersianDigits } from '@/utils/format';
import type { ProgressRole, WeightRequest, WeightRequestAnswer } from '@/types';

const { Text } = Typography;

interface Props {
  role: ProgressRole;
  /** درخواست‌های همین قرارداد (به ترتیب زمانی). */
  requests: WeightRequest[];
  onAdd: () => void;
  onAnswer: (id: string, answer: WeightRequestAnswer) => void;
}

interface AnswerFormValues {
  avgWeight: number;
  estimatedCount: number;
  note?: string;
}

/** فلو مستقل «درخواست اعلام وزن مرغ» — گام نیست، هر زمان قابل ثبت و چندباره است. */
export function WeightRequests({ role, requests, onAdd, onAnswer }: Props) {
  const handleAnswer = (id: string) => async (values: AnswerFormValues) => {
    onAnswer(id, {
      avgWeight: values.avgWeight,
      estimatedCount: values.estimatedCount,
      note: values.note?.trim() || undefined,
      answeredBy: 'farm',
      answeredAt: todayJalali(),
    });
    message.success('پاسخ وزن ثبت شد.');
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Text strong style={{ fontSize: 14 }}>درخواست اعلام وزن مرغ</Text>
          {role === 'supplier' && (
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              درخواست جدید
            </Button>
          )}
        </div>
      }
      style={{ marginBottom: 12 }}
    >
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
        درخواست اعلام میانگین وزن و تعداد برآوردی مرغ‌ها را می‌توانید هر زمان ثبت کنید؛ پاسخ مزرعه‌دار در همین بخش نمایش داده می‌شود.
      </Text>

      <List
        size="small"
        dataSource={requests}
        locale={{ emptyText: 'درخواستی ثبت نشده است' }}
        renderItem={(r) => (
          <List.Item style={{ display: 'block', paddingBlock: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text strong style={{ fontSize: 12 }}>درخواست {toPersianDigits(r.requestedAt)}</Text>
              {r.status === 'pending'
                ? <Tag color="orange" style={{ margin: 0 }}>در انتظار پاسخ</Tag>
                : <Tag color="green" style={{ margin: 0 }}>پاسخ داده شد</Tag>}
            </div>

            {r.status === 'answered' && r.answer && (
              <div style={{ marginTop: 6 }}>
                <SummaryRow label="میانگین وزن هر مرغ" value={`${formatNumber(r.answer.avgWeight)} کیلوگرم`} />
                <SummaryRow label="تعداد برآوردی" value={`${formatNumber(r.answer.estimatedCount)} قطعه`} />
                <SummaryRow label="تاریخ پاسخ" value={toPersianDigits(r.answer.answeredAt)} />
                {r.answer.note && (
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
                    توضیح مزرعه‌دار: {r.answer.note}
                  </Text>
                )}
              </div>
            )}

            {r.status === 'pending' && role === 'farm' && (
              <Form<AnswerFormValues>
                key={r.id}
                layout="vertical"
                onFinish={handleAnswer(r.id)}
                style={{ marginTop: 6 }}
              >
                <Form.Item
                  name="avgWeight"
                  rules={[
                    { required: true, message: 'میانگین وزن را وارد کنید' },
                    { type: 'number', min: 0.1, message: 'وزن باید بیشتر از ۰ باشد' },
                  ]}
                >
                  <NumberField label="میانگین وزن هر مرغ" unit="کیلوگرم" step={0.1} min={0.1} hint="میانگین وزن زنده هر مرغ بر اساس توزین نمونه‌ای" />
                </Form.Item>
                <Form.Item
                  name="estimatedCount"
                  rules={[
                    { required: true, message: 'تعداد برآوردی را وارد کنید' },
                    { type: 'number', min: 1, message: 'تعداد باید حداقل ۱ باشد' },
                  ]}
                >
                  <NumberField label="تعداد برآوردی مرغ" unit="قطعه" precision={0} hint="تعداد تقریبی مرغ‌های آماده بارگیری" />
                </Form.Item>
                <FieldLabel>توضیح (اختیاری)</FieldLabel>
                <Form.Item name="note" style={{ marginBottom: 12 }}>
                  <Input.TextArea rows={2} maxLength={200} showCount placeholder="مثلاً: وزن بر اساس توزین نمونه‌ای ۵۰ قطعه" />
                </Form.Item>
                <Button type="primary" size="small" block icon={<CheckOutlined />} htmlType="submit">
                  ثبت پاسخ
                </Button>
              </Form>
            )}
          </List.Item>
        )}
      />
    </Card>
  );
}
