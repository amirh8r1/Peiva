import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Slider, Button, Typography, Tag, Empty, List, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS, TERM_TEMPLATES, PROFIT_METHODS } from '@/types';
import { mockFarms } from '@/mocks';
import type { FarmProposal } from '@/types';

const { Text, Title } = Typography;

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, dispatch } = useData();
  const [percent, setPercent] = useState(35);
  const [submitted, setSubmitted] = useState(false);

  const contract = data.contracts.find((c) => c.id === id);
  if (!contract) return <Empty description="قرارداد یافت نشد" />;

  const myProposal = data.proposals.find((p) => p.contractId === id && p.farmId === 'farm-1');
  const otherBids = data.proposals.filter((p) => p.contractId === id && p.farmId !== 'farm-1');
  const selectedTerms = TERM_TEMPLATES.filter((t) => contract.selectedTermIds.includes(t.id));
  const profitMethod = PROFIT_METHODS.find((m) => m.id === contract.profitMethodId);

  // Use a random farm for the bidder identity
  const farmNames = mockFarms.reduce((acc, f) => { acc[f.id] = f.name; return acc; }, {} as Record<string, string>);

  const handleSubmit = () => {
    const proposal: FarmProposal = {
      id: `prop-${Date.now()}`,
      contractId: contract.id,
      contractName: contract.name || 'قرارداد جدید',
      farmId: 'farm-1',
      farmName: 'مرغداری سبز دشت',
      farmGrade: 'A',
      proposedPercentage: percent,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('fa-IR'),
    };
    dispatch({ type: 'ADD_PROPOSAL', payload: proposal });
    if (contract.status === 'sent') {
      dispatch({ type: 'UPDATE_CONTRACT_STATUS', payload: { id: contract.id, status: 'negotiating' } });
    }
    setSubmitted(true);
    message.success('پیشنهاد شما با موفقیت ثبت شد!');
    setTimeout(() => navigate('/'), 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title={contract.name || 'قرارداد'} subtitle="جزئیات و مناقصه" extra={
        <Button icon={<ArrowRightOutlined />} onClick={() => navigate('/proposals')}>بازگشت</Button>
      } />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Card size="small" style={{ marginBottom: 10 }}>
          <Tag color="blue">{CONTRACT_TYPE_LABELS[contract.contractType]}</Tag>
          <Text style={{ marginRight: 8 }}>حداقل تسهیم: ٪{formatNumber(contract.profitSharingMin)}</Text>
        </Card>

        <Card size="small" style={{ marginBottom: 10 }} title="شرایط">
          {selectedTerms.map((t) => <Tag key={t.id} style={{ marginBottom: 4 }}>{t.label}</Tag>)}
        </Card>

        <Card size="small" style={{ marginBottom: 10 }} title="شیوه تسهیم">
          <Text strong>{profitMethod?.label}</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{profitMethod?.description}</Text>
        </Card>

        {/* Other bids */}
        {otherBids.length > 0 && (
          <Card size="small" style={{ marginBottom: 10 }} title="پیشنهادهای سایر مزرعه‌داران">
            <List dataSource={otherBids} renderItem={(b: FarmProposal) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <Text>{farmNames[b.farmId] || b.farmName}</Text>
                <Text strong>٪{formatNumber(b.proposedPercentage)}</Text>
              </div>
            )} />
          </Card>
        )}

        {/* Submit bid */}
        {!myProposal && !submitted && (
          <Card style={{ marginBottom: 10 }}>
            <Title level={5}>پیشنهاد درصد مشارکت شما</Title>
            <Slider min={contract.profitSharingMin} max={60} value={percent} onChange={setPercent}
              marks={{ [contract.profitSharingMin]: `${contract.profitSharingMin}٪`, 40: '۴۰', 50: '۵۰', 60: '۶۰' }} />
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <Text strong style={{ fontSize: 24, color: '#389e0d' }}>٪{formatNumber(percent)}</Text>
            </div>
            <Button type="primary" block size="large" onClick={handleSubmit}>ثبت پیشنهاد</Button>
          </Card>
        )}

        {(myProposal || submitted) && (
          <Card style={{ background: myProposal?.status === 'accepted' ? '#f6ffed' : '#fff7e6', marginBottom: 10 }}>
            <Text type="secondary">پیشنهاد شما ثبت شده:</Text>
            <div><Text strong style={{ fontSize: 20 }}>٪{formatNumber(myProposal?.proposedPercentage || percent)}</Text></div>
            <Tag color="processing">در انتظار بررسی تأمین‌کننده</Tag>
          </Card>
        )}
      </div>
    </div>
  );
}
