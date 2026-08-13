import { useState } from 'react';
import { Alert, Button, Checkbox, DatePicker, Input, Select, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { StepCard, SummaryRow } from '../StepCard';
import { FeedbackActions } from '../FeedbackActions';
import { useStepFeedback } from '../../hooks/useStepFeedback';
import {
  makeEvent, todayJalali, isBeforeJalali, addDaysJalali, jalaliDatePickerProps,
} from '../../utils/progress.utils';
import { toEnglishDigits, toPersianDigits } from '@/utils/format';
import dayjs from '@/utils/dayjs';
import type { ContractProgressStep, DriverPayload, ProgressRole } from '@/types';

const { Text } = Typography;

const VEHICLE_TYPES = ['کامیون', 'کامیونت', 'وانت', 'نیسان'];

interface Props {
  step: Extract<ContractProgressStep, { key: 'driver' }>;
  role: ProgressRole;
  /** زودترین تاریخ مجاز مراجعه از گام برداشت (قانون حداقل ۷ روز). */
  earliestPickup?: string;
  onUpsert: (next: ContractProgressStep) => void;
}

/** گام ۳ — راننده و خودرو: ادعای تأمین‌کننده با اعتبارسنجی سخت ۷ روز، تأیید/رد مزرعه‌دار. */
export function DriverStepCard({ step, role, earliestPickup, onUpsert }: Props) {
  const { confirm, reject } = useStepFeedback(step, role, onUpsert);
  const [driverName, setDriverName] = useState(step.payload.driverName);
  const [driverPhone, setDriverPhone] = useState(step.payload.driverPhone);
  const [plateNumber, setPlateNumber] = useState(step.payload.plateNumber);
  const [vehicleType, setVehicleType] = useState(step.payload.vehicleType);
  const [isSupervisor, setIsSupervisor] = useState(step.payload.isDriverSupervisor);
  const [supervisorName, setSupervisorName] = useState(step.payload.supervisorName ?? '');
  const [supervisorPhone, setSupervisorPhone] = useState(step.payload.supervisorPhone ?? '');
  const [pickupDate, setPickupDate] = useState(step.payload.pickupDate);

  const isSupplier = role === 'supplier';
  const canClaim = isSupplier && (step.status === 'idle' || step.status === 'rejected');

  const handleClaim = () => {
    if (!driverName.trim()) return message.warning('نام راننده را وارد کنید');
    if (toEnglishDigits(driverPhone).replace(/\D/g, '').length < 10) return message.warning('شماره تماس راننده معتبر نیست');
    if (!plateNumber.trim()) return message.warning('پلاک خودرو را وارد کنید');
    if (!vehicleType) return message.warning('نوع خودرو را انتخاب کنید');
    if (!pickupDate) return message.warning('تاریخ مراجعه را انتخاب کنید');
    // قانون سخت: حداقل ۷ روز بعد از تأیید برداشت
    if (earliestPickup && isBeforeJalali(pickupDate, earliestPickup)) {
      return message.warning(`تاریخ مراجعه باید از ${toPersianDigits(earliestPickup)} به بعد باشد (حداقل ۷ روز بعد از تأیید برداشت)`);
    }
    if (!isSupervisor && (!supervisorName.trim() || toEnglishDigits(supervisorPhone).replace(/\D/g, '').length < 10)) {
      return message.warning('مشخصات ناظر را کامل وارد کنید (یا گزینه «ناظر همان راننده است» را فعال کنید)');
    }
    // هشدار نرم قانون ۲۴ ساعت
    if (isBeforeJalali(pickupDate, addDaysJalali(todayJalali(), 1))) {
      message.warning('طبق قانون، مشخصات راننده باید حداقل ۲۴ ساعت قبل از ارسال ثبت شود — در تاریخ انتخابی این شرط برقرار نیست.');
    }
    const payload: DriverPayload = {
      driverName: driverName.trim(), driverPhone: driverPhone.trim(), plateNumber: plateNumber.trim(),
      vehicleType, isDriverSupervisor: isSupervisor,
      supervisorName: isSupervisor ? undefined : supervisorName.trim(),
      supervisorPhone: isSupervisor ? undefined : supervisorPhone.trim(),
      pickupDate,
    };
    onUpsert({
      ...step, status: 'claimed', claimedBy: 'supplier', claimedAt: todayJalali(), payload,
      events: [...step.events, makeEvent('supplier', 'claimed')],
    });
    message.success('مشخصات راننده ثبت شد و برای مزرعه‌دار ارسال گردید.');
  };

  return (
    <StepCard step={step} stepLabel="راننده و خودرو">
      {/* ادعای تأمین‌کننده */}
      {canClaim && (
        <>
          {step.status === 'rejected' && (
            <Alert type="error" showIcon style={{ marginBottom: 12 }}
              message="نظر مزرعه‌دار" description={step.rejectedNote || 'ادعای شما رد شده است.'} />
          )}
          {earliestPickup && (
            <Alert type="info" showIcon style={{ marginBottom: 12 }}
              message={`زودترین تاریخ مجاز مراجعه: ${toPersianDigits(earliestPickup)}`}
              description="تاریخ مراجعه باید حداقل ۷ روز بعد از تأیید برداشت باشد." />
          )}
          <Input size="large" placeholder="نام راننده" value={driverName}
            onChange={(e) => setDriverName(e.target.value)} style={{ marginBottom: 12, borderRadius: 10 }} />
          <Input size="large" placeholder="شماره تماس راننده" value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)} style={{ marginBottom: 12, borderRadius: 10 }} />
          <Input size="large" placeholder="پلاک خودرو" value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)} style={{ marginBottom: 12, borderRadius: 10 }} />
          <Select size="large" style={{ width: '100%', marginBottom: 12, borderRadius: 10 }} placeholder="نوع خودرو"
            value={vehicleType || undefined} onChange={(v) => setVehicleType(v)}
            options={VEHICLE_TYPES.map((t) => ({ value: t, label: t }))} />
          <Checkbox checked={isSupervisor} onChange={(e) => setIsSupervisor(e.target.checked)} style={{ marginBottom: 12 }}>
            ناظر همراه، خود راننده است
          </Checkbox>
          {!isSupervisor && (
            <>
              <Input size="large" placeholder="نام ناظر همراه" value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)} style={{ marginBottom: 12, borderRadius: 10 }} />
              <Input size="large" placeholder="شماره تماس ناظر" value={supervisorPhone}
                onChange={(e) => setSupervisorPhone(e.target.value)} style={{ marginBottom: 12, borderRadius: 10 }} />
            </>
          )}
          <DatePicker
            {...jalaliDatePickerProps}
            placeholder="تاریخ مراجعه"
            value={pickupDate ? (dayjs as any)(pickupDate, { jalali: true }) : null}
            onChange={(d) => setPickupDate(d ? (d as { format: (f: string) => string }).format('YYYY/MM/DD') : '')}
            disabledDate={(d) => !!earliestPickup && d.isBefore((dayjs as any)(earliestPickup, { jalali: true }), 'day')}
          />
          <Text type="secondary" style={{ fontSize: 11, display: 'block', margin: '8px 0' }}>
            مشخصات باید حداقل ۲۴ ساعت قبل از ارسال ثبت شده باشد.
          </Text>
          <Button type="primary" size="large" block icon={<SendOutlined />} onClick={handleClaim}>
            ثبت مشخصات راننده
          </Button>
        </>
      )}

      {/* بررسی و تأیید/رد مزرعه‌دار */}
      {!isSupplier && step.status === 'claimed' && (
        <>
          <SummaryRow label="راننده" value={step.payload.driverName} />
          <SummaryRow label="تماس راننده" value={toPersianDigits(step.payload.driverPhone)} />
          <SummaryRow label="خودرو" value={`${step.payload.vehicleType} — ${step.payload.plateNumber}`} />
          <SummaryRow label="ناظر همراه" value={step.payload.isDriverSupervisor ? 'خود راننده' : `${step.payload.supervisorName ?? ''} (${toPersianDigits(step.payload.supervisorPhone ?? '')})`} />
          <SummaryRow label="تاریخ مراجعه" value={toPersianDigits(step.payload.pickupDate)} />
          <FeedbackActions
            allowReject
            confirmLabel="تأیید مشخصات راننده"
            onConfirm={() => { confirm(); message.success('مشخصات راننده تأیید شد.'); }}
            onReject={(note) => { reject(note); message.success('رد ثبت شد.'); }}
          />
        </>
      )}

      {/* خلاصه نهایی */}
      {step.status === 'done' && (
        <>
          <SummaryRow label="راننده" value={step.payload.driverName} />
          <SummaryRow label="خودرو" value={`${step.payload.vehicleType} — ${step.payload.plateNumber}`} />
          <SummaryRow label="ناظر همراه" value={step.payload.isDriverSupervisor ? 'خود راننده' : step.payload.supervisorName ?? '—'} />
          <SummaryRow label="تاریخ مراجعه" value={toPersianDigits(step.payload.pickupDate)} />
        </>
      )}
    </StepCard>
  );
}
