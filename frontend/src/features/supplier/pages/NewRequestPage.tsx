import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, InputNumber, Select, Typography, message } from 'antd';
import { DeleteOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageFrame } from '@/components/ui/PageFrame';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrimaryCTA } from '@/components/ui/PrimaryCTA';
import { SuccessScreen } from '@/components/ui/SuccessScreen';
import { NumberField, DateField, SelectField } from '@/features/progress/components/fields';
import { numberFieldProps } from '@/utils/fieldProps';
import { todayJalali } from '@/features/progress/utils/progress.utils';
import { useIsDesktop } from '@/hooks/useResponsive';
import { centeredForm, formGrid } from '@/utils/responsive';
import { pivaType } from '@/config/theme';
import { IRAN_PROVINCES, REQUEST_INPUT_LABELS } from '@/types/request';
import type { RequestInput, RequestInputKind, SupplierRequest } from '@/types/request';

const { Text } = Typography;

interface FormValues {
  inputs: { kind: RequestInputKind | undefined; amount: number | undefined }[];
  desiredKg: number;
  targetDeliveryDate: { format: (f: string) => string };
  province: string;
}

const KIND_OPTIONS = (Object.keys(REQUEST_INPUT_LABELS) as RequestInputKind[]).map((k) => ({
  value: k,
  label: `${REQUEST_INPUT_LABELS[k].label} (${REQUEST_INPUT_LABELS[k].unit})`,
}));

/**
 * ثبت درخواست جدید تأمین‌کننده — نهاده‌های ارائه‌شده (ترکیبی دلخواه)،
 * مرغ درخواستی، تاریخ تحویل هدف و استان. درخواست به صندوق زنجیره‌دار می‌رود.
 */
export function NewRequestPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { dispatch } = useData();
  const [form] = Form.useForm<FormValues>();
  const [created, setCreated] = useState(false);

  // واحد هر ردیف به نوع نهاده‌اش وابسته است — واچ کل آرایه
  const watchedInputs = Form.useWatch('inputs', form) as FormValues['inputs'] | undefined;

  const handleSubmit = (values: FormValues) => {
    // ادغام ردیف‌های هم‌نوع (جمع مقدارها) — یک نقطه واحد، بدون خطای کاربر
    const merged = new Map<RequestInputKind, number>();
    for (const row of values.inputs) {
      if (row.kind) merged.set(row.kind, (merged.get(row.kind) ?? 0) + Number(row.amount ?? 0));
    }
    const inputs: RequestInput[] = [...merged.entries()].map(([kind, amount]) => ({ kind, amount }));

    const request: SupplierRequest = {
      id: `rq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      inputs,
      desiredKg: Number(values.desiredKg),
      targetDeliveryDate: values.targetDeliveryDate.format('YYYY/MM/DD'),
      province: values.province,
      status: 'pending',
      createdAt: todayJalali(),
    };
    dispatch({ type: 'ADD_REQUEST', payload: request });
    message.success('درخواست شما ثبت شد.');
    setCreated(true);
  };

  if (created) {
    return (
      <PageFrame>
        <SuccessScreen
          title="درخواست ثبت شد"
          subtitle="درخواست شما به صندوق زنجیره‌دار ارسال شد — پس از تطبیق مزرعه و برآورد هزینه، سهم شما مشخص می‌شود."
          actionLabel="مشاهده درخواست‌های من"
          onAction={() => navigate('/supplier/requests')}
        />
      </PageFrame>
    );
  }

  return (
    <PageFrame header={<PageHeader title="درخواست جدید" subtitle="نهاده‌های خود را اعلام کنید" />}>
      <div style={centeredForm(isDesktop, 760)}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ inputs: [{ kind: undefined, amount: undefined }] }}
          onFinish={handleSubmit}
        >
          <Text strong style={{ ...pivaType.sectionTitle, display: 'block', marginBottom: 8 }}>نهاده‌هایی که ارائه می‌دهید</Text>
          <Form.List name="inputs">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }) => (
                  <Card key={key} size="small" style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Form.Item name={[name, 'kind']} style={{ flex: 1.2, marginBottom: 0 }}
                        rules={[{ required: true, message: 'نوع نهاده را انتخاب کنید' }]}>
                        <Select size={isDesktop ? 'middle' : 'large'} placeholder="نوع نهاده" options={KIND_OPTIONS} />
                      </Form.Item>
                      <Form.Item name={[name, 'amount']} style={{ flex: 1, marginBottom: 0 }}
                        rules={[
                          { required: true, message: 'مقدار را وارد کنید' },
                          { type: 'number', min: 1, message: 'حداقل ۱' },
                        ]}>
                        <InputNumber
                          size={isDesktop ? 'middle' : 'large'}
                          placeholder="مقدار"
                          addonAfter={REQUEST_INPUT_LABELS[watchedInputs?.[name]?.kind ?? 'cash'].unit}
                          parser={numberFieldProps.parser}
                          formatter={numberFieldProps.formatter}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                      <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(name)}
                        disabled={fields.length === 1} aria-label="حذف نهاده" />
                    </div>
                  </Card>
                ))}
                <Button block icon={<PlusOutlined />} onClick={() => add({ kind: undefined, amount: undefined })} style={{ marginBottom: 12 }}>
                  افزودن نهاده
                </Button>
              </>
            )}
          </Form.List>

          <div style={formGrid(isDesktop)}>
            <Form.Item name="desiredKg" rules={[
              { required: true, message: 'مقدار مرغ درخواستی را وارد کنید' },
              { type: 'number', min: 1, message: 'حداقل ۱ کیلوگرم' },
            ]}>
              <NumberField label="مرغ زنده درخواستی" unit="کیلوگرم" hint="مقدار کل مرغ زنده‌ای که در پایان دوره می‌خواهید" />
            </Form.Item>
            <Form.Item name="province" rules={[{ required: true, message: 'استان را انتخاب کنید' }]}>
              <SelectField label="استان موردنظر" options={IRAN_PROVINCES.map((p) => ({ value: p, label: p }))} placeholder="انتخاب استان" />
            </Form.Item>
          </div>
          <Form.Item name="targetDeliveryDate" rules={[{ required: true, message: 'تاریخ تحویل هدف را انتخاب کنید' }]}>
            <DateField label="تاریخ تحویل هدف" hint="تاریخ موردنظر برای دریافت مرغ زنده" />
          </Form.Item>

          <PrimaryCTA htmlType="submit" icon={<SendOutlined />}>ثبت درخواست</PrimaryCTA>
        </Form>
      </div>
    </PageFrame>
  );
}
