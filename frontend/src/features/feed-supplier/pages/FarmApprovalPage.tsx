import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Typography, List, message, Col, Row, Empty } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useData } from '@/context/DataContext';
import { SelectionCard } from '@/components/ui/SelectionCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatNumber } from '@/utils/format';
import { TERM_TEMPLATES, PROFIT_METHODS, CONTRACT_TYPE_LABELS } from '@/types';
import { mockFarms } from '@/mocks';
import type { FarmProposal, Farm } from '@/types';

const { Text, Title } = Typography;

export function FarmApprovalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, dispatch } = useData();
  const [decisions, setDecisions] = useState<Record<string, 'accepted' | 'rejected'>>({});

  const contract = data.contracts.find((c) => c.id === id);
  const bids = data.proposals.filter((p) => p.contractId === id);

  const bidWithFarm = bids.map((b) => {
    const farm = mockFarms.find((f) => f.id === b.farmId);
    return { ...b, farm };
  });

  const handleDecide = (propId: string, decision: 'accepted' | 'rejected') => {
    setDecisions((p) => ({ ...p, [propId]: decision }));
    dispatch({ type: 'UPDATE_PROPOSAL', payload: { id: propId, status: decision } });
    message.success(decision === 'accepted' ? 'مزرعه تأیید شد — درخواست وثیقه ارسال گردید' : 'مزرعه رد شد');
  };

  const allDecided = bids.length > 0 && bids.every((b) => decisions[b.id]);

  if (!contract) return <Empty description="قرارداد یافت نشد" />;

  const terms = TERM_TEMPLATES.filter((t) => contract.selectedTermIds.includes(t.id));
  const method = PROFIT_METHODS.find((m) => m.id === contract.profitMethodId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <PageHeader title="بررسی مزرعه‌داران" subtitle="پیشنهادهای مناقصه — مزرعه‌های مورد نظر را تأیید کنید" />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Contract summary */}
        <Card size="small" style={{ marginBottom: 10, background: '#fafafa', borderRadius: 10 }}>
          <Tag color="blue">{CONTRACT_TYPE_LABELS[contract.contractType]}</Tag>
          <Text style={{ fontSize: 12 }}>حداقل تسهیم: ٪{formatNumber(contract.profitSharingMin)}</Text>
          <div style={{ marginTop: 4 }}>{terms.map((t) => <Tag key={t.id} style={{ fontSize: 10 }}>{t.label}</Tag>)}</div>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>{method?.label}</Text>
        </Card>

        {bidWithFarm.length > 0 ? (
          <>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              {formatNumber(bids.length)} مزرعه‌دار در مناقصه شرکت کرده‌اند (مرتب‌شده بر اساس درصد پیشنهادی)
            </Text>

            {bidWithFarm
              .sort((a, b) => b.proposedPercentage - a.proposedPercentage)
              .map((bw) => {
                const decision = decisions[bw.id];
                const f = bw.farm;
                return (
                  <div key={bw.id} style={{ marginBottom: 10 }}>
                    {/* Farm SelectionCard with full overview */}
                    {f && (
                      <SelectionCard<Farm>
                        item={f}
                        selected={decision === 'accepted'}
                        onSelect={() => {}}
                        title={f.name}
                        subtitle={`${f.address.city}، ${f.address.province}`}
                        rating={f.rating}
                        grade={f.grade}
                        fields={[
                          { label: 'ظرفیت', value: formatNumber(f.capacity) },
                          { label: 'ضریب تبدیل', value: formatNumber(f.avgConversionRatio, 1) },
                          { label: 'سابقه', value: `${formatNumber(f.experienceYears)} سال` },
                          { label: 'مالک', value: f.ownerName },
                        ]}
                        details={[
                          { label: 'نام', value: f.name },
                          { label: 'مالک', value: f.ownerName },
                          { label: 'موقعیت', value: `${f.address.city}، ${f.address.province}` },
                          { label: 'گرید', value: f.grade },
                          { label: 'ظرفیت', value: formatNumber(f.capacity) },
                          { label: 'ضریب تبدیل', value: formatNumber(f.avgConversionRatio, 1) },
                          { label: 'سابقه', value: `${formatNumber(f.experienceYears)} سال` },
                          { label: 'تلفن', value: f.contact.phone },
                        ]}
                      />
                    )}

                    {/* Bid action bar */}
                    <Card size="small" style={{ borderRadius: '0 0 10px 10px', borderTop: 'none', background: decision === 'accepted' ? '#f6ffed' : '#fafafa' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong style={{ fontSize: 16 }}>پیشنهاد:</Text>
                          <Text strong style={{ fontSize: 20, color: '#389e0d', marginRight: 8 }}>٪{formatNumber(bw.proposedPercentage)}</Text>
                        </div>
                        {decision ? (
                          <Tag color={decision === 'accepted' ? 'success' : 'error'}>
                            {decision === 'accepted' ? '✅ تأیید — در انتظار وثیقه' : '✗ رد شده'}
                          </Tag>
                        ) : (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleDecide(bw.id, 'accepted')}>تأیید</Button>
                            <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleDecide(bw.id, 'rejected')}>رد</Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}

            {allDecided && (
              <Button type="primary" block size="large" style={{ marginTop: 8 }} onClick={() => navigate('/')}>
                اتمام بررسی — بازگشت به داشبورد
              </Button>
            )}
          </>
        ) : (
          <Empty description="هنوز مزرعه‌داری پیشنهاد نداده است" />
        )}
      </div>
    </div>
  );
}
