import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Button, Empty, List } from 'antd';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { CONTRACT_TYPE_LABELS } from '@/types';
import type { FarmProposal } from '@/types';

const { Text, Title } = Typography;

export function ProposalsListPage() {
  const navigate = useNavigate();
  const { data } = useData();

  const myProposals = data.proposals.filter((p) => p.farmId === 'farm-1');

  // Only show contracts that aren't finalized yet
  const finalizedIds = new Set(data.contracts.filter((c) => c.status === 'finalized').map((c) => c.id));

  // Need collateral: accepted + contract NOT finalized
  const needCollateral = myProposals.filter(
    (p) => p.status === 'accepted' && !finalizedIds.has(p.contractId)
  );

  // Open contracts to bid on
  const openContracts = data.contracts.filter(
    (c) => (c.status === 'sent' || c.status === 'negotiating') && !finalizedIds.has(c.id)
  );
  const notBidYet = openContracts.filter(
    (c) => !myProposals.some((p) => p.contractId === c.id)
  );

  // Already bid, waiting
  const myPendingBids = myProposals.filter(
    (p) => p.status === 'pending' && !finalizedIds.has(p.contractId)
  );

  // Rejected
  const rejected = myProposals.filter(
    (p) => p.status === 'rejected' && !finalizedIds.has(p.contractId)
  );

  return (
    <>
      <PageHeader title="قراردادهای پیشنهادی" subtitle="پیشنهادهای دریافت شده از تأمین‌کنندگان" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 🔴 Priority: Collateral needed */}
        {needCollateral.length > 0 && needCollateral.map((p) => (
          <Card key={p.id} style={{ marginBottom: 10, background: '#fff7e6', borderRadius: 10, border: '1px solid #faad14' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text strong>{p.contractName}</Text>
              <Tag color="warning">در انتظار وثیقه</Tag>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>پیشنهاد شما: ٪{formatNumber(p.proposedPercentage)} — تأیید شد!</Text>
            <Button type="primary" size="small" block style={{ marginTop: 8 }}
              onClick={(e) => { e.stopPropagation(); navigate(`/collateral/${p.contractId}`); }}>
              تأمین وثیقه
            </Button>
          </Card>
        ))}

        {/* 🟡 New to bid */}
        {notBidYet.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: needCollateral.length > 0 ? 16 : 0 }}>📋 فرصت‌های جدید مناقصه</Title>
            <List dataSource={notBidYet} renderItem={(c) => (
              <Card hoverable size="small" style={{ marginBottom: 8, borderRadius: 8 }} onClick={() => navigate(`/proposals/${c.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{c.name || 'قرارداد جدید'}</Text>
                    <div><Tag style={{ marginTop: 4 }}>{CONTRACT_TYPE_LABELS[c.contractType]}</Tag></div>
                  </div>
                  <Tag>پیشنهاد دهید</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>حداقل تسهیم: ٪{formatNumber(c.profitSharingMin)}</Text>
              </Card>
            )} />
          </>
        )}

        {/* ⏳ Pending bids */}
        {myPendingBids.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>⏳ پیشنهادهای در حال بررسی</Title>
            {myPendingBids.map((p) => (
              <Card key={p.id} size="small" style={{ marginBottom: 6, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{p.contractName}</Text>
                  <Tag color="processing">در انتظار</Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>پیشنهاد: ٪{formatNumber(p.proposedPercentage)}</Text>
              </Card>
            ))}
          </>
        )}

        {/* ❌ Rejected */}
        {rejected.length > 0 && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>❌ رد شده</Title>
            {rejected.map((p) => (
              <Card key={p.id} size="small" style={{ marginBottom: 6, borderRadius: 8, opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{p.contractName}</Text>
                  <Tag color="error">رد شده</Tag>
                </div>
              </Card>
            ))}
          </>
        )}

        {needCollateral.length === 0 && notBidYet.length === 0 && myPendingBids.length === 0 && rejected.length === 0 && (
          <Empty description="نوتیف جدیدی ندارید" />
        )}
      </div>
    </>
  );
}
