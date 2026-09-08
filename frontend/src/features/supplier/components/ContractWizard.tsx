import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Form, Modal, Typography, message, theme } from 'antd';
import { CheckOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { useIsDesktop } from '@/hooks/useResponsive';
import { Stepper, type StepperItem } from '@/components/ui/Stepper';
import { ESTIMATION_CONSTANTS } from '@/utils/estimation';
import { computeParticipation, buildParticipationSnapshot } from '@/utils/participation';
import { todayJalali } from '@/features/progress/utils/progress.utils';
import { pivaTokens, pivaType } from '@/config/theme';
import { toPersianDigits } from '@/utils/format';
import type { SupplierRequest } from '@/types/request';
import {
  draftInputs,
  StepZeroBody,
  StepOneBody,
  StepTwoBody,
  StepThreeBody,
  StepFourBody,
  StepFiveBody,
  OverviewAside,
  MobileOverview,
  type WizardDraft,
  type StepTwoValues,
} from './wizard/steps';
import { downloadContractDoc } from './wizard/contractDoc';

const { Text } = Typography;

const WIZARD_STEPS = ['نوع سفارش', 'نهاده', 'وزن و استان', 'محاسبه جوجه', 'پیش‌فاکتور', 'پیش‌قرارداد'];

/**
 * استپر متمرکز موبایل — پنجره ۳تایی [قبلی | فعلی | بعدی] با ساختار کاملاً متقارن:
 * هر اسلات = [کانکتور][ستون ثابت][کانکتور] + دو ناحیه ثابت دو طرف برای «ادامه دارد» (⋯).
 * با این ساختار، مرکز گام فعلی دقیقاً وسط عرض است (حتی در گام‌های لبه).
 */
function MobileWizardStepper({ step, total }: { step: number; total: number }) {
  const { token } = theme.useToken();

  const slots = [-1, 0, 1].map((offset) => {
    const idx = step + offset;
    if (idx < 0 || idx >= total) return null;
    return {
      key: idx,
      label: WIZARD_STEPS[idx],
      status: (idx < step ? 'done' : idx === step ? 'current' : 'idle') as 'done' | 'current' | 'idle',
    };
  });
  const hiddenFuture = step + 1 < total - 1;
  const hiddenPast = step - 1 > 0;

  const dots = (
    <span aria-hidden style={{ fontSize: 13, color: token.colorTextTertiary, lineHeight: 1 }}>⋯</span>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', paddingBottom: 10 }}>
      {/* سمت راست: ادامه گذشته (خارج از پنجره) */}
      <div style={{ width: 22, display: 'flex', justifyContent: 'center', paddingTop: 10, flexShrink: 0 }}>
        {hiddenPast && dots}
      </div>

      {slots.map((slot, i) => (
        <div key={slot ? `mstep-${slot.key}` : `mgap-${i}`} style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          {/* نیمه اتصال سمت راست (از گام قبلی) */}
          <div style={{
            flex: 1, minWidth: 6, height: 2, marginTop: 11, marginInline: 6, borderRadius: 2,
            background: slot && i > 0 && slots[i - 1]
              ? (slots[i - 1]!.status === 'done' ? token.colorPrimary : token.colorBorderSecondary)
              : 'transparent',
            transition: 'background-color var(--piva-duration-tab) var(--piva-ease-enter)',
          }} />
          <div style={{ width: 72, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {slot && (
              <>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: slot.status === 'done' ? token.colorPrimary
                    : slot.status === 'current' ? token.colorPrimaryBg
                    : token.colorFillSecondary,
                  color: slot.status === 'done' ? pivaTokens.onPrimary
                    : slot.status === 'current' ? token.colorPrimary
                    : token.colorTextTertiary,
                  border: slot.status === 'current' ? `1px solid ${token.colorPrimary}` : undefined,
                  transition: 'background-color var(--piva-duration-tab) var(--piva-ease-enter), color var(--piva-duration-tab) var(--piva-ease-enter)',
                }}>
                  {slot.status === 'done' ? <CheckOutlined /> : toPersianDigits(String(slot.key + 1))}
                </span>
                <span style={{
                  fontSize: pivaType.caption.fontSize,
                  fontWeight: slot.status === 'current' ? 600 : 400,
                  color: slot.status === 'current' ? token.colorText : slot.status === 'done' ? token.colorTextSecondary : token.colorTextTertiary,
                  textAlign: 'center',
                }}>
                  {slot.label}
                </span>
              </>
            )}
          </div>
          {/* نیمه اتصال سمت چپ (به گام بعدی) */}
          <div style={{
            flex: 1, minWidth: 6, height: 2, marginTop: 11, marginInline: 6, borderRadius: 2,
            background: slot && i < 2 && slots[i + 1]
              ? (slot.status === 'done' ? token.colorPrimary : token.colorBorderSecondary)
              : 'transparent',
            transition: 'background-color var(--piva-duration-tab) var(--piva-ease-enter)',
          }} />
        </div>
      ))}

      {/* سمت چپ: ادامه آینده (خارج از پنجره) */}
      <div style={{ width: 22, display: 'flex', justifyContent: 'center', paddingTop: 10, flexShrink: 0 }}>
        {hiddenFuture && dots}
      </div>
    </div>
  );
}

interface ContractWizardProps {
  onClose: () => void;
  /** بعد از ارسال موفق — داشبورد تب «در حال بررسی» را فعال می‌کند */
  onCreated: () => void;
}

/**
 * ویزارد تمام‌صفحه سفارش جدید مشارکت‌کننده — ۶ گام با پروگرس‌بار بالا:
 * مبنای سفارش → نهاده → وزن و استان → محاسبه جوجه → پیش‌فاکتور → پیش‌قرارداد و ارسال.
 * پورتال به body تا transform باقی‌مانده PageTransition موقعیت fixed را نشکند.
 */
export function ContractWizard({ onClose, onCreated }: ContractWizardProps) {
  const isDesktop = useIsDesktop();
  const { token } = theme.useToken();
  const { dispatch } = useData();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<WizardDraft>({});
  const [step2Form] = Form.useForm<StepTwoValues>();
  const requestIdRef = useRef<string>(`rq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);

  // تولید کل برآوردی = نهاده (تن → کیلوگرم) ÷ ضریب تبدیل پیش‌فرض — همان فرمول برآورد ادمین
  const productionKg = useMemo(
    () => (draft.feed ? Math.round((draft.feed * 1000) / ESTIMATION_CONSTANTS.defaultFcr) : 0),
    [draft.feed],
  );
  const inputs = useMemo(() => draftInputs(draft, productionKg, draft.perBirdKg), [draft, productionKg]);
  const participation = useMemo(
    () => (productionKg > 0 && draft.perBirdKg != null
      ? computeParticipation(inputs, productionKg, { perBirdWeightKg: draft.perBirdKg })
      : null),
    [inputs, productionKg, draft.perBirdKg],
  );
  const isDirty = inputs.length > 0 || draft.basis != null || draft.perBirdKg != null
    || draft.feedDeliveryDate != null || draft.province != null;

  // Esc = بستن (با تأیید در حالت dirty)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  const handleClose = () => {
    if (!isDirty) return onClose();
    Modal.confirm({
      title: 'انصراف از سفارش جدید',
      content: 'اطلاعات واردشده از بین می‌رود. مطمئنید؟',
      okText: 'انصراف',
      okButtonProps: { danger: true },
      cancelText: 'ادامه ثبت',
      onOk: onClose,
    });
  };

  const handleNext = async () => {
    if (step === 0) {
      if (draft.basis == null) {
        message.error('مبنای سفارش را انتخاب کنید.');
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!draft.feed) {
        message.error('مقدار نهاده را وارد کنید.');
        return;
      }
      if (!draft.feedDeliveryDate) {
        message.error('تاریخ تحویل نهاده را مشخص کنید.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      try {
        await step2Form.validateFields();
      } catch {
        return; // خطاهای فرم خودشان نمایش داده می‌شوند
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
      return;
    }
    if (step === 4) {
      setStep(5);
    }
  };

  const handleSubmit = () => {
    if (!draft.perBirdKg || !draft.feedDeliveryDate || !draft.province || !participation) return;
    const request: SupplierRequest = {
      id: requestIdRef.current,
      basis: 'production',
      inputs,
      desiredKg: participation.productionKg,
      targetWeightPerBirdKg: draft.perBirdKg,
      targetDeliveryDate: draft.feedDeliveryDate.format('YYYY/MM/DD'),
      province: draft.province,
      status: 'pending',
      createdAt: todayJalali(),
      participation: buildParticipationSnapshot(inputs, productionKg, { perBirdWeightKg: draft.perBirdKg }),
    };
    dispatch({ type: 'ADD_REQUEST', payload: request });
    message.success('پیش‌قرارداد شما ثبت و برای بررسی ارسال شد.');
    onCreated();
  };

  const handleDownload = () => {
    if (!participation || !draft.perBirdKg || !draft.feedDeliveryDate || !draft.province) return;
    downloadContractDoc({
      inputs,
      productionKg: participation.productionKg,
      perBirdKg: draft.perBirdKg,
      feedDeliveryDate: draft.feedDeliveryDate.format('YYYY/MM/DD'),
      province: draft.province,
      participation,
      requestId: requestIdRef.current,
      createdAt: todayJalali(),
    });
  };

  const stepperItems: StepperItem[] = WIZARD_STEPS.map((label, i) => ({
    label,
    status: i < step ? 'done' : i === step ? 'current' : 'idle',
  }));

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="سفارش جدید"
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: token.colorBgLayout,
        display: 'flex', flexDirection: 'column',
        // backwards: بعد از ورود، transform به none برمی‌گردد تا موقعیت fixed فرزندان (پاپ‌آپ تقویم) نشکند
        animation: 'piva-page-enter 200ms cubic-bezier(0.2, 0, 0, 1) backwards',
      }}
    >
      {/* هدر: دسکتاپ = عنوان + استپر + بستن؛ موبایل = عنوان/بستن + نوار پیشرفت خطی (استپر در عرض موبایل له می‌شود) */}
      <div style={{ background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
        {isDesktop ? (
          <div style={{
            maxWidth: 960, margin: '0 auto', paddingInline: 24,
            display: 'flex', alignItems: 'center', gap: 24, minHeight: 64,
          }}>
            <Text strong style={{ ...pivaType.sectionTitle, fontWeight: 800, flexShrink: 0 }}>سفارش جدید</Text>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Stepper items={stepperItems} />
            </div>
            <Button type="text" icon={<CloseOutlined />} onClick={handleClose} aria-label="بستن" />
          </div>
        ) : (
          <div style={{ maxWidth: 960, margin: '0 auto', paddingInline: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
              <Text strong style={{ ...pivaType.sectionTitle, fontWeight: 800 }}>سفارش جدید</Text>
              <Button type="text" icon={<CloseOutlined />} onClick={handleClose} aria-label="بستن" />
            </div>
            <MobileWizardStepper step={step} total={WIZARD_STEPS.length} />
          </div>
        )}
      </div>

      {/* بدنه */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{
          maxWidth: 960, margin: '0 auto', padding: '24px',
          display: 'flex', gap: 24, alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* موبایل: پیش‌فاکتور قابل باز/بسته زیر استپر — دسکتاپ پنل کناری دارد */}
            {!isDesktop && step >= 3 && participation && (
              <MobileOverview participation={participation} />
            )}
            {step === 0 && <StepZeroBody draft={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />}
            {step === 1 && <StepOneBody draft={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />}
            {step === 2 && <StepTwoBody form={step2Form} draft={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />}
            {step === 3 && participation && <StepThreeBody draft={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} participation={participation} />}
            {step === 4 && participation && <StepFourBody participation={participation} feedTons={draft.feed ?? 0} />}
            {step === 5 && participation && (
              <StepFiveBody draft={draft} inputs={inputs} participation={participation} onDownload={handleDownload} />
            )}
          </div>
          {isDesktop && step >= 3 && participation && (
            <div style={{ width: 300, flexShrink: 0 }}>
              <OverviewAside participation={participation} />
            </div>
          )}
        </div>
      </div>

      {/* فوتر: ناوبری گام‌ها */}
      <div style={{ background: token.colorBgContainer, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
        <div style={{
          maxWidth: 960, margin: '0 auto', padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>بازگشت</Button>
          {step < 5 ? (
            <Button type="primary" onClick={handleNext}>
              {step === 4 ? 'تأیید پیش‌فاکتور' : 'گام بعدی'}
            </Button>
          ) : (
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>ارسال درخواست</Button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
