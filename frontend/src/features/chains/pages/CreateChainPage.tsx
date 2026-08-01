import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Radio, Checkbox, Slider, Typography, Space, Tag, message } from 'antd';
import { ChainWizardProvider, useChainWizard } from '../context/ChainWizardContext';
import { ChainStepper } from '../components/ChainStepper';
import { useData } from '@/context/DataContext';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS, TERM_TEMPLATES, PROFIT_METHODS } from '@/types';
import type { Contract } from '@/types';

const { Text, Title } = Typography;

// ── Step 0: Contract type ──

function ContractTypeStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <Radio.Group value={state.contractType} onChange={(e) => dispatch({ type: 'SET_CONTRACT_TYPE', payload: e.target.value })} style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Card hoverable size="small" style={state.contractType === 'commission' ? { border: '2px solid #389e0d', background: '#f6ffed' } : {}}>
          <Radio value="commission">
            <Text strong>کارمزدی</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>تأمین‌کننده نهاده را تأمین میکند، سود به نسبت توافق تقسیم میشود</Text>
          </Radio>
        </Card>
        <Card hoverable size="small" style={state.contractType === 'contract' ? { border: '2px solid #389e0d', background: '#f6ffed' } : {}}>
          <Radio value="contract">
            <Text strong>پیمانکاری</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>تأمین‌کننده کل فرآیند را مدیریت میکند، مزرعه‌دار حق‌الزحمه ثابت دریافت میکند</Text>
          </Radio>
        </Card>
      </Space>
    </Radio.Group>
  );
}

// ── Step 1: Terms selection ──

function ContractTermsStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>شرایط و تعهدات مورد نظر را انتخاب کنید</Text>
      <Checkbox.Group value={state.selectedTermIds} onChange={(vals) => {
        // Find newly added or removed
        const added = vals.filter((v: string) => !state.selectedTermIds.includes(v));
        const removed = state.selectedTermIds.filter((v: string) => !vals.includes(v));
        if (added.length) dispatch({ type: 'TOGGLE_TERM', payload: added[0] });
        if (removed.length) dispatch({ type: 'TOGGLE_TERM', payload: removed[0] });
      }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {TERM_TEMPLATES.map((t) => (
            <Card key={t.id} size="small" hoverable style={{ borderRadius: 10 }}>
              <Checkbox value={t.id}>
                <Text strong style={{ fontSize: 13 }}>{t.label}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{t.description}</Text>
              </Checkbox>
            </Card>
          ))}
        </Space>
      </Checkbox.Group>
    </div>
  );
}

// ── Step 2: Profit method + min % ──

function ProfitSharingStep() {
  const { state, dispatch } = useChainWizard();
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>شیوه تسهیم منافع را انتخاب کنید</Text>
      <Radio.Group value={state.profitMethodId} onChange={(e) => dispatch({ type: 'SET_PROFIT_METHOD', payload: e.target.value })} style={{ width: '100%' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          {PROFIT_METHODS.map((m) => (
            <Card key={m.id} size="small" hoverable style={state.profitMethodId === m.id ? { border: '2px solid #389e0d', background: '#f6ffed', borderRadius: 10 } : { borderRadius: 10 }}>
              <Radio value={m.id}>
                <Text strong style={{ fontSize: 13 }}>{m.label}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{m.description}</Text>
              </Radio>
            </Card>
          ))}
        </Space>
      </Radio.Group>

      <div style={{ background: '#f6ffed', borderRadius: 12, padding: '16px 20px', marginTop: 16 }}>
        <Text style={{ fontSize: 12 }}>حداقل درصد تسهیم مزرعه‌دار</Text>
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: 28, color: '#389e0d' }}>٪{formatNumber(state.profitSharingMin)}</Text>
        </div>
        <Slider min={10} max={60} value={state.profitSharingMin} onChange={(v) => dispatch({ type: 'SET_PROFIT_SHARING', payload: v })}
          marks={{ 10: '۱۰', 25: '۲۵', 40: '۴۰', 60: '۶۰' }} />
      </div>
    </div>
  );
}

// ── Step 3: Review & Send ──

function ReviewStep() {
  const { state } = useChainWizard();
  const selectedTerms = TERM_TEMPLATES.filter((t) => state.selectedTermIds.includes(t.id));
  const selectedMethod = PROFIT_METHODS.find((m) => m.id === state.profitMethodId);

  return (
    <div>
      <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>نوع قرارداد</Text>
        <div><Tag color="green">{CONTRACT_TYPE_LABELS[state.contractType]}</Tag></div>
      </Card>

      <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>شرایط انتخاب شده ({formatNumber(selectedTerms.length)})</Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {selectedTerms.map((t) => <Tag key={t.id}>{t.label}</Tag>)}
        </div>
      </Card>

      <Card size="small" style={{ borderRadius: 10, marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 11 }}>شیوه تسهیم</Text>
        <div><Text strong>{selectedMethod?.label}</Text></div>
        <Text type="secondary" style={{ fontSize: 11 }}>{selectedMethod?.description}</Text>
      </Card>

      <Card size="small" style={{ borderRadius: 10, background: '#f6ffed' }}>
        <Text type="secondary" style={{ fontSize: 11 }}>حداقل درصد مزرعه‌دار</Text>
        <div><Text strong style={{ fontSize: 22, color: '#389e0d' }}>٪{formatNumber(state.profitSharingMin)}</Text></div>
      </Card>

      <Text type="secondary" style={{ display: 'block', marginTop: 16, textAlign: 'center', fontSize: 12 }}>
        با زدن دکمه تأیید، این قرارداد برای تمام مزرعه‌داران واجد شرایط ارسال میشود
      </Text>
    </div>
  );
}

// ── Step renderer ──

const STEPS = [ContractTypeStep, ContractTermsStep, ProfitSharingStep, ReviewStep];

function StepContent() {
  const { state } = useChainWizard();
  const C = STEPS[state.currentStep];
  return <C />;
}

// ── Page ──

export function CreateChainPage() {
  const navigate = useNavigate();
  const { dispatch: dataDispatch } = useData();
  const [submitting, setSubmitting] = useState(false);

  return (
    <ChainWizardProvider>
      <WizardInner
        submitting={submitting}
        onSubmit={(wizardState) => {
          setSubmitting(true);
          const newContract: Contract = {
            id: `ctr-${Date.now()}`,
            name: wizardState.contractName || 'قرارداد جدید',
            contractType: wizardState.contractType,
            selectedTermIds: wizardState.selectedTermIds,
            profitMethodId: wizardState.profitMethodId,
            profitSharingMin: wizardState.profitSharingMin,
            status: 'sent',
            createdBy: 'supplier',
            createdAt: new Date().toLocaleDateString('fa-IR'),
          };
          dataDispatch({ type: 'ADD_CONTRACT', payload: newContract });
          setTimeout(() => {
            setSubmitting(false);
            message.success('قرارداد با موفقیت ارسال شد و برای مزرعه‌داران ارسال گردید!');
            navigate('/');
          }, 600);
        }}
      />
    </ChainWizardProvider>
  );
}

function WizardInner({ submitting, onSubmit }: { submitting: boolean; onSubmit: (s: ReturnType<typeof useChainWizard>['state']) => void }) {
  const wizard = useChainWizard();
  return (
    <ChainStepper onSubmit={() => onSubmit(wizard.state)} isSubmitting={submitting}>
      <StepContent />
    </ChainStepper>
  );
}
