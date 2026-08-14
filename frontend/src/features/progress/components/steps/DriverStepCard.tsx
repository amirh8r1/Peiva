import { useState } from 'react';
import { Alert, Button, Checkbox, Form, Typography, message } from 'antd';
import { EditOutlined, SendOutlined } from '@ant-design/icons';
import { StepCard, SummaryRow } from '../StepCard';
import { makeEvent, todayJalali } from '../../utils/progress.utils';
import { TextField, SelectField, DateField } from '../fields';
import { toEnglishDigits, toPersianDigits } from '@/utils/format';
import dayjs from '@/utils/dayjs';
import type { ContractProgressStep, DriverPayload, ProgressRole } from '@/types';

const { Text } = Typography;

const VEHICLE_TYPES = ['کامیون', 'کامیونت', 'وانت', 'نیسان'];

interface Props {
  step: Extract<ContractProgressStep, { key: 'driver' }>;
  role: ProgressRole;
  /** تاریخ بارگیری مصوب گام برداشت — پیش‌فرض فیلد تاریخ در فرم اعلام. */
  initialPickupDate?: string;
  /** گام تحویل done شده؟ (بعد از آن ویرایش ممنوع است) */
  deliveryDone: boolean;
  onUpsert: (next: ContractProgressStep) => void;
}

interface DriverFormValues {
  driverName: string;
  driverPhone: string;
  plateNumber: string;
  vehicleType: string;
  isDriverSupervisor: boolean;
  supervisorName?: string;
  supervisorPhone?: string;
  pickupDate: { format: (f: string) => string };
}

/** شماره تماس معتبر: ۱۱ رقم که با ۰ شروع می‌شود. */
function validatePhone(label: string) {
  return (_: unknown, value?: string) => {
    const digits = toEnglishDigits(value ?? '').replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('0')) return Promise.resolve();
    return Promise.reject(new Error(`${label} معتبر نیست (نمونه: ۰۹۱۲۳۴۵۶۷۸۹)`));
  };
}

function toPayload(values: DriverFormValues): DriverPayload {
  return {
    driverName: values.driverName.trim(),
    driverPhone: values.driverPhone.trim(),
    plateNumber: values.plateNumber.trim(),
    vehicleType: values.vehicleType,
    isDriverSupervisor: values.isDriverSupervisor,
    supervisorName: values.isDriverSupervisor ? undefined : values.supervisorName?.trim(),
    supervisorPhone: values.isDriverSupervisor ? undefined : values.supervisorPhone?.trim(),
    pickupDate: values.pickupDate.format('YYYY/MM/DD'),
  };
}

/** گام ۳ — اعلام مشخصات دریافت‌کننده (۲۴ ساعت قبل از تحویل):
 *  تأمین‌کننده اعلام می‌کند و گام همان‌جا تکمیل می‌شود؛ مزرعه‌دار فقط نوتیف می‌گیرد.
 *  تا تکمیل گام تحویل، تأمین‌کننده می‌تواند مشخصات را ویرایش کند. */
export function DriverStepCard({ step, role, initialPickupDate, deliveryDone, onUpsert }: Props) {
  const [editing, setEditing] = useState(false);

  const isSupplier = role === 'supplier';
  const announced = step.status === 'done';
  const canAnnounce = isSupplier && step.status === 'idle';
  const canEdit = isSupplier && announced && !deliveryDone;
  const mode: 'announce' | 'edit' = editing ? 'edit' : 'announce';

  const handleSubmit = async (values: DriverFormValues) => {
    const payload = toPayload(values);
    if (mode === 'edit') {
      onUpsert({
        ...step, payload,
        events: [...step.events, makeEvent('supplier', 'updated')],
      });
      setEditing(false);
      message.success('مشخصات دریافت‌کننده به‌روزرسانی شد.');
    } else {
      onUpsert({
        ...step, status: 'done', claimedBy: 'supplier', claimedAt: todayJalali(), payload,
        events: [...step.events, makeEvent('supplier', 'announced')],
      });
      message.success('مشخصات دریافت‌کننده اعلام شد.');
    }
  };

  // ── خلاصه (farm همیشه؛ supplier بعد از اعلام وقتی ویرایش فعال نیست) ──
  const summary = (
    <>
      <SummaryRow label="راننده / دریافت‌کننده" value={step.payload.driverName} />
      <SummaryRow label="شماره تماس" value={toPersianDigits(step.payload.driverPhone)} />
      <SummaryRow label="خودرو" value={`${step.payload.vehicleType} — ${step.payload.plateNumber}`} />
      <SummaryRow
        label="ناظر همراه"
        value={step.payload.isDriverSupervisor ? 'خود راننده' : `${step.payload.supervisorName ?? ''} (${toPersianDigits(step.payload.supervisorPhone ?? '')})`}
      />
      <SummaryRow label="تاریخ بارگیری" value={toPersianDigits(step.payload.pickupDate)} />
    </>
  );

  if (!isSupplier && announced) {
    return (
      <StepCard step={step} stepLabel="اعلام مشخصات دریافت‌کننده">
        {summary}
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
          این اعلام صرفاً جهت اطلاع شماست — اقدام دیگری لازم نیست.
        </Text>
      </StepCard>
    );
  }

  if (!isSupplier && !announced) {
    return (
      <StepCard step={step} stepLabel="اعلام مشخصات دریافت‌کننده">
        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          در انتظار اعلام مشخصات دریافت‌کننده توسط تأمین‌کننده (۲۴ ساعت قبل از بارگیری)...
        </Text>
      </StepCard>
    );
  }

  if (isSupplier && announced && !editing) {
    return (
      <StepCard step={step} stepLabel="اعلام مشخصات دریافت‌کننده">
        {summary}
        {canEdit && (
          <Button size="small" icon={<EditOutlined />} style={{ marginTop: 8 }} onClick={() => setEditing(true)}>
            ویرایش مشخصات
          </Button>
        )}
        {!canEdit && (
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
            پس از تکمیل تحویل، ویرایش مشخصات ممکن نیست.
          </Text>
        )}
      </StepCard>
    );
  }

  // ── فرم اعلام / ویرایش (supplier) ──
  const isSupervisorChecked = (v?: boolean) => !!v;
  return (
    <StepCard step={step} stepLabel="اعلام مشخصات دریافت‌کننده">
      {mode === 'edit' && (
        <Alert type="info" showIcon style={{ marginBottom: 12 }}
          message="این اعلام قبلاً ثبت شده است" description="با ذخیره، نسخه جدید جایگزین می‌شود و در تاریخچه ثبت می‌گردد." />
      )}
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        مشخصات دریافت‌کننده مرغ زنده را اعلام کنید — این اعلام باید حدود ۲۴ ساعت قبل از بارگیری ثبت شود.
      </Text>
      <Form<DriverFormValues>
        key={mode}
        layout="vertical"
        initialValues={{
          driverName: mode === 'edit' ? step.payload.driverName : '',
          driverPhone: mode === 'edit' ? step.payload.driverPhone : '',
          plateNumber: mode === 'edit' ? step.payload.plateNumber : '',
          vehicleType: mode === 'edit' ? step.payload.vehicleType : undefined,
          isDriverSupervisor: mode === 'edit' ? step.payload.isDriverSupervisor : false,
          supervisorName: mode === 'edit' ? step.payload.supervisorName : '',
          supervisorPhone: mode === 'edit' ? step.payload.supervisorPhone : '',
          pickupDate: (() => {
            const source = mode === 'edit' && step.payload.pickupDate ? step.payload.pickupDate : initialPickupDate;
            return source ? (dayjs as any)(source, { jalali: true }) : undefined;
          })(),
        }}
        onFinish={handleSubmit}
      >
        <Form.Item name="driverName" rules={[{ required: true, message: 'نام راننده را وارد کنید' }]}>
          <TextField label="نام راننده / دریافت‌کننده" />
        </Form.Item>
        <Form.Item
          name="driverPhone"
          rules={[{ required: true, message: 'شماره تماس راننده را وارد کنید' }, { validator: validatePhone('شماره تماس راننده') }]}
        >
          <TextField label="شماره تماس راننده" hint="مثلاً: ۰۹۱۲۳۴۵۶۷۸۹" />
        </Form.Item>
        <Form.Item name="plateNumber" rules={[{ required: true, message: 'پلاک خودرو را وارد کنید' }]}>
          <TextField label="پلاک خودرو" hint="مثلاً: ۱۲ب۳۴۵ ایران۶۶" />
        </Form.Item>
        <Form.Item name="vehicleType" rules={[{ required: true, message: 'نوع خودرو را انتخاب کنید' }]}>
          <SelectField label="نوع خودرو" options={VEHICLE_TYPES.map((t) => ({ value: t, label: t }))} />
        </Form.Item>
        <Form.Item name="isDriverSupervisor" valuePropName="checked" style={{ marginBottom: 12 }}>
          <Checkbox>ناظر همراه، خود راننده است</Checkbox>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(p, c) => isSupervisorChecked(p.isDriverSupervisor) !== isSupervisorChecked(c.isDriverSupervisor)}>
          {({ getFieldValue }) => !isSupervisorChecked(getFieldValue('isDriverSupervisor')) && (
            <>
              <Form.Item name="supervisorName" rules={[{ required: true, message: 'نام ناظر همراه را وارد کنید' }]}>
                <TextField label="نام ناظر همراه" />
              </Form.Item>
              <Form.Item
                name="supervisorPhone"
                rules={[{ required: true, message: 'شماره تماس ناظر را وارد کنید' }, { validator: validatePhone('شماره تماس ناظر') }]}
              >
                <TextField label="شماره تماس ناظر" hint="مثلاً: ۰۹۱۲۳۴۵۶۷۸۹" />
              </Form.Item>
            </>
          )}
        </Form.Item>
        <Form.Item name="pickupDate" rules={[{ required: true, message: 'تاریخ بارگیری را انتخاب کنید' }]}>
          <DateField label="تاریخ بارگیری" hint="تاریخ مراجعه برای دریافت مرغ زنده — مشخصات باید حداقل ۲۴ ساعت قبل از آن اعلام شود" />
        </Form.Item>
        <Button type="primary" size="large" block icon={mode === 'edit' ? <EditOutlined /> : <SendOutlined />} htmlType="submit">
          {mode === 'edit' ? 'ذخیره تغییرات' : 'اعلام مشخصات دریافت‌کننده'}
        </Button>
        {mode === 'edit' && (
          <Button size="large" block style={{ marginTop: 8 }} onClick={() => setEditing(false)}>
            انصراف
          </Button>
        )}
      </Form>
    </StepCard>
  );
}
